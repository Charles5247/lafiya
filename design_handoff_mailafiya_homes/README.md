# Handoff: Mai'Lafiya Homes & Properties — Real Estate Website + Admin CMS

## Overview

This is the production handoff for **Mai'Lafiya Homes & Properties Ltd.** — a Nigerian
warehousing agency and real-estate business based in Kano, serving 6 cities across Northern
Nigeria. The client selected **Variation 1 — "Warm & Trust-Led"** from the two design
directions presented.

The build has two halves:

1. **Public marketing website** — homepage, property listings, property detail, services,
   about, list-your-property, contact (7 pages total)
2. **Admin CMS backend** — a content-management system (using the CMS's default admin UI —
   **no custom admin UI needs to be designed**) that lets the client manage every dynamic
   piece of content on the site: properties, testimonials, case studies, metrics, hero
   carousel, team members, partners, page copy, and form submissions.

Preferred stack: **Next.js 15 (App Router) + Tailwind CSS + Payload CMS** (or Strapi). See
`CLIENT-BRIEF.md` § 6 for the full data model.

---

## About the Design Files

The HTML/CSS/JSX files bundled here are **design references, not production code**. They
were created in this design tool using inline Babel JSX + hand-written CSS to prototype the
look, layout, and interactions. Do **not** ship them directly.

Your task is to **recreate these designs in the target production codebase's environment**
(Next.js 15 App Router with React Server Components, Tailwind, and Payload CMS as
recommended in `CLIENT-BRIEF.md`) using its established patterns:

- Turn each JSX component here into a proper RSC / client component split (data fetching
  on the server, interactive state client-side).
- Turn each CSS section into Tailwind utility classes + a small set of shared component
  classes for repeated patterns.
- Turn each hard-coded string/prop in `data.js` into a CMS-driven query.
- Turn each form into a Next.js Server Action posting to the CMS `submissions` collection.

The HTML/CSS is the **visual truth**. The CMS content model in `CLIENT-BRIEF.md` is the
**data truth**. Together they specify the build.

---

## Fidelity

**High-fidelity (hifi).** The mockups are pixel-perfect: final colors (with exact hex
values), typography (Fraunces + DM Sans), spacing, radii, hover states, and interactions
are all locked in. Recreate to visual parity.

---

## Screens / Views

### 1. Homepage `/`

**Purpose:** Convert visitors into enquiries. Warehouse-led hero, trust signals, featured
properties, CEO video interview, reviews, call to action.

**Layout (top to bottom):**

1. **Top band** (dark navy `#0E1E4F`, height ~34px) — marquee-style: ★ tagline "Your Profit,
   Our Priority" + service lines · phone number · WhatsApp CTA pill (green `#25D366`)
2. **Header** (sticky, cream bg, ~78px tall) — logo icon (44×44) + brand name lockup
   "MAI'LAFIYA HOMES / & PROPERTIES LTD. · EST. 2008" · centered nav pills (6 links) ·
   "Book a viewing" primary button
3. **Hero** (min-height 780px, 6-image auto-carousel bg with 5.5s interval + dark scrim)
   - Two-column grid `1.35fr 0.85fr`, padding `90px 32px 40px`
   - **Left column** (max-width 660px):
     - Eyebrow pill: gold accent border, "● NIGERIA'S WAREHOUSING SPECIALIST · 17 YRS · 340+ DEALS"
     - H1: Fraunces 52–92px clamp, "Own it. Lease it. / *Grow with it.*" (italic = gold `#D4A73E`)
     - Sub-copy: 17px cream
     - Value chip row: three inline "✓ Verified titles / Personally walked / Financing arranged" chips
     - CTA row: `v1-btn-primary` blue "See 45 available warehouses →" + `v1-btn-gold` "WhatsApp"
     - Micro-trust row: 5 gold stars + "4.9/5 · 218 client reviews · Response in 4 hours"
   - **Right column**: "HOT DEAL THIS WEEK" spotlight card (max 420px, cream bg, 20px radius,
     drop shadow). Gold badge pill on top with pulsing red dot animation. Property image
     (16:10 with rounded corners). Body: location tag, title, meta chips (size · bays · height),
     price + "View →" button. Clicking navigates to that property detail.
