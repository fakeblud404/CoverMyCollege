'use client';

import { useState, useRef } from 'react';
import { CATEGORIES, type AdFormData, type Category } from '@/lib/types';
import PlinkoGame from './PlinkoGame';
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

  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [targetSlotIndices, setTargetSlotIndices] = useState<number[]>([]);
  const [finalMultiplier, setFinalMultiplier] = useState<number | null>(null);
  const [steppedUp, setSteppedUp] = useState<boolean | null>(null);
  const [stepEvaluated, setStepEvaluated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const bidAmountCents = Math.round(formData.baseBid * 100);

  const handleDetailsSubmit = async () => {
    console.log('[Whop Checkout Client] Payment button clicked:', {
      baseBid: formData.baseBid,
      hasTitle: Boolean(formData.title.trim()),
      hasUrl: Boolean(formData.url.trim()),
      hasBidderName: Boolean(formData.bidderName.trim()),
      hasBidderEmail: Boolean(formData.bidderEmail.trim()),
      loading,
    });

    if (loading) {
      console.warn('[Whop Checkout Client] Prevented repeated click while loading.');
      return;
    }

    if (!formData.title?.trim() || !formData.url?.trim() || formData.baseBid < 1) {
      const msg = 'Please enter an Ad Title, Website URL, and a minimum bid of $1.00.';
      console.warn('[Whop Checkout Client] Validation failed:', msg);
      setError(msg);
      return;
    }
    if (!formData.bidderName.trim()) {
      const msg = 'Please enter your name so it can appear on the leaderboard.';
      console.warn('[Whop Checkout Client] Validation failed:', msg);
      setError(msg);
      return;
    }
    if (!formData.bidderEmail.trim() || !formData.bidderEmail.includes('@')) {
      const msg = 'Please enter a valid email address for your payment receipt.';
      console.warn('[Whop Checkout Client] Validation failed:', msg);
      setError(msg);
      return;
    }

    setError('');
    setLoading(true);

    try {
      console.log('[Whop Checkout Client] Sending request to /api/whop/checkout with amountCents:', bidAmountCents);

      const res = await fetch('/api/whop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bidAmountCents,
          adData: formData,
        }),
      });

      console.log('[Whop Checkout Client] Checkout API responded with status:', res.status);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Failed to create checkout (HTTP ${res.status}).`);
      }

      const checkoutUrl = data.checkoutUrl;
      console.log('[Whop Checkout Client] Received checkout response:', {
        checkoutId: data.checkoutId,
        hasUrl: Boolean(checkoutUrl),
      });

      if (!checkoutUrl || typeof checkoutUrl !== 'string') {
        throw new Error('No checkout URL received from Whop server.');
      }

      // Validate URL format and security protocol
      let destination = checkoutUrl.trim();
      if (!destination.startsWith('https://') && !destination.startsWith('http://')) {
        destination = `https://${destination}`;
      }

      try {
        const parsedUrl = new URL(destination);
        if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
          throw new Error('Invalid URL protocol returned from checkout.');
        }
      } catch (urlErr: any) {
        throw new Error(`Invalid checkout destination URL: ${urlErr?.message || destination}`);
      }

      console.log('[Whop Checkout Client] Navigating window tab to Whop hosted checkout:', destination);
      window.location.assign(destination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to redirect to Whop checkout.';
      console.error('[Whop Checkout Client] Checkout failed:', msg);
      setError(msg);
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
          whopCheckoutId: paymentIntentId || 'whop-' + Date.now(),
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
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFileName(file.name);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setFormData((prev) => ({ ...prev, logoUrl: result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: 'var(--ink, #1d1d1f)',
                        background: '#f2f2f7',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease, border-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e5e5ea';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f2f2f7';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
                      }}
                    >
                      Choose File
                    </button>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: selectedFileName ? 'var(--text-secondary, #6e6e73)' : 'var(--text-muted, #86868b)',
                        maxWidth: 200,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {selectedFileName || 'No file chosen'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
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
                  value={formData.baseBid || ''}
                  onChange={(e) => setFormData({ ...formData, baseBid: Math.max(0, Number(e.target.value)) })}
                  style={{ paddingLeft: 30 }}
                />
              </div>

              {/* Quick-Select Amounts */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {[1, 5, 10, 25, 50].map((amt) => {
                  const isSelected = formData.baseBid === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFormData({ ...formData, baseBid: amt })}
                      style={{
                        padding: '5px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        borderRadius: '100px',
                        border: isSelected ? '1.5px solid var(--blue, #0071e3)' : '1px solid rgba(0, 0, 0, 0.12)',
                        background: isSelected ? 'rgba(0, 113, 227, 0.08)' : '#ffffff',
                        color: isSelected ? 'var(--blue, #0071e3)' : 'var(--text-secondary, #333336)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      ${amt}
                    </button>
                  );
                })}
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                 Minimum $1.00. This amount passes through the Plinko multiplier (0.5× to 10×).
              </p>
            </div>

            {/* In-form visible error banner directly above checkout button */}
            {error && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md, 12px)',
                  background: 'rgba(255, 59, 48, 0.1)',
                  border: '1px solid rgba(255, 59, 48, 0.3)',
                  color: '#d32f2f',
                  fontSize: '0.86rem',
                  lineHeight: 1.45,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: error ? 4 : 12 }}>
              <button
                className="btn-primary"
                onClick={handleDetailsSubmit}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading
                  ? 'Connecting to Checkout...'
                  : `Continue to Checkout — $${formData.baseBid.toFixed(2)}`}
              </button>
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--ink-3, #86868b)',
                  letterSpacing: '0.02em',
                }}
              >
                via Whop
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              You will be securely redirected to Whop to complete your payment.
            </p>
          </div>
        )}

        {/* Step 2: Payment Fallback */}
        {step === 'payment' && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Redirecting you to Whop hosted checkout...
            </p>
            <button
              className="btn-primary"
              onClick={handleDetailsSubmit}
              disabled={loading}
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              {loading ? 'Connecting...' : 'Click to Proceed to Whop'}
            </button>
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
