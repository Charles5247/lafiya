# Supabase setup

1. Create a Supabase project. In SQL Editor, run `rebuild-package/schema.sql`, then `rebuild-package/supabase-setup.sql`, then `rebuild-package/seed.sql`, in that order. The setup SQL creates the public `site-media` and private `owner-uploads` buckets and RLS policies.
2. In Authentication → Users, create the first staff account with email and a temporary password. In SQL Editor run `update public.profiles set role='admin' where email='THE_ADMIN_EMAIL';` and `update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data,'{}'::jsonb) || '{"must_change_password":true}'::jsonb where email='THE_ADMIN_EMAIL';`. The admin UI asks for a new password at first login. Subsequent staff start as `user` and an admin promotes them in `/admin`.
3. With Supabase CLI 1.215.0+ (required for the JavaScript entrypoints in `supabase/config.toml`), deploy `submit-form` and `owner-upload-url`. Set Edge secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `UPLOAD_SIGNING_SECRET` (a long random value shared by both functions), `SITE_ORIGIN`, `RESEND_API_KEY`, `OFFICE_EMAIL=info@mailafiyahomes.ng`, `FROM_EMAIL`. Do not prefix secrets with `VITE_`.
4. Set the frontend's `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Project Settings → API. Verify `mailafiyahomes.ng` in Resend before relying on office email delivery.
5. On a disposable or staging project, run `node --env-file=.env.local scripts/verify-rls.mjs`. It reads Active properties and attempts structurally valid anonymous inserts, requiring an RLS denial (`42501`). Query `enquiries`, `property_listings`, and `contact_messages` as anon and confirm zero rows. Repeat as an editor: content can be edited, but `profiles`, `site_settings`, and `metrics` cannot.

The SQL source contains 20 public tables including `rate_limits`; the brief calls these 19 content collections plus the rate-limit table.

If the three SQL files were run before the CEO interview URL was added, run this once in SQL Editor:

```sql
update public.about_page
set ceo_video_url = 'https://drive.google.com/file/d/1tYeomZVlTK2irv9rCU1Q7oQQgS75_1I3/view'
where id = 1;
```

In Google Drive, give the video **Anyone with the link → Viewer** access so visitors can play its embedded preview. The file owner controls this permission; the app cannot change it.
