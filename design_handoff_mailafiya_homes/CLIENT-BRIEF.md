# Mai'Lafiya Homes & Properties Ltd. — Developer Handoff Brief

> **For Genspark:** Build a production real-estate website + admin CMS backend for a Nigerian warehousing & real-estate agency, based on the approved V1 (Warm & Trust-Led) prototype in this project.

---

## 1. Client & Business

| Field | Value |
|---|---|
| Legal name | Mai'Lafiya Homes & Properties Ltd. |
| RC number | RC 7394323 |
| Tagline | *"Your Profit, Our Priority"* |
| Services | Real Estate · Property Management · Project Supervisor · Construction · Business Consultant |
| Primary business | Warehousing agency (sale, lease, management) — leads offering |
| Secondary | Commercial, residential, land, short-let, industrial land |
| Territory | Northern Nigeria — Kano · Kaduna · Abuja · Jos · Sokoto · Maiduguri |
| Established | 2008 |
| Head office | Plot 14, Bompai Industrial Layout, Kano State, Nigeria |
| Phone | +234 803 555 0142 |
| WhatsApp | +234 803 555 0142 |
| Email | info@mailafiyahomes.ng |

## 2. Tech Stack (required)

- **Framework:** Next.js 15+ (App Router, RSC)
- **Styling:** Tailwind CSS + CSS variables for tokens
- **Fonts:** Fraunces (display) + DM Sans (body) — via `next/font/google`
- **Icons:** Custom SVG set (see `shared-icons.jsx` in prototype)
- **Images:** `next/image` with remote pattern for CMS-hosted images
- **CMS:** Headless CMS with REST or GraphQL — see §6 for data model. Recommended: **Payload CMS** (Node/TS, self-hosted, MongoDB or Postgres) or **Strapi**. Client wants full ownership — avoid SaaS lock-in.
- **Deployment:** Vercel (frontend) + Railway/Render (CMS + DB) — or single VPS if preferred
- **Auth (admin):** Email/password with role-based access
- **Forms:** Server actions posting to CMS `submissions` collections; also send email via Resend or SendGrid
- **Analytics:** Google Analytics 4 + Plausible (optional)
- **WhatsApp:** `https://wa.me/2348035550142?text=...` deep link (no API needed)

## 3. Approved Design Direction

**V1 — "Warm & Trust-Led"** was selected. Full visual reference: `Mai'Lafiya Prototype.html` in this project.

### Brand tokens

```css
--clay: #1E3AB8;      /* Royal blue — primary CTA, links, active nav */
--clay-dk: #142A87;   /* Hover state */
--green: #0E1E4F;     /* Deep navy — dark bands (topband, testimonials, process) */
--green-dk: #060F2D;
--gold: #D4A73E;      /* Warm gold — accents, highlights, secondary CTA */
--gold-dk: #B68A26;
--cream: #FBF7F1;     /* Main page background */
--cream-dp: #F3ECDF;  /* Alternating section background */
--char: #1F1B16;      /* Body text */
--muted: #6B6459;     /* Secondary text */
--border: #E6DFCF;    /* Card borders, dividers */
```

### Typography

- **Display**: Fraunces (serif) — 400/500/600 — headings, prices, decorative
- **Body**: DM Sans (sans) — 400/500/600/700 — everything else
- Italic Fraunces `<em>` uses `--gold-dk`

### Component Radii & spacing scale

- Small cards: `border-radius: 16px`
- Large cards / pcards: `20px`
- Buttons: `999px` (pill)
- Section vertical rhythm: 90px desktop, 60px mobile
- Container: `max-width: 1240px`, `padding: 0 32px`

### Buttons