4. **Search bar** (below hero content, cream card, 5-column grid): "I want to · Property type · City · Budget · [Find properties]" button. Below: 6 pagination dots for hero carousel.
5. **Trust bar** — 5-column strip on cream, each item has a colored left border (alternating
   blue and gold) — 17 yrs / 340+ / ₦12B+ / 218 reviews / 4 hrs response
6. **Category strip** — 6 icon cards on cream bg (Warehouses Lease · Warehouses Sale ·
   Management · Commercial · Residential · Land). Each: icon in blue chip, label, listing count.
   Hover: border → blue, lift 2px.
7. **Why us** (cream-deep `#F3ECDF` bg, 90px vertical padding) — centered eyebrow + H2 "Four
   promises we keep, every deal." + 4-column grid of promise cards. Each card: icon chip
   (alternating blue/gold), title (Fraunces 22px), body. Hover: lift + blue border.
8. **Featured properties** (cream bg, 90px padding) — head with 🔥 eyebrow + H2 "Just listed
   — grab them before they go." + right-aligned tab pills (Warehouse / Commercial /
   Residential / Land). 3-column property card grid. "View all properties →" outline
   button below.
9. **CEO video** (full-width dark section, ~140px vertical padding, CEO portrait bg with
   dark scrim) — gold eyebrow "A WORD FROM OUR FOUNDER", big italic Fraunces quote pull,
   attribution line, 96×96 play button (blue circle with white play triangle + pulsing ring),
   "Watch the full interview · 8 min 42 sec" meta.
10. **Story + stats** (cream-deep bg, 2-column grid) — Left: eyebrow "Our story" + H2 +
    2 paragraphs + 2×2 stats grid (Fraunces numbers in blue, muted labels). Right: image
    collage — one large image top-right, one smaller bottom-left with cream border, floating
    round blue "17 years of trust" badge over both.
11. **Google reviews** — head with H2 "4.9 out of 5 · 218+ reviews" + 5-star row + "Verified
    on Google" badge. 4-column review grid. Each review: avatar + name + when + stars + body.
12. **Case studies** — head with H2 "Recent deals we've closed" + "See all work →" link.
    3-column grid, each case: 220px cover image + city eyebrow + Fraunces title + big
    metric number (in green `#0E1E4F`) + label.
13. **Partners row** — centered "Trusted by" label + horizontal wrap of partner name
    wordmarks (Fraunces, muted).
14. **CTA band** (blue `#1E3AB8` bg, 70px padding) — gold pill eyebrow "YOUR PROFIT, OUR
    PRIORITY", H2 "Your next warehouse is one message away.", body, gold button "Get a
    shortlist" + ghost WhatsApp button.
15. **Footer** (charcoal `#1F1B16` bg, 80px padding) — 4-column: brand + tagline · Explore
    links · Categories links · Contact info. Below: divider + copyright + legal links.
16. **Floating WhatsApp button** (always visible, fixed bottom-right, `#25D366` pill, gentle
    3s bob animation).

---

### 2. Property Listings `/properties`

**Purpose:** Filterable browse of all properties.

**Layout:**
- Hero band (cream-deep bg, 60px padding top / 40px bottom): breadcrumb + H1 "Browse our
  properties" + sub-copy with count
- **Filter bar** (cream card, 5-column grid: Category / City / Listing type / Max price
  (slider with live value display) / [Apply] button)
- **Toolbar** (below filter): results count · Sort dropdown · Grid/List toggle icons
- **Grid view**: 3-column property card grid (see Property Card component below)
- **List view**: horizontal rows — 260px thumbnail · body (category · title · description
  clip · meta) · right rail (listing badge · price · pricePeriod · "View details" button)
- Pagination: `< 1 2 3 … 14 >` centered

---

### 3. Property Detail `/properties/[slug]`

**Purpose:** Convert an interested visitor into an enquiry for a specific property.

