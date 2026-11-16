import { CONFIG } from '../config';

export const api = {
  async processDonation(payload) {
    try {
      const response = await fetch(`${CONFIG.API_BASE}/api/stripe-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return { success: false, error: data?.error || 'Payment failed. Please try again.' };
      }
      if (data?.requires_action) {
        return {
          success: false,
          requiresAction: true,
          clientSecret: data.client_secret,
        };
      }
      if (data?.success === false) {
        return { success: false, error: data.error || 'Payment failed. Please try again.' };
      }
      return { success: true, data };
    } catch {
      return { success: false, error: 'Could not connect to the payment service. Please try again.' };
    }
  },
};

export function trackPurchase(value, name, frequency) {
  if (typeof window !== 'undefined' && window.fbq && value > 0) {
    window.fbq('track', 'Purchase', {
      value: Number(value.toFixed(2)),
      currency: 'GBP',
      content_name: name || 'General Fund',
      content_type: 'product',
      donation_frequency: frequency || 'One-time',
    });
  }
}
