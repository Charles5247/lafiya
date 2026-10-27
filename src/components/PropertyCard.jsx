import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from '../lib/media';
import { money } from '../lib/data';
import { MapPin, ArrowRight, Warehouse, Building2, House } from '../lib/icons';

export function PropertyCard({ p, categories = [], cities = [], view = 'grid' }) {
  const cat = categories.find((c) => c.id === p.category_id)?.name || 'Property';
  const city = cities.find((c) => c.id === p.city_id)?.name || p.city || '';

  const displayTitle = p.short_title || p.title;
  const priceDisplay = money(p.price);

  if (view === 'list') {
    return (
      <article className="v1-plist-row">
        <div className="v1-plist-media">
          <Image src={p.main_image} alt={displayTitle} />
          <span className="v1-pcard-listing">{p.listing}</span>
        </div>
        <div className="v1-plist-body">
          <span className="v1-pcard-cat">{cat} · {city}</span>
          <h3 className="v1-plist-title">
            <Link to={`/properties/${p.slug}`}>{displayTitle}</Link>
          </h3>
          <p className="v1-plist-desc">{p.meta_description || p.description?.slice(0, 140) + '…'}</p>
          <div className="v1-pcard-meta" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <span><MapPin size={14} /> {p.area}, {p.state}</span>
            <span>·</span>
            <span>{p.size}</span>
            {p.dock_doors && <span>· {p.dock_doors} bays</span>}
            {p.bedrooms && <span>· {p.bedrooms} beds</span>}
          </div>
        </div>
        <div className="v1-plist-price">
          <div>
            <div className="v1-pcard-price">{priceDisplay}</div>
            {p.price_period && <div className="v1-pcard-period">{p.price_period}</div>}
          </div>
          <Link className="v1-btn v1-btn-sm v1-btn-primary" to={`/properties/${p.slug}`}>
            View details <ArrowRight size={14} />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="v1-pcard">
      <div className="v1-pcard-media">
        <Image src={p.main_image} alt={displayTitle} />
        <span className="v1-pcard-listing">{p.listing}</span>
      </div>
      <div className="v1-pcard-body">
        <span className="v1-pcard-cat">{cat} · {city}</span>
        <h3 className="v1-pcard-title">
          <Link to={`/properties/${p.slug}`}>{displayTitle}</Link>
        </h3>
        <div className="v1-pcard-meta">
          <span><MapPin size={14} /> {p.area}, {city}</span>
          <span>·</span>
          <span>{p.size}</span>
        </div>
        <div className="v1-pcard-foot">
          <div>
            <div className="v1-pcard-price">{priceDisplay}</div>
            {p.price_period && <div className="v1-pcard-period">{p.price_period}</div>}
          </div>
          <span className="v1-pcard-arrow">
            <ArrowRight size={18} />
          </span>
        </div>
      </div>
    </article>
  );
}