**Layout:**
- Breadcrumb at top of container
- **Gallery** (2-column grid `3fr 1fr`, gap 12px):
  - Main image (aspect 16:10, radius 20px). Listing badge top-left. "▶ Video tour" pill
    bottom-right (dark backdrop-blur bg).
  - Right column: 4 stacked thumbnails, each 16:10 with radius 14px. Last thumbnail shows
    "+N" overlay if gallery > 4 images.
- **Body** (2-column grid `1fr 380px`, gap 60px):
  - **Left column**:
    - Head: category eyebrow, H1 (Fraunces 40px), save/share buttons — RIGHT: big Fraunces
      price in blue + period underneath
    - **Spec strip** (cream-deep bg, radius 16px, padding 24px) — 4–6 spec blocks depending
      on property type. Warehouse: Size / Loading bays / Clear height / Truck parking.
      Residential: Size / Bedrooms / Bathrooms / Year built.
    - Description block (H3 + long-form paragraph)
    - Features & amenities: H3 + 2-column checklist (green checkmarks + item)
    - Location: H3 + map placeholder (16:7, cream-deep bg, floating white "📍 Area, City,
      State" chip in center, subtle grid + radial gradient overlay)
    - Similar properties: H3 + 3-column property card grid
  - **Right sidebar** (sticky, top 100px):
    - Agent card: dark green `#0E1E4F` bg, radius 16px, padding 20px. 48×48 avatar + name
      (Fraunces 17px) + role (small cream 12px) + phone pill.
    - **Inquiry form** (cream card, radius 16px, padding 24px): name / phone / email /
      inquiry-type select / message textarea. "Send enquiry" primary button (full width).
      "or" divider. WhatsApp button (full width, green). "Call [phone]" outline button.
    - Trust mini (cream-deep bg, radius 12px): 3 rows — Title verified / Personally walked
      / Listed X days ago (each with green icon).

---

### 4. Services `/services`

**Purpose:** Explain all 5+ service lines and win consideration for less-obvious ones
(management, valuation, consulting).

**Layout:**
- Page hero (cream-deep bg): breadcrumb + eyebrow + H1 "Warehousing, real estate, / and
  everything in between." + sub-copy
- **Services grid** — 3×2 of service cards. Each card: cream bg, border, 32px padding,
  radius 20px. Icon chip · Fraunces H3 · body · "Learn more →" link.
- **Process section** (dark navy bg, cream text): eyebrow (gold), H2 "A process built on
  clarity". 4-column grid of process steps — big Fraunces number in gold + Fraunces title
  + body.
- CTA band (same as homepage)

---

### 5. About `/about`

**Purpose:** Build trust via story, values, team.

**Layout:**
- Page hero: breadcrumb + eyebrow + H1 "Well-being begins with / a place that works."
- **Story section**: 2-column — Left: 520px image with radius 20px. Right: eyebrow + H2
  "From a Bompai family shop to Northern Nigeria's trusted name." + 2 paragraphs.
- **Values section** (cream-deep bg): centered eyebrow + H2 "What we hold ourselves to".
  4-column grid of value cards — each: Fraunces title in blue + short description.
- **Team section**: centered eyebrow + H2 + 4-column grid — each card has aspect 4:5 image
  with radius 16px + Fraunces name + muted role.
- CTA band

---

### 6. List Your Property `/list-your-property`

**Purpose:** Get property owners to submit their properties for listing/management.

**Layout:**
- Page hero: breadcrumb + eyebrow + H1 "Let us find a tenant / you'll be glad you signed."
- 2-column body (grid `1fr 360px`, gap 60px):
  - **Left**: form card (cream bg, radius 20px, padding 32px, border). Fields:
    - Name + Phone (2-column row)
    - Email
    - Property type + Intent (2-column row) — selects
    - City + Approximate size (2-column row)
    - Address / area
    - Tell us more (textarea)
    - **Upload photos** — dashed border dropzone (cream-deep bg) with upload icon + prompt
      copy
    - "Submit property details" primary button (full width)
  - **Right sidebar** (sticky):
    - Perks list — 4 items with green checkmarks + strong lead + body text
    - Testimonial quote card (dark green bg, cream text) — quote icon + blockquote + cite

---

### 7. Contact `/contact`

**Purpose:** Multi-channel contact + office info.

**Layout:**
- Page hero: breadcrumb + eyebrow + H1 "We reply to every enquiry / within 4 working hours."
- 2-column body:
  - **Left**: contact form (cream bg, radius 20px, padding 32px)
    - Name + Phone (row)
    - Email
    - Enquiry type (select with 6 options)
    - Message (textarea)
    - "Send message" primary (full width)
  - **Right**: 4 stacked contact cards — Phone / WhatsApp / Email / Head office. Each:
    icon chip + label + Fraunces value + sub-line.
- Full-width map placeholder at bottom (aspect 16:6, radius 16px)

---

### Mobile Views

All 7 pages fully responsive. Test at 375px width.

Key mobile transformations:
- Header → hamburger menu with slide-down drawer
- Hero: single-column stack, hot-deal card below headline instead of beside it
- All grids → single column
- Search bar → stacked vertical
- Filter bar → 2-column grid
- Property detail gallery → main + 4 thumbnails as horizontal row below
- Property detail sidebar → un-sticks, stacks under main content
- Footer 4-col → 2-col
- Floating WhatsApp button: no label, icon-only

---

## Interactions & Behavior

### Navigation
- All internal links use client-side routing (`next/link`)
- Header nav shows active state (`is-active` — blue bg pill on desktop, blue text on mobile)
- Breadcrumbs link back through hierarchy
- Property card click → property detail (`/properties/[slug]`)
- Hero spotlight card click → that property's detail

### Hero carousel
- 6 slides, auto-advance every 5.5s
- Dot pagination clickable to jump
- Cross-fade transition 1.2s ease
- Pause on hover (optional enhancement)

### Property cards (grid + list)
- Hover: `translateY(-4px)` + soft shadow (`0 20px 40px -20px rgba(31,27,22,0.2)`)
- "View →" pill changes bg from cream-deep to blue on card hover
- Heart button click: `stopPropagation` — toggle saved (backend-optional feature; can be
  localStorage-only for v1)

### Filters & sorting (listings)
- Debounced query update (300ms)
- URL query string reflects filters (shareable/bookmarkable)
- "Apply" button not strictly needed if filters are live — keep for mobile UX
- Grid ↔ List toggle: persist choice in localStorage

### Forms
- All submissions POST to CMS `submissions` collection endpoints
- Client-side validation with Zod schema (name required, email valid, phone required, message
  min 10 chars)
- Server-side re-validation on Server Action
- Success state: replace form with "Thanks — we'll reply within 4 hours" panel
- Error state: inline field errors + toast for network errors
- Rate limit: 5 submissions per IP per hour
- Honeypot field: hidden `<input name="website">` — reject if filled

### WhatsApp buttons
- Always use `https://wa.me/2348035550142?text=<url-encoded-message>` deep links
- On property detail: pre-fill message `"Hi, I'm interested in [property title]. Is it still available?"`
- Floating WhatsApp button: pre-fill `"Hi Mai'Lafiya, I'd like to enquire about a property."`

### Phone buttons
- `tel:+2348035550142` links — trigger native dialer

### CEO video
- Currently a static play button. On click, replace with embedded video player (YouTube
  or Vimeo — client to provide URL, stored in `about-page.ceoVideoUrl`).

### Property detail gallery
- Click thumbnail → replace main image (fade transition 200ms)
- Click main image → open fullscreen lightbox (roll your own or use `yet-another-react-lightbox`)
- Video tour badge → open lightbox with video

### Animations
- Hero spotlight pulsing dot: red 8px dot with expanding box-shadow, 2s infinite
- Floating WhatsApp bob: `translateY(0 → -4px → 0)`, 3s ease infinite
- CEO play button ring: scale 1 → 1.15 fade, 2.2s ease infinite
- All hover transitions: 0.2s ease

---

## State Management

Mostly server state via CMS. Client state needed:

**Homepage**
- Hero carousel index (client component, `useState` + `setInterval`)
- Featured properties tab (client component)

**Listings**
- Filter state (category, city, listing type, price range) — sync with URL search params
  via `useSearchParams` + `router.push`
- View mode (grid/list) — localStorage
- Sort — URL query param

**Property detail**
- Selected gallery image (client component `useState`)
- Lightbox open/close state
- Similar-properties current index (if carouseled)

**Forms**
- Form field state — `useFormState` (Next.js Server Actions)
- Submission loading state — `useFormStatus`
- Success/error state — server-returned

**Global (persistent, optional)**
- Saved properties list — localStorage array of property IDs (v1 client-only; can be
  server-side later)

---

## Design Tokens

### Colors (CSS custom properties, defined at root)

```css
--clay: #1E3AB8;         /* Primary royal blue */
--clay-dk: #142A87;      /* Hover state for primary */
--green: #0E1E4F;        /* Deep navy — dark section bg */
--green-dk: #060F2D;     /* Even darker navy */
--gold: #D4A73E;         /* Warm gold — accent, italic emphasis */
--gold-dk: #B68A26;      /* Gold hover */
--cream: #FBF7F1;        /* Main page bg + card bg */
--cream-dp: #F3ECDF;     /* Section alternate bg */
--char: #1F1B16;         /* Body text + footer bg */
--muted: #6B6459;        /* Secondary text */
--border: #E6DFCF;       /* Borders + dividers */
```

Also:
- WhatsApp green: `#25D366` (hover `#1EBE5D`)
- Hot-deal red dot: `#E74C3C`
- Cream on dark bg with 0.9 alpha for body text: `rgba(251,247,241,0.9)`

### Typography

- **Display font**: Fraunces (Google Fonts, opsz 9..144, weights 400/500/600)
  - Used for: all H1/H2/H3, prices, stat numbers, badge callouts, CEO quote, testimonial quotes
- **Body font**: DM Sans (Google Fonts, weights 400/500/600/700)
  - Used for: everything else — body text, buttons, form fields, labels, nav

**Type scale (desktop):**
- H1: `clamp(44px, 5.5vw, 72px)` — hero H1 uses `clamp(52px, 6.5vw, 92px)`
- H2: `clamp(32px, 3.5vw, 46px)`
- H3: 24px
- Property card title: 20px Fraunces 500
- Property card price: 22px Fraunces 500
- Body: 15px DM Sans 400, line-height 1.55
- Small: 13px, XS: 12px, tiny: 11px
- Eyebrow: 12px uppercase, letter-spacing 0.1em, color `--clay`, weight 600

### Spacing scale

Section vertical padding: `90px` desktop / `60px` mobile
Container: `max-width: 1240px; padding: 0 32px` desktop / `0 20px` mobile
Card padding: `20–32px` depending on card type
Grid gaps: `20–24px` (cards), `40–60px` (major columns)

### Border radius

- Buttons: `999px` (pill)
- Small chips/badges: `999px`
- Property cards / large cards: `20px`
- Medium cards / form fields: `16px`
- Inputs: `10px`
- Icon chips: `12–14px`

### Shadows

- Card hover: `0 20px 40px -20px rgba(31,27,22,0.2)`
- Hero spotlight card: `0 30px 80px -20px rgba(0,0,0,0.5)`
- Hero search bar: `0 30px 60px -20px rgba(31,27,22,0.4)`
- Floating WhatsApp: `0 15px 40px -8px rgba(37,211,102,0.6)`
- Story badge: `0 20px 40px -10px rgba(30,58,184,0.4)`

---

## Assets

**Logo files** (all in `assets/`):
- `logo-original.png` — full lockup with wordmark + services list + RC number (client-supplied)
- `logo-light.png` — same lockup with transparent bg (for use on cream/white)
- `logo-inverse.png` — full lockup, all marks converted to white (for dark backgrounds)
- `logo-icon.png` — square MH monogram only, transparent bg (for header/cards)
- `logo-icon-inverse.png` — square MH monogram, white/blue for dark backgrounds

**Photography** (placeholder images used in prototype, all Creative Commons — client should
supply their own):
- Warehouses: `warehouse-aerial-{1,2}.jpg`, `warehouse-facility-1.jpg`, `warehouse-interior-{1,2}.jpg`, `warehouse-loading.jpg`, `warehouse-exterior-2.jpg`
- Residential: `duplex-{1..4}.jpg`, `apartment-{1..3}.jpg`
- Commercial: `office-{1..4}.jpg`
- Land: `land-{1,2}.jpg`
- People: `ceo-portrait.jpg`, `team-{1..3}.jpg`, `handshake-{1,2}.jpg`

**Icons**: All inline SVG. See `shared-icons.jsx` — 30+ stroke icons in a consistent style
(warehouse, keys, gear, search, map, shield, phone, mail, whatsapp, bed, bath, ruler, car,
truck, door, arrow variants, play, star, check, chevrons, filter, grid, list, pin, clock,
quote, menu, close, heart, share, facebook, instagram, linkedin, building, factory, land,
upload). Recommend porting to a `<Icon name="…" />` component using the same SVG paths, or
migrating to `lucide-react` (most of the names map 1:1).

**Fonts**: Google Fonts — Fraunces + DM Sans — load via `next/font/google` for
performance + zero layout shift.

---

## Files in this handoff

Located in this handoff folder:

- `README.md` — this document
- `CLIENT-BRIEF.md` — machine-readable brief with full CMS data model, API spec, tech stack
  requirements, non-functional requirements, deliverables checklist. **Genspark should read
  this first — it drives the CMS build.**
- `Mai'Lafiya Prototype.html` — the interactive visual reference (open in a browser to see
  the site running with variation/page/device toggles)
- `variation-1.jsx` — full V1 React component code (all 7 pages + shared components)
- `variation-1.css` — full V1 stylesheet (~1300 lines, all tokens, layouts, hover states)
- `shared-icons.jsx` — the icon library
- `data.js` — seed content: 12 realistic properties, 4 Google reviews, 3 case studies, 6
  services, 4 "why us" items, business info, cities list, categories list. **Use this as
  seed data for the CMS.**

**Note:** `variation-2.jsx/css` and the shell HTML control bar were part of the exploration
but the client chose V1. They're excluded from this handoff. Skip them.

---

## Key implementation reminders

1. **The CMS data model in `CLIENT-BRIEF.md` § 6 is the source of truth.** Every hard-coded
   value in `data.js` maps to a collection field there.

2. **No custom admin UI needed.** Use Payload's or Strapi's default admin. The client just
   needs the *fields* right.

3. **Client wants full ownership.** Deploy the CMS on a VPS or Railway/Render — no SaaS
   lock-in (Contentful, Sanity, etc. are out).

4. **Warehousing leads.** Order property categories and homepage cards accordingly:
   Warehouse first, always.

5. **Nigeria-specific patterns**:
   - WhatsApp everywhere (float button + inline + property detail sidebar)
   - Full Naira figures, not abbreviated (`₦45,000,000` not `₦45M`)
   - Phone/WhatsApp as trust signals — display prominently, not hidden in footer
   - "Response in 4 hours" and "Verified titles" are big-deal trust badges — repeat them

6. **Form submissions** must email `info@mailafiyahomes.ng` on new submissions (use Resend
   or SendGrid), AND store in CMS for admin dashboard review.

7. **SEO for property detail pages** — dynamic `<title>`, meta description, Open Graph
   image (use `mainImage`), JSON-LD `RealEstateListing` schema.

8. **Northern Nigerian audience** — the copy uses Hausa phrases (Amana, Adalci, Sabuntawa,
   Al'umma for the values section, and "Mai'Lafiya" itself means "well-being"). Preserve
   these — they're a brand differentiator.

Contact the client for real property photos, real testimonials, and real partner logos
before launch — the prototype uses Creative Commons placeholders that must be replaced.
