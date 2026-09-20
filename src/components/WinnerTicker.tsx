'use client';

import { useState, useEffect } from 'react';

interface WinnerItem {
  name: string;
  item: string;
  amount: string;
  emoji: string;
}

export default function WinnerTicker() {
  const [winners, setWinners] = useState<WinnerItem[]>([]);

  useEffect(() => {
    async function loadWinners() {
      try {
        const res = await fetch('/api/winners');
        if (res.ok) {
          const data = await res.json();
          if (data.winners && data.winners.length > 0) {
            setWinners(
              data.winners.map((w: any) => ({
                name: w.name,
                item: w.item,
                amount: w.amountDisplay,
                emoji: w.avatarEmoji || '',
              }))
            );
          }
        }
      } catch { /* Silent */ }
    }
    loadWinners();
  }, []);

  if (winners.length === 0) {
    return null; // Don't render ticker if there are no real winners yet
  }

  // Duplicate list for seamless infinite scroll
  const items = [...winners, ...winners];

  return (
    <div className="winner-ticker-wrap" role="marquee" aria-label="Recent winners">
      <div className="winner-ticker-inner">
        {items.map((w, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginRight: 48,
              fontSize: '0.82rem',
              color: '#d1fae5',
            }}
          >
            <span>{w.emoji}</span>
            <span style={{ fontWeight: 600, color: '#6ee7b7' }}>{w.name}</span>
            <span style={{ color: '#a7f3d0' }}>just won</span>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>{w.item}</span>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '100px',
                padding: '1px 8px',
                fontWeight: 700,
                color: '#34d399',
              }}
            >
              {w.amount}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
