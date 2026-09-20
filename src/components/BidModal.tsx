'use client';

import { useState } from 'react';
import { CATEGORIES, type AdFormData, type Category } from '@/lib/types';
import PlinkoGame from './PlinkoGame';
import StripePaymentForm from './StripePaymentForm';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBidPlaced: () => void;
}

type Step = 'details' | 'payment' | 'plinko' | 'result';

export default function BidModal({ isOpen, onClose, onBidPlaced }: BidModalProps) {
  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    description: '',
    url: '',
    category: 'AI',
    baseBid: 10,
    bidderName: '',
    bidderEmail: '',
  });
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [targetSlotIndices, setTargetSlotIndices] = useState<number[]>([]);
  const [finalMultiplier, setFinalMultiplier] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const bidAmountCents = Math.round(formData.baseBid * 100);

  const handleDetailsSubmit = async () => {
    if (!formData.title || !formData.url || formData.baseBid < 1) {
      setError('Please fill in all required fields and bid at least $1.');
      return;
    }
    if (!formData.bidderName.trim()) {
      setError('Please enter your name so it can appear on the leaderboard.');
      return;
    }
    if (!formData.bidderEmail.trim() || !formData.bidderEmail.includes('@')) {
      setError('Please enter a valid email address for your receipt.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bidAmountCents, bidderName: formData.bidderName }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create payment');
      }
      const data = await res.json();

      if (data.isAdminBypass) {
        // Bypass payment step directly for admin
        handlePaymentSuccess(data.paymentIntentId);
        return;
      }

      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (piId: string) => {
    setPaymentIntentId(piId);
    setLoading(true);

    try {
      // Get Plinko result from server, sending the baseBid for tier calculation
      const res = await fetch('/api/plinko', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: piId, baseBid: bidAmountCents }),
      });

      if (!res.ok) throw new Error('Failed to get Plinko result');
      const data = await res.json();
      setTargetSlotIndices(data.targetSlotIndices || [data.slotIndex]);
      setStep('plinko');
    } catch {
      setError('Payment succeeded but Plinko failed. Contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlinkoComplete = async (multiplier: number) => {
    setFinalMultiplier(multiplier);
    setLoading(true);

    try {
      // Submit the ad
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          baseBid: bidAmountCents,
          multiplier,
          finalBid: Math.round(bidAmountCents * multiplier),
          stripePaymentId: paymentIntentId,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit ad');
      setStep('result');
    } catch {
      setError('Failed to submit your ad. Contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'result') {
      onBidPlaced();
    }
    // Reset state
    setStep('details');
    setFormData({ title: '', description: '', url: '', category: 'AI', baseBid: 10, bidderName: '', bidderEmail: '' });
    setClientSecret('');
    setPaymentIntentId('');
    setTargetSlotIndices([]);
    setFinalMultiplier(null);
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              {step === 'details' && 'Bid & Cover My College'}
              {step === 'payment' && 'Payment'}
              {step === 'plinko' && 'Plinko Multiplier'}
              {step === 'result' && 'You\'re Live & Tuition Funded!'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              {step === 'details' && 'Step 1 of 3 — Enter app details (100% of bid funds my $15k tuition)'}
              {step === 'payment' && 'Step 2 of 3 — Complete payment securely'}
              {step === 'plinko' && 'Step 3 of 3 — Drop the ball to multiply your rank & tuition power'}
              {step === 'result' && 'Your app is now ranked on the live leaderboard!'}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: 4,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Progress bar */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginBottom: 24,
          }}
        >
          {['details', 'payment', 'plinko'].map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background:
                  ['details', 'payment', 'plinko', 'result'].indexOf(step) >= i
                    ? 'var(--accent-blue)'
                    : 'var(--border)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-red-dim)',
              color: 'var(--accent-red)',
              fontSize: '0.85rem',
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Step 1: Ad Details */}
        {step === 'details' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Ad Title *
              </label>
              <input
                className="input"
                placeholder="e.g. Acme AI Tools"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Description
              </label>
              <input
                className="input"
                placeholder="Short description of your product"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Website URL *
              </label>
              <input
                className="input"
                placeholder="https://yoursite.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Category
              </label>
              <select
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ cursor: 'pointer' }}
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Your Name * <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(shown on leaderboard)</span>
              </label>
              <input
                className="input"
                placeholder="e.g. Alex K."
                value={formData.bidderName}
                onChange={(e) => setFormData({ ...formData, bidderName: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Email * <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(private — receipt only)</span>
              </label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={formData.bidderEmail}
                onChange={(e) => setFormData({ ...formData, bidderEmail: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Base Bid Amount (USD) *
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  $
                </span>
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="10"
                  value={formData.baseBid}
                  onChange={(e) => setFormData({ ...formData, baseBid: Number(e.target.value) })}
                  style={{ paddingLeft: 30 }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                 This amount passes through the Plinko multiplier (0.5× to 10×)
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={handleDetailsSubmit}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                marginTop: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Setting up...' : `Continue to Payment — $${formData.baseBid.toFixed(2)}`}
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && clientSecret && (
          <div className="animate-fade-in">
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Base bid</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                ${formData.baseBid.toFixed(2)}
              </span>
            </div>

            <StripePaymentForm
              clientSecret={clientSecret}
              amount={bidAmountCents}
              onSuccess={handlePaymentSuccess}
              onError={(msg) => setError(msg)}
            />
          </div>
        )}

        {/* Step 3: Plinko */}
        {step === 'plinko' && (
          <div className="animate-fade-in">
            <PlinkoGame
              targetSlotIndices={targetSlotIndices}
              onComplete={handlePlinkoComplete}
            />
          </div>
        )}

        {/* Result */}
        {step === 'result' && finalMultiplier !== null && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8, marginTop: 16 }}>
              Your final bid
            </div>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: finalMultiplier >= 5 ? '#22c55e' : finalMultiplier >= 2 ? 'var(--accent-gold)' : 'var(--text-primary)',
                letterSpacing: '-0.03em',
                marginBottom: 4,
              }}
            >
              ${((bidAmountCents * finalMultiplier) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>
              ${formData.baseBid.toFixed(2)} × {finalMultiplier}× multiplier
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                marginBottom: 20,
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{formData.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {formData.description || 'No description'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {formData.category} • {formData.url}
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleClose}
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              View Leaderboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
