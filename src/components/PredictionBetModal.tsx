'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  appIconEmoji: string;
  betChoiceLabel: string;
  odds: number;
  marketType: 'survival' | 'movement';
  appId: string;
  onBetPlaced: (wager: number) => void;
}

export default function PredictionBetModal({
  isOpen,
  onClose,
  appName,
  appIconEmoji,
  betChoiceLabel,
  odds,
  marketType,
  appId,
  onBetPlaced,
}: BetModalProps) {
  const [wager, setWager] = useState<number>(25);
  const [error, setError] = useState<string>('');
  const [placedSuccess, setPlacedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const minBet = 1;
  const maxBet = 500;
  const potentialPayout = (wager * odds).toFixed(2);

  const handleConfirm = () => {
    if (wager < minBet || wager > maxBet) {
      setError(`Bet amount must be between $${minBet} and $${maxBet}.`);
      return;
    }
    setError('');
    
    // Call parent handler to record bet
    onBetPlaced(wager);
    setPlacedSuccess(true);
  };

  const handleClose = () => {
    setPlacedSuccess(false);
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.6rem' }}>{appIconEmoji}</span>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Place Prediction Bet</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{appName}</div>
            </div>
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
            }}
          >
            ×
          </button>
        </div>

        {!placedSuccess ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Bet Summary Pill */}
            <div
              style={{
                padding: '14px 16px',
                background: 'rgba(241, 245, 249, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Selected Prediction
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {betChoiceLabel}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Odds
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  {odds.toFixed(2)}x
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-red-dim)',
                  color: 'var(--accent-red)',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Wager Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Wager Amount (USD $)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  min={minBet}
                  max={maxBet}
                  value={wager}
                  onChange={(e) => setWager(Number(e.target.value))}
                  className="input"
                  style={{ paddingLeft: 30, fontSize: '1.05rem', fontWeight: 700 }}
                />
              </div>

              {/* Quick preset buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {[10, 25, 50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWager(amt)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 'var(--radius-sm)',
                      border: wager === amt ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                      background: wager === amt ? 'var(--accent-blue-dim)' : 'transparent',
                      color: wager === amt ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout Calculation */}
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Potential Payout</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                ${potentialPayout}
              </span>
            </div>

            {/* Action Buttons */}
            <button
              className="btn-primary"
              onClick={handleConfirm}
              style={{ padding: '14px', fontSize: '1rem', minHeight: 48 }}
            >
               Confirm Bet (${wager})
            </button>

            {/* Responsible Gaming Disclaimer */}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
              ️ Predictions involve risk. Set your limits. Read our{' '}
              <Link href="/responsible-gaming" style={{ color: 'var(--accent-amber)', textDecoration: 'underline' }}>
                Responsible Gaming Policy
              </Link>.
            </p>
          </div>
        ) : (
          /* Success Toast View */
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}></div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px' }}>Bet Placed Successfully!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, lineHeight: 1.6 }}>
              You wagered <strong>${wager}</strong> on <strong>{appName} ({betChoiceLabel})</strong> at <strong>{odds.toFixed(2)}x</strong>.
              <br /> Check your active bets dashboard for updates in 24 hours.
            </p>

            {/* Optional Double or Nothing Plinko Trigger */}
            <div
              style={{
                padding: '16px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 20,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-gold)', marginBottom: 4 }}>
                 Double or Nothing via Plinko?
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                Risk a portion of your wager on Plinko to multiply your betting power!
              </div>
              <Link href={`/plinko?presetWager=${wager}`}>
                <button
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-gold)',
                    color: '#000',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                  }}
                >
                   Boost Power on Plinko
                </button>
              </Link>
            </div>

            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
