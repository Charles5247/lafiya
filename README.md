# Mai'Lafiya Homes & Properties Ltd.

See [QA-REPORT.md](QA-REPORT.md) for the acceptance checklist and unverified live checks. The current repository builds without Supabase credentials using the supplied seed preview; connect Supabase before launch.

React 18 + Vite, plain JSX, Supabase backend. No payment flow.

## Run locally

1. Install Node 20+, then run `npm install`.
2. Copy `.env.example` to `.env.local` and fill in the public Supabase URL and anon key plus the site URL. The service-role key is never used in the frontend.
3. Follow [SUPABASE-SETUP.md](SUPABASE-SETUP.md), then run `npm run dev`.
4. Run `npm test` and `npm run build` before deploying.

## Deploy

Deploy the Supabase Edge Functions, set their secrets, and verify `mailafiyahomes.ng` in Resend. Deploy the static `dist` output to Netlify, Vercel, or Cloudflare Pages with the Vite environment variables. Configure the host to serve the generated route HTML and fall back to `index.html` for `/admin` and unknown client routes. Set `SITE_ORIGIN` to the exact deployed origin. Add a Supabase Database Webhook on `public.properties` INSERT/UPDATE/DELETE that calls your host's build hook so property previews and sitemap refresh after edits. Store the build-hook secret only in Supabase.

Rollback the frontend by redeploying the previous build. For database changes, retain a SQL backup before migrations. Form submissions remain in Supabase if Resend is unavailable.

## How the client edits content

Sign in at `/admin`. Use the left menu to choose a content table, search records, edit, save, or export CSV. `properties` holds listings; set `status` to `Active` to publish. `hero_slides`, `promises`, reviews, case studies, partners, and the singleton page tables control public copy. Add photos through Media library with required alt text, then paste the resulting URL into content. Owner submissions appear under `property_listings`; use Convert to create a Draft property, complete its fields, then activate it. Admins may update staff roles; editors cannot. Change the initial password when prompted.

Uploaded owner photos remain private. Staff use signed Storage links to view them. Keep the Resend sender domain verified and set `VITE_GA4_ID` when analytics is ready; visitors' consent controls analytics events.
