'use client';

import { useState } from 'react';
import type { RankMovementMarketApp, MovementOddsOption } from '@/lib/types';
import CountdownTimer from './CountdownTimer';

interface RankMovementBetCardProps {
  app: RankMovementMarketApp;
  onBetClick: (app: RankMovementMarketApp, option: MovementOddsOption) => void;
}

export default function RankMovementBetCard({ app, onBetClick }: RankMovementBetCardProps) {
  const [selectedOptionType, setSelectedOptionType] = useState<string>(app.movementOptions[0].type);

  const currentOption = app.movementOptions.find((o) => o.type === selectedOptionType) || app.movementOptions[0];

  const getOptionColor = (type: string) => {
    if (type.startsWith('rise')) return '#059669';
    if (type.startsWith('drop')) return '#dc2626';
    return 'var(--text-secondary)';
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'all 0.25s ease',
        boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.05)',
      }}
      className="fade-in-up"
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(147, 51, 234, 0.08)',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              flexShrink: 0,
            }}
          >
            {app.iconEmoji}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{app.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span className="badge badge-category" style={{ fontSize: '0.62rem' }}>{app.category}</span>
              <span>• Current: <strong style={{ color: 'var(--accent-gold)' }}>#{app.currentRank}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Closes In</div>
          <CountdownTimer endsAt={app.closesAt} compact />
        </div>
      </div>

      {/* Movement Question & Options */}
      <div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
          Predict 24h Rank Movement:
        </div>
        
        {/* Movement Options Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
          {app.movementOptions.map((opt) => {
            const isSelected = opt.type === selectedOptionType;
            const color = getOptionColor(opt.type);

            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setSelectedOptionType(opt.type)}
                style={{
                  padding: '10px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? `2px solid ${color}` : '1px solid rgba(0,0,0,0.08)',
                  background: isSelected ? `${color}15` : '#ffffff',
                  color: isSelected ? color : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{opt.label}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: isSelected ? color : 'var(--text-muted)',
                    background: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.05)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {opt.odds.toFixed(2)}x
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Bet CTA Button */}
      <button
        className="btn-bid"
        onClick={() => onBetClick(app, currentOption)}
        style={{
          minHeight: 48,
          fontSize: '0.95rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <span>Bet on &ldquo;{currentOption.label}&rdquo;</span>
        <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>{currentOption.odds.toFixed(2)}x</span>
      </button>

      {/* Social Proof */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          paddingTop: 10,
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <span> {app.recentBetSnippet}</span>
        <span> Live Market</span>
      </div>
    </div>
  );
}
