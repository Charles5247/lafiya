# Paste this into Codex (VS Code)

Before sending, put these in your project folder so Codex can read them:

```
/design_handoff_mailafiya_homes/     <- unzip your original handoff here
/rebuild-package/
    BUILD-SPEC.md
    schema.sql
    supabase-setup.sql
    seed.sql
    assets/logo-mh.png
    assets/founder-portrait-cropped.jpg
```

You also need two free accounts: **Supabase** (database, login, file storage) and **Resend** (email). Hosting on Netlify, Vercel or Cloudflare Pages is free too.

---

You are a senior front-end engineer. Build the complete website and admin back office for **Mai'Lafiya Homes & Properties Ltd.**, a Kano-based warehousing and real-estate agency, in this empty repository. Keep it **simple**: React + Vite in **plain JavaScript (JSX, no TypeScript)**, with **Supabase** as the backend. There are no payments, so do not add any payment, cart or checkout code.

## Sources of truth, in this order
1. `/rebuild-package/BUILD-SPEC.md`: decisions, behaviour, data rules, bugs to avoid, mobile rules. **Read it fully first.** Its decisions override the handoff wherever they differ (business name, CEO name, tagline, logo, rate limits).
2. `/design_handoff_mailafiya_homes/`: visual design and layout. Study `README.md`, `CLIENT-BRIEF.md`, `variation-1.jsx`, `variation-1.css`, `shared-icons.jsx`, `data.js`, and open `Mai'Lafiya Prototype.html` in a browser. Recreate the design faithfully. These are design references, not production code: do not copy the inline-Babel setup.
3. `/rebuild-package/schema.sql`, `supabase-setup.sql`, `seed.sql`: the exact database, security rules and seed content.

## Stack (fixed, do not substitute)
- React 18 + Vite, JavaScript only, React Router, `zod`, `lucide-react`, plain CSS ported from `variation-1.css` using the exact design tokens in BUILD-SPEC §1.
- Supabase: Postgres + Auth + Storage + Edge Functions (Deno). Frontend uses `@supabase/supabase-js` with the anon key only. **Never ship the service-role key to the browser.**
- Email via Resend, called from the Edge Function only.
- Pre-render public pages at build time with `vite-react-ssg` (include one page per Active property) so WhatsApp and Google link previews work. Add a Supabase database webhook note to the README for triggering rebuilds.

## Build order
1. **Plan**: write `ARCHITECTURE.md` (routes, components, data hooks, Edge Functions, env vars). Do not wait for approval.
2. **Foundation**: Vite app, design tokens, fonts, layout (top band, sticky header with the MH logo, footer, floating WhatsApp, cookie/consent banner), Supabase client, image resolver with on-brand placeholders when a file is missing.
3. **Database**: give me a short `SUPABASE-SETUP.md` with the exact steps to run the three SQL files and create the first admin. Verify RLS: a logged-out visitor can read Active properties but cannot read submissions or write anything.
4. **Public pages**, in this order, comparing each against the prototype before moving on: Home (all 16 sections) → Listings → Property detail → Services → About → List-your-property → Contact.
5. **Edge Functions**: `submit-form` (enquiry, contact, owner listing) and `owner-upload-url`. Zod validation, **silent honeypot**, `check_rate_limit()`, store **then** email, auto-reply to the submitter, CORS locked to the site's domain.
6. **Admin at `/admin`**: Supabase Auth login, forced password change on first login, generic CRUD for every table, dashboard counts, inbox statuses/notes/assignee, CSV export (with formula-injection guard), convert-owner-listing-to-draft (`convert_listing_to_property`), image upload with required alt text, staff management for admins only.
7. **SEO and analytics**: per-page meta, Open Graph, JSON-LD `RealEstateListing`, `sitemap.xml`, `robots.txt`, GA4 events behind the consent banner.
8. **Mobile and QA pass** (BUILD-SPEC §7 and §10): test at 375, 393, 412, 768, 1240. Fix every issue. Run Lighthouse on Home, Listings and Detail (mobile target 90+).

## Hard rules
- A filled honeypot returns success and stores nothing. Never return a raw error to a bot.
- Store submissions **before** sending email. An email failure must not fail the request.
- Write real arrays/objects to JSON columns (BUILD-SPEC §6.1) and add a test for it.
- Visitors must never be able to write to any table directly. Test with the anon key.
- If a real image is missing, show the branded placeholder. No broken images, no lorem ipsum.
- Don't invent business facts. Use the copy in `seed.sql` and the handoff.
- Keep all UI strings in one central file so Hausa can be added later.
- Don't ask me questions. Make the best decision, record it in `ASSUMPTIONS.md`, and continue.

## Flag, don't fake
The handoff's `assets/` photos (properties, hero, team, avatars) are not available. Create `ASSETS-NEEDED.md` listing every expected file, where it is used and target dimensions. Email to `info@mailafiyahomes.ng` needs the domain verified in Resend.

## Definition of done
Work through BUILD-SPEC §10 and report pass/fail with evidence, then list anything not done and why. Also give me a "run locally and deploy" guide and a "how the client edits content" guide.
