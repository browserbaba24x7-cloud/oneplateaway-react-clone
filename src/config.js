export const CONFIG = {
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  API_BASE: (import.meta.env.VITE_API_BASE || '').replace(/\/$/, ''),
  CURRENCY: 'gbp',
  COUNTRY: 'GB',
  UNIT_COST: 2.99,
  DONATION_PRESETS: [15, 25, 75, 100],
};
