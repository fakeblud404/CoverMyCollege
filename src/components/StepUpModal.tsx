'use client';

import { useState } from 'react';

interface HigherCompetitor {
  name: string;
  bidAmount: number; // in dollars
}

interface StepUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  earnedOddsPercentage: number; // e.g. 45 (%)
  userBidAmount: number; // in dollars e.g. 50
  higherCompetitor?: HigherCompetitor | null;
  onStepUpEvaluated?: (success: boolean) => void;
}

export default function StepUpModal({
  isOpen,
  onClose,
  earnedOddsPercentage,
  userBidAmount,
  higherCompetitor = { name: 'Apex AI SaaS', bidAmount: 120 },
  onStepUpEvaluated,
}: StepUpModalProps) {
  const [evaluated, setEvaluated] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Calculate adjusted odds based on competitor bid comparison
  let adjustedOdds = Math.min(earnedOddsPercentage, 95);
  let competitorFactorText = '';

  if (higherCompetitor && higherCompetitor.bidAmount > userBidAmount) {
    const ratio = userBidAmount / higherCompetitor.bidAmount;
    adjustedOdds = Math.max(5, Math.round(earnedOddsPercentage * Math.max(0.35, ratio)));
    competitorFactorText = `Competitor above (${higherCompetitor.name}) has a higher bid ($${higherCompetitor.bidAmount} vs $${userBidAmount}). Your step-up chance was adjusted from ${earnedOddsPercentage}% to ${adjustedOdds}%.`;
  } else {
    competitorFactorText = `You hold a competitive bid! Your full ${earnedOddsPercentage}% step-up chance is active.`;
  }

  const handleStepUpClick = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulation roll

    const roll = Math.random() * 100;
    const isWin = roll <= adjustedOdds;

    setSuccess(isWin);
    setEvaluated(true);
    setLoading(false);
  };

  const handleContinue = () => {
    onStepUpEvaluated?.(success);
    setEvaluated(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: 460, textAlign: 'center', padding: '32px 28px' }}>
        {!evaluated ? (
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚡</div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
              Step Up in Leaderboard?
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              You earned <strong style={{ color: 'var(--blue)' }}>+{earnedOddsPercentage}% Step-Up Odds</strong> from Plinko!
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
              {competitorFactorText}
              <div style={{ marginTop: 8, fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                Final Step-Up Probability: <span style={{ color: 'var(--blue)' }}>{adjustedOdds}%</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleStepUpClick}
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
          <div className="animate-fade-in">
            {/* Success View */}
            {success ? (
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '2px solid #22c55e',
                    color: '#22c55e',
                    fontSize: '2.5rem',
                    marginBottom: 16,
                  }}
                >
                  ▲
                </div>
                <h2
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#16a34a',
                    margin: '0 0 12px',
                  }}
                >
                  You have stepped up by one tile 
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                  Congratulations! Your app successfully beat the odds and climbed +1 position on the live leaderboard!
                </p>
              </div>
            ) : (
              /* Failure View */
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '2px solid #ef4444',
                    color: '#ef4444',
                    fontSize: '2.5rem',
                    marginBottom: 16,
                  }}
                >
                  ▼
                </div>
                <h2
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#dc2626',
                    margin: '0 0 12px',
                  }}
                >
                  Oops! You did not step up 
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                  The competitor above held their position this time due to their higher bid. Your base bid remains active on the leaderboard!
                </p>
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleContinue}
              style={{
                width: '100%',
                minHeight: 48,
                fontSize: '0.95rem',
              }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