| Variant | Bg | Text | Use |
|---|---|---|---|
| `v1-btn-primary` | `--clay` | `--cream` | Primary CTAs |
| `v1-btn-gold` | `--gold` | `--char` | Highlighted CTA (CTA band) |
| `v1-btn-outline` | transparent, border `--char` | `--char` | Secondary |
| `v1-btn-whatsapp` | `#25D366` | white | WhatsApp CTAs |
| `v1-btn-ghost-cream` | transparent, border cream | cream | On dark backgrounds |

## 4. Site Map

```
/
├── /                              Homepage
├── /properties                    Listings (filterable)
│   └── /properties/[slug]         Property Detail
├── /services                      Services (5 service lines)
├── /about                         About Us
├── /list-your-property            List with us (owner form)
├── /contact                       Contact
└── /admin                         CMS admin (auth-gated, no custom UI required — use CMS default UI)
```

## 5. Page-by-page Requirements

### 5.1 Homepage `/`

Section order (top → bottom):

1. **Top band** — tagline marquee + phone + WhatsApp CTA (dark navy)
2. **Header** — logo, nav (Home / Properties / Services / About / List with us / Contact), "Book a viewing" CTA. Sticky.
3. **Hero** — full-width, 780px min-height
   - Carousel background: 6 rotating images (auto-advance 5.5s, dot pagination)
   - Left column: eyebrow badge, H1 headline, subheading, 3 value bullets, 2 CTAs (primary + WhatsApp), micro-trust row (★ rating + review count)
   - Right column: **"Hot Deal This Week" spotlight card** — floating property preview with pulsing red badge, links to `/properties/[slug]`
   - Below: 5-field search bar (I want to / Property type / City / Budget / [Search] button)
4. **Trust bar** — 5 stats (17 years / 340+ deals / ₦12B+ closed / 218 reviews / 4-hour response)
5. **Category strip** — 6 icon cards (Warehouses Lease / Warehouses Sale / Management / Commercial / Residential / Land)
6. **Why us** — 4 promise cards on cream-deep bg (Verified titles / 4-hour response / Personally walked / Financing arranged)
7. **Featured properties** — tabbed (Warehouse / Commercial / Residential / Land), 3 property cards, "View all" CTA
8. **CEO video section** — full-width dark band with CEO portrait bg, big play button, quote overlay
9. **Story + stats** — 2-column: copy + team image collage with "17 years of trust" badge
10. **Google reviews** — 4 review cards with stars, ★★★★★ 4.9 header
11. **Case studies** — 3 recent deals cards
12. **Partners** — trust logos row (Dangote, BUA, Flour Mills, etc.)
13. **CTA band** — "Your Profit, Our Priority" — clay-blue background with gold CTA
14. **Footer** — 4-column: brand + tagline · Explore · Categories · Contact
15. **Floating WhatsApp button** — bottom-right, gentle bob animation, always visible

### 5.2 Property Listings `/properties`

- Hero: page title, count subtitle
- Filter bar (5 fields): Category / City / Listing type / Max price (slider) / Apply
- Toolbar: results count · Sort dropdown · Grid/List view toggle
- **Grid view**: 3-column property cards
- **List view**: horizontal rows with image + details + price/CTA column
- Pagination: prev · 1 · 2 · 3 · … · 14 · next
- Empty state: "No properties match your filters" + reset button

### 5.3 Property Detail `/properties/[slug]`

- Breadcrumb
- **Gallery**: main image (16:10, ~65%) + 4 thumbnail column with "+N more" overlay on last, video tour badge
- Head bar: category tag · title · save/share actions · big price · price period
- **Spec strip**: 6 stat blocks — Size / Loading bays / Clear height / Truck parking (warehouse); or Bedrooms / Bathrooms / Year built (residential)
- Description block
- Features & amenities: 2-column checklist
- Location: map placeholder with property address
- Similar properties: 3 cards
- **Sticky right sidebar**:
  - Agent card (photo, name, role, phone) — dark green background
  - **Inquiry form**: name / phone / email / inquiry type / message → button "Send enquiry" + WhatsApp button
  - Trust mini: Title verified · Personally walked · Listed X days ago

