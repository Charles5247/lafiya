import React, { useState } from 'react';

const known = new Set(['logo-mh.png', 'founder-portrait-cropped.jpg']);

export function resolveImage(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const name = value.replace(/^(\/)?assets\//, '');
  if (known.has(name)) return `/assets/${name}`;
  return null;
}

export function Image({ src, alt = '', className = '', ...props }) {
  const resolved = resolveImage(src);
  const [failed, setFailed] = useState(false);

  if (resolved && !failed) {
    return (
      <img
        src={resolved}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setFailed(true)}
        {...props}
      />
    );
  }

  return (
    <div className={`brand-placeholder ${className}`} role="img" aria-label={alt || "Mai'Lafiya Homes"}>
      <span className="brand-placeholder-monogram">MH</span>
      <small className="brand-placeholder-label">Mai'Lafiya Homes</small>
    </div>
  );
}
