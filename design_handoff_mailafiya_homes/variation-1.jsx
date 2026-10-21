// Variation 1 — "Warm & Trust-Led"
// Palette: clay #B8542C, deep green #2D4A3E, cream #FBF7F1, charcoal #1F1B16
// Type: Fraunces (display) + DM Sans (body)
const { useState, useEffect, useRef, useMemo } = React;

const V1 = {
  clay: "#1E3AB8",          // Royal blue (brand)
  clayDark: "#142A87",
  green: "#0E1E4F",         // Deep navy for dark sections
  greenDark: "#060F2D",
  gold: "#D4A73E",
  goldDark: "#B68A26",
  cream: "#FBF7F1",
  creamDeep: "#F3ECDF",
  charcoal: "#1F1B16",
  muted: "#6B6459",
  border: "#E6DFCF",
};

// =============================== Chrome ===================================
function V1TopBar({ page, setPage }) {
  const D = window.MAILAFIYA_DATA;
  const nav = [
    ["home", "Home"],
    ["listings", "Properties"],
    ["services", "Services"],
    ["about", "About"],
    ["list-property", "List with us"],
    ["contact", "Contact"],
  ];
  return (
    <>
      <div className="v1-topband">
        <div className="v1-container v1-topband-inner">
          <span className="v1-topband-item v1-topband-item--marquee">
            <Icon name="star" className="w-3.5 h-3.5" fill="currentColor" strokeWidth={0} />
            <strong>{D.business.tagline}</strong>
            <span className="v1-topband-dot">·</span>
            <span>Real Estate · Property Management · Construction · Consulting</span>
          </span>
          <div className="flex items-center gap-5">
            <a className="v1-topband-item" href="#" onClick={(e) => { e.preventDefault(); setPage("contact"); }}>
              <Icon name="phone" className="w-3.5 h-3.5" /> {D.business.phone}
            </a>
            <a className="v1-topband-item v1-topband-item--wa" href="#" onClick={(e) => e.preventDefault()}>
              <Icon name="whatsapp" className="w-3.5 h-3.5" /> WhatsApp us
            </a>
          </div>
        </div>
      </div>
      <header className="v1-header">
        <div className="v1-container v1-header-inner">
          <a href="#" className="v1-brand" onClick={(e) => { e.preventDefault(); setPage("home"); }}>
            <img src="assets/logo-icon.png" alt="Mai'Lafiya Homes & Properties Ltd." className="v1-logo-img" />
            <span className="v1-brand-text">
              <span className="v1-brand-name">MAI'LAFIYA HOMES</span>
              <span className="v1-brand-sub">& PROPERTIES LTD. · EST. 2008</span>
            </span>
          </a>
          <nav className="v1-nav">
            {nav.map(([k, label]) => (
              <a
                key={k}
                href="#"
                className={"v1-nav-link " + (page === k ? "is-active" : "")}
                onClick={(e) => { e.preventDefault(); setPage(k); }}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="v1-header-cta">
            <button className="v1-btn v1-btn-primary" onClick={() => setPage("contact")}>
              Book a viewing
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

function V1MobileNav({ page, setPage }) {
  const [open, setOpen] = useState(false);
  const D = window.MAILAFIYA_DATA;
  const nav = [
    ["home", "Home"],
    ["listings", "Properties"],
    ["services", "Services"],
    ["about", "About"],
    ["list-property", "List with us"],
    ["contact", "Contact"],
  ];
  return (
    <>
      <header className="v1-mheader">
        <a href="#" className="v1-brand" onClick={(e) => { e.preventDefault(); setPage("home"); }}>
          <img src="assets/logo-icon.png" alt="Mai'Lafiya Homes" className="v1-logo-img" />
          <span className="v1-brand-text">
            <span className="v1-brand-name" style={{ fontSize: 13 }}>MAI'LAFIYA HOMES</span>
            <span className="v1-brand-sub" style={{ fontSize: 9 }}>& PROPERTIES LTD.</span>
          </span>
        </a>
        <button className="v1-icon-btn" onClick={() => setOpen(!open)} aria-label="Menu">
          <Icon name={open ? "close" : "menu"} className="w-5 h-5" />
        </button>
      </header>
      {open && (
        <div className="v1-mdrawer">
          {nav.map(([k, label]) => (
            <a
              key={k}
              href="#"
              className={"v1-mdrawer-link " + (page === k ? "is-active" : "")}
              onClick={(e) => { e.preventDefault(); setPage(k); setOpen(false); }}
            >
              {label}
            </a>
          ))}
          <div className="v1-mdrawer-cta">
            <button className="v1-btn v1-btn-primary" style={{ width: "100%" }}
              onClick={() => { setPage("contact"); setOpen(false); }}>
              Book a viewing
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function V1Footer({ setPage }) {
  const D = window.MAILAFIYA_DATA;
  return (
    <footer className="v1-footer">
      <div className="v1-container">
        <div className="v1-footer-grid">
          <div>
            <div className="v1-brand" style={{ marginBottom: 18 }}>
              <img src="assets/logo-icon-inverse.png" alt="" className="v1-logo-img v1-logo-img--dark" />
              <span className="v1-brand-text">
                <span className="v1-brand-name" style={{ color: V1.cream }}>MAI'LAFIYA HOMES</span>
                <span className="v1-brand-sub" style={{ color: "rgba(251,247,241,0.6)" }}>& PROPERTIES LTD.</span>
              </span>
            </div>
            <p className="v1-footer-p">
              <em style={{ color: V1.gold, fontStyle: "normal", fontWeight: 600 }}>"{D.business.tagline}"</em><br /><br />
              Nigeria's specialist in warehousing, real estate, property management &
              construction. Serving the North since 2008 · {D.business.rc}.
            </p>
            <div className="v1-social">
              <a href="#" className="v1-social-link"><Icon name="facebook" className="w-4 h-4" /></a>
              <a href="#" className="v1-social-link"><Icon name="instagram" className="w-4 h-4" /></a>
              <a href="#" className="v1-social-link"><Icon name="linkedin" className="w-4 h-4" /></a>
              <a href="#" className="v1-social-link"><Icon name="whatsapp" className="w-4 h-4" /></a>
            </div>
          </div>
          <div>
            <h5 className="v1-footer-h">Explore</h5>
            <ul className="v1-footer-list">
              <li><a onClick={() => setPage("listings")}>All properties</a></li>
              <li><a onClick={() => setPage("services")}>Warehousing services</a></li>
              <li><a onClick={() => setPage("about")}>About us</a></li>
              <li><a onClick={() => setPage("list-property")}>List with us</a></li>
            </ul>
          </div>
          <div>
            <h5 className="v1-footer-h">Categories</h5>
            <ul className="v1-footer-list">
              <li><a onClick={() => setPage("listings")}>Warehouses (Lease)</a></li>
              <li><a onClick={() => setPage("listings")}>Warehouses (Sale)</a></li>
              <li><a onClick={() => setPage("listings")}>Commercial spaces</a></li>
              <li><a onClick={() => setPage("listings")}>Residential</a></li>
              <li><a onClick={() => setPage("listings")}>Land</a></li>
            </ul>
          </div>
          <div>
            <h5 className="v1-footer-h">Reach us</h5>
            <ul className="v1-footer-list">
              <li><Icon name="pin" className="w-3.5 h-3.5 inline mr-1" /> {D.business.address}</li>
              <li><Icon name="phone" className="w-3.5 h-3.5 inline mr-1" /> {D.business.phone}</li>
              <li><Icon name="mail" className="w-3.5 h-3.5 inline mr-1" /> {D.business.email}</li>
              <li><Icon name="clock" className="w-3.5 h-3.5 inline mr-1" /> {D.business.hours}</li>
            </ul>
          </div>
        </div>
        <div className="v1-footer-bottom">
          <span>© 2026 Mai'Lafiya General Merchants Ltd · RC No. 812XXX</span>
          <span>Privacy · Terms · Cookies</span>
        </div>
      </div>
    </footer>
  );
}

// ================================ Home ====================================
function V1PropertyCard({ p, onClick, mobile }) {
  const D = window.MAILAFIYA_DATA;
  return (
    <article className="v1-pcard" onClick={onClick}>
      <div className="v1-pcard-media">
        <img src={p.image} alt={p.title} />
        <span className="v1-pcard-listing">{p.listing}</span>
        <button className="v1-pcard-heart" onClick={(e) => e.stopPropagation()}>
          <Icon name="heart" className="w-4 h-4" />
        </button>
      </div>
      <div className="v1-pcard-body">
        <div className="v1-pcard-cat">{p.category} · {p.area}</div>
        <h3 className="v1-pcard-title">{p.shortTitle}</h3>
        <div className="v1-pcard-meta">
          {p.category === "Warehouse" ? (
            <>
              <span><Icon name="ruler" className="w-3.5 h-3.5 inline" /> {p.size}</span>
              {p.dockDoors && <span><Icon name="door" className="w-3.5 h-3.5 inline" /> {p.dockDoors} bays</span>}
              {p.clearHeight && <span><Icon name="arrowUp" className="w-3.5 h-3.5 inline" /> {p.clearHeight}</span>}
            </>
          ) : p.category === "Land" ? (
            <span><Icon name="ruler" className="w-3.5 h-3.5 inline" /> {p.size}</span>
          ) : (
            <>
              {p.bedrooms && <span><Icon name="bed" className="w-3.5 h-3.5 inline" /> {p.bedrooms} bed</span>}
              {p.bathrooms && <span><Icon name="bath" className="w-3.5 h-3.5 inline" /> {p.bathrooms} bath</span>}
              <span><Icon name="ruler" className="w-3.5 h-3.5 inline" /> {p.size}</span>
            </>
          )}
        </div>
        <div className="v1-pcard-foot">
          <div>
            <div className="v1-pcard-price">{D.fmt(p.price)}</div>
            {p.pricePeriod && <div className="v1-pcard-period">{p.pricePeriod}</div>}
          </div>
          <button className="v1-pcard-cta">View <Icon name="arrowRight" className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </article>
  );
}

function V1HeroCarousel({ setPage, setDetailId }) {
  const D = window.MAILAFIYA_DATA;
  const slides = [
    { img: "assets/warehouse-aerial-2.jpg", tag: "Warehousing" },
    { img: "assets/warehouse-facility-1.jpg", tag: "Industrial" },
    { img: "assets/handshake-1.jpg", tag: "Trusted Deals" },
    { img: "assets/team-3.jpg", tag: "Our People" },
    { img: "assets/office-4.jpg", tag: "Commercial" },
    { img: "assets/duplex-3.jpg", tag: "Residential" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);

  // Spotlight — first featured warehouse as "hot deal"
  const hot = D.properties[0];

  return (
    <section className="v1-hero">
      <div className="v1-hero-slides">
        {slides.map((s, i) => (
          <div key={i} className={"v1-hero-slide " + (i === idx ? "is-active" : "")}
            style={{ backgroundImage: `url(${s.img})` }} />
        ))}
        <div className="v1-hero-scrim" />
      </div>
      <div className="v1-container v1-hero-content">
        <div className="v1-hero-left">
          <span className="v1-hero-eyebrow">
            <span className="dot" />
            <strong>NIGERIA'S WAREHOUSING SPECIALIST</strong>
            <span style={{ opacity: 0.6 }}>· 17 YRS · 340+ DEALS</span>
          </span>
          <h1 className="v1-hero-h1">
            Own it. Lease it.<br />
            <em>Grow with it.</em>
          </h1>
          <p className="v1-hero-sub">
            From 500 sqm SME warehouses to industrial estates — we source, verify, and close deals
            across Northern Nigeria. Every listing personally walked. Every enquiry answered in 4 hours.
          </p>
          <div className="v1-hero-value-row">
            <span><Icon name="check" className="w-3.5 h-3.5" /> Verified titles</span>
            <span><Icon name="check" className="w-3.5 h-3.5" /> Personally walked</span>
            <span><Icon name="check" className="w-3.5 h-3.5" /> Financing arranged</span>
          </div>
          <div className="v1-hero-cta-row">
            <button className="v1-btn v1-btn-primary v1-btn-lg" onClick={() => setPage("listings")}>
              See 45 available warehouses <Icon name="arrowRight" className="w-4 h-4" />
            </button>
            <button className="v1-btn v1-btn-gold v1-btn-lg" onClick={() => {}}>
              <Icon name="whatsapp" className="w-4 h-4" /> Chat on WhatsApp
            </button>
          </div>
          <div className="v1-hero-microtrust">
            <div className="v1-hero-stars">
              {[1,2,3,4,5].map(i => <Icon key={i} name="star" fill="currentColor" strokeWidth={0} className="w-4 h-4" />)}
            </div>
            <span><strong>{D.business.clientRating}/5</strong> · {D.business.reviewCount} client reviews · Response in 4 hours</span>
          </div>
        </div>

        <aside className="v1-hero-spotlight" onClick={() => { setDetailId(hot.id); setPage("detail"); }}>
          <div className="v1-hero-spotlight-badge">
            <span className="v1-spotlight-pulse" />
            HOT DEAL THIS WEEK
          </div>
          <div className="v1-hero-spotlight-media">
            <img src={hot.image} alt={hot.title} />
            <span className="v1-hero-spotlight-cat">{hot.category} · {hot.listing}</span>
          </div>
          <div className="v1-hero-spotlight-body">
            <div className="v1-hero-spotlight-loc"><Icon name="pin" className="w-3 h-3" /> {hot.area}, {hot.city}</div>
            <h3 className="v1-hero-spotlight-title">{hot.shortTitle}</h3>
            <div className="v1-hero-spotlight-meta">
              <span><Icon name="ruler" className="w-3.5 h-3.5" /> {hot.size}</span>
              <span><Icon name="door" className="w-3.5 h-3.5" /> {hot.dockDoors} bays</span>
              <span><Icon name="arrowUp" className="w-3.5 h-3.5" /> {hot.clearHeight}</span>
            </div>
            <div className="v1-hero-spotlight-foot">
              <div>
                <div className="v1-hero-spotlight-price">{D.fmt(hot.price)}</div>
                <div className="v1-hero-spotlight-period">{hot.pricePeriod}</div>
              </div>
              <button className="v1-hero-spotlight-cta">
                View <Icon name="arrowRight" className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div className="v1-container v1-hero-search-wrap">
        <div className="v1-hero-search">
          <div className="v1-hero-search-field">
            <label>I want to</label>
            <select><option>Lease</option><option>Buy</option><option>List my property</option></select>
          </div>
          <div className="v1-hero-search-field">
            <label>Property type</label>
            <select><option>Warehouse</option><option>Commercial</option><option>Residential</option><option>Land</option></select>
          </div>
          <div className="v1-hero-search-field">
            <label>City</label>
            <select><option>Any city</option><option>Kano</option><option>Kaduna</option><option>Abuja</option><option>Jos</option></select>
          </div>
          <div className="v1-hero-search-field">
            <label>Budget</label>
            <select><option>Any</option><option>Under ₦100M</option><option>₦100M – ₦500M</option><option>₦500M – ₦1B</option><option>Over ₦1B</option></select>
          </div>
          <button className="v1-btn v1-btn-primary v1-btn-lg v1-hero-search-btn" onClick={() => setPage("listings")}>
            <Icon name="search" className="w-4 h-4" /> Find properties
          </button>
        </div>
        <div className="v1-hero-dots">
          {slides.map((_, i) => (
            <button key={i} className={"v1-dot " + (i === idx ? "is-active" : "")} onClick={() => setIdx(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// A small trust bar with the key numbers, shown right under hero
function V1TrustBar() {
  const D = window.MAILAFIYA_DATA;
  const stats = [
    { n: D.business.yearsInBusiness, suffix: " yrs", l: "In business since 2008" },
    { n: D.business.propertiesTransacted, suffix: "+", l: "Properties transacted" },
    { n: "₦12B", suffix: "+", l: "In deals closed" },
    { n: D.business.reviewCount, suffix: "", l: "5-star client reviews" },
    { n: "4", suffix: " hrs", l: "Enquiry response time" },
  ];
  return (
    <section className="v1-trustbar">
      <div className="v1-container v1-trustbar-inner">
        {stats.map((s, i) => (
          <div key={i} className="v1-trustbar-item">
            <div className="v1-trustbar-n">
              {s.n}<span className="v1-trustbar-suffix">{s.suffix}</span>
            </div>
            <div className="v1-trustbar-l">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// "Why us" strip — 4 punchy value cards
function V1WhyUs() {
  const D = window.MAILAFIYA_DATA;
  return (
    <section className="v1-whyus">
      <div className="v1-container">
        <div className="v1-section-head v1-section-head--centered">
          <span className="v1-eyebrow">Why Mai'Lafiya Homes</span>
          <h2 className="v1-h2">Four promises we keep, every deal.</h2>
        </div>
        <div className="v1-whyus-grid">
          {D.whyUs.map((w) => (
            <div key={w.title} className="v1-whyus-card">
              <div className="v1-whyus-icon"><Icon name={w.icon} className="w-6 h-6" /></div>
              <h3 className="v1-whyus-t">{w.title}</h3>
              <p className="v1-whyus-d">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Google-style reviews strip
function V1GoogleReviews() {
  const D = window.MAILAFIYA_DATA;
  return (
    <section className="v1-section v1-greviews">
      <div className="v1-container">
        <div className="v1-section-head">
          <div>
            <span className="v1-eyebrow">Client reviews</span>
            <h2 className="v1-h2">{D.business.clientRating} out of 5 · {D.business.reviewCount}+ reviews</h2>
            <div className="v1-greviews-stars-row">
              {[1,2,3,4,5].map(i => <Icon key={i} name="star" fill="currentColor" strokeWidth={0} className="w-5 h-5" />)}
              <span className="v1-greviews-badge">Verified on Google</span>
            </div>
          </div>
          <a href="#" className="v1-link">Read all reviews <Icon name="arrowRight" className="w-4 h-4" /></a>
        </div>
        <div className="v1-greviews-grid">
          {D.googleReviews.map((r, i) => (
            <article key={i} className="v1-greview">
              <div className="v1-greview-head">
                <img src={r.avatar} alt={r.name} className="v1-greview-avatar" />
                <div>
                  <div className="v1-greview-name">{r.name}</div>
                  <div className="v1-greview-when">{r.when}</div>
                </div>
              </div>
              <div className="v1-greview-stars">
                {Array.from({ length: r.stars }).map((_, j) => (
                  <Icon key={j} name="star" fill="currentColor" strokeWidth={0} className="w-3.5 h-3.5" />
                ))}
              </div>
              <p className="v1-greview-body">{r.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// Floating WhatsApp button — always visible
function V1FloatingWA() {
  return (
    <a href="#" className="v1-wafloat" aria-label="WhatsApp">
      <Icon name="whatsapp" className="w-6 h-6" />
      <span className="v1-wafloat-label">Chat with us</span>
    </a>
  );
}

function V1CategoryStrip({ setPage }) {
  const cats = [
    { icon: "warehouse", label: "Warehouses (Lease)", count: "45+" },
    { icon: "factory", label: "Warehouses (Sale)", count: "18+" },
    { icon: "gear", label: "Management Services", count: "" },
    { icon: "building", label: "Commercial", count: "62+" },
    { icon: "bed", label: "Residential", count: "80+" },
    { icon: "land", label: "Land & Plots", count: "34+" },
  ];
  return (
    <section className="v1-catstrip">
      <div className="v1-container">
        <div className="v1-catstrip-grid">
          {cats.map((c) => (
            <button key={c.label} className="v1-cat" onClick={() => setPage("listings")}>
              <span className="v1-cat-icon"><Icon name={c.icon} className="w-6 h-6" /></span>
              <span className="v1-cat-label">{c.label}</span>
              {c.count && <span className="v1-cat-count">{c.count} listings</span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function V1FeaturedProperties({ setPage, setDetailId }) {
  const D = window.MAILAFIYA_DATA;
  const [tab, setTab] = useState("Warehouse");
  const items = D.properties.filter((p) => p.category === tab).slice(0, 3);
  return (
    <section className="v1-section">
      <div className="v1-container">
        <div className="v1-section-head">
          <div>
            <span className="v1-eyebrow">🔥 Fresh listings this week</span>
            <h2 className="v1-h2">Just listed — grab them before they go.</h2>
          </div>
          <div className="v1-tabs">
            {["Warehouse", "Commercial", "Residential", "Land"].map((t) => (
              <button
                key={t}
                className={"v1-tab " + (tab === t ? "is-active" : "")}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="v1-pgrid">
          {items.map((p) => (
            <V1PropertyCard key={p.id} p={p}
              onClick={() => { setDetailId(p.id); setPage("detail"); }} />
          ))}
        </div>
        <div className="v1-section-foot">
          <button className="v1-btn v1-btn-outline" onClick={() => setPage("listings")}>
            View all properties <Icon name="arrowRight" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function V1CEOVideo() {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="v1-ceo">
      <div className="v1-ceo-bg" style={{ backgroundImage: "url(assets/ceo-portrait.jpg)" }} />
      <div className="v1-ceo-scrim" />
      <div className="v1-container v1-ceo-content">
        <div className="v1-ceo-eyebrow">A word from our founder</div>
        <h2 className="v1-ceo-h2">
          "We don't sell property.<br />We solve problems for the people who use it."
        </h2>
        <p className="v1-ceo-attribution">
          Alhaji Musa Danladi — Founder & CEO, Mai'Lafiya General Merchants
        </p>
        <button className="v1-ceo-play" onClick={() => setPlaying(!playing)} aria-label="Play video">
          <span className="v1-ceo-play-ring" />
          <span className="v1-ceo-play-btn">
            <Icon name="play" fill="currentColor" className="w-6 h-6 ml-1" strokeWidth={0} />
          </span>
        </button>
        <div className="v1-ceo-meta">Watch the full interview · 8 min 42 sec</div>
      </div>
    </section>
  );
}

function V1StatsBrandStory() {
  const D = window.MAILAFIYA_DATA;
  return (
    <section className="v1-section v1-story">
      <div className="v1-container v1-story-grid">
        <div className="v1-story-copy">
          <span className="v1-eyebrow">Our story</span>
          <h2 className="v1-h2">Rooted in the North.<br />Built on relationships.</h2>
          <p className="v1-story-p">
            Mai'Lafiya — the Hausa word for "well-being" — has guided our practice since 2008.
            What started as a family brokerage in Kano's Bompai Industrial Layout has grown into
            Northern Nigeria's most trusted specialist in warehousing and industrial real estate.
          </p>
          <p className="v1-story-p">
            We hold a small book of properties by design — every listing is walked, verified, and
            represented by a consultant who knows the tenants, the neighbours, and the roads in.
          </p>
          <div className="v1-story-stats">
            <div className="v1-stat">
              <div className="v1-stat-n">{D.business.yearsInBusiness}</div>
              <div className="v1-stat-l">Years in business</div>
            </div>
            <div className="v1-stat">
              <div className="v1-stat-n">{D.business.propertiesTransacted}+</div>
              <div className="v1-stat-l">Properties transacted</div>
            </div>
            <div className="v1-stat">
              <div className="v1-stat-n">{Math.round(D.business.squareMetresManaged / 1000)}k</div>
              <div className="v1-stat-l">Sqm under management</div>
            </div>
            <div className="v1-stat">
              <div className="v1-stat-n">6</div>
              <div className="v1-stat-l">Northern cities served</div>
            </div>
          </div>
        </div>
        <div className="v1-story-media">
          <img src="assets/team-3.jpg" alt="Our team" className="v1-story-img-1" />
          <img src="assets/warehouse-facility-1.jpg" alt="Warehouse" className="v1-story-img-2" />
          <div className="v1-story-badge">
            <div className="v1-story-badge-n">17</div>
            <div className="v1-story-badge-l">years<br />of trust</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function V1Testimonials() {
  const D = window.MAILAFIYA_DATA;
  return (
    <section className="v1-section v1-testimonials">
      <div className="v1-container">
        <div className="v1-section-head v1-section-head--centered">
          <span className="v1-eyebrow">What clients say</span>
          <h2 className="v1-h2">Trusted by industry leaders<br />across Northern Nigeria</h2>
        </div>
        <div className="v1-tgrid">
          {D.testimonials.map((t, i) => (
            <figure key={i} className="v1-tcard">
              <Icon name="quote" className="v1-tcard-quote" />
              <blockquote className="v1-tcard-q">"{t.quote}"</blockquote>
              <figcaption className="v1-tcard-attr">
                <img src={t.avatar} alt={t.name} className="v1-tcard-avatar" />
                <div>
                  <div className="v1-tcard-name">{t.name}</div>
                  <div className="v1-tcard-role">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function V1CaseStudies({ setPage }) {
  const D = window.MAILAFIYA_DATA;
  return (
    <section className="v1-section v1-cases">
      <div className="v1-container">
        <div className="v1-section-head">
          <div>
            <span className="v1-eyebrow">Case studies</span>
            <h2 className="v1-h2">Recent deals we've closed</h2>
          </div>
          <a href="#" className="v1-link" onClick={(e) => { e.preventDefault(); setPage("about"); }}>
            See all work <Icon name="arrowRight" className="w-4 h-4" />
          </a>
        </div>
        <div className="v1-case-grid">
          {D.caseStudies.map((c, i) => (
            <article key={i} className="v1-case">
              <div className="v1-case-media" style={{ backgroundImage: `url(${c.image})` }} />
              <div className="v1-case-body">
                <div className="v1-case-city">{c.city}</div>
                <h3 className="v1-case-title">{c.title}</h3>
                <div className="v1-case-metric">
                  <span className="v1-case-metric-n">{c.metric}</span>
                  <span className="v1-case-metric-l">{c.metricLabel}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function V1Partners() {
  const D = window.MAILAFIYA_DATA;
  return (
    <section className="v1-partners">
      <div className="v1-container">
        <div className="v1-partners-label">Trusted by</div>
        <div className="v1-partners-row">
          {D.partners.map((p) => <span key={p} className="v1-partner">{p}</span>)}
        </div>
      </div>
    </section>
  );
}

function V1CTABand({ setPage }) {
  const D = window.MAILAFIYA_DATA;
  return (
    <section className="v1-ctaband">
      <div className="v1-container v1-ctaband-inner">
        <div>
          <span className="v1-ctaband-eyebrow">YOUR PROFIT, OUR PRIORITY</span>
          <h2 className="v1-ctaband-h">Your next warehouse is one message away.</h2>
          <p className="v1-ctaband-p">
            Tell us what you need — size, city, budget. Get a curated shortlist within 5 working days.
            Response guaranteed in {D.business.responseTime}.
          </p>
        </div>
        <div className="v1-ctaband-actions">
          <button className="v1-btn v1-btn-gold v1-btn-lg" onClick={() => setPage("contact")}>
            Get a shortlist <Icon name="arrowRight" className="w-4 h-4" />
          </button>
          <button className="v1-btn v1-btn-ghost-cream v1-btn-lg">
            <Icon name="whatsapp" className="w-4 h-4" /> WhatsApp us now
          </button>
        </div>
      </div>
    </section>
  );
}

function V1HomePage({ setPage, setDetailId }) {
  return (
    <>
      <V1HeroCarousel setPage={setPage} setDetailId={setDetailId} />
      <V1TrustBar />
      <V1CategoryStrip setPage={setPage} />
      <V1WhyUs />
      <V1FeaturedProperties setPage={setPage} setDetailId={setDetailId} />
      <V1CEOVideo />
      <V1StatsBrandStory />
      <V1GoogleReviews />
      <V1CaseStudies setPage={setPage} />
      <V1Partners />
      <V1CTABand setPage={setPage} />
    </>
  );
}

// ============================== Listings =================================
function V1ListingsPage({ setPage, setDetailId }) {
  const D = window.MAILAFIYA_DATA;
  const [cat, setCat] = useState("All properties");
  const [city, setCity] = useState("All cities");
  const [listing, setListing] = useState("Any");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("Featured");
  const [priceMax, setPriceMax] = useState(5000000000);

  const filtered = D.properties.filter((p) => {
    if (cat !== "All properties" && p.category !== cat) return false;
    if (city !== "All cities" && p.city !== city) return false;
    if (listing !== "Any" && p.listing !== listing) return false;
    if (p.price > priceMax) return false;
    return true;
  });

  return (
    <>
      <section className="v1-listings-hero">
        <div className="v1-container">
          <div className="v1-crumbs">Home / <span>Properties</span></div>
          <h1 className="v1-h1">Browse our properties</h1>
          <p className="v1-listings-hero-p">
            {D.properties.length} carefully curated listings across Kano, Kaduna, Abuja, Jos, Sokoto and Maiduguri.
          </p>
        </div>
      </section>

      <section className="v1-container v1-listings-body">
        <div className="v1-filter-bar">
          <div className="v1-filter-field">
            <label>Category</label>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              {D.categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="v1-filter-field">
            <label>City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {D.cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="v1-filter-field">
            <label>Listing type</label>
            <select value={listing} onChange={(e) => setListing(e.target.value)}>
              {D.listingTypes.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="v1-filter-field v1-filter-field--wide">
            <label>Max price: {D.fmt(priceMax)}</label>
            <input type="range" min={10000000} max={5000000000} step={10000000}
              value={priceMax} onChange={(e) => setPriceMax(+e.target.value)} />
          </div>
          <button className="v1-btn v1-btn-primary">Apply</button>
        </div>

        <div className="v1-toolbar">
          <div className="v1-toolbar-count">
            <strong>{filtered.length}</strong> properties match your search
          </div>
          <div className="v1-toolbar-right">
            <div className="v1-sort">
              Sort:
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Featured</option>
                <option>Newest</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
              </select>
            </div>
            <div className="v1-view-toggle">
              <button className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")}>
                <Icon name="grid" className="w-4 h-4" />
              </button>
              <button className={view === "list" ? "is-active" : ""} onClick={() => setView("list")}>
                <Icon name="list" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {view === "grid" ? (
          <div className="v1-pgrid v1-pgrid--3">
            {filtered.map((p) => (
              <V1PropertyCard key={p.id} p={p}
                onClick={() => { setDetailId(p.id); setPage("detail"); }} />
            ))}
          </div>
        ) : (
          <div className="v1-plist">
            {filtered.map((p) => (
              <article key={p.id} className="v1-plist-row"
                onClick={() => { setDetailId(p.id); setPage("detail"); }}>
                <div className="v1-plist-media"><img src={p.image} alt={p.title} /></div>
                <div className="v1-plist-body">
                  <div className="v1-pcard-cat">{p.category} · {p.area}, {p.city}</div>
                  <h3 className="v1-plist-title">{p.title}</h3>
                  <p className="v1-plist-desc">{p.description.slice(0, 140)}…</p>
                  <div className="v1-pcard-meta">
                    <span><Icon name="ruler" className="w-3.5 h-3.5 inline" /> {p.size}</span>
                    {p.dockDoors && <span><Icon name="door" className="w-3.5 h-3.5 inline" /> {p.dockDoors} bays</span>}
                    {p.bedrooms && <span><Icon name="bed" className="w-3.5 h-3.5 inline" /> {p.bedrooms} bed</span>}
                  </div>
                </div>
                <div className="v1-plist-price">
                  <span className="v1-pcard-listing v1-pcard-listing--inline">{p.listing}</span>
                  <div className="v1-pcard-price">{D.fmt(p.price)}</div>
                  {p.pricePeriod && <div className="v1-pcard-period">{p.pricePeriod}</div>}
                  <button className="v1-btn v1-btn-outline v1-btn-sm">View details</button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="v1-pagination">
          <button className="v1-page-btn"><Icon name="arrowLeft" className="w-4 h-4" /></button>
          <button className="v1-page-btn is-active">1</button>
          <button className="v1-page-btn">2</button>
          <button className="v1-page-btn">3</button>
          <span className="v1-page-ellipsis">…</span>
          <button className="v1-page-btn">14</button>
          <button className="v1-page-btn"><Icon name="arrowRight" className="w-4 h-4" /></button>
        </div>
      </section>
    </>
  );
}

// ============================== Detail =====================================
function V1DetailPage({ id, setPage, setDetailId }) {
  const D = window.MAILAFIYA_DATA;
  const p = D.properties.find((x) => x.id === id) || D.properties[0];
  const [main, setMain] = useState(p.gallery[0]);
  const similar = D.properties.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3);

  useEffect(() => { setMain(p.gallery[0]); }, [p.id]);

  return (
    <>
      <div className="v1-container">
        <div className="v1-crumbs" style={{ marginTop: 24 }}>
          <a onClick={() => setPage("home")}>Home</a> / <a onClick={() => setPage("listings")}>Properties</a> / <span>{p.shortTitle}</span>
        </div>
      </div>

      <section className="v1-container v1-detail-gallery">
        <div className="v1-detail-main">
          <img src={main} alt={p.title} />
          <span className="v1-pcard-listing v1-detail-listing">{p.listing}</span>
          <button className="v1-detail-video-badge"><Icon name="play" fill="currentColor" strokeWidth={0} className="w-3.5 h-3.5" /> Video tour</button>
        </div>
        <div className="v1-detail-thumbs">
          {p.gallery.slice(0, 4).map((g, i) => (
            <button key={i} className={"v1-detail-thumb " + (g === main ? "is-active" : "")} onClick={() => setMain(g)}>
              <img src={g} alt="" />
              {i === 3 && p.gallery.length > 4 && (
                <span className="v1-detail-thumb-more">+{p.gallery.length - 4}</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="v1-container v1-detail-body">
        <div className="v1-detail-main-col">
          <div className="v1-detail-head">
            <div>
              <div className="v1-pcard-cat">{p.category} · {p.area}, {p.city}, {p.state}</div>
              <h1 className="v1-detail-h1">{p.title}</h1>
              <div className="v1-detail-actions">
                <button className="v1-icon-btn"><Icon name="heart" className="w-4 h-4" /> Save</button>
                <button className="v1-icon-btn"><Icon name="share" className="w-4 h-4" /> Share</button>
              </div>
            </div>
            <div className="v1-detail-price">
              <div className="v1-detail-price-n">{D.fmt(p.price)}</div>
              {p.pricePeriod && <div className="v1-detail-price-p">{p.pricePeriod}</div>}
            </div>
          </div>

          <div className="v1-spec-strip">
            <div className="v1-spec">
              <Icon name="ruler" className="w-5 h-5" />
              <div><div className="v1-spec-l">Size</div><div className="v1-spec-v">{p.size}</div></div>
            </div>
            {p.category === "Warehouse" && (
              <>
                <div className="v1-spec">
                  <Icon name="door" className="w-5 h-5" />
                  <div><div className="v1-spec-l">Loading bays</div><div className="v1-spec-v">{p.dockDoors}</div></div>
                </div>
                <div className="v1-spec">
                  <Icon name="arrowUp" className="w-5 h-5" />
                  <div><div className="v1-spec-l">Clear height</div><div className="v1-spec-v">{p.clearHeight}</div></div>
                </div>
                <div className="v1-spec">
                  <Icon name="truck" className="w-5 h-5" />
                  <div><div className="v1-spec-l">Truck parking</div><div className="v1-spec-v">{p.parking}</div></div>
                </div>
              </>
            )}
            {p.bedrooms && (
              <>
                <div className="v1-spec">
                  <Icon name="bed" className="w-5 h-5" />
                  <div><div className="v1-spec-l">Bedrooms</div><div className="v1-spec-v">{p.bedrooms}</div></div>
                </div>
                <div className="v1-spec">
                  <Icon name="bath" className="w-5 h-5" />
                  <div><div className="v1-spec-l">Bathrooms</div><div className="v1-spec-v">{p.bathrooms}</div></div>
                </div>
              </>
            )}
            {p.yearBuilt && (
              <div className="v1-spec">
                <Icon name="clock" className="w-5 h-5" />
                <div><div className="v1-spec-l">Year built</div><div className="v1-spec-v">{p.yearBuilt}</div></div>
              </div>
            )}
          </div>

          <div className="v1-detail-block">
            <h2 className="v1-h3">Description</h2>
            <p className="v1-detail-desc">{p.description}</p>
          </div>

          <div className="v1-detail-block">
            <h2 className="v1-h3">Features & amenities</h2>
            <ul className="v1-feature-list">
              {p.features.map((f) => (
                <li key={f}><Icon name="check" className="w-4 h-4" /> {f}</li>
              ))}
            </ul>
          </div>

          <div className="v1-detail-block">
            <h2 className="v1-h3">Location</h2>
            <div className="v1-map">
              <div className="v1-map-inner">
                <Icon name="pin" className="w-6 h-6" />
                <span>{p.area}, {p.city}, {p.state}</span>
              </div>
              <div className="v1-map-grid" />
            </div>
          </div>

          <div className="v1-detail-block">
            <h2 className="v1-h3">Similar properties</h2>
            <div className="v1-pgrid v1-pgrid--3">
              {similar.map((s) => (
                <V1PropertyCard key={s.id} p={s} onClick={() => { setDetailId(s.id); }} />
              ))}
            </div>
          </div>
        </div>

        <aside className="v1-detail-side">
          <div className="v1-agent-card">
            <div className="v1-agent-head">
              <img src="assets/team-2.jpg" alt="Agent" className="v1-agent-avatar" />
              <div>
                <div className="v1-agent-name">{p.agent.name}</div>
                <div className="v1-agent-role">{p.agent.role}</div>
              </div>
            </div>
            <div className="v1-agent-phone"><Icon name="phone" className="w-3.5 h-3.5" /> {p.agent.phone}</div>
          </div>

          <div className="v1-inquiry">
            <h3 className="v1-inquiry-h">Enquire about this property</h3>
            <input className="v1-input" placeholder="Full name" />
            <input className="v1-input" placeholder="Phone number" />
            <input className="v1-input" placeholder="Email address" />
            <select className="v1-input">
              <option>Inquiry type</option>
              <option>Request viewing</option>
              <option>Request more info</option>
              <option>Make an offer</option>
            </select>
            <textarea className="v1-input v1-textarea"
              defaultValue={`Hello, I'd like to know more about ${p.shortTitle}.`} rows={4} />
            <button className="v1-btn v1-btn-primary" style={{ width: "100%" }}>Send enquiry</button>
            <div className="v1-inquiry-alt">or</div>
            <button className="v1-btn v1-btn-whatsapp" style={{ width: "100%" }}>
              <Icon name="whatsapp" className="w-4 h-4" /> Message on WhatsApp
            </button>
            <button className="v1-btn v1-btn-outline" style={{ width: "100%", marginTop: 10 }}>
              <Icon name="phone" className="w-4 h-4" /> Call {p.agent.phone.split(" ").slice(-2).join(" ")}
            </button>
          </div>

          <div className="v1-trust-mini">
            <div className="v1-trust-row">
              <Icon name="shield" className="w-4 h-4" /> Title verified
            </div>
            <div className="v1-trust-row">
              <Icon name="check" className="w-4 h-4" /> Property walked & photographed by our team
            </div>
            <div className="v1-trust-row">
              <Icon name="clock" className="w-4 h-4" /> Listed 12 days ago
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

// ============================== Services ===================================
function V1ServicesPage({ setPage }) {
  const D = window.MAILAFIYA_DATA;
  return (
    <>
      <section className="v1-page-hero">
        <div className="v1-container">
          <div className="v1-crumbs">Home / <span>Services</span></div>
          <span className="v1-eyebrow">What we do</span>
          <h1 className="v1-h1">Warehousing, real estate,<br /><em>and everything in between.</em></h1>
          <p className="v1-page-hero-p">
            From sourcing a 500 sqm SME warehouse to managing an industrial portfolio, we handle
            the full lifecycle of your property.
          </p>
        </div>
      </section>

      <section className="v1-container v1-section">
        <div className="v1-services-grid">
          {D.services.map((s) => (
            <article key={s.title} className="v1-service">
              <div className="v1-service-icon"><Icon name={s.icon} className="w-6 h-6" /></div>
              <h3 className="v1-service-h">{s.title}</h3>
              <p className="v1-service-p">{s.blurb}</p>
              <a href="#" className="v1-link">Learn more <Icon name="arrowRight" className="w-3.5 h-3.5" /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="v1-section v1-process">
        <div className="v1-container">
          <div className="v1-section-head v1-section-head--centered">
            <span className="v1-eyebrow">How we work</span>
            <h2 className="v1-h2">A process built on clarity</h2>
          </div>
          <div className="v1-process-grid">
            {[
              { n: "01", t: "Discovery call", d: "We understand your operational needs — dock heights, floor loads, power, location logistics." },
              { n: "02", t: "Shortlist", d: "Within 5 working days you receive a curated shortlist of 3-6 properties, each personally walked by our team." },
              { n: "03", t: "Site visits", d: "We coordinate viewings, answer questions on the ground, and pull structural / title reports on your favourites." },
              { n: "04", t: "Negotiate & close", d: "Terms, valuation, legal support and hand-over — we stay with you until the keys change hands." },
            ].map((s) => (
              <div key={s.n} className="v1-process-step">
                <div className="v1-process-n">{s.n}</div>
                <h3 className="v1-process-t">{s.t}</h3>
                <p className="v1-process-d">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <V1CTABand setPage={setPage} />
    </>
  );
}

// ============================== About =====================================
function V1AboutPage({ setPage }) {
  const D = window.MAILAFIYA_DATA;
  const team = [
    { name: "Alhaji Musa Danladi", role: "Founder & CEO", img: "assets/ceo-portrait.jpg" },
    { name: "Ibrahim Suleiman", role: "Head, Warehousing Division", img: "assets/team-2.jpg" },
    { name: "Aisha Bello", role: "Senior Property Consultant", img: "assets/team-1.jpg" },
    { name: "Yusuf Danladi", role: "Consultant, Kaduna Region", img: "assets/team-3.jpg" },
  ];
  return (
    <>
      <section className="v1-page-hero">
        <div className="v1-container">
          <div className="v1-crumbs">Home / <span>About</span></div>
          <span className="v1-eyebrow">About Mai'Lafiya</span>
          <h1 className="v1-h1">Well-being begins with<br /><em>a place that works.</em></h1>
          <p className="v1-page-hero-p">
            For seventeen years we have helped families and industry across Northern Nigeria
            find the property that unlocks the next chapter of their story.
          </p>
        </div>
      </section>

      <section className="v1-container v1-section v1-about-story">
        <div className="v1-about-story-grid">
          <img src="assets/warehouse-facility-1.jpg" alt="Warehouse" className="v1-about-img" />
          <div>
            <span className="v1-eyebrow">Our story</span>
            <h2 className="v1-h2">From a Bompai family shop<br />to Northern Nigeria's trusted name.</h2>
            <p className="v1-about-p">
              Mai'Lafiya General Merchants was founded in 2008 by Alhaji Musa Danladi as a modest brokerage
              serving traders in Kano's Bompai Industrial Layout. Over seventeen years the practice has
              grown — but the values have not. Every property we represent is walked by one of our
              consultants. Every client is known by name.
            </p>
            <p className="v1-about-p">
              Today, we operate across six cities in Northern Nigeria and specialise in the industrial
              and warehousing segments — the assets that keep the North's economy moving. We remain a
              family-owned business, and proud of it.
            </p>
          </div>
        </div>
      </section>

      <section className="v1-values">
        <div className="v1-container">
          <div className="v1-section-head v1-section-head--centered">
            <span className="v1-eyebrow">Our values</span>
            <h2 className="v1-h2">What we hold ourselves to</h2>
          </div>
          <div className="v1-values-grid">
            {[
              { t: "Amana (Trust)", d: "Our word is bond. What we promise, we deliver." },
              { t: "Adalci (Fairness)", d: "Every party — landlord, tenant, buyer, seller — leaves the table with dignity." },
              { t: "Sabuntawa (Renewal)", d: "We invest in our people, our processes, and the properties we manage." },
              { t: "Al'umma (Community)", d: "We build long-term relationships with the towns and traders we serve." },
            ].map((v) => (
              <div key={v.t} className="v1-value">
                <div className="v1-value-t">{v.t}</div>
                <div className="v1-value-d">{v.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="v1-container v1-section">
        <div className="v1-section-head v1-section-head--centered">
          <span className="v1-eyebrow">The people</span>
          <h2 className="v1-h2">Meet the team</h2>
        </div>
        <div className="v1-team-grid">
          {team.map((t) => (
            <article key={t.name} className="v1-team-card">
              <img src={t.img} alt={t.name} className="v1-team-img" />
              <h3 className="v1-team-name">{t.name}</h3>
              <div className="v1-team-role">{t.role}</div>
            </article>
          ))}
        </div>
      </section>

      <V1CTABand setPage={setPage} />
    </>
  );
}

// ============================== List Your Property =========================
function V1ListPropertyPage() {
  return (
    <>
      <section className="v1-page-hero">
        <div className="v1-container">
          <div className="v1-crumbs">Home / <span>List with us</span></div>
          <span className="v1-eyebrow">For property owners</span>
          <h1 className="v1-h1">Let us find a tenant<br /><em>you'll be glad you signed.</em></h1>
          <p className="v1-page-hero-p">
            Whether you have a single warehouse or an industrial portfolio, we place tenants
            who pay on time and treat your property like their own.
          </p>
        </div>
      </section>

      <section className="v1-container v1-section">
        <div className="v1-list-grid">
          <div className="v1-list-form-wrap">
            <h2 className="v1-h3" style={{ marginBottom: 20 }}>Tell us about your property</h2>
            <form className="v1-form">
              <div className="v1-form-row">
                <div className="v1-form-field">
                  <label>Your name</label>
                  <input className="v1-input" placeholder="e.g. Musa Ibrahim" />
                </div>
                <div className="v1-form-field">
                  <label>Phone number</label>
                  <input className="v1-input" placeholder="+234 803 …" />
                </div>
              </div>
              <div className="v1-form-field">
                <label>Email address</label>
                <input className="v1-input" placeholder="you@example.com" />
              </div>
              <div className="v1-form-row">
                <div className="v1-form-field">
                  <label>Property type</label>
                  <select className="v1-input">
                    <option>Warehouse</option>
                    <option>Commercial (office, plaza)</option>
                    <option>Residential</option>
                    <option>Industrial land</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="v1-form-field">
                  <label>Intent</label>
                  <select className="v1-input">
                    <option>Rent / Lease it out</option>
                    <option>Sell it</option>
                    <option>Get it professionally managed</option>
                    <option>Get a valuation</option>
                  </select>
                </div>
              </div>
              <div className="v1-form-row">
                <div className="v1-form-field">
                  <label>City</label>
                  <select className="v1-input">
                    <option>Kano</option><option>Kaduna</option><option>Abuja</option>
                    <option>Jos</option><option>Sokoto</option><option>Maiduguri</option>
                  </select>
                </div>
                <div className="v1-form-field">
                  <label>Approximate size</label>
                  <input className="v1-input" placeholder="e.g. 2,500 sqm" />
                </div>
              </div>
              <div className="v1-form-field">
                <label>Address / area</label>
                <input className="v1-input" placeholder="Neighbourhood or street" />
              </div>
              <div className="v1-form-field">
                <label>Tell us more</label>
                <textarea className="v1-input v1-textarea" rows={4}
                  placeholder="Anything we should know — condition, previous tenants, existing lease terms…" />
              </div>
              <div className="v1-form-field">
                <label>Upload photos <span style={{ color: V1.muted, fontWeight: 400 }}>(optional)</span></label>
                <div className="v1-upload">
                  <Icon name="upload" className="w-6 h-6" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Drop files here or browse</div>
                    <div style={{ color: V1.muted, fontSize: 13 }}>JPG or PNG up to 10 MB each</div>
                  </div>
                </div>
              </div>
              <button type="button" className="v1-btn v1-btn-primary v1-btn-lg" style={{ width: "100%" }}>
                Submit property details
              </button>
            </form>
          </div>
          <aside className="v1-list-side">
            <h3 className="v1-h3">Why owners choose us</h3>
            <ul className="v1-perks">
              <li><Icon name="check" className="w-4 h-4" /><div><strong>340+ tenants placed.</strong> A network of vetted corporates and traders across the North.</div></li>
              <li><Icon name="check" className="w-4 h-4" /><div><strong>Personally walked.</strong> Every property we list is inspected and photographed by our consultants.</div></li>
              <li><Icon name="check" className="w-4 h-4" /><div><strong>Transparent fees.</strong> No hidden charges. Standard 10% commission on annual rent.</div></li>
              <li><Icon name="check" className="w-4 h-4" /><div><strong>Full management option.</strong> Rent collection, maintenance, quarterly reporting — we can run the property for you.</div></li>
            </ul>
            <div className="v1-quote-card">
              <Icon name="quote" className="v1-tcard-quote" />
              <blockquote>"They filled my Sharada warehouse within three weeks. And the tenant is paying on time, going into year four."</blockquote>
              <cite>— Ahmed Bello, MD, Northern Industrial Holdings</cite>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

// ============================== Contact ====================================
function V1ContactPage() {
  const D = window.MAILAFIYA_DATA;
  return (
    <>
      <section className="v1-page-hero">
        <div className="v1-container">
          <div className="v1-crumbs">Home / <span>Contact</span></div>
          <span className="v1-eyebrow">Get in touch</span>
          <h1 className="v1-h1">We reply to every enquiry<br /><em>within 4 working hours.</em></h1>
          <p className="v1-page-hero-p">
            Call, WhatsApp, or send us a message. Our consultants know the whole of Northern Nigeria's
            industrial market — and would love to help you find your next property.
          </p>
        </div>
      </section>

      <section className="v1-container v1-section">
        <div className="v1-contact-grid">
          <div className="v1-contact-form-wrap">
            <h2 className="v1-h3" style={{ marginBottom: 20 }}>Send us a message</h2>
            <form className="v1-form">
              <div className="v1-form-row">
                <div className="v1-form-field">
                  <label>Full name</label>
                  <input className="v1-input" placeholder="Your name" />
                </div>
                <div className="v1-form-field">
                  <label>Phone number</label>
                  <input className="v1-input" placeholder="+234 …" />
                </div>
              </div>
              <div className="v1-form-field">
                <label>Email address</label>
                <input className="v1-input" placeholder="you@example.com" />
              </div>
              <div className="v1-form-field">
                <label>Enquiry type</label>
                <select className="v1-input">
                  <option>General enquiry</option>
                  <option>Looking to lease a property</option>
                  <option>Looking to buy a property</option>
                  <option>List my property with you</option>
                  <option>Property management</option>
                  <option>Valuation request</option>
                </select>
              </div>
              <div className="v1-form-field">
                <label>Message</label>
                <textarea className="v1-input v1-textarea" rows={5}
                  placeholder="How can we help?" />
              </div>
              <button type="button" className="v1-btn v1-btn-primary v1-btn-lg" style={{ width: "100%" }}>
                Send message
              </button>
            </form>
          </div>
          <aside className="v1-contact-side">
            <div className="v1-contact-card">
              <div className="v1-contact-icon"><Icon name="phone" className="w-5 h-5" /></div>
              <div>
                <div className="v1-contact-l">Call us</div>
                <div className="v1-contact-v">{D.business.phone}</div>
                <div className="v1-contact-sub">{D.business.hours}</div>
              </div>
            </div>
            <div className="v1-contact-card">
              <div className="v1-contact-icon"><Icon name="whatsapp" className="w-5 h-5" /></div>
              <div>
                <div className="v1-contact-l">WhatsApp</div>
                <div className="v1-contact-v">{D.business.whatsapp}</div>
                <div className="v1-contact-sub">Fastest way to reach us</div>
              </div>
            </div>
            <div className="v1-contact-card">
              <div className="v1-contact-icon"><Icon name="mail" className="w-5 h-5" /></div>
              <div>
                <div className="v1-contact-l">Email</div>
                <div className="v1-contact-v">{D.business.email}</div>
                <div className="v1-contact-sub">Replies within 4 hours</div>
              </div>
            </div>
            <div className="v1-contact-card">
              <div className="v1-contact-icon"><Icon name="pin" className="w-5 h-5" /></div>
              <div>
                <div className="v1-contact-l">Head office</div>
                <div className="v1-contact-v">{D.business.address}</div>
                <div className="v1-contact-sub">Walk-ins welcome</div>
              </div>
            </div>
          </aside>
        </div>

        <div className="v1-map v1-map--large" style={{ marginTop: 40 }}>
          <div className="v1-map-inner">
            <Icon name="pin" className="w-8 h-8" />
            <div>
              <div style={{ fontFamily: "Fraunces", fontSize: 22, fontWeight: 500 }}>Head office · Bompai, Kano</div>
              <div style={{ color: V1.muted, marginTop: 4 }}>{D.business.address}</div>
            </div>
          </div>
          <div className="v1-map-grid" />
        </div>
      </section>
    </>
  );
}

// ============================== Root =======================================
function V1Root({ page, setPage, detailId, setDetailId, mobile }) {
  return (
    <div className={"v1-root " + (mobile ? "v1-mobile" : "")} data-screen-label={"V1 " + page}>
      {mobile
        ? <V1MobileNav page={page} setPage={setPage} />
        : <V1TopBar page={page} setPage={setPage} />}
      <main>
        {page === "home" && <V1HomePage setPage={setPage} setDetailId={setDetailId} />}
        {page === "listings" && <V1ListingsPage setPage={setPage} setDetailId={setDetailId} />}
        {page === "detail" && <V1DetailPage id={detailId} setPage={setPage} setDetailId={setDetailId} />}
        {page === "services" && <V1ServicesPage setPage={setPage} />}
        {page === "about" && <V1AboutPage setPage={setPage} />}
        {page === "list-property" && <V1ListPropertyPage />}
        {page === "contact" && <V1ContactPage />}
      </main>
      <V1Footer setPage={setPage} />
      <V1FloatingWA />
    </div>
  );
}

window.V1Root = V1Root;
