import React from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { Meta } from '../components/Meta';
import { useRows, useOne, track } from '../lib/data';
import { ui } from '../strings';
import {
  Warehouse,
  Key,
  Settings,
  Search,
  MapPin,
  ShieldCheck,
  ArrowRight,
  WhatsAppIcon,
} from '../lib/icons';

const ICON_MAP = {
  warehouse: Warehouse,
  keys: Key,
  gear: Settings,
  search: Search,
  map: MapPin,
  shield: ShieldCheck,
};

export function Services() {
  const { data: services } = useRows('services');
  const { data: servicesPage } = useOne('services_page');

  const processSteps = Array.isArray(servicesPage?.process_steps) && servicesPage.process_steps.length > 0
    ? servicesPage.process_steps
    : [
        { number: '01', title: 'Discovery', description: 'We listen first: your operation, volumes, budget, timing and non-negotiables.' },
        { number: '02', title: 'Shortlist', description: 'Within days you receive a curated shortlist of verified, personally walked properties.' },
        { number: '03', title: 'Site visits', description: 'We accompany you on inspections and flag what the brochure does not show.' },
        { number: '04', title: 'Negotiate & close', description: 'Fair terms, clean titles, signed paperwork — and we stay on for management.' },
      ];

  const waUrl = (text = '') => `https://wa.me/${ui.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;

  return (
    <Shell>
      <Meta
        title="Industrial & Commercial Real Estate Services"
        description="Warehouse leasing, sales & acquisition, facility management, valuations, site sourcing, and corporate advisory across Northern Nigeria."
      />

      <section className="v1-page-hero">
        <div className="v1-container">
          <div className="v1-crumbs">
            <Link to="/">Home</Link> / <span>Services</span>
          </div>
          <h1>Warehousing, real estate, <em>and everything in between.</em></h1>
          <p className="v1-page-hero-p">
            {servicesPage?.hero_subcopy ||
              'From a single 500 sqm unit to a multi-city industrial portfolio, one team handles sourcing, due diligence, negotiation and management.'}
          </p>
        </div>
      </section>

      {/* 6 Services */}
      <section className="v1-section">
        <div className="v1-container">
          <div className="v1-section-head">
            <div>
              <span className="v1-eyebrow">Expertise across the North</span>
              <h2 className="v1-h2">What we do for businesses & investors</h2>
            </div>
            <Link className="v1-btn v1-btn-primary" to="/contact">
              Discuss a brief <ArrowRight size={16} />
            </Link>
          </div>

          <div className="v1-services-grid">
            {services.map((service) => {
              const Icon = ICON_MAP[service.icon] || Warehouse;
              return (
                <article key={service.id} className="v1-service">
                  <div className="v1-service-icon">
                    <Icon size={26} />
                  </div>
                  <h3 className="v1-service-h">{service.title}</h3>
                  <p className="v1-service-p">{service.blurb}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4-Step Process Strip */}
      <section className="v1-section v1-section-navy">
        <div className="v1-container">
          <div className="v1-section-head v1-section-head--centered">
            <span className="v1-eyebrow" style={{ color: 'var(--gold)' }}>Our process</span>
            <h2 className="v1-h2" style={{ color: '#fff' }}>How we work together, start to finish</h2>
          </div>

          <div className="v1-process-grid">
            {processSteps.map((step) => (
              <div key={step.number} className="v1-process-step">
                <div className="v1-process-n">{step.number}</div>
                <h3 className="v1-process-t">{step.title}</h3>
                <p className="v1-process-d">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="v1-ctaband">
        <div className="v1-container">
          <div className="v1-ctaband-inner">
            <div>
              <span className="v1-ctaband-eyebrow">READY TO GET STARTED?</span>
              <h2 className="v1-ctaband-h">Let’s discuss your property requirements.</h2>
              <p className="v1-ctaband-p">
                Whether you need a warehouse inspection, valuation, or facility management quote, we respond within 4 hours.
              </p>
            </div>
            <div className="v1-ctaband-actions">
              <Link className="v1-btn v1-btn-lg v1-btn-gold" to="/contact">
                Contact our team <ArrowRight size={18} />
              </Link>
              <a
                className="v1-btn v1-btn-lg v1-btn-ghost-light"
                href={waUrl("Hi Mai'Lafiya Homes, I would like to enquire about your real estate services.")}
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

