'use client';

import Link from 'next/link';

const STEPS = [
  {
    number: 1,
    title: 'Submit Your App & Bid',
    description:
      'Enter your app title, URL, description, and base bid amount. Your bid secures your spot on the live leaderboard seen by thousands of users.',
    accent: 'var(--blue)',
    accentDim: 'var(--blue-dim)',
  },
  {
    number: 2,
    title: 'Spin Plinko Multiplier',
    description:
      'Pass your bid through the provably fair Plinko drop. Hit a multiplier from 0.5x to 10x to multiply your bid power and leap up the rankings.',
    accent: 'var(--blue)',
    accentDim: 'var(--blue-dim)',
  },
  {
    number: 3,
    title: 'Fund College Tuition',
    description:
      '100% of bidding proceeds directly fund my $15,000 college degree. Track real-time progress as every bid brings us closer to graduation.',
    accent: 'var(--blue)',
    accentDim: 'var(--blue-dim)',
  },
  {
    number: 4,
    title: 'Claim Prime Visibility',
    description:
      'Top-ranked apps get featured hero placement, verified sponsor badges, direct clickthrough traffic, and massive viral brand exposure.',
    accent: 'var(--blue)',
    accentDim: 'var(--blue-dim)',
  },
];

interface HowItWorksSectionProps {
  compact?: boolean;
  onStartBidding?: () => void;
}

export default function HowItWorksSection({ compact = false, onStartBidding }: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" style={{ padding: compact ? '60px 0' : '100px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div className="section-label">How It Works</div>
        <h2 className="section-title">Promote Your App &amp; Cover My College</h2>
        <p className="section-sub">
          Simple, transparent, and high-impact — apps get top ad placements while helping a student reach their $15,000 college degree goal.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}
      >
        {STEPS.map((step) => (
          <div key={step.number} className="step-card fade-in-up">
            {/* Watermark number */}
            <div className="step-number">{step.number}</div>

            {/* Step number pill */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: step.accentDim,
                border: `1.5px solid ${step.accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: step.accent,
                marginBottom: 18,
                flexShrink: 0,
              }}
            >
              {step.number}
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.35 }}>
              {step.title}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', lineHeight: 1.7, margin: 0 }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {!compact && (
        <div style={{ textAlign: 'center', marginTop: 52 }}>
          {onStartBidding ? (
            <button className="btn-bid" onClick={onStartBidding} style={{ fontSize: '1rem', padding: '14px 36px' }}>
              Start Bidding Now
            </button>
          ) : (
            <Link href="/live-auctions">
              <button className="btn-bid" style={{ fontSize: '1rem', padding: '14px 36px' }}>
                Browse Live Auctions
              </button>
            </Link>
          )}
          <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)', marginTop: 14 }}>
            <Link href="/responsible-gaming" style={{ color: 'var(--ink-3)', textDecoration: 'underline' }}>
              Responsible gaming policy
            </Link>
            {' · '}
            <Link href="/faq" style={{ color: 'var(--ink-3)', textDecoration: 'underline' }}>
              FAQ
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