### 5.4 Services `/services`

- Hero: "Warehousing, real estate, and everything in between"
- 6 service cards grid: Warehouse Leasing / Warehouse Sales / Facility Management / Property Valuation / Site Sourcing / Corporate Real Estate — each with icon, title, blurb, "Learn more" link
- Process section (dark green bg): 4 steps (01 Discovery / 02 Shortlist / 03 Site visits / 04 Negotiate & close)
- CTA band

### 5.5 About `/about`

- Hero: "Well-being begins with a place that works"
- Story block: 2-column (image + copy)
- Values section (cream-deep bg): 4 value cards — Amana (Trust) / Adalci (Fairness) / Sabuntawa (Renewal) / Al'umma (Community)
- Team grid: 4 team member cards
- CTA band

### 5.6 List Your Property `/list-your-property`

- Hero: "Let us find a tenant you'll be glad you signed"
- 2-column layout:
  - **Left**: Long form — name, phone, email, property type, intent (rent/sell/manage/valuation), city, size, address, description, photo upload
  - **Right**: Perks list (340+ tenants placed / Personally walked / Transparent fees / Full management) + testimonial quote card

### 5.7 Contact `/contact`

- Hero: "We reply within 4 working hours"
- 2-column:
  - **Left**: Contact form — name, phone, email, enquiry type, message
  - **Right**: 4 contact cards — Phone / WhatsApp / Email / Head office (with hours)
- Full-width map placeholder at bottom

## 6. CMS Content Model (Admin Backend)

**No admin UI needs to be custom-designed.** Use the CMS's built-in admin (Payload/Strapi default UI). The client only needs the *data model* right.

**Roles:** `admin` (full access) · `editor` (content only, no user management)

### Collections

#### 6.1 `site-settings` (singleton)
| Field | Type | Required | Notes |
|---|---|---|---|
| businessName | string | ✅ | "Mai'Lafiya Homes & Properties Ltd." |
| shortName | string | ✅ | "Mai'Lafiya Homes" |
| tagline | string | ✅ | "Your Profit, Our Priority" |
| rcNumber | string | ✅ | "RC 7394323" |
| yearFounded | number | ✅ | 2008 |
| phone | string | ✅ | E.164 preferred |
| whatsapp | string | ✅ | Digits only, no + |
| email | email | ✅ | |
| address | text | ✅ | |
| businessHours | text | ✅ | |
| socialLinks | group | | facebook, instagram, linkedin (all url, optional) |
| logoLight | media | ✅ | For light bg |
| logoDark | media | ✅ | For dark bg |
| logoIcon | media | ✅ | Square monogram |
| footerCopy | richtext | | Editable footer paragraph |

#### 6.2 `metrics` (singleton) — for Trust Bar + Story stats
| Field | Type | Required |
|---|---|---|
| yearsInBusiness | number | ✅ |
| propertiesTransacted | number | ✅ |
| valueOfDealsClosed | string | ✅ | e.g. "₦12B+" (freeform display) |
| squareMetresManaged | number | ✅ |
| citiesServed | number | ✅ |
| clientRating | number | ✅ | 0–5, 1 decimal |
| reviewCount | number | ✅ |
| responseTimeHours | number | ✅ | Used in "4-hour response" |
| clientRetentionPct | number | | Optional |

#### 6.3 `hero-slides` (collection, ordered)
| Field | Type | Required |
|---|---|---|
| image | media | ✅ |
| tag | string | ✅ | e.g. "Warehousing" |
| order | number | ✅ | Sort position |
| active | boolean | ✅ | Show on homepage |

#### 6.4 `property-categories` (collection)
| Field | Type | Notes |
|---|---|---|
| name | string | "Warehouse", "Commercial" etc |
| slug | slug | Auto from name |
| icon | select | Options: warehouse / factory / building / bed / land / gear |
| description | text | For category filter blurb |
| listingCount | number (computed) | Auto: count of active properties in category |
| order | number | |

