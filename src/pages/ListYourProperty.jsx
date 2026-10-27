import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { Meta } from '../components/Meta';
import { ownerSchema, submitForm } from '../lib/forms';
import { supabase } from '../lib/supabase';
import { track } from '../lib/data';
import { ui } from '../strings';
import { Check, ShieldCheck, ArrowRight, Upload, Phone, WhatsAppIcon } from '../lib/icons';

export function ListYourProperty() {
  const [formData, setFormData] = useState({
    owner_name: '',
    phone: '',
    email: '',
    property_type: 'Warehouse',
    intent: 'Rent',
    city: 'Kano',
    approximate_size: '',
    address: '',
    notes: '',
    uploads: [],
    website: '', // silent honeypot
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle photo file selections and signed upload
  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (formData.uploads.length + files.length > 6) {
      setFormErrors((prev) => ({ ...prev, uploads: 'Maximum 6 photos allowed.' }));
      return;
    }

    setIsUploading(true);
    setUploadStatus(`Uploading ${files.length} photo(s)…`);

    try {
      const newUploads = [...formData.uploads];

      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          throw new Error('Only JPG, PNG, and WebP images are allowed.');
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('Each photo must be 10 MB or less.');
        }

        if (supabase) {
          const { data, error } = await supabase.functions.invoke('owner-upload-url', {
            body: { name: file.name, type: file.type, size: file.size },
          });

          if (error || !data?.token) {
            throw new Error('Could not obtain secure upload URL.');
          }

          const uploadRes = await supabase.storage.from('owner-uploads').uploadToSignedUrl(data.path, data.token, file, { contentType: file.type });

          if (uploadRes.error) {
            throw new Error(`Upload failed for ${file.name}`);
          }

          newUploads.push(data.path);
        } else {
          throw new Error('Photo uploads require a connected Supabase project.');
        }
      }

      setFormData((prev) => ({ ...prev, uploads: newUploads }));
      setUploadStatus(`${newUploads.length} photo(s) attached.`);
      setFormErrors((prev) => ({ ...prev, uploads: null }));
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, uploads: err.message }));
      setUploadStatus('');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const result = ownerSchema.safeParse(formData);
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
      await submitForm('owner', result.data);
      track('list_property_submitted');
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
        title="List Your Property | Mai'Lafiya Homes"
        description="List your warehouse, commercial space, or land in Kano, Kaduna, Abuja, or across Northern Nigeria with Mai'Lafiya Homes & Properties Ltd."
      />

      <section className="v1-page-hero">
        <div className="v1-container">
          <div className="v1-crumbs">
            <Link to="/">Home</Link> / <span>List with us</span>
          </div>
          <h1>Let us find a tenant or buyer <em>you'll be glad you signed.</em></h1>
          <p className="v1-page-hero-p">
            Submit your warehouse, commercial building, or land. Our consultants personally inspect the asset, verify documentation, and introduce qualified operators.
          </p>
        </div>
      </section>

      <div className="v1-container" style={{ padding: '60px 0 90px' }}>
        <div className="v1-form-layout">
          {/* Left Form */}
          <div className="v1-form-wrap">
            <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>Property & Owner Information</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
              We reply within 4 working hours to arrange an inspection.
            </p>

            {isSuccess ? (
              <div style={{ background: '#e7f6e8', padding: '30px', borderRadius: '16px', textAlign: 'center' }}>
                <ShieldCheck size={44} color="#18842c" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ color: '#18842c', margin: '0 0 8px' }}>Listing Submitted Successfully</h3>
                <p style={{ fontSize: '15px', color: '#2d4a3e', margin: '0 0 20px' }}>
                  {ui.status.success}
                </p>
                <Link className="v1-btn v1-btn-primary" to="/properties">
                  Browse current listings
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
                      placeholder="e.g. Alhaji Sani Bello"
                      value={formData.owner_name}
                      onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    />
                    {formErrors.owner_name && <span className="error">{formErrors.owner_name}</span>}
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
                    <label>{ui.fields.propertyType} *</label>
                    <select
                      className="v1-select"
                      value={formData.property_type}
                      onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    >
                      <option value="Warehouse">Warehouse</option>
                      <option value="Commercial">Commercial / Plaza</option>
                      <option value="Residential">Residential Duplex / Apartment</option>
                      <option value="Industrial land">Industrial land</option>
                    </select>
                    {formErrors.property_type && <span className="error">{formErrors.property_type}</span>}
                  </div>
                </div>

                <div className="v1-form-row">
                  <div className="v1-form-field">
                    <label>{ui.fields.intent} *</label>
                    <select
                      className="v1-select"
                      value={formData.intent}
                      onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                    >
                      <option value="Rent">Rent / Lease</option>
                      <option value="Sell">Sell</option>
                      <option value="Manage">Full Facility Management</option>
                      <option value="Valuation">Valuation</option>
                    </select>
                    {formErrors.intent && <span className="error">{formErrors.intent}</span>}
                  </div>

                  <div className="v1-form-field">
                    <label>{ui.fields.city} *</label>
                    <select
                      className="v1-select"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    >
                      <option value="Kano">Kano</option>
                      <option value="Kaduna">Kaduna</option>
                      <option value="Abuja">Abuja</option>
                      <option value="Jos">Jos</option>
                      <option value="Sokoto">Sokoto</option>
                      <option value="Maiduguri">Maiduguri</option>
                    </select>
                    {formErrors.city && <span className="error">{formErrors.city}</span>}
                  </div>
                </div>

                <div className="v1-form-row">
                  <div className="v1-form-field">
                    <label>{ui.fields.approximateSize} *</label>
                    <input
                      type="text"
                      className="v1-input"
                      placeholder="e.g. 3,500 sqm or 4-bedroom duplex"
                      value={formData.approximate_size}
                      onChange={(e) => setFormData({ ...formData, approximate_size: e.target.value })}
                    />
                    {formErrors.approximate_size && <span className="error">{formErrors.approximate_size}</span>}
                  </div>

                  <div className="v1-form-field">
                    <label>{ui.fields.address} *</label>
                    <input
                      type="text"
                      className="v1-input"
                      placeholder="e.g. Sharada Phase II, Kano"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    {formErrors.address && <span className="error">{formErrors.address}</span>}
                  </div>
                </div>

                <div className="v1-form-field">
                  <label>{ui.fields.notes} *</label>
                  <textarea
                    className="v1-textarea"
                    placeholder="Tell us about power supply, floor condition, access roads, asking price, or any existing tenants…"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                  {formErrors.notes && <span className="error">{formErrors.notes}</span>}
                </div>

                {/* Upload Photos */}
                <div className="v1-form-field">
                  <label>{ui.fields.photos}</label>
                  <label className="v1-upload-area">
                    <Upload size={28} color="var(--clay)" style={{ marginBottom: '8px' }} />
                    <span style={{ fontWeight: 600, color: 'var(--char)' }}>
                      Click to upload photos (up to 6)
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                      JPG, PNG, or WebP up to 10 MB each
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                      disabled={isUploading || formData.uploads.length >= 6}
                    />
                  </label>
                  {uploadStatus && (
                    <span style={{ fontSize: '13px', color: 'var(--clay)', marginTop: '6px', display: 'block', fontWeight: 600 }}>
                      {uploadStatus}
                    </span>
                  )}
                  {formErrors.uploads && <span className="error">{formErrors.uploads}</span>}
                </div>

                {formErrors.form && (
                  <p style={{ color: '#b22222', fontSize: '13px', marginBottom: '16px' }}>
                    {formErrors.form}
                  </p>
                )}

                <button
                  type="submit"
                  className="v1-btn v1-btn-lg v1-btn-primary"
                  style={{ width: '100%', marginTop: '10px' }}
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Property for Review'} <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>

          {/* Right Perks & Quote Sidebar */}
          <aside className="v1-list-side">
            <h3 style={{ fontSize: '22px', marginBottom: '16px' }}>Why Landlords & Owners Choose Mai'Lafiya</h3>
            <ul className="v1-perks">
              <li>
                <Check size={20} />
                <div>
                  <strong>Rigorous Tenant Due Diligence</strong>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 0' }}>
                    We vet operational track records, financial statements, and business references.
                  </p>
                </div>
              </li>
              <li>
                <Check size={20} />
                <div>
                  <strong>Personal Physical Inspections</strong>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 0' }}>
                    We accompany every prospective client on-site. Your property is never left unattended.
                  </p>
                </div>
              </li>
              <li>
                <Check size={20} />
                <div>
                  <strong>Full Legal & Management Protection</strong>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 0' }}>
                    Clean tenancy agreements, rent tracking, prompt quarterly statements, and maintenance oversight.
                  </p>
                </div>
              </li>
            </ul>

            <div className="v1-quote-card">
              <span className="v1-eyebrow" style={{ color: 'var(--gold)' }}>Our Motto</span>
              <blockquote>
                “{ui.tagline}”
              </blockquote>
              <cite>Mai'Lafiya Homes & Properties Ltd. · EST. 2008</cite>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}

