import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { Meta } from '../components/Meta';
import { PropertyCard } from '../components/PropertyCard';
import { Image } from '../lib/media';
import { useRows, useOne, money, track } from '../lib/data';
import { ui } from '../strings';
import {
  ArrowRight,
  Search,
  Warehouse,
  Building2,
  House,
  Landmark,
  Settings,
  Check,
  Star,
  ShieldCheck,
  Clock,
  Key,
  Play,
  MapPin,
  WhatsAppIcon,
  VerifiedBadgeIcon,
} from '../lib/icons';

const ICON_MAP = {
  shield: ShieldCheck,
  clock: Clock,
  check: Check,
  keys: Key,
  warehouse: Warehouse,
  building: Building2,
  bed: House,
  land: Landmark,
  settings: Settings,
};

export function Home() {
  const { data: slides } = useRows('hero_slides');
  const { data: properties } = useRows('properties');
  const { data: categories } = useRows('property_categories');
  const { data: cities } = useRows('cities');
  const { data: promises } = useRows('promises');
  const { data: reviews } = useRows('testimonials_google');
  const { data: cases } = useRows('case_studies');
  const { data: partners } = useRows('partners');
  const { data: metrics } = useOne('metrics');
  const { data: about } = useOne('about_page');

  const [slide, setSlide] = useState(0);
  const [pause, setPause] = useState(false);
  const [activeTab, setActiveTab] = useState('Warehouse');
  const [search, setSearch] = useState({
    listing: '',
    category: '',
    city: '',
    budget: '',
  });

  const navigate = useNavigate();

  // Carousel timer: 5.5s interval, respects prefers-reduced-motion
  useEffect(() => {
    if (pause) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timer = setInterval(() => {
      setSlide((current) => (current + 1) % Math.max(slides.length, 1));
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length, pause]);

  // Hot Deal: only active properties
  const hotDeal = properties.find((p) => p.is_hot_deal && p.status === 'Active') || properties[0];

  // Tabbed featured properties: filter by active tab & active status, limit 3
  const activeCatId = categories.find((c) => c.name.toLowerCase() === activeTab.toLowerCase())?.id;
  const featured = properties
    .filter((p) => p.status === 'Active' && (!activeCatId || p.category_id === activeCatId))
    .slice(0, 3);

  // Search submit
  function handleSearchSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.listing) params.set('listing', search.listing);
    if (search.category) params.set('category', search.category);
    if (search.city) params.set('city', search.city);
    if (search.budget) {
      const [min, max] = search.budget.split('-');
      if (min) params.set('minPrice', min);
      if (max) params.set('maxPrice', max);
    }
    navigate(`/properties?${params.toString()}`);
  }

  const cleanPhone = ui.phone.replace(/\s+/g, '');
  const waUrl = (text = '') => `https://wa.me/${ui.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;

  return (
    <Shell>
      <Meta
        title="Warehouse Leasing, Sales & Real Estate in Kano"
        description="Mai'Lafiya Homes & Properties Ltd. - Northern Nigeria's premier warehousing agency and real estate specialists based in Bompai, Kano."
      />

      {/* 3. HERO (1.35fr : 0.85fr grid, 6-slide carousel, Hot Deal, 4-field Search Bar) */}
      <section
        className="v1-hero"
        onMouseEnter={() => setPause(true)}
        onMouseLeave={() => setPause(false)}
      >
        <div className="v1-hero-slides">
          {slides.map((s, idx) => (
            <div
              key={s.id || idx}
              className={`v1-hero-slide ${idx === slide ? 'is-active' : ''}`}
            >
              <Image src={s.image} alt={s.tag || 'Hero slide'} />
            </div>
          ))}
        </div>
        <div className="v1-hero-scrim" />

        <div className="v1-container">
          <div className="v1-hero-content">
            {/* Left column */}
            <div className="v1-hero-left">
              <div className="v1-hero-eyebrow">
                <span className="dot" />
                <strong>{ui.hero.eyebrow}</strong>
              </div>

              <h1 className="v1-hero-h1">
                {ui.hero.headlineLine1} <br />
                <em>{ui.hero.headlineHighlight}</em>
              </h1>

              <p className="v1-hero-sub">{ui.hero.body}</p>

              <div className="v1-hero-value-row">
                {ui.hero.trustPills.map((pill) => (
                  <span key={pill}>
                    <Check size={16} /> {pill}
                  </span>
                ))}
              </div>

              <div className="v1-hero-cta-row">
                <Link className="v1-btn v1-btn-lg v1-btn-primary" to="/properties?category=warehouse">
                  {ui.actions.browseWarehouses} <ArrowRight size={18} />
                </Link>
                <a
                  className="v1-btn v1-btn-lg v1-btn-gold"
                  href={waUrl("Hello Mai'Lafiya Homes, I would like to enquire about available properties.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('whatsapp_click')}
                >
                  <WhatsAppIcon size={18} /> WhatsApp
                </a>
              </div>

              <div className="v1-hero-microtrust">
                <div className="v1-hero-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <span>
                  <strong>{metrics?.client_rating != null ? `${metrics.client_rating}/5` : '—'}</strong> · {metrics?.review_count ?? '—'} client reviews · Response in {metrics?.response_time_hours ?? '—'} hours
                </span>
              </div>
            </div>

            {/* Right column: Hot Deal Card */}
            {hotDeal && (
              <Link className="v1-hero-spotlight" to={`/properties/${hotDeal.slug}`}>
                <div className="v1-hero-spotlight-badge">
                  <span className="v1-spotlight-pulse" />
                  <span>{ui.hero.hotDealBadge}</span>
                </div>
                <div className="v1-hero-spotlight-media">
                  <Image src={hotDeal.main_image} alt={hotDeal.title} />
                  <span className="v1-hero-spotlight-cat">Warehouse</span>
                </div>
                <div className="v1-hero-spotlight-body">
                  <span className="v1-hero-spotlight-loc">
                    <MapPin size={12} /> {hotDeal.area}, Kano
                  </span>
                  <h3 className="v1-hero-spotlight-title">{hotDeal.short_title || hotDeal.title}</h3>
                  <div className="v1-hero-spotlight-meta">
                    <span>{hotDeal.size}</span>
                    {hotDeal.dock_doors && <span>· {hotDeal.dock_doors} bays</span>}
                    {hotDeal.clear_height && <span>· {hotDeal.clear_height}</span>}
                  </div>
                  <div className="v1-hero-spotlight-foot">
                    <div>
                      <div className="v1-hero-spotlight-price">{money(hotDeal.price)}</div>
                      {hotDeal.price_period && (
                        <div className="v1-hero-spotlight-period">{hotDeal.price_period}</div>
                      )}
                    </div>
                    <span className="v1-hero-spotlight-cta">
                      View <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* 4-field Search bar */}
          <div className="v1-hero-search-wrap">
            <form className="v1-hero-search" onSubmit={handleSearchSubmit}>
              <div className="v1-hero-search-field">
                <label>I want to</label>
                <select
                  value={search.listing}
                  onChange={(e) => setSearch({ ...search, listing: e.target.value })}
                >
                  <option value="">Any listing</option>
                  <option value="For Lease">For Lease</option>
                  <option value="For Sale">For Sale</option>
                  <option value="Short-let">Short-let</option>
                </select>
              </div>

              <div className="v1-hero-search-field">
                <label>Property type</label>
                <select
                  value={search.category}
                  onChange={(e) => setSearch({ ...search, category: e.target.value })}
                >
                  <option value="">Any type</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="v1-hero-search-field">
                <label>City</label>
                <select
                  value={search.city}
                  onChange={(e) => setSearch({ ...search, city: e.target.value })}
                >
                  <option value="">Any city</option>
                  {cities.map((ci) => (
                    <option key={ci.id} value={ci.slug}>
                      {ci.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="v1-hero-search-field">
                <label>Budget</label>
                <select
                  value={search.budget}
                  onChange={(e) => setSearch({ ...search, budget: e.target.value })}
                >
                  <option value="">Any budget</option>
                  <option value="-100000000">Under ₦100M</option>
                  <option value="100000000-500000000">₦100M – ₦500M</option>
                  <option value="500000000-1000000000">₦500M – ₦1B</option>
                  <option value="1000000000-">Over ₦1B</option>
                </select>
              </div>

              <button className="v1-btn v1-btn-primary v1-hero-search-btn" type="submit">
                <Search size={18} /> {ui.actions.search}
              </button>
            </form>

            {/* Pagination dots for hero */}
            <div className="v1-hero-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`v1-hero-dot ${i === slide ? 'is-active' : ''}`}
                  onClick={() => setSlide(i)}
                  aria-label={`Jump to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRUST BAR */}
      <div className="v1-trustbar">
        <div className="v1-container">
          <div className="v1-trustbar-inner">
            <div className="v1-trustbar-item">
              <span className="v1-trustbar-n">{metrics?.years_in_business ?? '—'}</span>
              <span className="v1-trustbar-l">Years in business</span>
            </div>
            <div className="v1-trustbar-item">
              <span className="v1-trustbar-n">{metrics?.properties_transacted != null ? `${metrics.properties_transacted}+` : '—'}</span>
              <span className="v1-trustbar-l">Deals closed</span>
            </div>
            <div className="v1-trustbar-item">
              <span className="v1-trustbar-n">{metrics?.value_of_deals_closed ?? '—'}</span>
              <span className="v1-trustbar-l">Value of deals</span>
            </div>
            <div className="v1-trustbar-item">
              <span className="v1-trustbar-n">{metrics?.review_count ?? '—'}</span>
              <span className="v1-trustbar-l">Client reviews</span>
            </div>
            <div className="v1-trustbar-item">
              <span className="v1-trustbar-n">
                {metrics?.response_time_hours != null ? `${metrics.response_time_hours}h` : '—'}
              </span>
              <span className="v1-trustbar-l">Response time</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. CATEGORY STRIP */}
      <section className="v1-catstrip">
        <div className="v1-container">
          <div className="v1-catstrip-grid">
            {[
              { label: 'Warehouses Lease', cat: 'warehouse', listing: 'For Lease', icon: Warehouse },
              { label: 'Warehouses Sale', cat: 'warehouse', listing: 'For Sale', icon: Warehouse },
              { label: 'Management Services', link: '/services', icon: Settings },
              { label: 'Commercial', cat: 'commercial', icon: Building2 },
              { label: 'Residential', cat: 'residential', icon: House },
              { label: 'Land', cat: 'land', icon: Landmark },
            ].map((item) => {
              const Icon = item.icon;
              const count = item.cat
                ? properties.filter(
                    (p) =>
                      p.status === 'Active' &&
                      categories.find((c) => c.id === p.category_id)?.slug === item.cat &&
                      (!item.listing || p.listing === item.listing)
                  ).length
                : 0;

              const target = item.link
                ? item.link
                : `/properties?category=${item.cat}${item.listing ? '&listing=' + encodeURIComponent(item.listing) : ''}`;

              return (
                <Link key={item.label} className="v1-cat" to={target}>
                  <div className="v1-cat-icon">
                    <Icon size={22} />
                  </div>
                  <strong className="v1-cat-label">{item.label}</strong>
                  <span className="v1-cat-count">
                    {item.link ? 'Explore services' : `${count} available`}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. FOUR PROMISES */}
      <section className="v1-section v1-section-deep">
        <div className="v1-container">
          <div className="v1-section-head v1-section-head--centered">
            <span className="v1-eyebrow">{ui.promisesHeading.eyebrow}</span>
            <h2 className="v1-h2">{ui.promisesHeading.title}</h2>
          </div>

          <div className="v1-whyus-grid">
            {promises.map((p) => {
              const Icon = ICON_MAP[p.icon] || ShieldCheck;
              return (
                <div key={p.id} className="v1-whyus-card">
                  <div className="v1-whyus-icon">
                    <Icon size={24} />
                  </div>
                  <h3 className="v1-whyus-t">{p.title}</h3>
                  <p className="v1-whyus-d">{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FEATURED PROPERTIES WITH TABS */}
      <section className="v1-section">
        <div className="v1-container">
          <div className="v1-section-head">
            <div>
              <span className="v1-eyebrow">🔥 {ui.featuredHeading.eyebrow}</span>
              <h2 className="v1-h2">{ui.featuredHeading.title}</h2>
            </div>
            <div className="v1-tabs">
              {['Warehouse', 'Commercial', 'Residential', 'Land'].map((tab) => (
                <button
                  key={tab}
                  className={`v1-tab ${activeTab === tab ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="v1-pgrid">
            {featured.map((p) => (
              <PropertyCard
                key={p.id}
                p={p}
                categories={categories}
                cities={cities}
              />
            ))}
          </div>

          <div className="v1-section-foot">
            <Link className="v1-btn v1-btn-outline" to="/properties">
              {ui.actions.viewAll} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOUNDER VIDEO BAND */}
      <section className="v1-ceo">
        <div className="v1-ceo-scrim" />
        <div className="v1-container">
          <div className="v1-ceo-content">
            <div className="v1-ceo-eyebrow">✦ A Word From Our Founder</div>
            <h2 className="v1-ceo-h2">
              “{about?.ceo_quote || "When you trust us with a property, you are trusting us with your family's or your company's future. We never forget that."}”
            </h2>
            <div className="v1-ceo-attribution">
              <strong>{about?.ceo_name || 'Mr. Kingsley Agena'}</strong> · {about?.ceo_title || 'Founder & Chief Executive'}
            </div>
            {about?.ceo_video_url && about.ceo_video_url !== '#' && <a
              className="v1-ceo-play"
              href={about.ceo_video_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ui.actions.watchInterview}
            >
              <span className="v1-ceo-play-ring" />
              <span className="v1-ceo-play-btn">
                <Play size={30} fill="currentColor" />
              </span>
            </a>}
            {about?.ceo_video_url && about.ceo_video_url !== '#' && <div className="v1-ceo-meta">{ui.actions.watchInterview}</div>}
          </div>
        </div>
      </section>

      {/* 9. STORY + STATS */}
      <section className="v1-section v1-section-deep" id="about-story">
        <div className="v1-container">
          <div className="v1-story-grid">
            <div>
              <span className="v1-eyebrow">{about?.story_eyebrow || 'Our story'}</span>
              <h2 className="v1-h2">
                From a Bompai family shop to <em>Northern Nigeria's trusted name.</em>
              </h2>
              <p className="v1-story-p">
                {about?.story_body?.split('\n\n')[0] ||
                  "Mai'Lafiya began in 2008 as a small family trading business in Bompai, Kano. Helping neighbours and suppliers find reliable warehouse space taught us that in Northern Nigeria, property is built on relationships and reputation."}
              </p>
              <p className="v1-story-p">
                {about?.story_body?.split('\n\n')[1] || ui.footer.about}
              </p>

              <div className="v1-story-stats">
                <div>
                  <div className="v1-stat-n">{metrics?.years_in_business ?? '—'}</div>
                  <div className="v1-stat-l">Years in business</div>
                </div>
                <div>
                  <div className="v1-stat-n">{metrics?.properties_transacted != null ? `${metrics.properties_transacted}+` : '—'}</div>
                  <div className="v1-stat-l">Properties transacted</div>
                </div>
                <div>
                  <div className="v1-stat-n">{metrics?.value_of_deals_closed ?? '—'}</div>
                  <div className="v1-stat-l">Transaction volume</div>
                </div>
                <div>
                  <div className="v1-stat-n">{metrics?.square_metres_managed != null ? metrics.square_metres_managed.toLocaleString('en-NG') : '—'}</div>
                  <div className="v1-stat-l">Square metres managed</div>
                </div>
              </div>
            </div>

            <div className="v1-story-media">
              <Image
                src="assets/founder-portrait-cropped.jpg"
                alt="Mr. Kingsley Agena, Founder of Mai'Lafiya Homes"
                className="v1-story-img-main"
              />
              <div className="v1-story-badge">
                <div>
                  <div className="v1-story-badge-n">{metrics?.years_in_business ?? '—'}</div>
                  <div className="v1-story-badge-l">Years of trust</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. GOOGLE REVIEWS */}
      <section className="v1-section">
        <div className="v1-container">
          <div className="v1-section-head">
            <div>
              <span className="v1-eyebrow">Client feedback</span>
              <h2 className="v1-h2">{ui.reviewsHeading.title}</h2>
            </div>
            <div className="v1-greviews-stars-row">
              <div style={{ display: 'flex', gap: '3px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <span className="v1-greviews-badge">
                <VerifiedBadgeIcon size={14} /> Verified on Google
              </span>
            </div>
          </div>

          <div className="v1-greviews-grid">
            {reviews.map((r) => (
              <article key={r.id} className="v1-greview">
                <div className="v1-greview-head">
                  <div className="v1-greview-avatar brand-placeholder" style={{ minHeight: 'unset' }}>
                    <span style={{ fontSize: '18px' }}>{r.name[0]}</span>
                  </div>
                  <div>
                    <div className="v1-greview-name">{r.name}</div>
                    <div className="v1-greview-when">{r.when_label}</div>
                  </div>
                </div>
                <div className="v1-greview-stars">
                  {[...Array(r.stars || 5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="v1-greview-body">{r.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 11. CASE STUDIES */}
      <section className="v1-section v1-section-deep">
        <div className="v1-container">
          <div className="v1-section-head">
            <div>
              <span className="v1-eyebrow">Proven track record</span>
              <h2 className="v1-h2">{ui.casesHeading.title}</h2>
            </div>
            <Link className="v1-btn v1-btn-outline" to="/properties">
              Explore listings <ArrowRight size={16} />
            </Link>
          </div>

          <div className="v1-case-grid">
            {cases.map((c) => (
              <article key={c.id} className="v1-case">
                <div className="v1-case-media">
                  <Image src={c.image} alt={c.title} />
                </div>
                <div className="v1-case-body">
                  <span className="v1-case-city">{c.city_name || 'Northern Nigeria'}</span>
                  <h3 className="v1-case-title">{c.title}</h3>
                  <div className="v1-case-metric">
                    <span className="v1-case-metric-n">{c.metric}</span>
                    <span className="v1-case-metric-l">{c.metric_label}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 12. PARTNERS ROW */}
      <section className="v1-partners">
        <div className="v1-container">
          <div className="v1-partners-label">{ui.partnersHeading}</div>
          <div className="v1-partners-row">
            {partners.map((partner) => (
              <span key={partner.id} className="v1-partner">
                {partner.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 13. BLUE CTA BAND */}
      <section className="v1-ctaband">
        <div className="v1-container">
          <div className="v1-ctaband-inner">
            <div>
              <span className="v1-ctaband-eyebrow">{ui.ctaBand.eyebrow}</span>
              <h2 className="v1-ctaband-h">{ui.ctaBand.title}</h2>
              <p className="v1-ctaband-p">{ui.ctaBand.body}</p>
            </div>
            <div className="v1-ctaband-actions">
              <Link className="v1-btn v1-btn-lg v1-btn-gold" to="/contact">
                {ui.actions.shortlist} <ArrowRight size={18} />
              </Link>
              <a
                className="v1-btn v1-btn-lg v1-btn-ghost-light"
                href={waUrl("Hi Mai'Lafiya Homes, I would like to get a shortlist of available spaces.")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('whatsapp_click')}
              >
                <WhatsAppIcon size={18} /> WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}





