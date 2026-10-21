# Architecture

React 18 + Vite (JSX) serves seven public routes and `/admin`. React Router owns navigation. `src/lib/supabase.js` creates the anon client; `src/lib/data.js` supplies public read hooks. Components share `src/styles.css`, with the handoff palette, and all interface copy lives in `src/strings.js`.

Routes: `/`, `/properties`, `/properties/:slug`, `/services`, `/about`, `/list-your-property`, `/contact`, `/admin`. Public chrome includes top band, sticky header, footer, consent banner and WhatsApp. The admin is auth gated, reads a profile role, and provides table editing and submission inboxes.

Data: public Supabase queries rely on RLS. Mutations to submissions use `submit-form`; owner uploads use `owner-upload-url`. Staff CRUD uses authenticated Supabase queries under RLS. JSONB values remain native JS arrays/objects.

Environment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`, `VITE_GA4_ID`; Edge secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `OFFICE_EMAIL`, `FROM_EMAIL`, `SITE_ORIGIN`.

Build: `vite-react-ssg` pre-renders fixed routes and Active property slugs fetched at build time. A Supabase database webhook triggers the host build hook on property changes. Runtime queries refresh visible data.
