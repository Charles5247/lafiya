import React from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { Meta } from '../components/Meta';
import { Image } from '../lib/media';
import { useRows, useOne, track } from '../lib/data';
import { ui } from '../strings';
import { ArrowRight, WhatsAppIcon } from '../lib/icons';

export function About() {
  const { data: about } = useOne('about_page');
  const { data: values } = useRows('values');
  const { data: agents } = useRows('agents');

  const waUrl = (text = '') => `https://wa.me/${ui.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;

  return (
    <Shell>
      <Meta
        title="About Mai'Lafiya Homes & Properties Ltd."
        description="Founded in 2008 in Bompai, Kano, Mai'Lafiya Homes & Properties Ltd. is Northern Nigeria's trusted warehousing and property management agency."
      />

      <section className="v1-page-hero">
        <div className="v1-container">
          <div className="v1-crumbs">
            <Link to="/">Home</Link> / <span>About Us</span>
          </div>
          <h1>Well-being begins with <em>a place that works.</em></h1>
          <p className="v1-page-hero-p">
            {about?.hero_subcopy ||
              "Mai'Lafiya means well-being. For 17 years we have helped Northern Nigeria's businesses and families find property that genuinely works for them."}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="v1-section">
        <div className="v1-container">
          <div className="v1-about-story-grid">
            <div style={{ position: 'relative' }}>
              <Image
                src="assets/founder-portrait-cropped.jpg"
                alt="Mr. Kingsley Agena, Founder of Mai'Lafiya Homes"
                className="v1-about-img"
              />
            </div>
            <div>
              <span className="v1-eyebrow">{about?.story_eyebrow || 'Our story'}</span>
              <h2 className="v1-h2">
                From a Bompai family shop to <em>Northern Nigeria's trusted name.</em>
              </h2>
              <p className="v1-about-p">
                {about?.story_body?.split('\n\n')[0] ||
                  "Mai'Lafiya began in 2008 as a small family trading business in Bompai, Kano. Helping neighbours and suppliers find reliable warehouse space taught us that in Northern Nigeria, property is built on relationships and reputation."}
              </p>
              <p className="v1-about-p">
                {about?.story_body?.split('\n\n')[1] ||
                  'Today we are a registered real-estate, property-management and construction-consulting firm serving six cities, with 340+ transactions and ₦12B+ in deals closed — and we still walk every property ourselves.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Quote Band */}
      <section className="v1-section v1-section-navy">
        <div className="v1-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <span className="v1-eyebrow" style={{ color: 'var(--gold)' }}>A Word From Our Founder</span>
            <blockquote style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '30px', lineHeight: 1.3, color: '#fff', margin: 0 }}>
              “{about?.ceo_quote || "When you trust us with a property, you are trusting us with your family's or your company's future. We never forget that."}”
            </blockquote>
            <p style={{ color: 'rgba(251,247,241,0.85)', fontSize: '15px', margin: 0 }}>
              <strong>{about?.ceo_name || 'Mr. Kingsley Agena'}</strong> · {about?.ceo_title || 'Founder & Chief Executive'}
            </p>
          </div>
        </div>
      </section>

      {/* Values with Hausa Names */}
      <section className="v1-values">
        <div className="v1-container">
          <div className="v1-section-head v1-section-head--centered">
            <span className="v1-eyebrow">{about?.values_eyebrow || 'Our values'}</span>
            <h2 className="v1-h2">{about?.values_headline || 'What we hold ourselves to'}</h2>
          </div>

          <div className="v1-values-grid">
            {values.map((v) => (
              <article key={v.id} className="v1-value">
                <h3 className="v1-value-t">{v.title}</h3>
                <p className="v1-value-d">{v.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="v1-section">
        <div className="v1-container">
          <div className="v1-section-head">
            <div>
              <span className="v1-eyebrow">The people behind the deals</span>
              <h2 className="v1-h2">Meet our property consultants</h2>
            </div>
          </div>

          <div className="v1-team-grid">
            {/* Founder first */}
            <article className="v1-team-card">
              <Image
                src="assets/founder-portrait-cropped.jpg"
                alt="Mr. Kingsley Agena"
                className="v1-team-img"
              />
              <h3 className="v1-team-name">Mr. Kingsley Agena</h3>
              <p className="v1-team-role">Founder & Chief Executive · Kano</p>
            </article>

            {agents.map((agent) => (
              <article key={agent.id} className="v1-team-card">
                <Image
                  src={agent.photo}
                  alt={agent.name}
                  className="v1-team-img"
                />
                <h3 className="v1-team-name">{agent.name}</h3>
                <p className="v1-team-role">{agent.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="v1-ctaband">
        <div className="v1-container">
          <div className="v1-ctaband-inner">
            <div>
              <span className="v1-ctaband-eyebrow">WORK WITH US</span>
              <h2 className="v1-ctaband-h">Looking for a trusted property partner in Northern Nigeria?</h2>
              <p className="v1-ctaband-p">
                Visit us at Plot 14, Bompai Industrial Layout, Kano or message our team directly.
              </p>
            </div>
            <div className="v1-ctaband-actions">
              <Link className="v1-btn v1-btn-lg v1-btn-gold" to="/contact">
                Contact us today <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}

