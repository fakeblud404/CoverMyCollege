'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface SettledPrediction {
  id: string;
  appName: string;
  appIconEmoji: string;
  betChoice: string;
  wager: number;
  odds: number;
  outcome: 'won' | 'lost';
  payout: number;
  claimed?: boolean;
}

const INITIAL_SETTLED: SettledPrediction[] = [
  {
    id: 's1',
    appName: 'PhotoAI',
    appIconEmoji: '',
    betChoice: 'YES (Stay in Top 25)',
    wager: 50,
    odds: 1.80,
    outcome: 'won',
    payout: 90.00,
    claimed: false,
  },
  {
    id: 's2',
    appName: 'FitTrack Pro',
    appIconEmoji: '️‍️',
    betChoice: 'Rise 5+ spots',
    wager: 100,
    odds: 3.50,
    outcome: 'lost',
    payout: 0,
  },
  {
    id: 's3',
    appName: 'BudgetBuddy',
    appIconEmoji: '',
    betChoice: 'Drop 1–4 spots',
    wager: 75,
    odds: 1.90,
    outcome: 'won',
    payout: 142.50,
    claimed: true,
  },
];

export default function PredictionResultsClient() {
  const [settled, setSettled] = useState<SettledPrediction[]>(INITIAL_SETTLED);
  const [plinkoModalBet, setPlinkoModalBet] = useState<SettledPrediction | null>(null);
  const [plinkoResult, setPlinkoResult] = useState<string | null>(null);

  const handleClaim = (id: string) => {
    setSettled((prev) =>
      prev.map((item) => (item.id === id ? { ...item, claimed: true } : item))
    );

    // Offer Bonus Plinko Drop
    const bet = settled.find((b) => b.id === id);
    if (bet) {
      setPlinkoModalBet(bet);
    }
  };

  const handleBonusPlinkoDrop = () => {
    if (!plinkoModalBet) return;
    const win = Math.random() > 0.5;
    if (win) {
      const doubled = plinkoModalBet.payout * 2;
      setPlinkoResult(` CONGRATS! Ball landed in 2x! You doubled your payout to $${doubled.toFixed(2)}!`);
    } else {
      setPlinkoResult(` Ouch! Ball landed in 0x. Better luck next time!`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 1000, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div className="section-label"> Settled Markets</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
            Prediction Results & Payouts
          </h1>
          <p className="section-sub">
            Review 24h market settlements, claim your winning payouts, or try bonus rounds!
          </p>
        </div>

        {/* Results List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
          {settled.map((item) => {
            const isWin = item.outcome === 'won';

            return (
              <div
                key={item.id}
                style={{
                  padding: '20px 24px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: isWin ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: '2rem' }}>{item.appIconEmoji}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                      {item.appName}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Bet: <strong style={{ color: '#0f172a' }}>{item.betChoice}</strong> • Wager: ${item.wager} @ {item.odds.toFixed(2)}x
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {isWin ? (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 800 }}>
                         You won ${item.payout.toFixed(2)}!
                      </div>
                      {!item.claimed ? (
                        <button
                          onClick={() => handleClaim(item.id)}
                          style={{
                            marginTop: 6,
                            padding: '8px 18px',
                            borderRadius: 'var(--radius-md)',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                          }}
                        >
                          Claim Payout
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                           Claimed to balance
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-red)', fontWeight: 700 }}>
                         You lost ${item.wager}
                      </div>
                      <Link href="/app-predictions">
                        <button
                          style={{
                            marginTop: 6,
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(0, 0, 0, 0.04)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            color: 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          Try Similar Apps →
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bonus Plinko Modal */}
        {plinkoModalBet && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 440, textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}></div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px' }}>
                Bonus Plinko Drop!
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                You won <strong>${plinkoModalBet.payout.toFixed(2)}</strong>! Take 1 free Plinko drop to try and 2x your winnings. (50% chance 2x / 50% chance 0x).
              </p>

              {plinkoResult ? (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    fontWeight: 700,
                    marginBottom: 20,
                  }}
                >
                  {plinkoResult}
                </div>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleBonusPlinkoDrop}
                  style={{ width: '100%', minHeight: 48, fontSize: '1rem', marginBottom: 12 }}
                >
                   Drop Bonus Ball Now
                </button>
              )}

              <button
                onClick={() => { setPlinkoModalBet(null); setPlinkoResult(null); }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
