# Mai'Lafiya Homes & Properties Ltd.

See [QA-REPORT.md](QA-REPORT.md) for the acceptance checklist and unverified live checks. The current repository builds without Supabase credentials using the supplied seed preview; connect Supabase before launch.

React 18 + Vite, plain JSX, Supabase backend. No payment flow.

## Run locally

1. Install Node 20+, then run `npm install`.
2. Copy `.env.example` to `.env.local` and fill in the public Supabase URL and anon key plus the site URL. The service-role key is never used in the frontend.
3. Follow [SUPABASE-SETUP.md](SUPABASE-SETUP.md), then run `npm run dev`.
4. Run `npm test` and `npm run build` before deploying.

## Deploy

The public site and staff CMS are separate Vercel projects connected to this repository. Both use `npm run build` and output `dist`. Set `VITE_DEPLOY_TARGET=admin` only on the admin project; the public project leaves it unset. The public build excludes the admin route, while the admin build serves the CMS at its own project root and disallows indexing. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` on both projects so staff edits and public listings use the same Supabase database. Set `VITE_SITE_URL` to the public site's origin on both projects. Keep the service-role key and passwords out of Vercel's `VITE_` variables and this repository.

Create the staff account in Supabase Authentication, then set its `public.profiles.role` to `admin` as described in [SUPABASE-SETUP.md](SUPABASE-SETUP.md). The CMS lets staff add and edit properties, upload public media, review submissions from the public "List with us" form, and convert approved owner submissions to Draft properties. Publish a property by changing its status to `Active`. After deploying both projects, verify that the admin domain opens the login page, the public `/admin` route is unavailable, and a staff-created Active property appears on the public site.

Deploy the Supabase Edge Functions, set their secrets, and verify `mailafiyahomes.ng` in Resend. For Vercel, import this GitHub repository twice, once for each project. The committed `vercel.json` sets `npm run build` and `dist`; the admin project's `VITE_DEPLOY_TARGET` selects its separate build. In Vercel Project Settings → Environment Variables, set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SITE_URL` for Production and Preview before deploying; set `VITE_GA4_ID` on the public project only when analytics is ready. Vercel builds fail if the two Supabase values are absent. These `VITE_` values are public browser configuration: never add a Supabase service-role key or Resend key to Vercel. Use the deployed public origin as `SITE_ORIGIN` in Supabase Edge Function secrets. The public build reads Active properties with the anon key and fails if that query fails, so initialize the database first.

In the public Vercel project's Git settings, connect the repository and set the production branch. Add a Deploy Hook there; create a Supabase Database Webhook on `public.properties` INSERT/UPDATE/DELETE that calls it so property previews and sitemap refresh after edits. Store the deploy-hook URL only in Supabase. Vercel's generated `*.vercel.app` URL can be used for a preview; configure the final domain and update `VITE_SITE_URL`, `SITE_ORIGIN`, Supabase Auth URL settings, and Resend domain verification before launch. Verify `/`, `/properties`, and one property detail on the public deployment, then verify `/` on the separate admin deployment.

Rollback the frontend by redeploying the previous build. For database changes, retain a SQL backup before migrations. Form submissions remain in Supabase if Resend is unavailable.

## How the client edits content

Sign in at the separate admin project's URL. Use the left menu to choose a content table, search records, edit, save, or export CSV. `properties` holds listings; set `status` to `Active` to publish. `hero_slides`, `promises`, reviews, case studies, partners, and the singleton page tables control public copy. Add photos through Media library with required alt text, then paste the resulting URL into content. Owner submissions appear under `property_listings`; use Convert to create a Draft property, complete its fields, then activate it. Admins may update staff roles; editors cannot. Change the initial password when prompted.

Uploaded owner photos remain private. Staff use signed Storage links to view them. Keep the Resend sender domain verified and set `VITE_GA4_ID` when analytics is ready; visitors' consent controls analytics events.

The CEO interview is edited in `about_page.ceo_video_url`. The supplied Google Drive link opens in an on-page viewer; the Drive file must be shared as **Anyone with the link → Viewer** for public visitors.