Seed values: Warehouse, Commercial, Residential, Land, Short-let, Industrial

#### 6.5 `cities` (collection)
| Field | Type |
|---|---|
| name | string |
| state | string |
| active | boolean |
| order | number |

Seed: Kano · Kaduna · Abuja · Jos · Sokoto · Maiduguri

#### 6.6 `agents` (collection) — Team + property agents
| Field | Type | Required |
|---|---|---|
| name | string | ✅ |
| role | string | ✅ |
| photo | media | ✅ |
| phone | string | ✅ |
| whatsapp | string | |
| email | email | |
| bio | richtext | |
| city | relation → cities | |
| showOnTeam | boolean | ✅ | Also appears on About page |
| order | number | |

#### 6.7 `properties` (collection) — **Primary data**
| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | ✅ | "Bompai Industrial Warehouse — 4,200 sqm" |
| slug | slug | ✅ | Auto from title |
| shortTitle | string | ✅ | For cards |
| category | relation → property-categories | ✅ | |
| subCategory | select | ✅ | Options: Lease / Sale |
| listing | select | ✅ | For Lease / For Sale / Short-let |
| price | number | ✅ | Naira, full figure |
| pricePeriod | string | | " / year" or " / night" etc |
| currency | select | ✅ | Default: NGN |
| city | relation → cities | ✅ | |
| area | string | ✅ | "Bompai Industrial Layout" |
| state | string | ✅ | |
| latitude | number | | For map |
| longitude | number | | |
| size | string | ✅ | "4,200 sqm" — freeform to allow "12 hectares" etc |
| sizeSqm | number | | Numeric for filtering |
| bedrooms | number | | Nullable — warehouses N/A |
| bathrooms | number | | Nullable |
| parking | string | | "12 trucks" / "4 cars" |
| dockDoors | number | | Warehouses only |
| clearHeight | string | | "9.5 m" |
| floors | number | | |
| yearBuilt | number | | |
| mainImage | media | ✅ | Card thumbnail |
| gallery | media array | ✅ | Min 3 |
| videoTourUrl | url | | YouTube/Vimeo |
| badges | multi-select | | Options: Featured / Newly Built / Cold Chain / Bonded / Premium / For Sale / etc |
| description | richtext | ✅ | |
| features | text array | ✅ | Bullet points for amenities list |
| agent | relation → agents | ✅ | |
| isFeatured | boolean | | Shows on homepage "Featured Properties" |
| isHotDeal | boolean | | Shows in hero spotlight card. **Only ONE can be true at a time** — enforce in CMS |
| status | select | ✅ | Options: Draft / Active / Under Offer / Let / Sold / Archived |
| titleVerified | boolean | ✅ | Trust badge |
| walkedByTeam | boolean | ✅ | Trust badge |
| listedAt | date | ✅ | Auto = createdAt |
| metaTitle | string | | SEO |
| metaDescription | text | | SEO |

#### 6.8 `services` (collection, ordered) — Services page
| Field | Type | Required |
|---|---|---|
| title | string | ✅ |
| icon | select | ✅ | warehouse / keys / gear / search / map / shield |
| blurb | text | ✅ |
| body | richtext | | Long description for future service detail page |
| order | number | ✅ |
| active | boolean | ✅ |

#### 6.9 `case-studies` (collection)
| Field | Type | Required |
|---|---|---|
| title | string | ✅ | "10,000 sqm bonded facility sourced for FMCG group" |
| city | relation → cities | ✅ |
| metric | string | ✅ | "6 weeks" |
| metricLabel | string | ✅ | "from brief to signed lease" |
| image | media | ✅ |
| body | richtext | | For future detail page |
| featured | boolean | | Show on homepage |
| order | number | |

