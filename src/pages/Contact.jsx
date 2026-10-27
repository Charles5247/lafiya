import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { Meta } from '../components/Meta';
import { contactSchema, submitForm } from '../lib/forms';
import { track } from '../lib/data';
import { ui } from '../strings';
import { Phone, WhatsAppIcon, Mail, MapPin, ShieldCheck, ArrowRight } from '../lib/icons';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    enquiry_type: 'General enquiry',
    message: '',
    website: '', // silent honeypot
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const cleanPhone = ui.phone.replace(/\s+/g, '');
  const waUrl = (text = '') => `https://wa.me/${ui.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;

  async function handleSubmit(e) {
    e.preventDefault();

    const result = contactSchema.safeParse(formData);
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
      await submitForm('contact', result.data);
      track('contact_submitted');
      setIsSuccess(true);
    } catch (err) {
      setFormErrors({ form: err.message || ui.status.error });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Shell>
      <Meta
        title="Contact Us | Mai'Lafiya Homes & Properties"
        description="Get in touch with Mai'Lafiya Homes & Properties Ltd. Located at Plot 14, Bompai Industrial Layout, Kano. We respond within 4 hours."
      />

      <section className="v1-page-hero">
        <div className="v1-container">
          <div className="v1-crumbs">
            <Link to="/">Home</Link> / <span>Contact</span>
          </div>
          <h1>{ui.contactHero}</h1>
          <p className="v1-page-hero-p">
            Connect with our Kano head office or consultants in Abuja and Kaduna. Every enquiry receives a dedicated response within 4 working hours.
          </p>
        </div>
      </section>

      <div className="v1-container" style={{ padding: '60px 0 90px' }}>
        <div className="v1-form-layout">
          {/* Contact Form */}
          <div className="v1-form-wrap">
            <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>Send Us a Message</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
              Fill out the form below and an agent will follow up directly.
            </p>

            {isSuccess ? (
              <div style={{ background: '#e7f6e8', padding: '30px', borderRadius: '16px', textAlign: 'center' }}>
                <ShieldCheck size={44} color="#18842c" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ color: '#18842c', margin: '0 0 8px' }}>Message Sent</h3>
                <p style={{ fontSize: '15px', color: '#2d4a3e', margin: '0 0 20px' }}>
                  {ui.status.success}
                </p>
                <Link className="v1-btn v1-btn-primary" to="/properties">
                  Explore properties
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
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

                <div className="v1-form-row">
                  <div className="v1-form-field">
                    <label>{ui.fields.name} *</label>
                    <input
                      type="text"
                      className="v1-input"
                      placeholder="e.g. Ibrahim Danladi"
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
                </div>

                <div className="v1-form-row">
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
                      value={formData.enquiry_type}
                      onChange={(e) => setFormData({ ...formData, enquiry_type: e.target.value })}
                    >
                      <option value="General enquiry">General enquiry</option>
                      <option value="Warehouse leasing">Warehouse leasing</option>
                      <option value="Warehouse purchase">Warehouse purchase</option>
                      <option value="Facility management">Facility management</option>
                      <option value="Property valuation">Property valuation</option>
                      <option value="Land acquisition">Land acquisition</option>
                    </select>
                  </div>
                </div>

                <div className="v1-form-field">
                  <label>{ui.fields.message} *</label>
                  <textarea
                    className="v1-textarea"
                    placeholder="How can we assist your business or family with real estate?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                  {formErrors.message && <span className="error">{formErrors.message}</span>}
                </div>

                {formErrors.form && (
                  <p style={{ color: '#b22222', fontSize: '13px', marginBottom: '16px' }}>
                    {formErrors.form}
                  </p>
                )}

                <button
                  type="submit"
                  className="v1-btn v1-btn-lg v1-btn-primary"
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending…' : ui.actions.send} <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>

          {/* 4 Contact Cards */}
          <aside className="v1-contact-cards">
            <article className="v1-contact-card">
              <div className="v1-contact-icon">
                <Phone size={22} />
              </div>
              <div>
                <span className="v1-contact-l">Phone Enquiries</span>
                <div className="v1-contact-v">
                  <a href={`tel:${cleanPhone}`} onClick={() => track('phone_click')}>
                    {ui.phone}
                  </a>
                </div>
                <span className="v1-contact-sub">{ui.businessHours}</span>
              </div>
            </article>

            <article className="v1-contact-card">
              <div className="v1-contact-icon" style={{ color: 'var(--whatsapp)' }}>
                <WhatsAppIcon size={22} />
              </div>
              <div>
                <span className="v1-contact-l">Instant WhatsApp</span>
                <div className="v1-contact-v">
                  <a
                    href={waUrl('Hello Mai\'Lafiya Homes, I have an enquiry.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('whatsapp_click')}
                  >
                    Chat with an Agent
                  </a>
                </div>
                <span className="v1-contact-sub">Available 7 days a week</span>
              </div>
            </article>

            <article className="v1-contact-card">
              <div className="v1-contact-icon">
                <Mail size={22} />
              </div>
              <div>
                <span className="v1-contact-l">Official Email</span>
                <div className="v1-contact-v">
                  <a href={`mailto:${ui.email}`}>
                    {ui.email}
                  </a>
                </div>
                <span className="v1-contact-sub">Direct to client services team</span>
              </div>
            </article>

            <article className="v1-contact-card">
              <div className="v1-contact-icon">
                <MapPin size={22} />
              </div>
              <div>
                <span className="v1-contact-l">Head Office</span>
                <div className="v1-contact-v" style={{ fontSize: '17px' }}>
                  Plot 14, Bompai Industrial Layout
                </div>
                <span className="v1-contact-sub">Kano State, Nigeria</span>
              </div>
            </article>

            {/* Map Block */}
            <div className="v1-map" style={{ marginTop: '10px' }}>
              <div className="v1-map-inner">
                <MapPin size={20} color="var(--clay)" />
                <span>Plot 14, Bompai Industrial Layout, Kano</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

