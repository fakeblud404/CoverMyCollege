'use client';

import { useState } from 'react';
import type { SurvivalMarketApp } from '@/lib/types';
import CountdownTimer from './CountdownTimer';

interface SurvivalBetCardProps {
  app: SurvivalMarketApp;
  onBetClick: (app: SurvivalMarketApp, choice: 'YES' | 'NO', odds: number) => void;
}

export default function SurvivalBetCard({ app, onBetClick }: SurvivalBetCardProps) {
  const [hoverYes, setHoverYes] = useState(false);
  const [hoverNo, setHoverNo] = useState(false);

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
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
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
              <span>• Current: <strong style={{ color: 'var(--accent-gold)' }}>#{app.currentRank}</strong> in Top {app.totalRanked}</span>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Closes In</div>
          <CountdownTimer endsAt={app.closesAt} compact />
        </div>
      </div>

      {/* Bet Question */}
      <div
        style={{
          padding: '12px 16px',
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '0.92rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.4,
        }}
      >
        Will <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{app.name}</span> stay in Top {app.targetTop} tomorrow at 5 PM?
      </div>

      {/* Yes / No Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button
          onClick={() => onBetClick(app, 'YES', app.yesOdds)}
          onMouseEnter={() => setHoverYes(true)}
          onMouseLeave={() => setHoverYes(false)}
          style={{
            minHeight: 48,
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            background: hoverYes ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: hoverYes ? '#ffffff' : '#059669',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            transform: hoverYes ? 'translateY(-2px)' : 'none',
            boxShadow: hoverYes ? '0 4px 14px rgba(16, 185, 129, 0.3)' : 'none',
          }}
        >
          <span>Bet YES</span>
          <span style={{ fontSize: '0.9rem', background: hoverYes ? 'rgba(255, 255, 255, 0.25)' : 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
            {app.yesOdds.toFixed(2)}x
          </span>
        </button>

        <button
          onClick={() => onBetClick(app, 'NO', app.noOdds)}
          onMouseEnter={() => setHoverNo(true)}
          onMouseLeave={() => setHoverNo(false)}
          style={{
            minHeight: 48,
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            background: hoverNo ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: hoverNo ? '#ffffff' : '#dc2626',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            transform: hoverNo ? 'translateY(-2px)' : 'none',
            boxShadow: hoverNo ? '0 4px 14px rgba(239, 68, 68, 0.3)' : 'none',
          }}
        >
          <span>Bet NO</span>
          <span style={{ fontSize: '0.9rem', background: hoverNo ? 'rgba(255, 255, 255, 0.25)' : 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
            {app.noOdds.toFixed(2)}x
          </span>
        </button>
      </div>

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
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        <span> <strong style={{ color: '#059669' }}>{app.yesPercentage}%</strong> bet YES</span>
        <span> {app.recentBetSnippet}</span>
      </div>
    </div>
  );
}
