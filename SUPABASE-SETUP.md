# Supabase setup

1. Create a Supabase project. In SQL Editor, run `rebuild-package/schema.sql`, then `rebuild-package/supabase-setup.sql`, then `rebuild-package/seed.sql`, in that order. The setup SQL creates the public `site-media` and private `owner-uploads` buckets and RLS policies.
2. In Authentication → Users, create the first staff account with email and password. In SQL Editor run `update public.profiles set role='admin' where email='THE_ADMIN_EMAIL';`. Set the Auth user's `raw_user_meta_data.must_change_password` to `true` before their first login. Subsequent staff start as `user` and an admin promotes them in `/admin`.
3. Deploy `submit-form` and `owner-upload-url`. Set Edge secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_ORIGIN`, `RESEND_API_KEY`, `OFFICE_EMAIL=info@mailafiyahomes.ng`, `FROM_EMAIL`. Do not prefix the service key with `VITE_`.
4. Set the frontend's `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Project Settings → API. Verify `mailafiyahomes.ng` in Resend before relying on office email delivery.
5. RLS verification with the anon key: query `properties` and confirm only `status='Active'` rows return; query `enquiries`, `property_listings`, and `contact_messages` and confirm zero rows; attempt an insert into each and confirm rejection. Repeat as an editor: content can be edited, but `profiles`, `site_settings`, and `metrics` cannot. Run the included automated RLS probe against a connected project.

The SQL source contains 20 public tables including `rate_limits`; the brief calls these 19 content collections plus the rate-limit table.
