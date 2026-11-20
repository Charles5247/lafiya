import React, { useState } from 'react';

export function resolveImage(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const name = value.replace(/^(\/)?assets\//, '');
  return `/assets/${name}`;
}

export function Image({ src, alt = '', className = '', ...props }) {
  const resolved = resolveImage(src);
  const [failedSrc, setFailedSrc] = useState(null);

  if (resolved && resolved !== failedSrc) {
    return (
      <img
        src={resolved}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setFailedSrc(resolved)}
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
