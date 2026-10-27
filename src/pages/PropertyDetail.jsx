import React, { useState, useEffect } from 'react';
import { Link, useParams, useLoaderData } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { Meta } from '../components/Meta';
import { PropertyCard } from '../components/PropertyCard';
import { Image, resolveImage } from '../lib/media';
import { useRows, useOne, money, track, getPropertyBySlug } from '../lib/data';
import { enquirySchema, submitForm } from '../lib/forms';
import { ui } from '../strings';
import {
  MapPin,
  Check,
  Phone,
  WhatsAppIcon,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  User,
} from '../lib/icons';

export function PropertyDetail() {
  const { slug } = useParams();
  const loaderProperty = useLoaderData();

  const [property, setProperty] = useState(loaderProperty || null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    inquiry_type: 'Request viewing',
    message: '',
    website: '', // honeypot
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: categories } = useRows('property_categories');
  const { data: cities } = useRows('cities');
  const { data: agents } = useRows('agents');
  const { data: allProperties } = useRows('properties');

  useEffect(() => {
    let alive = true;
    getPropertyBySlug(slug).then((res) => {
      if (alive && res) {
        setProperty(res);
        setActivePhotoIdx(0);
        track('property_view', { property_id: res.id, title: res.title });
      }
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        setActivePhotoIdx((prev) => (prev + 1) % photos.length);
      }
      if (e.key === 'ArrowLeft') {
        setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, property]);

  if (!property) {
    return (
      <Shell>
        <section className="v1-page-hero">
          <div className="v1-container">
            <h1>Property Not Found</h1>
            <p className="v1-page-hero-p">
              The property you are looking for may have been leased, sold, or unlisted.
            </p>
            <div style={{ marginTop: '20px' }}>
              <Link className="v1-btn v1-btn-primary" to="/properties">
                Browse all active properties
              </Link>
            </div>
          </div>
        </section>
      </Shell>
    );
  }

  const category = categories.find((c) => c.id === property.category_id)?.name || 'Warehouse';
  const city = cities.find((c) => c.id === property.city_id)?.name || 'Kano';
  const agent = agents.find((a) => a.id === property.agent_id) || agents[0];

  const photos = Array.isArray(property.gallery) && property.gallery.length > 0
    ? property.gallery
    : [property.main_image];

  const similarProperties = allProperties
    .filter((p) => p.id !== property.id && p.status === 'Active')
    .slice(0, 3);

  const cleanPhone = (agent?.phone || ui.phone).replace(/\s+/g, '');
  const waPreFill = `Hi, I'm interested in ${property.title}. Is it still available?`;
  const waUrl = `https://wa.me/${agent?.whatsapp || ui.whatsapp}?text=${encodeURIComponent(waPreFill)}`;

  // Form submit handler
  async function handleEnquirySubmit(e) {
    e.preventDefault();
    const payload = {
      ...formData,
      property_id: property.id,
      source: 'property-detail',
    };

    const result = enquirySchema.safeParse(payload);
    if (!result.success) {
      const errMap = {};
      result.error.issues.forEach((issue) => {
        errMap[issue.path[0]] = issue.message;
      });
      setFormErrors(errMap);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      await submitForm('enquiry', result.data);
      track('enquiry_submitted', { property_id: property.id });
      setIsSuccess(true);
    } catch (err) {
      setFormErrors({ form: err.message || ui.status.error });
    } finally {
      setIsSubmitting(false);
    }
  }

  // JSON-LD RealEstateListing schema
  const siteOrigin = (import.meta.env.VITE_SITE_URL || 'https://mailafiyahomes.ng').replace(/\/$/, '');
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.meta_description || property.description,
    url: `${siteOrigin}/properties/${property.slug}`,
    image: photos.map((p) => resolveImage(p) || `${siteOrigin}/assets/logo-mh.png`),
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'NGN',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: property.state,
      addressCountry: 'NG',
    },
  };

  return (
    <Shell>
      <Meta
        title={property.meta_title || property.title}
        description={property.meta_description || property.description?.slice(0, 155)}
        image={resolveImage(property.main_image)}
        structured={structuredData}
      />

      <div className="v1-container" style={{ paddingTop: '24px' }}>
        <div className="v1-crumbs">
          <Link to="/">Home</Link> / <Link to="/properties">Properties</Link> / <span>{property.short_title || property.title}</span>
        </div>
      </div>

      {/* Gallery Section */}
      <section className="v1-container">
        <div className="v1-detail-gallery">
          {/* Main Photo */}
          <div
            className="v1-detail-main"
            onClick={() => setLightboxOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="View enlarged image"
          >
            <Image src={photos[activePhotoIdx]} alt={property.title} />
            <span className="v1-pcard-listing v1-detail-listing">{property.listing}</span>
            {property.video_url && (
              <button
                className="v1-detail-video-badge"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(property.video_url, '_blank');
                }}
              >
                <Play size={14} fill="currentColor" /> Video tour
              </button>
            )}
          </div>

          {/* 4 Thumbnails */}
          <div className="v1-detail-thumbs">
            {photos.slice(0, 4).map((imgUrl, idx) => {
              const isLast = idx === 3 && photos.length > 4;
              return (
                <button
                  key={idx}
                  className={`v1-detail-thumb ${idx === activePhotoIdx ? 'is-active' : ''}`}
                  onClick={() => {
                    setActivePhotoIdx(idx);
                    setLightboxOpen(true);
                  }}
                  aria-label={`Thumbnail ${idx + 1}`}
                >
                  <Image src={imgUrl} alt={`${property.title} - photo ${idx + 1}`} />
                  {isLast && (
                    <div className="v1-detail-thumb-more">
                      +{photos.length - 4}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Detail Body & Sticky Sidebar */}
      <div className="v1-container">
        <div className="v1-detail-body">
          {/* Left Column */}
          <div>
            <div className="v1-detail-head">
              <div>
                <span className="v1-eyebrow">
                  {category} · {property.listing}
                </span>
                <h1 className="v1-detail-h1">{property.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '14px' }}>
                  <MapPin size={16} /> {property.area}, {city}, {property.state}
                </div>
              </div>

              <div>
                <div className="v1-detail-price-n">{money(property.price)}</div>
                {property.price_period && (
                  <div className="v1-detail-price-p">{property.price_period}</div>
                )}
              </div>
            </div>

            {/* Spec Strip adapted by category */}
            <div className="v1-spec-strip">
              <div className="v1-spec">
                <div>
                  <div className="v1-spec-l">Total Size</div>
                  <div className="v1-spec-v">{property.size}</div>
                </div>
              </div>

              {category === 'Warehouse' ? (
                <>
                  {property.dock_doors && (
                    <div className="v1-spec">
                      <div>
                        <div className="v1-spec-l">Loading Bays</div>
                        <div className="v1-spec-v">{property.dock_doors} dock-height</div>
                      </div>
                    </div>
                  )}
                  {property.clear_height && (
                    <div className="v1-spec">
                      <div>
                        <div className="v1-spec-l">Clear Height</div>
                        <div className="v1-spec-v">{property.clear_height}</div>
                      </div>
                    </div>
                  )}
                  {property.parking && (
                    <div className="v1-spec">
                      <div>
                        <div className="v1-spec-l">Truck Parking</div>
                        <div className="v1-spec-v">{property.parking}</div>
                      </div>
                    </div>
                  )}
                </>
              ) : category === 'Residential' ? (
                <>
                  {property.bedrooms && (
                    <div className="v1-spec">
                      <div>
                        <div className="v1-spec-l">Bedrooms</div>
                        <div className="v1-spec-v">{property.bedrooms} Beds</div>
                      </div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="v1-spec">
                      <div>
                        <div className="v1-spec-l">Bathrooms</div>
                        <div className="v1-spec-v">{property.bathrooms} Baths</div>
                      </div>
                    </div>
                  )}
                  {property.parking && (
                    <div className="v1-spec">
                      <div>
                        <div className="v1-spec-l">Car Spaces</div>
                        <div className="v1-spec-v">{property.parking}</div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {property.parking && (
                    <div className="v1-spec">
                      <div>
                        <div className="v1-spec-l">Dedicated Parking</div>
                        <div className="v1-spec-v">{property.parking}</div>
                      </div>
                    </div>
                  )}
                  {property.floors && (
                    <div className="v1-spec">
                      <div>
                        <div className="v1-spec-l">Building Floors</div>
                        <div className="v1-spec-v">{property.floors} storeys</div>
                      </div>
                    </div>
                  )}
                  {property.year_built && (
                    <div className="v1-spec">
                      <div>
                        <div className="v1-spec-l">Year Built</div>
                        <div className="v1-spec-v">{property.year_built}</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Long Description */}
            <section className="v1-detail-block">
              <h3>Description</h3>
              <p className="v1-detail-desc">{property.description}</p>
            </section>

            {/* Features Checklist */}
            {Array.isArray(property.features) && property.features.length > 0 && (
              <section className="v1-detail-block">
                <h3>{ui.detail.featuresTitle}</h3>
                <ul className="v1-feature-list">
                  {property.features.map((feature, i) => (
                    <li key={i}>
                      <Check size={18} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Location & Map Placeholder */}
            <section className="v1-detail-block">
              <h3>{ui.detail.locationTitle}</h3>
              <div className="v1-map">
                <div className="v1-map-inner">
                  <MapPin size={20} color="var(--clay)" />
                  <span>
                    {property.area}, {city}, {property.state}
                  </span>
                </div>
              </div>
            </section>

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <section className="v1-detail-block" style={{ marginTop: '50px' }}>
                <h3>{ui.detail.similarTitle}</h3>
                <div className="v1-pgrid" style={{ marginTop: '20px' }}>
                  {similarProperties.map((sp) => (
                    <PropertyCard
                      key={sp.id}
                      p={sp}
                      categories={categories}
                      cities={cities}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar: Agent Card & Enquiry Form */}
          <aside className="v1-detail-side" id="enquiry-panel">
            {/* Agent Card */}
            <div className="v1-agent-card">
              <div className="v1-agent-head">
                <div className="v1-agent-avatar brand-placeholder" style={{ minHeight: 'unset' }}>
                  <User size={24} />
                </div>
                <div>
                  <div className="v1-agent-name">{agent?.name || 'Ibrahim Suleiman'}</div>
                  <div className="v1-agent-role">
                    {agent?.role || 'Head, Warehousing Division'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  className="v1-btn v1-btn-sm v1-btn-ghost-light"
                  href={`tel:${cleanPhone}`}
                  style={{ flex: 1 }}
                  onClick={() => track('phone_click')}
                >
                  <Phone size={14} /> Call
                </a>
                <a
                  className="v1-btn v1-btn-sm v1-btn-whatsapp"
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1 }}
                  onClick={() => track('whatsapp_click')}
                >
                  <WhatsAppIcon size={14} /> WhatsApp
                </a>
              </div>
            </div>

            {/* Enquiry Form */}
            <div className="v1-inquiry">
              <h3 className="v1-inquiry-h">{ui.detail.enquiryFormTitle}</h3>

              {isSuccess ? (
                <div style={{ background: '#e7f6e8', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                  <ShieldCheck size={36} color="#18842c" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ color: '#18842c', margin: '0 0 6px' }}>Enquiry Received</h4>
                  <p style={{ fontSize: '13.5px', color: '#2d4a3e', margin: 0 }}>
                    {ui.status.success}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} noValidate>
                  {/* Honeypot */}
                  <label className="v1-honeypot" aria-hidden="true">
                    Website
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </label>

                  <div className="v1-form-field">
                    <label>{ui.fields.name} *</label>
                    <input
                      type="text"
                      className="v1-input"
                      placeholder="e.g. Alhaji Aminu Bello"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {formErrors.name && <span className="error">{formErrors.name}</span>}
                  </div>

                  <div className="v1-form-field">
                    <label>{ui.fields.phone} *</label>
                    <input
                      type="tel"
                      className="v1-input"
                      placeholder="+234 803 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    {formErrors.phone && <span className="error">{formErrors.phone}</span>}
                  </div>

                  <div className="v1-form-field">
                    <label>{ui.fields.email} *</label>
                    <input
                      type="email"
                      className="v1-input"
                      placeholder="you@company.ng"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {formErrors.email && <span className="error">{formErrors.email}</span>}
                  </div>

                  <div className="v1-form-field">
                    <label>{ui.fields.inquiryType}</label>
                    <select
                      className="v1-select"
                      value={formData.inquiry_type}
                      onChange={(e) => setFormData({ ...formData, inquiry_type: e.target.value })}
                    >
                      <option value="Request viewing">Request viewing</option>
                      <option value="Request info">Request info</option>
                      <option value="Make offer">Make offer</option>
                    </select>
                  </div>

                  <div className="v1-form-field">
                    <label>{ui.fields.message} *</label>
                    <textarea
                      className="v1-textarea"
                      placeholder="Tell us about your requirements, dates, or questions…"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                    {formErrors.message && <span className="error">{formErrors.message}</span>}
                  </div>

                  {formErrors.form && (
                    <p style={{ color: '#b22222', fontSize: '13px', marginBottom: '12px' }}>
                      {formErrors.form}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="v1-btn v1-btn-primary"
                    style={{ width: '100%' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting…' : 'Send Enquiry'} <ArrowRight size={16} />
                  </button>
                </form>
              )}

              <div className="v1-trust-mini">
                {ui.detail.trustNotes.map((note, idx) => (
                  <div key={idx} className="v1-trust-row">
                    <Check size={16} />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="v1-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="v1-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          <button
            className="v1-lightbox-nav v1-lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="v1-lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[activePhotoIdx]}
              alt={`${property.title} - photo ${activePhotoIdx + 1}`}
            />
          </div>

          <button
            className="v1-lightbox-nav v1-lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              setActivePhotoIdx((prev) => (prev + 1) % photos.length);
            }}
            aria-label="Next photo"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar (Call / WhatsApp / Enquire) */}
      <div className="v1-mobile-detail-bar">
        <a
          className="v1-btn v1-btn-sm v1-btn-outline"
          href={`tel:${cleanPhone}`}
          onClick={() => track('phone_click')}
        >
          <Phone size={14} /> Call
        </a>
        <a
          className="v1-btn v1-btn-sm v1-btn-whatsapp"
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp_click')}
        >
          <WhatsAppIcon size={14} /> WhatsApp
        </a>
        <a
          className="v1-btn v1-btn-sm v1-btn-primary"
          href="#enquiry-panel"
        >
          Enquire
        </a>
      </div>
    </Shell>
  );
}

