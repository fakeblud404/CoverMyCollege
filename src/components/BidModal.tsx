'use client';

import { useState } from 'react';
import { CATEGORIES, type AdFormData, type Category } from '@/lib/types';
import PlinkoGame from './PlinkoGame';
import PayPalCheckout from './PayPalCheckout';
import StepUpModal from './StepUpModal';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBidPlaced: () => void;
}

type Step = 'details' | 'payment' | 'plinko' | 'stepup' | 'result';

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
  const [paypalOrderId, setPaypalOrderId] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [targetSlotIndices, setTargetSlotIndices] = useState<number[]>([]);
  const [finalMultiplier, setFinalMultiplier] = useState<number | null>(null);
  const [steppedUp, setSteppedUp] = useState<boolean | null>(null);
  const [stepEvaluated, setStepEvaluated] = useState(false);
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
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bidAmountCents, bidderName: formData.bidderName }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create PayPal order');
      }
      const data = await res.json();

      if (data.isAdminBypass) {
        // Bypass payment step directly for admin
        handlePaymentSuccess(data.orderId);
        return;
      }

      setPaypalOrderId(data.orderId);
      setStep('payment');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize payment. Please try again.';
      setError(msg);
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

  const handlePlinkoComplete = (oddsPct: number) => {
    setFinalMultiplier(oddsPct);
    setStep('stepup');
  };

  const submitAdToLeaderboard = async (isSuccess: boolean) => {
    setLoading(true);
    const mult = finalMultiplier || 35;
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          baseBid: bidAmountCents,
          multiplier: mult,
          finalBid: Math.round(bidAmountCents * (isSuccess ? 1.5 : 1.0)),
          paypalOrderId: paymentIntentId || 'demo-order-' + Date.now(),
        }),
      });
      if (!res.ok) throw new Error('Failed to submit ad');
      onBidPlaced();
    } catch {
      setError('Failed to update leaderboard. Contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateStepUp = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    // Higher competitor comparison: if higher competitor has larger bid, reduce odds
    const higherCompetitor = { name: 'Apex AI SaaS', bidAmount: 120 };
    let adjustedOdds = Math.min(finalMultiplier || 35, 95);
    if (higherCompetitor.bidAmount > formData.baseBid) {
      const ratio = formData.baseBid / higherCompetitor.bidAmount;
      adjustedOdds = Math.max(5, Math.round(adjustedOdds * Math.max(0.35, ratio)));
    }

    const roll = Math.random() * 100;
    const isWin = roll <= adjustedOdds;

    setSteppedUp(isWin);
    setStepEvaluated(true);
    setLoading(false);

    // Save ad immediately so it's guaranteed to show on the leaderboard!
    await submitAdToLeaderboard(isWin);
  };

  const handleClose = () => {
    onBidPlaced();
    // Reset state
    setStep('details');
    setFormData({ title: '', description: '', url: '', category: 'AI', baseBid: 10, bidderName: '', bidderEmail: '' });
    setPaypalOrderId('');
    setPaymentIntentId('');
    setTargetSlotIndices([]);
    setFinalMultiplier(null);
    setSteppedUp(null);
    setStepEvaluated(false);
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
                App Logo <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Crop preview box (matching 44x44 leaderboard tile) */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(37, 99, 235, 0.08)',
                    border: '1px solid rgba(0, 113, 227, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#2563eb',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                  title="Leaderboard Icon Preview"
                >
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    formData.title ? formData.title.charAt(0).toUpperCase() : 'A'
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setFormData((prev) => ({ ...prev, logoUrl: result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Square image recommended (cropped automatically to fit leaderboard icon).
                  </div>
                </div>
              </div>
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
        {step === 'payment' && paypalOrderId && (
          <div className="animate-fade-in">
            <PayPalCheckout
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

        {/* Step 4: Step Up Evaluation */}
        {step === 'stepup' && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            {!stepEvaluated ? (
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚡</div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                  Step Up in Leaderboard?
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                  You earned <strong style={{ color: 'var(--blue)' }}>+{finalMultiplier || 35}% Step-Up Odds</strong> from Plinko!
                </p>

                {/* Competitor Bid Comparison Info */}
                <div
                  style={{
                    padding: '14px',
                    background: 'rgba(0, 113, 227, 0.06)',
                    border: '1px solid rgba(0, 113, 227, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 24,
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--blue)', marginBottom: 4 }}>
                    Leaderboard Competitor Check
                  </div>
                  {formData.baseBid < 120 ? (
                    <div>
                      Competitor above (Apex AI SaaS) has a higher bid ($120 vs ${formData.baseBid}).
                      Your step-up chance was adjusted from {finalMultiplier || 35}% to {Math.max(5, Math.round((finalMultiplier || 35) * Math.max(0.35, formData.baseBid / 120)))}%.
                    </div>
                  ) : (
                    <div>You hold a competitive bid! Your full {finalMultiplier || 35}% step-up chance is active.</div>
                  )}
                </div>

                <button
                  className="btn-primary"
                  onClick={handleEvaluateStepUp}
                  disabled={loading}
                  style={{
                    width: '100%',
                    minHeight: 48,
                    fontSize: '1rem',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? 'Evaluating Odds…' : 'Step Up in Leaderboard'}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ margin: '16px 0 20px' }}>
                  {steppedUp ? (
                    <div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          background: 'rgba(34, 197, 94, 0.12)',
                          border: '2px solid #22c55e',
                          color: '#22c55e',
                          fontSize: '2rem',
                          marginBottom: 12,
                        }}
                      >
                        ▲
                      </div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', margin: '0 0 8px' }}>
                        You have stepped up by one tile 
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        Your app beat the odds and climbed +1 spot higher on the leaderboard!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '2px solid #ef4444',
                          color: '#ef4444',
                          fontSize: '2rem',
                          marginBottom: 12,
                        }}
                      >
                        ▼
                      </div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626', margin: '0 0 8px' }}>
                        Oops! You did not step up 
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        The competitor above held their position due to their higher bid. Your base bid remains active!
                      </p>
                    </div>
                  )}
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
        )}
      </div>
    </div>
  );
}
