# Mai'Lafiya Homes & Properties: Build Spec (from the working Floot build)

This spec records what was built and verified in the Floot prototype, so it can be rebuilt in VS Code with Codex. It sits alongside the original **design handoff** (`design_handoff_mailafiya_homes.zip`). The handoff's `README.md`, `CLIENT-BRIEF.md`, `variation-1.jsx` and `variation-1.css` stay the source of truth for **visuals and layout**. This spec is the source of truth for **decisions, behaviour, data and fixes** that came after.

## 1. Decisions already made (do not reopen)

| Topic | Decision |
|---|---|
| Business name | **Mai'Lafiya Homes & Properties Ltd.** (RC 7394323). Ignore "General Merchants" in `data.js` and the prototype footer |
| Tagline | **"Your Profit, Our Priority"** (blue logo identity). Do NOT use the "Your Trust, Our Commitment" green/gold banner seen behind the founder in his photo |
| Founder / CEO | **Mr. Kingsley Agena**, Founder & Chief Executive. Ignore "Alhaji Musa Danladi" in the prototype |
| Logo | The blue/black **MH house monogram** (`assets/logo-mh.png`, transparent PNG). Header shows monogram + text lockup "MAI'LAFIYA HOMES / & PROPERTIES LTD. · EST. 2008"; hide the sub-line under 420px |
| Palette | Handoff tokens exactly: `--clay #1E3AB8` (primary blue), `--clay-dk #142A87`, `--green #0E1E4F` (deep navy), `--green-dk #060F2D`, `--gold #D4A73E`, `--gold-dk #B68A26`, `--cream #FBF7F1`, `--cream-dp #F3ECDF`, `--char #1F1B16`, `--muted #6B6459`, `--border #E6DFCF`, WhatsApp `#25D366` |
| Fonts | Fraunces (display; italic `<em>` is gold) + DM Sans (body) |
| Hausa copy | Keep verbatim: Amana, Adalci, Sabuntawa, Al'umma |
| Prices | Full Naira figures (`₦45,000,000`), never abbreviated, except the freeform `valueOfDealsClosed` text ("₦12B+") |
| Warehouse | Always the first category and the lead of every category list |
| Contact | +234 803 555 0142 (phone + WhatsApp `2348035550142`), info@mailafiyahomes.ng, Plot 14 Bompai Industrial Layout, Kano |
| Rate limit | 5 per minute and 20 per hour per IP per form (not the README's "5/hour") |

## 2. Stack: simple React in plain JavaScript (no payments, no TypeScript)

There is **no payment gateway**, so none of the heavy e-commerce stack is needed. The site still needs a small backend, because three things must be stored somewhere: the property listings the admin edits, the enquiry/contact/owner-listing form submissions, and owner photo uploads. **Supabase** provides all of that with no custom server to run.

| Layer | Choice |
|---|---|
| Frontend | **React 18 + Vite, JavaScript (JSX only, no TypeScript)**, React Router, plain CSS ported from the handoff (one stylesheet or CSS modules), `lucide-react` icons + an inline WhatsApp SVG, `zod` for form validation |
| Database, login, files | **Supabase**: Postgres (`schema.sql`, `supabase-setup.sql`, `seed.sql`), Auth (email + password, staff only), Storage (`site-media` public, `owner-uploads` private) |
| Server code | **One Supabase Edge Function** (`submit-form`) + one small `owner-upload-url` function. They handle the honeypot, rate limit (`check_rate_limit()` RPC), validation, storing, and email through **Resend** |
| Admin | A React page at `/admin` in the same app, talking to Supabase directly under row-level security (RLS). No admin framework needed |
| Hosting | Static frontend on **Netlify, Vercel or Cloudflare Pages** (free tier is enough) + Supabase free tier. Custom domain later |
| SEO and link previews | Pre-render public pages at build time with **`vite-react-ssg`** (or `vite-plugin-ssr`), including one page per Active property (fetched from Supabase at build). A Supabase database webhook calls the host's build hook when properties change so WhatsApp/Google previews stay fresh. Live data on the page is still fetched at runtime, so listing edits appear instantly |

**Why not a plain-JavaScript site?** It's possible, but with 7 pages, URL-synced filters, an admin and three forms you would end up hand-writing a small framework. React keeps it simple and is easier for Codex to get right.

**What the visitor can never do:** write to the database directly. RLS blocks it; only the Edge Function (service role) inserts submissions.

**Setup order:** create a Supabase project, then run `schema.sql`, `supabase-setup.sql` and `seed.sql`. Create the first staff user in Supabase Auth and set that profile's `role` to `admin`. Deploy the Edge Functions with secrets (`RESEND_API_KEY`, `OFFICE_EMAIL`, `FROM_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY`). Connect the frontend host with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Verify `mailafiyahomes.ng` in Resend or notification emails will not reach the office.

## 3. Pages (7 public + admin)

`/` Home · `/properties` · `/properties/[slug]` · `/services` · `/about` · `/list-your-property` · `/contact` · admin at `/admin`.

### Home: 16 sections in this order
Top band (tagline · phone · "WhatsApp us") → sticky header → **hero** (6 slides, 5.5 s auto-advance, 1.2 s cross-fade, dots, pause on hover, respects reduced motion; Hot Deal spotlight card; 4-field search bar: I want to / Property type / City / Budget) → trust bar (5 stats from metrics) → category strip (Warehouses Lease, Warehouses Sale, Management Services, Commercial, Residential, Land) → 4 "promises" → featured properties with tabs (Warehouse, Commercial, Residential, Land, 3 each) → founder video band → story + 4 stats → Google-style reviews (4) → case studies (3) → partners row → blue CTA band → footer → floating WhatsApp button.

Every count and number comes from the database (metrics, live listing counts, "See N available warehouses"), never hard-coded.

### Listings
Filters (category, city, listing type, max-price slider 10M to 5B step 10M, debounced 300 ms), sort (Featured, Newest, Price asc/desc), grid/list toggle persisted in localStorage, server-side pagination (9 per page) with ellipsis, empty state with Reset, all synced to the URL (`?category=&city=&listing=&minPrice=&maxPrice=&sort=&page=`). Hero budget options: Any · Under ₦100M · ₦100M–₦500M · ₦500M–₦1B · Over ₦1B (uses `minPrice`).

### Property detail
Gallery (main + 4 thumbs, "+N" overlay, fullscreen lightbox with keyboard arrows/Esc), video-tour badge when a URL exists, spec strip that adapts by category (warehouse: bays, clear height, truck parking; residential: beds, baths), description, features checklist, location block, 3 similar properties, sticky sidebar (agent card, enquiry form, WhatsApp button, call button, trust notes), JSON-LD `RealEstateListing`, per-property meta title/description/OG image. WhatsApp pre-fill: `Hi, I'm interested in [title]. Is it still available?`.

### Other pages
Services (6 services + 4-step process, content from DB), About (story, founder quote card with portrait and optional video, 4 values, team grid with founder first), List-your-property (owner form + photo upload + benefits + quote), Contact (form + 4 contact cards + map block).

## 4. Data model
`schema.sql` and `seed.sql` in this package hold the exact 19 collections plus `rate_limits`. Notes:
- `properties.price` is `bigint`. Treat it as a string in JS if you use a driver that returns bigint as text.
- Only one `is_hot_deal = true` at a time (unique partial index + the app clears the old one in the same transaction).
- Status workflow: Draft / Active / Under Offer / Let / Sold / Archived. **Only Active is public.**
- Slugs auto-generate from the title and stay unique (append `-2`, `-3`).
- Singletons (`site_settings`, `metrics`, `about_page`, `services_page`) have `id = 1`.
- Image fields hold either a full URL or a handoff asset key (`assets/xxx.jpg`); a resolver maps keys to hosted files. **If no file exists, render an on-brand navy placeholder, never a broken image.**

## 5. Behaviour contracts

**Public reads** (supabase-js from the browser, allowed by RLS): home bundle (slides, hot deal, featured, promises, reviews, case studies, partners, founder block); property list (filters above); property detail (+ similar, agent); About and Services page data; site bundle (settings, metrics, categories and cities with live counts, lease/sale warehouse counts).

**Forms (enquiry, contact, owner listing):**
1. Zod-validate on client and server. Name ≥ 2 chars, valid email, phone digits/space/+/-/() ≥ 7, message ≥ 10.
2. **Honeypot field `website`**: if filled, return success and store nothing (do not return an error, it tips off bots).
3. Rate limit 5/min and 20/hour per IP per form using the `check_rate_limit()` database function (read the IP from `x-forwarded-for`). Return 429 with a friendly message.
4. Store first; **then** email `info@mailafiyahomes.ng` and send the submitter an auto-reply. A failed email must never lose the submission or fail the request.
5. Success panel: "Thanks, we'll reply within 4 hours". Inline field errors. Toast or inline message on network error.
6. Owner photo upload: JPG/PNG/WebP only, ≤ 10 MB, max 6 files, **private** `owner-uploads` bucket; the `owner-upload-url` Edge Function returns a short-lived signed upload URL; the form function only accepts file paths that function issued; staff view them through signed URLs.

**Admin (`/admin`, roles `admin` and `editor`):** CRUD for every collection; search, sort, status filters; relation dropdowns; image upload with **required alt text** stored in the media library; Properties auto-slug (client-side, kept unique) and Hot Deal exclusivity (database trigger); submissions inboxes (enquiries, owner listings, contact messages) with status, assignee, internal notes, unread badges, **CSV export** (neutralise spreadsheet formula injection by prefixing cells starting `= + - @` with `'`); "Convert owner listing to Draft property" (call the `convert_listing_to_property` RPC); dashboard counts (new enquiries/listings/messages, active and draft properties); editors cannot manage staff or site settings (RLS enforces this, not just the UI); users can't change their own role; change-password screen. **Force a password change on first login** (not built in Floot, build it now; Supabase Auth `updateUser`).

## 6. Bugs found in the prototype: avoid repeating them
1. **JSON columns stored as strings.** In the Floot build, `JSON.stringify(array)` was stored as a JSON *string*, not an array, which silently broke galleries, features and uploads. With supabase-js pass real JS arrays/objects (never `JSON.stringify` them). Add a test that `jsonb_typeof(gallery) = 'array'` after an admin save.
2. Honeypot returned a 400, tipping off bots (see §5).
3. "Over ₦1B" budget ignored its lower bound. A `minPrice` param fixes it.
4. A semantic `--muted` token (a surface colour) collided with the handoff's `--muted` (grey text colour). Keep them distinct.
5. Heading colour: a global `h1…h6 { color }` rule beat component classes and washed out headings on dark bands. Headings should inherit colour.
6. A `<button>` heart nested inside a `<Link>` card is invalid HTML. Use a stretched-link pattern (title link with an `::after` overlay, heart button above it).
7. Hot-deal and featured logic must filter on `status = 'Active'`.

## 7. Mobile requirements (verified against code, not yet on a device)
Test at 375, 393, 412, 768 and 1240+.
- Hamburger drawer under 820 px; desktop nav hidden; header brand never overflows (hide sub-line under 420 px).
- Hero stacks: headline, then CTAs (full-width buttons that may wrap), then the Hot Deal card, then the search bar as a single column.
- All text inputs and selects are **16px** (stops iOS auto-zoom). All tap targets ≥ 44 px.
- Category strip: 2 per row as horizontal tiles. Trust bar: 2 columns, last item full width. Footer: brand and contact full width, link columns 2-up.
- Listings filter bar: 2 columns, with the price slider and Reset full width. Pagination wraps.
- **Property detail: a sticky bottom bar with Call / WhatsApp / Enquire** (Enquire scrolls to the form); hide the floating WhatsApp button on those pages. Lightbox arrows move to the bottom.
- About founder card stacks; floating WhatsApp is icon-only; cookie banner and floating button respect `env(safe-area-inset-bottom)`.
- No horizontal scroll anywhere (`overflow-x: clip` on the root).
- Admin: collapsible menu on mobile, tables scroll horizontally, forms single column.

## 8. Still open / not done in the prototype
- **Real photography.** Only the logo and founder portrait exist. All property, hero, team, review-avatar and case-study images from the handoff `assets/` folder are missing. See §9.
- Privacy, Terms and Cookies pages (footer shows them as plain text).
- GA4: events are wired (`property_view`, `enquiry_submitted`, `whatsapp_click`, `phone_click`, `list_property_submitted`) behind a consent banner; add the real measurement ID.
- `sitemap.xml` and `robots.txt` generated at build time; per-page OG images.
- The map block is a styled placeholder; swap for a real map (Google/Mapbox) if the client wants one.
- No Hausa translation yet; keep all UI strings in one central file so it can be added.

## 9. Assets
Provided in `assets/`: `logo-mh.png` (transparent, 480 px wide) and `founder-portrait-cropped.jpg` (4:5, watermark and old banner removed). Everything else must be supplied. Expected filenames (from the handoff): `warehouse-facility-1`, `warehouse-aerial-1/2`, `warehouse-interior-1/2`, `warehouse-loading`, `warehouse-exterior-2`, `office-1..4`, `duplex-1/3`, `apartment-1..3`, `land-1/2`, `team-1..3`, `handshake-1/2`.

## 10. Acceptance checklist
- [ ] All 7 pages match the handoff prototype on desktop and at 375 px, with no horizontal scroll
- [ ] 19 tables in Supabase, seeded, editable in `/admin`; roles enforced by RLS (test as an editor and as a logged-out visitor)
- [ ] A visitor cannot write to any table directly (try with the anon key)
- [ ] Filters, sort, pagination and URL sync work; empty state works
- [ ] Only one Hot Deal can exist; only Active properties are public
- [ ] All 3 forms: validation, honeypot, rate limit, stored, emailed, auto-reply
- [ ] Owner photo upload works end to end; staff can open the files
- [ ] CSV export works; convert-to-property works
- [ ] JSON array columns verified as arrays after admin save
- [ ] Pre-rendered meta, OG tags, JSON-LD, sitemap, robots (check a property link preview in WhatsApp)
- [ ] Lighthouse ≥ 90 on Home, Listings and Detail (mobile)
- [ ] No console errors, no broken images
