// Lightweight inline stroke icons — one style, no external deps
// Usage: <Icon name="warehouse" className="w-6 h-6" />
const ICON_PATHS = {
  warehouse: (
    <>
      <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5Z" />
      <path d="M7 21v-6h10v6" />
      <path d="M7 15h10" />
    </>
  ),
  keys: (
    <>
      <circle cx="7.5" cy="15.5" r="3.5" />
      <path d="m10.5 12.5 8-8 2 2-2 2 2 2-2.5 2.5-2-2-2 2" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  map: (
    <>
      <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z" />
      <path d="M9 3v16" />
      <path d="M15 5v16" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
    </>
  ),
  phone: (
    <>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M20.5 3.5A11 11 0 0 0 3.4 17l-1.4 5 5.1-1.3A11 11 0 1 0 20.5 3.5Z" />
      <path d="M8.5 8.5c.3-.7.7-.7 1-.7h.7c.2 0 .5 0 .8.7l1 2.3c.1.3.1.6-.1.9l-.5.7c-.2.3-.3.5 0 .9a7 7 0 0 0 3.4 3c.4.2.7.2.9 0l.8-1c.2-.3.5-.2.8-.1l2.2 1c.4.2.6.3.6.5.1.4-.1 1.4-.5 2a3 3 0 0 1-2 1.3c-.6.1-1.4.2-4.4-1-3.7-1.5-6-5.3-6.2-5.5-.2-.3-1.5-2-1.5-3.8 0-1.8 1-2.7 1.3-3 .3-.4.7-.5 1-.5" />
    </>
  ),
  bed: (
    <>
      <path d="M2 20v-8a2 2 0 0 1 2-2h10a4 4 0 0 1 4 4v6" />
      <path d="M2 15h20" />
      <path d="M22 20v-5" />
      <circle cx="7" cy="13" r="2" />
    </>
  ),
  bath: (
    <>
      <path d="M4 12h16" />
      <path d="M4 12v5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5" />
      <path d="M7 12V6a2 2 0 0 1 4 0" />
      <path d="M8 20v2" />
      <path d="M16 20v2" />
    </>
  ),
  ruler: (
    <>
      <path d="M3 21 21 3" />
      <path d="m5 15 4 4" />
      <path d="m9 11 4 4" />
      <path d="m13 7 4 4" />
      <path d="M3 21 21 3l-2-2H3v2Z" />
    </>
  ),
  car: (
    <>
      <path d="M3 12 5 7h14l2 5" />
      <path d="M3 12v6h18v-6" />
      <path d="M3 12h18" />
      <circle cx="7" cy="17" r="1.5" />
      <circle cx="17" cy="17" r="1.5" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </>
  ),
  door: (
    <>
      <path d="M6 3h12v18H6z" />
      <circle cx="14" cy="12" r="1" />
    </>
  ),
  arrowUp: (
    <>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </>
  ),
  play: <path d="m8 5 12 7-12 7V5Z" />,
  star: <path d="m12 3 2.9 6 6.6.6-5 4.5 1.5 6.4L12 17l-6 3.5 1.5-6.4-5-4.5L9.1 9 12 3Z" />,
  check: <path d="m5 13 4 4L20 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  filter: <path d="M3 5h18M6 12h12M10 19h4" />,
  grid: (
    <>
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </>
  ),
  pin: (
    <>
      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  quote: (
    <>
      <path d="M6 17c0-3 2-5 5-5V8c-4 0-7 3-7 8v3h4v-2Z" />
      <path d="M15 17c0-3 2-5 5-5V8c-4 0-7 3-7 8v3h4v-2Z" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  heart: (
    <path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9Z" />
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </>
  ),
  facebook: <path d="M13 22V13h3l1-4h-4V6.5c0-1 .5-2 2-2h2V1s-2-.3-3.7-.3C10.5.7 9 2.7 9 5.5V9H6v4h3v9h4Z" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 17v-7" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V4h10v17" />
      <path d="M14 9h6v12" />
      <path d="M7 8h1M7 12h1M7 16h1M11 8h0M11 12h0M11 16h0M17 13h0M17 17h0" />
    </>
  ),
  factory: (
    <>
      <path d="M2 21V10l6 4V10l6 4V6h6v15H2Z" />
      <path d="M6 17h2M11 17h2M16 17h2" />
    </>
  ),
  land: (
    <>
      <path d="M3 20h18" />
      <path d="M5 20 8 8l4 5 3-9 4 16" />
    </>
  ),
  upload: (
    <>
      <path d="M12 3v13" />
      <path d="m6 9 6-6 6 6" />
      <path d="M4 20h16" />
    </>
  ),
};

function Icon({ name, className = "w-5 h-5", strokeWidth = 1.6, fill = "none" }) {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </svg>
  );
}

window.Icon = Icon;
