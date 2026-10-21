-- Run AFTER schema.sql in the Supabase SQL editor (and before or after seed.sql).
-- Goal: the React site talks to Supabase directly for reads, and staff edits go through row-level security.
-- Visitors can NEVER write to the database directly. Form submissions go through an Edge Function (service role),
-- which is where the honeypot, rate limit and email live.

-- ---------- role helpers ----------
CREATE OR REPLACE FUNCTION public.current_role_name() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT role FROM public.profiles WHERE id = auth.uid() $$;

CREATE OR REPLACE FUNCTION public.is_staff() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT coalesce(public.current_role_name() IN ('admin','editor'), false) $$;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT coalesce(public.current_role_name() = 'admin', false) $$;

-- Auto-create a profile for every new sign-up (role 'user' = no access until promoted).
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  RETURN new;
END $$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Only one Hot Deal at a time: setting a new one clears the previous (works with the unique index in schema.sql).
CREATE OR REPLACE FUNCTION public.properties_single_hot() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF new.is_hot_deal THEN UPDATE public.properties SET is_hot_deal = false WHERE is_hot_deal AND id <> new.id; END IF;
  new.updated_at := now();
  RETURN new;
END $$;
DROP TRIGGER IF EXISTS properties_single_hot_trg ON public.properties;
CREATE TRIGGER properties_single_hot_trg BEFORE INSERT OR UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.properties_single_hot();

-- ---------- row-level security ----------
-- Public-readable content tables: anyone can read, only staff can write.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['hero_slides','property_categories','cities','agents','services','case_studies','testimonials_google','partners','values','promises','media','about_page','services_page'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "public read" ON public.%I FOR SELECT USING (true)', t);
    EXECUTE format('CREATE POLICY "staff write" ON public.%I FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
  END LOOP;
END $$;

-- Site-wide settings and metrics: public read, ADMIN-only write (editors cannot change these).
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['site_settings','metrics'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "public read" ON public.%I FOR SELECT USING (true)', t);
    EXECUTE format('CREATE POLICY "admin write" ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
  END LOOP;
END $$;

-- Properties: the public sees ONLY Active ones; staff see and edit everything.
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active" ON public.properties FOR SELECT USING (status = 'Active' OR public.is_staff());
CREATE POLICY "staff write" ON public.properties FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Submissions: NO public access at all (inserts happen only in the Edge Function with the service role).
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['enquiries','property_listings','contact_messages'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "staff read" ON public.%I FOR SELECT USING (public.is_staff())', t);
    EXECUTE format('CREATE POLICY "staff update" ON public.%I FOR UPDATE USING (public.is_staff()) WITH CHECK (public.is_staff())', t);
    EXECUTE format('CREATE POLICY "staff delete" ON public.%I FOR DELETE USING (public.is_staff())', t);
  END LOOP;
END $$;

-- Profiles: staff can list colleagues; each person can read their own; only admins change roles (never their own).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own or staff" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_staff());
CREATE POLICY "admin updates others" ON public.profiles FOR UPDATE USING (public.is_admin() AND id <> auth.uid()) WITH CHECK (public.is_admin() AND id <> auth.uid());

-- Rate limits: no policies = nobody but the service role can touch it.
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- ---------- rate limiting (called by the Edge Function) ----------
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_bucket text, p_ip text, p_per_minute int DEFAULT 5, p_per_hour int DEFAULT 20)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m int; h int;
BEGIN
  SELECT count(*) FILTER (WHERE created_at > now() - interval '1 minute'), count(*) INTO m, h
  FROM rate_limits WHERE bucket = p_bucket AND ip = p_ip AND created_at > now() - interval '1 hour';
  IF m >= p_per_minute OR h >= p_per_hour THEN RETURN false; END IF;
  INSERT INTO rate_limits (bucket, ip) VALUES (p_bucket, p_ip);
  IF random() < 0.05 THEN DELETE FROM rate_limits WHERE created_at < now() - interval '2 days'; END IF;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.check_rate_limit(text, text, int, int) FROM PUBLIC, anon, authenticated;

-- ---------- convert an owner listing into a Draft property (staff only) ----------
CREATE OR REPLACE FUNCTION public.convert_listing_to_property(p_id int) RETURNS int
LANGUAGE plpgsql AS $$
DECLARE l public.property_listings%ROWTYPE; v_cat int; v_city int; v_state text; v_agent int; v_new int; v_slug text; v_base text; n int := 2;
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT * INTO l FROM public.property_listings WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Listing not found'; END IF;
  IF l.converted_to_property_id IS NOT NULL THEN RAISE EXCEPTION 'This listing has already been converted'; END IF;
  SELECT id INTO v_cat FROM public.property_categories WHERE slug = CASE l.property_type
    WHEN 'Warehouse' THEN 'warehouse' WHEN 'Residential' THEN 'residential' WHEN 'Industrial land' THEN 'land' ELSE 'commercial' END;
  SELECT id, state INTO v_city, v_state FROM public.cities WHERE lower(name) = lower(l.city) LIMIT 1;
  IF v_city IS NULL THEN SELECT id, state INTO v_city, v_state FROM public.cities ORDER BY sort_order LIMIT 1; END IF;
  SELECT id INTO v_agent FROM public.agents ORDER BY sort_order LIMIT 1;
  v_base := trim(BOTH '-' FROM regexp_replace(lower(l.property_type || ' ' || l.address || ' ' || l.city), '[^a-z0-9]+', '-', 'g'));
  v_slug := v_base;
  WHILE EXISTS (SELECT 1 FROM public.properties WHERE slug = v_slug) LOOP v_slug := v_base || '-' || n; n := n + 1; END LOOP;
  INSERT INTO public.properties (title, slug, short_title, category_id, sub_category, listing, price, city_id, area, state, size, main_image, description, agent_id, status)
  VALUES (l.property_type || ' — ' || l.address, v_slug, left(l.property_type || ' — ' || l.address, 60), v_cat,
          CASE WHEN l.intent = 'Sell' THEN 'Sale'::sub_category_kind ELSE 'Lease'::sub_category_kind END,
          CASE WHEN l.intent = 'Sell' THEN 'For Sale'::listing_kind ELSE 'For Lease'::listing_kind END,
          0, v_city, l.address, v_state, l.approximate_size, '', l.notes, v_agent, 'Draft')
  RETURNING id INTO v_new;
  UPDATE public.property_listings SET converted_to_property_id = v_new, status = 'Onboarded' WHERE id = p_id;
  RETURN v_new;
END $$;

-- ---------- storage buckets (also creatable in the dashboard) ----------
-- 'site-media'    : PUBLIC read, staff upload (property photos, logo, portraits)
-- 'owner-uploads' : PRIVATE. Visitors upload only through Edge-Function-issued signed upload URLs; staff view via signed URLs.
INSERT INTO storage.buckets (id, name, public) VALUES ('site-media', 'site-media', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('owner-uploads', 'owner-uploads', false) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "staff upload site media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-media' AND public.is_staff());
CREATE POLICY "staff update site media" ON storage.objects FOR UPDATE USING (bucket_id = 'site-media' AND public.is_staff());
CREATE POLICY "staff delete site media" ON storage.objects FOR DELETE USING (bucket_id = 'site-media' AND public.is_staff());
CREATE POLICY "staff read owner uploads" ON storage.objects FOR SELECT USING (bucket_id = 'owner-uploads' AND public.is_staff());
