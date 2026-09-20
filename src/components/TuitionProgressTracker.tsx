'use client';

import { useState, useEffect } from 'react';

interface TuitionProgressTrackerProps {
  targetAmount?: number;
  onBidClick?: () => void;
}

export default function TuitionProgressTracker({
  targetAmount = 15000,
  onBidClick,
}: TuitionProgressTrackerProps) {
  const [currentAmount, setCurrentAmount] = useState(0);
  const [animatedAmount, setAnimatedAmount] = useState(0);
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setCurrentAmount((data.totalRaisedCents ?? 0) / 100);
          setStatsLoaded(true);
        }
      } catch {
        if (!cancelled) setStatsLoaded(true);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const increment = currentAmount / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= currentAmount) {
        setAnimatedAmount(currentAmount);
        clearInterval(timer);
      } else {
        setAnimatedAmount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [currentAmount]);

  const percentage = Math.min(100, (animatedAmount / targetAmount) * 100);

  return (
    <section
      style={{
        padding: '16px 24px',
        background: 'var(--off-white)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
      }}
      aria-label="College Tuition Funding Progress"
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        {/* Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--blue)',
              display: 'inline-block',
              animation: 'pulse 1.8s infinite',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
            }}
          >
            College Tuition Goal
          </span>
        </div>

        {/* Progress bar — takes remaining space */}
        <div style={{ flex: 1, minWidth: 120, position: 'relative' }}>
          <div
            style={{
              height: 6,
              background: 'rgba(0,0,0,0.1)',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percentage}%`,
                background: 'var(--ink)',
                borderRadius: 3,
                transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
        </div>

        {/* Amounts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {statsLoaded ? (
            <span style={{ fontSize: '0.88rem', color: 'var(--ink)', fontWeight: 700 }}>
              <span style={{ color: 'var(--blue)' }}>${animatedAmount.toLocaleString()}</span>
              <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>
                {' '}/ ${targetAmount.toLocaleString()}
              </span>
            </span>
          ) : (
            <div
              style={{
                width: 100,
                height: 14,
                borderRadius: 4,
                background: 'rgba(0,0,0,0.08)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          )}

          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--green)',
              background: 'var(--green-dim)',
              border: '1px solid rgba(29,153,84,0.2)',
              padding: '2px 10px',
              borderRadius: 100,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}
          >
            {percentage.toFixed(1)}% Funded
          </span>

          {onBidClick && (
            <button
              onClick={onBidClick}
              style={{
                padding: '5px 16px',
                borderRadius: 100,
                border: 'none',
                background: 'var(--ink)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                transition: 'background 0.18s',
              }}
            >
              Contribute
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
