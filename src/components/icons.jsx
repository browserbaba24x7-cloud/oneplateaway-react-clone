// Inline copies of the exact lucide glyphs the original site renders (so pixels match).
const base = (size) => ({
  xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  'aria-hidden': 'true',
});

export const Menu = ({ size = 24, className = '' }) => (
  <svg {...base(size)} className={`lucide lucide-menu ${className}`.trim()}>
    <path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" />
  </svg>
);

export const X = ({ size = 24, className = '' }) => (
  <svg {...base(size)} className={`lucide lucide-x ${className}`.trim()}>
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

export const Check = ({ size = 24, className = '' }) => (
  <svg {...base(size)} className={`lucide lucide-check ${className}`.trim()}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
