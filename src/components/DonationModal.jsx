import { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Alert, Button } from 'react-bootstrap';
import { Elements, CardElement, PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AlertCircle, Check, ChevronLeft, Gift, Heart, Lock, Utensils, X } from 'lucide-react';
import { CONFIG } from '../config';
import { api, trackPurchase } from '../services/donations';

// Created once, outside render (Stripe warns if loadStripe is called repeatedly)
const stripePromise = CONFIG.STRIPE_PUBLIC_KEY ? loadStripe(CONFIG.STRIPE_PUBLIC_KEY) : null;

const FIELD = 'w-full p-3 bg-gray-50 rounded-lg border-2 border-transparent focus:border-primary outline-none';
const LABEL = 'block text-xs font-bold text-gray-500 mb-1';
const GIFT_FIELD = 'w-full p-3 bg-white rounded-lg border border-purple-200 outline-none text-sm';

function DonationFlow({ onClose, projectTitle, initialFrequency = 'One-time', initialIsGift = false, unitCost = CONFIG.UNIT_COST, setBusyParent }) {
  const stripe = useStripe();
  const elements = useElements();

  const [paymentRequest, setPaymentRequest] = useState(null);
  const [walletLabel, setWalletLabel] = useState(null);
  const [amount, setAmount] = useState(25);
  const [custom, setCustom] = useState('');
  const [frequency, setFrequency] = useState(initialFrequency);
  const [type, setType] = useState('Sadaqah');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('amount'); // amount -> details -> payment -> success
  const [error, setError] = useState(null);
  const [donor, setDonor] = useState({ firstName: '', lastName: '', email: '', phone: '', note: '' });
  const [isGift, setIsGift] = useState(initialIsGift);
  const [recipient, setRecipient] = useState({ recipientName: '', recipientEmail: '' });

  useEffect(() => { setBusyParent?.(busy); }, [busy, setBusyParent]);

  const plates = Math.floor(amount / unitCost);
  const giftDetails = isGift ? { ...recipient, message: donor.note } : undefined;

  const basePayload = (method, paymentMethodId, donorInfo) => ({
    amount, frequency, type, designation: projectTitle || 'General Fund', method,
    donor: donorInfo, note: donor.note, campaign: projectTitle, paymentMethodId, unitCost, giftDetails,
  });

  /** Sends PaymentMethod to backend; handles 3-D Secure if the bank asks for it. */
  const charge = async (payload) => {
    let res = await api.processDonation(payload);
    if (res.requiresAction && stripe) {
      const { error: scaError } = await stripe.confirmCardPayment(res.clientSecret);
      res = scaError ? { success: false, error: scaError.message || 'Authentication failed.' } : { success: true };
    }
    return res;
  };

  // Apple Pay / Google Pay / Link ("express checkout")
  useEffect(() => {
    if (!stripe || amount < 1) return undefined;
    const pr = stripe.paymentRequest({
      country: CONFIG.COUNTRY, currency: CONFIG.CURRENCY,
      total: { label: projectTitle || 'Donation', amount: Math.round(amount * 100) },
      requestPayerName: true, requestPayerEmail: true,
    });
    let cancelled = false;
    pr.canMakePayment().then((result) => {
      if (cancelled) return;
      if (result) {
        setPaymentRequest(pr);
        setWalletLabel(result.applePay ? 'Apple Pay' : result.googlePay ? 'Google Pay' : result.link ? 'Link' : 'Express Checkout');
      } else { setPaymentRequest(null); setWalletLabel(null); }
    });
    const onPaymentMethod = async (ev) => {
      try {
        const name = ev.payerName || '';
        const res = await charge(basePayload('stripe_wallet', ev.paymentMethod.id, {
          firstName: name.split(' ')[0] || 'Guest', lastName: name.split(' ').slice(1).join(' ') || '',
          email: ev.payerEmail || '', note: donor.note,
        }));
        if (res.success) { ev.complete('success'); trackPurchase(amount, projectTitle, frequency); setStep('success'); }
        else { ev.complete('fail'); setError(res.error || 'Payment failed.'); }
      } catch (e) { ev.complete('fail'); setError(e.message || 'An error occurred.'); }
    };
    pr.on('paymentmethod', onPaymentMethod);
    return () => { cancelled = true; pr.off('paymentmethod', onPaymentMethod); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe, amount, projectTitle, frequency, type, isGift, donor.note, recipient]);

  const submitCard = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) { setError('Payment gateway is initializing. Please try again in a moment.'); return; }
    const card = elements.getElement(CardElement);
    if (!card) return;
    setBusy(true); setError(null);
    try {
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card', card,
        billing_details: { name: `${donor.firstName} ${donor.lastName}`, email: donor.email, phone: donor.phone },
      });
      if (pmError) { setError(pmError.message || 'Payment failed. Please check your card details.'); setBusy(false); return; }
      const res = await charge(basePayload('stripe', paymentMethod.id, donor));
      if (!res.success) { setError(res.error || 'Transaction declined. Please try a different card.'); setBusy(false); return; }
      trackPurchase(amount, projectTitle, frequency);
      setBusy(false);
      setStep('success');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setBusy(false);
    }
  };

  // ------------------------------------------------------------------ success
  if (step === 'success') {
    return (
      <div className="text-center py-10 px-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Thank you!</h3>
        <p className="text-gray-600 mb-8">Your donation has been received. May Allah accept your Sadaqah.</p>
        <Button bsPrefix="op-btn" variant={null} onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 px-8 rounded-xl transition">Close</Button>
      </div>
    );
  }

  return (
    <div>
      {step !== 'amount' && (
        <Button bsPrefix="op-btn" variant={null} aria-label="Back" onClick={() => setStep(step === 'payment' ? 'details' : 'amount')}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 transition">
          <ChevronLeft size={24} />
        </Button>
      )}

      {/* ------------------------------------------------------------ STEP 1: amount */}
      {step === 'amount' && (
        <div className="p-6">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
              Feed Someone in Makkah <Heart size={20} className="text-secondary" fill="currentColor" />
            </h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">Your donation provides freshly prepared meals for those in need in Makkah.</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            {['One-time', 'Monthly'].map((f) => (
              <button key={f} type="button" onClick={() => setFrequency(f)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${frequency === f ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}>{f}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {CONFIG.DONATION_PRESETS.map((v) => (
              <button key={v} type="button" onClick={() => { setAmount(v); setCustom(''); }}
                className={`p-4 rounded-xl border-2 transition relative ${amount === v && !custom ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="font-black text-lg">£{v}</div>
                <div className="text-xs text-gray-500 font-medium">Feeds {Math.floor(v / unitCost)} Peoples</div>
                {amount === v && !custom && <div className="absolute top-2 right-2 text-primary"><Check size={16} /></div>}
              </button>
            ))}
          </div>

          {amount > 0 && (
            <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-fade-in flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary shrink-0"><Utensils size={24} /></div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  You are feeding <span className="text-secondary text-md">{plates}</span> {plates === 1 ? 'people' : 'peoples'} in Makkah.
                </p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">May Allah accept your generosity</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">£</span>
              <Form.Control bsPrefix="op-field" type="number" min="1" step="0.01" placeholder="Other amount" value={custom}
                className={`w-full p-4 pl-8 bg-gray-50 border-2 rounded-xl font-bold outline-none focus:border-primary transition ${custom ? 'border-primary' : 'border-transparent'}`}
                onChange={(e) => { const v = e.target.value; setCustom(v); const n = parseFloat(v); setAmount(isNaN(n) || n < 0 ? 0 : n); }} />
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            {['Sadaqah', 'Fidya'].map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="donationType" checked={type === t} onChange={() => setType(t)} className="text-primary focus:ring-primary" />
                <span className="text-sm font-medium">{t}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" id="gift-check" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} className="rounded text-primary focus:ring-primary" />
            <label htmlFor="gift-check" className="text-sm font-medium flex items-center gap-1 cursor-pointer">
              <Gift size={16} className="text-purple-500" /> Dedicate this donation as a gift?
            </label>
          </div>

          {amount > 0 && amount < 1 && (
            <p className="text-red-500 text-xs font-medium mb-2 flex items-center gap-1"><AlertCircle size={12} /> Minimum donation is £1</p>
          )}

          <Button bsPrefix="op-btn" variant={null} disabled={amount < 1} onClick={() => setStep('details')}
            className="w-full py-4 bg-secondary text-white font-bold rounded-xl shadow-lg hover:bg-accent transition disabled:opacity-50 disabled:cursor-not-allowed">
            {amount >= 1 ? `Sponsor ${plates} ${plates === 1 ? 'plate' : 'plates'}` : 'Continue'}
          </Button>
        </div>
      )}

      {/* ------------------------------------------------------------ STEP 2: details */}
      {step === 'details' && (
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Your Details</h3>
          <Form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Form.Group controlId="d-first">
                <Form.Label bsPrefix="op-label" className={LABEL}>First Name</Form.Label>
                <Form.Control bsPrefix="op-field" required type="text" className={FIELD} value={donor.firstName}
                  onChange={(e) => setDonor({ ...donor, firstName: e.target.value })} onBlur={(e) => setDonor({ ...donor, firstName: e.target.value.trim() })} />
              </Form.Group>
              <Form.Group controlId="d-last">
                <Form.Label bsPrefix="op-label" className={LABEL}>Last Name</Form.Label>
                <Form.Control bsPrefix="op-field" required type="text" className={FIELD} value={donor.lastName}
                  onChange={(e) => setDonor({ ...donor, lastName: e.target.value })} onBlur={(e) => setDonor({ ...donor, lastName: e.target.value.trim() })} />
              </Form.Group>
            </div>
            <Form.Group controlId="d-email">
              <Form.Label bsPrefix="op-label" className={LABEL}>Email Address</Form.Label>
              <Form.Control bsPrefix="op-field" required type="email" className={FIELD} value={donor.email}
                onChange={(e) => setDonor({ ...donor, email: e.target.value })} />
            </Form.Group>
            <Form.Group controlId="d-phone">
              <Form.Label bsPrefix="op-label" className={LABEL}>Phone Number</Form.Label>
              <Form.Control bsPrefix="op-field" required type="tel" autoComplete="tel" className={FIELD} value={donor.phone}
                onChange={(e) => setDonor({ ...donor, phone: e.target.value })} onBlur={(e) => setDonor({ ...donor, phone: e.target.value.trim() })} />
            </Form.Group>

            {isGift && (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-3 animate-fade-in">
                <h4 className="font-bold text-purple-800 text-sm flex items-center gap-2"><Gift size={16} /> Gift Recipient</h4>
                <Form.Control bsPrefix="op-field" required type="text" placeholder="Recipient's Name" className={GIFT_FIELD} value={recipient.recipientName}
                  onChange={(e) => setRecipient({ ...recipient, recipientName: e.target.value })} />
                <Form.Control bsPrefix="op-field" required type="email" placeholder="Recipient's Email" className={GIFT_FIELD} value={recipient.recipientEmail}
                  onChange={(e) => setRecipient({ ...recipient, recipientEmail: e.target.value })} />
                <Form.Control bsPrefix="op-field" as="textarea" placeholder="Add a message (optional)" className={`${GIFT_FIELD} h-20`} value={donor.note}
                  onChange={(e) => setDonor({ ...donor, note: e.target.value })} />
              </div>
            )}

            <Button bsPrefix="op-btn" variant={null} type="submit"
              className="w-full py-4 bg-secondary text-white font-bold rounded-xl shadow-lg hover:bg-accent transition mt-6">Proceed to Payment</Button>
          </Form>
        </div>
      )}

      {/* ------------------------------------------------------------ STEP 3: payment */}
      {step === 'payment' && (
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Secure Payment</h3>
          <div className="text-center mb-8 text-gray-500 text-sm">
            Sponsoring <span className="font-bold text-gray-900">£{amount}</span> {frequency === 'Monthly' ? '/ month' : ''}
          </div>

          {paymentRequest && (
            <div className="mb-6">
              <p className="text-xs text-center text-gray-500 mb-2">
                {walletLabel ? `${walletLabel} available on this device` : 'Express checkout available on this device'}
              </p>
              <PaymentRequestButtonElement options={{ paymentRequest }} />
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or pay with card</span></div>
              </div>
            </div>
          )}

          <Form onSubmit={submitCard}>
            <div className="p-4 border rounded-xl mb-6 bg-white shadow-sm">
              <CardElement options={{ style: { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } }, invalid: { color: '#9e2146' } } }} />
            </div>

            {error && (
              <Alert bsPrefix="op-alert" variant={null} transition={false} className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </Alert>
            )}

            <Button bsPrefix="op-btn" variant={null} type="submit" disabled={!stripe || busy}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {busy ? 'Processing...' : (<><Lock size={18} /> Pay £{amount}</>)}
            </Button>
            <div className="text-center mt-4 text-xs text-gray-400 flex items-center justify-center gap-1"><Lock size={12} /> SSL Encrypted Payment</div>
          </Form>
        </div>
      )}
    </div>
  );
}

/**
 * Modal shell. React-Bootstrap handles focus trap, scroll lock, Esc and ARIA;
 * the visual skin (blurred black backdrop, rounded-3xl white card) is applied via classes + overrides.css.
 */
export default function DonationModal({ show, onClose, projectTitle, frequency, isGift, unitCost }) {
  const [busy, setBusy] = useState(false);
  const key = useMemo(() => `${frequency}-${isGift}-${projectTitle}-${show}`, [frequency, isGift, projectTitle, show]);

  return (
    <Modal show={show} onHide={() => !busy && onClose()} centered scrollable={false} animation={false}
      backdrop="static" keyboard={!busy} className="op-modal" backdropClassName="op-backdrop"
      contentClassName="relative bg-white w-full max-w-md rounded-[2rem] md:rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up"
      aria-label="Make a donation">
      <Button bsPrefix="op-btn" variant={null} onClick={() => !busy && onClose()} aria-label="Close"
        className="absolute top-3 right-3 md:top-4 md:right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition">
        <X size={20} />
      </Button>
      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <DonationFlow key={key} onClose={onClose} projectTitle={projectTitle} initialFrequency={frequency}
            initialIsGift={isGift} unitCost={unitCost} setBusyParent={setBusy} />
        </Elements>
      ) : (
        <div className="p-8 text-center">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
          <h3 className="font-bold text-lg mb-2">Configuration Error</h3>
          <p className="text-gray-500 text-sm">Stripe public key is missing. Set <code>VITE_STRIPE_PUBLIC_KEY</code> in your .env file.</p>
          <Button bsPrefix="op-btn" variant={null} onClick={onClose} className="mt-6 px-6 py-2 bg-gray-100 rounded-lg font-bold">Close</Button>
        </div>
      )}
    </Modal>
  );
}
