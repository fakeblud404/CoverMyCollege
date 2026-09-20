'use client';

import { useState } from 'react';
import type { UserPredictionBet } from '@/lib/types';
import CountdownTimer from './CountdownTimer';

interface UserBetsDashboardProps {
  bets: UserPredictionBet[];
  onClaimWin?: (bet: UserPredictionBet) => void;
}

export default function UserBetsDashboard({ bets, onClaimWin }: UserBetsDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'settled' | 'won' | 'lost'>('all');

  const filteredBets = bets.filter((bet) => {
    if (filter === 'all') return true;
    if (filter === 'active') return bet.status === 'active';
    if (filter === 'settled') return bet.status !== 'active';
    if (filter === 'won') return bet.status === 'won';
    if (filter === 'lost') return bet.status === 'lost';
    return true;
  });

  return (
    <div
      style={{
        padding: '24px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
           My Active & Settled Predictions
        </h2>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'active', 'settled', 'won', 'lost'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: filter === tab ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                background: filter === tab ? 'var(--accent-blue-dim)' : 'transparent',
                color: filter === tab ? 'var(--accent-blue)' : 'var(--text-secondary)',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filteredBets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}></div>
          <div style={{ fontWeight: 600 }}>No bets found</div>
          <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Place a prediction bet on your favorite app!</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                {['App Name', 'Market', 'Bet Choice', 'Wager', 'Odds', 'Potential Payout', 'Status', 'Time / Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBets.map((bet) => {
                const statusColor =
                  bet.status === 'won'
                    ? 'var(--accent-green)'
                    : bet.status === 'lost'
                    ? 'var(--accent-red)'
                    : 'var(--accent-gold)';

                return (
                  <tr key={bet.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '14px', fontWeight: 700 }}>
                      <span style={{ marginRight: 6 }}>{bet.appIconEmoji}</span>
                      {bet.appName}
                    </td>
                    <td style={{ padding: '14px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {bet.marketType}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {bet.betChoiceLabel}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 600 }}>
                      ${bet.wagerAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px', color: 'var(--blue)', fontWeight: 700 }}>
                      {bet.odds.toFixed(2)}x
                    </td>
                    <td style={{ padding: '14px', fontWeight: 800, color: 'var(--blue)' }}>
                      ${bet.potentialPayout.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '100px',
                          textTransform: 'uppercase',
                          background: `${statusColor}18`,
                          color: statusColor,
                          border: `1px solid ${statusColor}40`,
                        }}
                      >
                        {bet.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      {bet.status === 'active' ? (
                        <CountdownTimer endsAt={bet.settlesAt} compact />
                      ) : bet.status === 'won' && !bet.claimed ? (
                        <button
                          onClick={() => onClaimWin && onClaimWin(bet)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--accent-green)',
                            color: '#000',
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                          }}
                        >
                           Claim ${bet.potentialPayout.toFixed(2)}
                        </button>
                      ) : bet.status === 'won' && bet.claimed ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}> Claimed</span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
