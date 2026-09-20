'use client';

import Link from 'next/link';

interface LeaderboardHeroProps {
  activeAdsCount: number;
  onStartBidding?: () => void;
}

export default function LeaderboardHero({ activeAdsCount, onStartBidding }: LeaderboardHeroProps) {
  return (
    <section
      style={{
        padding: '100px 24px 96px',
        textAlign: 'center',
        background: 'var(--white)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial glow — very gentle, Apple-style */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(0,113,227,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Live badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 16px',
            borderRadius: 100,
            background: 'rgba(29,153,84,0.08)',
            border: '1px solid rgba(29,153,84,0.2)',
            marginBottom: 28,
          }}
        >
          <span
            className="live-pulse-dot"
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--green)',
            }}
          />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--green)', letterSpacing: '0.03em' }}>
            {activeAdsCount > 0 ? `${activeAdsCount} Live Auctions` : 'Auctions Open'}
          </span>
        </div>

        {/* Display headline — Playfair Display */}
        <h1
          style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontSize: 'clamp(2.8rem, 7vw, 5.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.08,
            color: 'var(--ink)',
            margin: '0 auto 28px',
            maxWidth: 820,
          }}
        >
          Fund My College.
          <br />
          <span style={{ color: 'var(--blue)' }}>Rank #1.</span>
        </h1>

        {/* Supporting sentence */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
            color: 'var(--ink-2)',
            maxWidth: 560,
            margin: '0 auto 48px',
            lineHeight: 1.65,
            fontWeight: 400,
          }}
        >
          App creators bid for the top spot on a live leaderboard seen by thousands.
          Every dollar goes directly toward my <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>$15,000 college tuition</strong>.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 72,
          }}
        >
          {onStartBidding ? (
            <button
              className="btn-bid"
              onClick={onStartBidding}
              id="hero-start-bidding-btn"
              style={{ fontSize: '1rem', padding: '14px 36px' }}
            >
              Bid &amp; Cover My College
            </button>
          ) : (
            <Link href="/live-auctions">
              <button className="btn-bid" style={{ fontSize: '1rem', padding: '14px 36px' }}>
                Bid &amp; Cover My College
              </button>
            </Link>
          )}
          <Link href="/how-it-works">
            <button className="btn-ghost" style={{ fontSize: '1rem', padding: '14px 36px' }}>
              How It Works
            </button>
          </Link>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '40px 64px',
          }}
        >
          {[
            { value: '$6,450+', label: 'Raised For College' },
            { value: '$15,000', label: 'Tuition Goal' },
            { value: '15+', label: 'Sponsoring Apps' },
            { value: '100%', label: 'Goes To Tuition' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 'clamp(1.6rem, 3.5vw, 2rem)',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  marginBottom: 6,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', fontWeight: 500, letterSpacing: '0.03em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
