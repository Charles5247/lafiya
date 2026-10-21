-- Mai'Lafiya Homes & Properties: Postgres schema (from the working Floot build), made Supabase-ready.
-- Run this FIRST in the Supabase SQL editor, then supabase-setup.sql, then seed.sql.
-- All jsonb columns hold real JSON arrays/objects (NOT JSON-encoded strings).

CREATE TYPE listing_kind AS ENUM ('For Lease','For Sale','Short-let');
CREATE TYPE sub_category_kind AS ENUM ('Lease','Sale');
CREATE TYPE property_status AS ENUM ('Draft','Active','Under Offer','Let','Sold','Archived');
CREATE TYPE enquiry_type AS ENUM ('Request viewing','Request info','Make offer');
CREATE TYPE enquiry_source AS ENUM ('property-detail','contact','list-property','homepage-cta');
CREATE TYPE enquiry_status AS ENUM ('New','Contacted','Qualified','Closed','Spam');
CREATE TYPE owner_intent AS ENUM ('Rent','Sell','Manage','Valuation');
CREATE TYPE owner_listing_status AS ENUM ('New','Reviewing','Onboarded','Rejected');
CREATE TYPE contact_status AS ENUM ('New','Replied','Closed');

-- Staff profiles (Supabase Auth). A row is auto-created when someone signs up; role 'user' has NO admin access.
-- Promote staff to 'editor' or 'admin' from the Supabase dashboard or the admin "Staff users" screen.
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL, display_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin','editor','user')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  business_name text NOT NULL, short_name text NOT NULL, tagline text NOT NULL, rc_number text NOT NULL,
  year_founded int NOT NULL, phone text NOT NULL, whatsapp text NOT NULL, email text NOT NULL,
  address text NOT NULL, business_hours text NOT NULL,
  facebook text, instagram text, linkedin text,
  logo_light text, logo_dark text, logo_icon text, footer_copy text,
  service_lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE metrics (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  years_in_business int NOT NULL, properties_transacted int NOT NULL, value_of_deals_closed text NOT NULL,
  square_metres_managed int NOT NULL, cities_served int NOT NULL, client_rating numeric(2,1) NOT NULL,
  review_count int NOT NULL, response_time_hours int NOT NULL, client_retention_pct int,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE hero_slides (
  id serial PRIMARY KEY, image text NOT NULL, tag text NOT NULL, sort_order int NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true
);

CREATE TABLE property_categories (
  id serial PRIMARY KEY, name text NOT NULL, slug text NOT NULL UNIQUE, icon text NOT NULL DEFAULT 'building',
  description text, sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE cities (
  id serial PRIMARY KEY, name text NOT NULL, slug text NOT NULL UNIQUE, state text NOT NULL,
  active boolean NOT NULL DEFAULT true, sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE agents (
  id serial PRIMARY KEY, name text NOT NULL, role text NOT NULL, photo text, phone text NOT NULL,
  whatsapp text, email text, bio text, city_id int REFERENCES cities(id) ON DELETE SET NULL,
  show_on_team boolean NOT NULL DEFAULT false, sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE properties (
  id serial PRIMARY KEY,
  title text NOT NULL, slug text NOT NULL UNIQUE, short_title text NOT NULL,
  category_id int NOT NULL REFERENCES property_categories(id),
  sub_category sub_category_kind NOT NULL, listing listing_kind NOT NULL,
  price bigint NOT NULL, price_period text, currency text NOT NULL DEFAULT 'NGN',
  city_id int NOT NULL REFERENCES cities(id),
  area text NOT NULL, state text NOT NULL, latitude numeric, longitude numeric,
  size text NOT NULL, size_sqm numeric, bedrooms int, bathrooms int, parking text,
  dock_doors int, clear_height text, floors int, year_built int,
  main_image text NOT NULL, gallery jsonb NOT NULL DEFAULT '[]'::jsonb, video_tour_url text,
  badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text NOT NULL, features jsonb NOT NULL DEFAULT '[]'::jsonb,
  agent_id int NOT NULL REFERENCES agents(id),
  is_featured boolean NOT NULL DEFAULT false, is_hot_deal boolean NOT NULL DEFAULT false,
  status property_status NOT NULL DEFAULT 'Draft',
  title_verified boolean NOT NULL DEFAULT true, walked_by_team boolean NOT NULL DEFAULT true,
  listed_at timestamptz NOT NULL DEFAULT now(),
  meta_title text, meta_description text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
-- Only one Hot Deal at a time (the app also clears the previous one when a new one is set):
CREATE UNIQUE INDEX one_hot_deal ON properties ((is_hot_deal)) WHERE is_hot_deal;
CREATE INDEX properties_filter_idx ON properties (status, category_id, city_id, listing, price);

CREATE TABLE services (
  id serial PRIMARY KEY, title text NOT NULL, icon text NOT NULL, blurb text NOT NULL, body text,
  sort_order int NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true
);

CREATE TABLE case_studies (
  id serial PRIMARY KEY, title text NOT NULL, city_id int NOT NULL REFERENCES cities(id),
  metric text NOT NULL, metric_label text NOT NULL, image text NOT NULL, body text,
  featured boolean NOT NULL DEFAULT false, sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE testimonials_google (
  id serial PRIMARY KEY, name text NOT NULL, avatar text, when_label text NOT NULL, when_date date NOT NULL,
  stars int NOT NULL CHECK (stars BETWEEN 1 AND 5), body text NOT NULL,
  verified boolean NOT NULL DEFAULT true, featured boolean NOT NULL DEFAULT false, sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE partners (
  id serial PRIMARY KEY, name text NOT NULL, logo text, website_url text,
  sort_order int NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true
);

CREATE TABLE "values" (
  id serial PRIMARY KEY, title text NOT NULL, description text NOT NULL, sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE promises (
  id serial PRIMARY KEY, icon text NOT NULL, title text NOT NULL, description text NOT NULL, sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE about_page (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_headline text NOT NULL, hero_subcopy text NOT NULL, hero_image text,
  story_eyebrow text NOT NULL, story_headline text NOT NULL, story_body text NOT NULL,
  story_image_a text, story_image_b text, values_eyebrow text NOT NULL, values_headline text NOT NULL,
  ceo_name text NOT NULL, ceo_title text NOT NULL, ceo_quote text NOT NULL, ceo_image text, ceo_video_url text
);

CREATE TABLE services_page (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  hero_headline text NOT NULL, hero_subcopy text NOT NULL, process_steps jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE enquiries (
  id serial PRIMARY KEY, name text NOT NULL, phone text NOT NULL, email text NOT NULL,
  inquiry_type enquiry_type NOT NULL, message text NOT NULL,
  property_id int REFERENCES properties(id) ON DELETE SET NULL,
  source enquiry_source NOT NULL, status enquiry_status NOT NULL DEFAULT 'New',
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL, notes text, is_read boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE property_listings (
  id serial PRIMARY KEY, owner_name text NOT NULL, phone text NOT NULL, email text NOT NULL,
  property_type text NOT NULL, intent owner_intent NOT NULL, city text NOT NULL, approximate_size text NOT NULL,
  address text NOT NULL, notes text NOT NULL, uploads jsonb NOT NULL DEFAULT '[]'::jsonb,
  status owner_listing_status NOT NULL DEFAULT 'New',
  converted_to_property_id int REFERENCES properties(id) ON DELETE SET NULL,
  admin_notes text, is_read boolean NOT NULL DEFAULT false, submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contact_messages (
  id serial PRIMARY KEY, name text NOT NULL, phone text NOT NULL, email text NOT NULL,
  enquiry_type text NOT NULL, message text NOT NULL, status contact_status NOT NULL DEFAULT 'New',
  admin_notes text, is_read boolean NOT NULL DEFAULT false, submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE media (
  id serial PRIMARY KEY, url text NOT NULL, alt_text text NOT NULL, filename text, created_at timestamptz NOT NULL DEFAULT now()
);

-- Serverless-safe rate limiting (5/min and 20/hour per IP per bucket), used by the Edge Function via check_rate_limit().
CREATE TABLE rate_limits (
  id bigserial PRIMARY KEY, bucket text NOT NULL, ip text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rate_limits_lookup ON rate_limits (bucket, ip, created_at);
