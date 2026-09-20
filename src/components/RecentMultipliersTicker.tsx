'use client';

import { useEffect, useState } from 'react';

interface WinnerItem {
  title: string;
  multiplier: number;
  baseBid: number;
  finalBid: number;
  odds: string;
}

const WINNERS: WinnerItem[] = [
  { title: 'Acme AI Tools',       multiplier: 5.2,  baseBid: 5000, finalBid: 26000, odds: '7.5%'  },
  { title: 'SEO Wizard Pro',      multiplier: 10.0, baseBid: 2500, finalBid: 25000, odds: '3.0%'  },
  { title: 'CryptoTrack Pro',     multiplier: 2.0,  baseBid: 4100, finalBid: 8200,  odds: '15.0%' },
  { title: 'LaunchPad SaaS',      multiplier: 5.0,  baseBid: 1500, finalBid: 7500,  odds: '8.0%'  },
  { title: 'MarketBot AI',        multiplier: 2.0,  baseBid: 3000, finalBid: 6000,  odds: '15.0%' },
  { title: 'DevStack Cloud',      multiplier: 3.4,  baseBid: 2000, finalBid: 6800,  odds: '10.0%' },
  { title: 'FinVault Pro',        multiplier: 5.0,  baseBid: 1000, finalBid: 5000,  odds: '8.0%'  },
  { title: 'ShopEngine Headless', multiplier: 10.0, baseBid: 500,  finalBid: 5000,  odds: '3.0%'  },
];

const LABEL_WIDTH = 130; // px — width reserved for the fixed left label

export default function RecentMultipliersTicker() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const getColor = (m: number) => {
    if (m >= 5)  return '#16a34a';
    if (m >= 2)  return '#d97706';
    if (m >= 1)  return '#2563eb';
    return '#dc2626';
  };

  const getEmoji = (m: number) => {
    if (m >= 10) return '';
    if (m >= 5)  return '';
    if (m >= 2)  return '';
    return '';
  };

  // Triple the items so -33.333% shift creates a seamless loop
  const items = [...WINNERS, ...WINNERS, ...WINNERS];

  return (
    <div
      role="marquee"
      aria-label="Recent Plinko Winners Ticker"
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: 38,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1.5px solid rgba(0,0,0,0.09)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Fixed Label on left — sits above the scrolling strip */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: LABEL_WIDTH,
          zIndex: 10,
          background: 'linear-gradient(90deg, #ffffff 75%, rgba(255,255,255,0) 100%)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 14,
          gap: 6,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#16a34a',
            boxShadow: '0 0 7px #16a34a',
            display: 'inline-block',
            animation: 'pulse 1.5s infinite',
          }}
        />
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
           WINNERS
        </span>
      </div>

      {/* Right fade-out edge */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 48,
          zIndex: 10,
          background: 'linear-gradient(270deg, #ffffff 70%, rgba(255,255,255,0) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Scrolling ticker strip */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          paddingLeft: LABEL_WIDTH,
          /* 
            The strip is 3× the item count.
            translateX(-33.333%) moves exactly one full copy's worth of items,
            creating a seamless infinite scroll to the left.
          */
          animation: 'ticker 32s linear infinite',
          willChange: 'transform',
        }}
      >
        {items.map((w, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              marginRight: 36,
              fontSize: '0.77rem',
              color: '#334155',
            }}
          >
            {/* Separator dot between entries */}
            {i % WINNERS.length !== 0 || i === 0 ? null : (
              <span style={{ color: '#cbd5e1', marginRight: 36 }}>•••</span>
            )}
            <span style={{ fontSize: '0.85rem' }}>{getEmoji(w.multiplier)}</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{w.title}</span>
            <span style={{ color: '#94a3b8' }}>won</span>
            <span style={{ fontWeight: 800, color: '#16a34a' }}>
              ${(w.finalBid / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span style={{ color: '#94a3b8' }}>at</span>
            <span
              style={{
                fontWeight: 800,
                color: getColor(w.multiplier),
                background: `${getColor(w.multiplier)}14`,
                border: `1px solid ${getColor(w.multiplier)}33`,
                padding: '1px 6px',
                borderRadius: 4,
                fontSize: '0.72rem',
              }}
            >
              {w.multiplier}× · {w.odds} odds
            </span>
            <span style={{ color: '#e2e8f0', marginLeft: 12 }}>│</span>
          </span>
        ))}
      </div>
    </div>
  );
}
