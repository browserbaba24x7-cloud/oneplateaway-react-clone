/**
 * Minimal payment API for the OnePlateAway React app.
 *
 *   POST /api/stripe-payment   one-time donation  -> PaymentIntent (confirmed immediately)
 *                              monthly donation   -> Customer + Subscription
 *
 * The browser only ever sends a Stripe PaymentMethod id (never card numbers). The amount is validated here,
 * and the secret key never leaves the server. If the card needs 3-D Secure the response is
 * { requires_action: true, client_secret } and the React app finishes it with stripe.confirmCardPayment().
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const { STRIPE_SECRET_KEY, CLIENT_ORIGIN = 'http://localhost:5173', PORT = 8787, STRIPE_MONTHLY_PRODUCT_ID } = process.env;
if (!STRIPE_SECRET_KEY) { console.error('Missing STRIPE_SECRET_KEY in .env'); process.exit(1); }

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });
const app = express();
app.use(cors({ origin: CLIENT_ORIGIN.split(',') }));
app.use(express.json({ limit: '50kb' }));

const CURRENCY = 'gbp';
const MIN_PENCE = 100;      // £1
const MAX_PENCE = 5000000;  // £50,000 sanity cap

// tiny in-memory rate limit: 10 attempts / 10 min / IP (use Redis or a gateway in production)
const hits = new Map();
const limiter = (req, res, next) => {
  const now = Date.now(), win = 10 * 60 * 1000;
  const list = (hits.get(req.ip) || []).filter((t) => now - t < win);
  if (list.length >= 10) return res.status(429).json({ success: false, error: 'Too many attempts. Please try again later.' });
  list.push(now); hits.set(req.ip, list); next();
};

let monthlyProductId = STRIPE_MONTHLY_PRODUCT_ID;
async function getMonthlyProduct() {
  if (!monthlyProductId) {
    const product = await stripe.products.create({ name: 'OnePlateAway Monthly Sustainer' });
    monthlyProductId = product.id; // cached for this process; set STRIPE_MONTHLY_PRODUCT_ID to persist
  }
  return monthlyProductId;
}

const clip = (v, n = 450) => String(v ?? '').slice(0, n); // Stripe metadata values max 500 chars

app.post('/api/stripe-payment', limiter, async (req, res) => {
  try {
    const { amount, frequency, type, designation, donor = {}, paymentMethodId, unitCost = 2.99, giftDetails, note } = req.body || {};

    const pence = Math.round(Number(amount) * 100);
    if (!Number.isFinite(pence) || pence < MIN_PENCE || pence > MAX_PENCE) return res.status(400).json({ success: false, error: 'Invalid donation amount.' });
    if (!paymentMethodId || typeof paymentMethodId !== 'string' || !paymentMethodId.startsWith('pm_')) return res.status(400).json({ success: false, error: 'Missing payment method.' });
    if (!donor.email) return res.status(400).json({ success: false, error: 'An email address is required for your receipt.' });

    const monthly = frequency === 'Monthly';
    const name = `${donor.firstName || ''} ${donor.lastName || ''}`.trim();
    const metadata = {
      donor_name: clip(name), donor_phone: clip(donor.phone), donation_type: clip(type), designation: clip(designation),
      frequency: monthly ? 'Monthly' : 'One-time', meals: String(Math.floor(Number(amount) / Number(unitCost || 2.99))),
      is_gift: giftDetails ? 'true' : 'false', recipient_name: clip(giftDetails?.recipientName), recipient_email: clip(giftDetails?.recipientEmail),
      note: clip(note || giftDetails?.message),
    };

    if (!monthly) {
      const intent = await stripe.paymentIntents.create({
        amount: pence, currency: CURRENCY, payment_method: paymentMethodId, confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        receipt_email: donor.email, description: `${type || 'Donation'} - ${designation || 'General Fund'}`, metadata,
      }, { idempotencyKey: `pi_${paymentMethodId}_${pence}` });
      return respond(res, intent.status, intent.client_secret, { paymentIntentId: intent.id });
    }

    // ---- Monthly: customer + subscription
    const customer = await stripe.customers.create({ email: donor.email, name: name || undefined, phone: donor.phone || undefined, metadata });
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
    await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: paymentMethodId } });
    const sub = await stripe.subscriptions.create({
      customer: customer.id, default_payment_method: paymentMethodId, metadata, payment_behavior: 'allow_incomplete',
      items: [{ price_data: { currency: CURRENCY, product: await getMonthlyProduct(), unit_amount: pence, recurring: { interval: 'month' } } }],
      expand: ['latest_invoice.payment_intent'],
    });
    const pi = sub.latest_invoice?.payment_intent;
    if (sub.status === 'active' || sub.status === 'trialing') return res.json({ success: true, subscriptionId: sub.id });
    if (pi?.status === 'requires_action') return res.json({ success: false, requires_action: true, client_secret: pi.client_secret });
    await stripe.subscriptions.cancel(sub.id).catch(() => {});
    return res.status(402).json({ success: false, error: 'Your card was declined. Please try a different card.' });
  } catch (err) {
    console.error('[stripe-payment]', err.type || err.name, err.code || '', err.message);
    const msg = err.type === 'StripeCardError' ? err.message : 'We could not process your payment. Please try again.';
    return res.status(err.type === 'StripeCardError' ? 402 : 500).json({ success: false, error: msg });
  }
});

function respond(res, status, clientSecret, extra = {}) {
  if (status === 'succeeded' || status === 'processing') return res.json({ success: true, ...extra });
  if (status === 'requires_action') return res.json({ success: false, requires_action: true, client_secret: clientSecret });
  return res.status(402).json({ success: false, error: 'Your card was declined. Please try a different card.' });
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`Payment API listening on http://localhost:${PORT}`));