#### 6.10 `testimonials-google` (collection) — Google-style reviews
| Field | Type | Required |
|---|---|---|
| name | string | ✅ |
| avatar | media | ✅ |
| whenLabel | string | ✅ | "2 weeks ago" — freeform, human-readable |
| whenDate | date | ✅ | For sorting |
| stars | number | ✅ | 1–5 |
| body | text | ✅ | |
| verified | boolean | ✅ | Default true |
| featured | boolean | | Show on homepage grid (max 4) |
| order | number | |

#### 6.11 `partners` (collection) — Trusted-by row
| Field | Type | Required |
|---|---|---|
| name | string | ✅ | "Dangote Group" |
| logo | media | | Optional — falls back to text |
| websiteUrl | url | | |
| order | number | ✅ |
| active | boolean | ✅ |

#### 6.12 `values` (collection) — About page values
| Field | Type |
|---|---|
| title | string | "Amana (Trust)" |
| description | text |
| order | number |

Seed: Amana / Adalci / Sabuntawa / Al'umma

#### 6.13 `about-page` (singleton)
| Field | Type |
|---|---|
| heroHeadline | richtext | With `<em>` supported |
| heroSubcopy | text |
| heroImage | media |
| storyEyebrow | string |
| storyHeadline | richtext |
| storyBody | richtext |
| storyImage1 | media |
| storyImage2 | media |
| valuesEyebrow | string |
| valuesHeadline | string |

#### 6.14 `services-page` (singleton)
| Field | Type |
|---|---|
| heroHeadline | richtext |
| heroSubcopy | text |
| processSteps | array of `{ number, title, description }` | Fixed 4 items |

#### 6.15 `enquiries` (collection) — Form submissions storage
Form: **Property Detail inquiry form**
| Field | Type | Required |
|---|---|---|
| name | string | ✅ |
| phone | string | ✅ |
| email | email | ✅ |
| inquiryType | select | ✅ | Request viewing / Request info / Make offer |
| message | text | ✅ |
| property | relation → properties | | Which property they enquired about |
| source | select | ✅ | property-detail / contact / list-property / homepage-cta |
| status | select | ✅ | New / Contacted / Qualified / Closed / Spam |
| assignedTo | relation → users | | Which agent |
| notes | richtext | | Internal notes |
| submittedAt | date (auto) | ✅ |

Actions: mark as read, assign, add note, export CSV, filter by status/source/date

#### 6.16 `property-listings` (collection) — Owner submissions
Form: **List Your Property form**
| Field | Type | Required |
|---|---|---|
| ownerName | string | ✅ |
| phone | string | ✅ |
| email | email | ✅ |
| propertyType | select | ✅ |
| intent | select | ✅ | Rent / Sell / Manage / Valuation |
| city | string | ✅ |
| approximateSize | string | ✅ |
| address | string | ✅ |
| notes | text | ✅ |
| uploads | media array | | Owner-uploaded photos |
| status | select | ✅ | New / Reviewing / Onboarded / Rejected |
| convertedToProperty | relation → properties | | If we list it |
| submittedAt | date | ✅ |

#### 6.17 `contact-messages` (collection)
Form: **Contact page form**
| Field | Type | Required |
|---|---|---|
| name | string | ✅ |
| phone | string | ✅ |
| email | email | ✅ |
| enquiryType | select | ✅ |
| message | text | ✅ |
| status | select | ✅ | New / Replied / Closed |
| submittedAt | date | ✅ |

#### 6.18 `users` (built-in) — Admin CMS access
- Roles: admin / editor
- Fields: email, name, role, phone, active

#### 6.19 `media` (built-in library)
- Bulk upload
- Alt text field (required for accessibility)
- Auto-generate 3 sizes: thumb (400w), medium (800w), full (1600w)
- Serve WebP with JPEG fallback
- CDN-fronted

## 7. Frontend → CMS API endpoints

Use CMS auto-generated REST/GraphQL. Frontend fetches server-side (RSC) where possible.

