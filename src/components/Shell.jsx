import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ui } from '../strings';
import { track } from '../lib/data';
import { Phone, WhatsAppIcon, Menu, X, ArrowRight, ShieldCheck } from '../lib/icons';

export function Shell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [consent, setConsent] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('analytics-consent');
    }
    return 'unset';
  });

  const location = useLocation();
  const isDetailPage = location.pathname.startsWith('/properties/') && location.pathname !== '/properties';

  useEffect(() => {
    setMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const handleConsent = (choice) => {
    localStorage.setItem('analytics-consent', choice);
    setConsent(choice);
    if (choice === 'yes' && import.meta.env.VITE_GA4_ID) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA4_ID}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', import.meta.env.VITE_GA4_ID);
    }
  };

  const cleanPhone = ui.phone.replace(/\s+/g, '');
  const waUrl = (text = '') => `https://wa.me/${ui.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;

  return (
    <div className="v1-root">
      {/* Top band */}
      <div className="v1-topband">
        <div className="v1-topband-inner">
          <span className="v1-topband-item v1-topband-item--marquee">
            ✦ <strong>{ui.tagline}</strong>
            <span className="v1-topband-dot">·</span>
            <span>{ui.serviceLines}</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              className="v1-topband-item"
              href={`tel:${cleanPhone}`}
              onClick={() => track('phone_click')}
            >
              <Phone size={14} /> {ui.phone}
            </a>
            <a
              className="v1-topband-item v1-topband-item--wa"
              href={waUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('whatsapp_click')}
            >
              <WhatsAppIcon size={14} /> WhatsApp us
            </a>
          </div>
        </div>
      </div>

      {/* Sticky header */}
      <header className="v1-header">
        <div className="v1-header-inner">
          <Link className="v1-brand" to="/">
            <img src="/assets/logo-mh.png" alt="MH Logo" className="v1-logo-img" />
            <span className="v1-brand-text">
              <span className="v1-brand-name">MAI'LAFIYA HOMES</span>
              <span className="v1-brand-sub">& PROPERTIES LTD. · EST. {ui.estYear}</span>
            </span>
          </Link>

          <nav className="v1-nav" aria-label="Main Navigation">
            {ui.nav.map(([path, label]) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) => `v1-nav-link ${isActive ? 'is-active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link className="v1-btn v1-btn-primary v1-header-cta" to="/contact">
              {ui.actions.viewing}
            </Link>
            <button
              className="v1-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <nav
          className={`v1-mobile-drawer ${menuOpen ? 'is-open' : ''}`}
          aria-label="Mobile Navigation"
        >
          {ui.nav.map(([path, label]) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <Link
            className="v1-btn v1-btn-primary"
            to="/contact"
            onClick={() => setMenuOpen(false)}
            style={{ marginTop: '8px', width: '100%' }}
          >
            {ui.actions.viewing}
          </Link>
        </nav>
      </header>

      {/* Page Content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Footer */}
      <footer className="v1-footer">
        <div className="v1-container">
          <div className="v1-footer-grid">
            <div>
              <Link className="v1-brand" to="/">
                <img src="/assets/logo-mh.png" alt="MH Logo" className="v1-logo-img" />
                <span className="v1-brand-text">
                  <span className="v1-brand-name" style={{ color: '#fff' }}>MAI'LAFIYA HOMES</span>
                  <span className="v1-brand-sub" style={{ color: 'var(--gold)' }}>
                    & PROPERTIES LTD. · RC 7394323
                  </span>
                </span>
              </Link>
              <p className="v1-footer-p">{ui.footer.about}</p>
              <p style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '13px' }}>
                {ui.tagline}
              </p>
            </div>

            <div>
              <h3 className="v1-footer-h">Explore</h3>
              <ul className="v1-footer-list">
                {ui.nav.map(([path, label]) => (
                  <li key={path}>
                    <Link to={path}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="v1-footer-h">Categories</h3>
              <ul className="v1-footer-list">
                <li><Link to="/properties?category=warehouse">Warehouse (Lease & Sale)</Link></li>
                <li><Link to="/properties?category=commercial">Commercial & Retail</Link></li>
                <li><Link to="/properties?category=residential">Residential & Duplexes</Link></li>
                <li><Link to="/properties?category=land">Titled Industrial Land</Link></li>
                <li><Link to="/properties?category=short-let">Serviced Short-let</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="v1-footer-h">Contact Head Office</h3>
              <ul className="v1-footer-list">
                <li>
                  <a href={`tel:${cleanPhone}`} onClick={() => track('phone_click')}>
                    {ui.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${ui.email}`}>
                    {ui.email}
                  </a>
                </li>
                <li style={{ color: 'rgba(251,247,241,0.7)', fontSize: '13px', lineHeight: 1.5 }}>
                  {ui.address}
                </li>
                <li style={{ color: 'var(--gold)', fontSize: '12px', marginTop: '6px' }}>
                  {ui.businessHours}
                </li>
              </ul>
            </div>
          </div>

          <div className="v1-footer-bottom">
            <div>
              © {new Date().getFullYear()} {ui.brand} · {ui.rcNumber}. {ui.footer.rights}
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>{ui.footer.privacy}</span>
              <span>·</span>
              <span>{ui.footer.terms}</span>
              <span>·</span>
              <span>{ui.footer.cookies}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp (hidden on detail page because of sticky bottom bar) */}
      {!isDetailPage && (
        <a
          className="v1-wafloat"
          href={waUrl()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ui.actions.whatsapp}
          onClick={() => track('whatsapp_click')}
        >
          <WhatsAppIcon size={20} />
          <span className="v1-wafloat-label">{ui.actions.whatsapp}</span>
        </a>
      )}

      {/* Analytics Consent Banner */}
      {consent === 'unset' && (
        <aside className="v1-consent" role="dialog" aria-label="Cookie and Analytics Consent">
          <p className="v1-consent-p">{ui.consent.message}</p>
          <div className="v1-consent-actions">
            <button
              className="v1-btn v1-btn-sm v1-btn-outline"
              onClick={() => handleConsent('no')}
            >
              {ui.consent.decline}
            </button>
            <button
              className="v1-btn v1-btn-sm v1-btn-primary"
              onClick={() => handleConsent('yes')}
            >
              {ui.consent.accept}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}

