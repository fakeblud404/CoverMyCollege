'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export interface PlinkoWinnerItem {
  id: string;
  name: string;
  amount: number; // in USD dollars
  multiplier?: string;
}

export interface PlinkoWinnerItem {
  id: string;
  name: string;
  amount: number; // in USD dollars
  multiplier?: string;
}

export default function BigPlinkoWinners() {
  const [winners, setWinners] = useState<PlinkoWinnerItem[]>([]);

  useEffect(() => {
    async function loadWinners() {
      try {
        const res = await fetch('/api/winners');
        if (res.ok) {
          const data = await res.json();
          if (data.winners && data.winners.length > 0) {
            setWinners(
              data.winners.map((w: any) => ({
                id: w.id,
                name: w.name,
                amount: Math.round(w.amountCents ? w.amountCents / 100 : 0),
                multiplier: w.bigWin || `${w.multiplier}×`,
              }))
            );
          }
        }
      } catch { /* Silent */ }
    }
    loadWinners();
  }, []);

  if (winners.length === 0) {
    return null; // Don't render banner if no real winners exist yet
  }

  // Duplicate items for continuous smooth marquee loop
  const marqueeItems = [...winners, ...winners];

  return (
    <section 
      style={{
        margin: '16px 0 28px',
        padding: '14px 20px',
        background: '#ffffff',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="Big Plinko Winners"
    >
      {/* Glow orb */}
      <div 
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          background: 'rgba(16, 185, 129, 0.08)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Big Plinko Winners
            </h2>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#059669',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '2px 8px',
                borderRadius: '100px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span className="live-pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#059669' }} />
              Live Drops
            </span>
          </div>
        </div>

        <Link
          href="/winners"
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#059669',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            transition: 'all 0.2s ease',
          }}
          className="hover:underline"
        >
          See all big winners &rarr;
        </Link>
      </div>

      {/* Continuous Marquee Scrolling Ticker Container */}
      <div 
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          width: '100%',
          padding: '4px 0',
        }}
      >
        <div className="ticker-content" style={{ display: 'inline-block', animationDuration: '35s' }}>
          {marqueeItems.map((w, i) => (
            <div
              key={`${w.id}-${i}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginRight: 24,
                padding: '6px 14px',
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.85rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
              }}
            >
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{w.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>won</span>
              <span style={{ fontWeight: 800, color: '#059669' }}>
                ${w.amount.toLocaleString('en-US')}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>on Plinko</span>
              {w.multiplier && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#d97706',
                    background: 'rgba(217, 119, 6, 0.12)',
                    border: '1px solid rgba(217, 119, 6, 0.25)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  {w.multiplier}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