### Public read endpoints
```
GET  /api/site-settings                     → singleton
GET  /api/metrics                           → singleton
GET  /api/hero-slides?where[active]=true&sort=order
GET  /api/property-categories?sort=order
GET  /api/cities?where[active]=true&sort=order
GET  /api/properties?where[status]=Active&limit=12&sort=-listedAt
GET  /api/properties?where[category.slug]=warehouse&where[city.slug]=kano
GET  /api/properties?where[isFeatured]=true&limit=6
GET  /api/properties?where[isHotDeal]=true&limit=1
GET  /api/properties/[slug]                 → single by slug
GET  /api/properties?where[slug]=[slug]     → alt
GET  /api/services?where[active]=true&sort=order
GET  /api/services-page                     → singleton
GET  /api/about-page                        → singleton
GET  /api/values?sort=order
GET  /api/agents?where[showOnTeam]=true&sort=order
GET  /api/case-studies?where[featured]=true&sort=order
GET  /api/testimonials-google?where[featured]=true&sort=order&limit=4
GET  /api/partners?where[active]=true&sort=order
```

### Public write endpoints (form submissions)
```
POST /api/enquiries                         → property/homepage forms
POST /api/property-listings                 → list-your-property form
POST /api/contact-messages                  → contact form
```

All POSTs:
- Rate limit: 5/min per IP
- Honeypot field required
- Validate server-side (Zod)
- Trigger email notification to `info@mailafiyahomes.ng` on new submission
- Auto-reply email to submitter

### Filter query params (properties list)
| Param | Type | Example |
|---|---|---|
| `where[category.slug]` | string | warehouse |
| `where[city.slug]` | string | kano |
| `where[listing]` | string | For Lease |
| `where[price][lte]` | number | 500000000 |
| `where[price][gte]` | number | 10000000 |
| `where[sizeSqm][gte]` | number | 1000 |
| `sort` | string | -listedAt / price / -price |
| `page` | number | 1 |
| `limit` | number | 12 |

## 8. Non-functional requirements

- **Performance**: Lighthouse ≥ 90 on all metrics. Image lazy-loading. Route prefetching.
- **SEO**: Per-page `<title>` + meta description. `sitemap.xml`, `robots.txt`, Open Graph tags for property pages.
- **Accessibility**: WCAG 2.1 AA. Focus visible on all interactives. Alt text required on media uploads.
- **Analytics**: GA4 events for: property_view, enquiry_submitted, whatsapp_click, phone_click, list_property_submitted.
- **i18n**: English only for v1. Structure to allow future Hausa translation (don't hard-code strings in components).
- **Mobile-first**: All layouts tested at 375px width. Touch targets ≥ 44px.
- **Currency**: Naira with full figures (`₦45,000,000`) — no abbreviation for now.
- **Data privacy**: NDPR-compliant. Cookie banner if analytics enabled. Form submissions retained 24 months then archived.

## 9. Deliverables checklist for developer

- [ ] Next.js frontend deployed
- [ ] Headless CMS deployed with all 19 collections above
- [ ] Admin credentials handed over to client
- [ ] Seed data loaded from prototype (properties, testimonials, cities, categories, partners)
- [ ] Email notifications wired (submissions → `info@mailafiyahomes.ng`)
- [ ] SSL + custom domain
- [ ] Google Business Profile linked
- [ ] Google Analytics 4 configured
- [ ] Admin walkthrough recorded (30-min Loom)
- [ ] 30-day post-launch support

## 10. Reference files in this project

- `Mai'Lafiya Prototype.html` — approved visual reference (V1)
- `variation-1.jsx` + `variation-1.css` — production-ready React components
- `data.js` — seed content (properties, testimonials, services, business info)
- `shared-icons.jsx` — icon library
- `assets/` — logo variants + placeholder property imagery
- `Handoff.html` — printable visual spec document
