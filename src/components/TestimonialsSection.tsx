'use client';

const TESTIMONIALS = [
  {
    name: 'Jessica M.',
    location: 'New York',
    initials: 'JM',
    avatarColor: '#dbeafe',
    avatarText: '#1d4ed8',
    stars: 5,
    quote:
      "I won an iPhone 15 Pro for $420 — couldn't believe it! The countdown was intense and the Plinko multiplier gave me a 3x boost. Delivery was in 3 days. Will be back for the MacBook auction!",
    item: 'Won iPhone 15 Pro',
    badge: 'Verified Winner',
  },
  {
    name: 'Michael S.',
    location: 'Austin',
    initials: 'MS',
    avatarColor: '#dcfce7',
    avatarText: '#15803d',
    stars: 5,
    quote:
      "Super transparent — you can see every bid live. I liked that the Plinko game is provably fair with a hash I could verify. Got a 5x multiplier and jumped to #1 with just $150.",
    item: 'Won Sony WH-1000XM5',
    badge: 'Verified Bidder',
  },
  {
    name: 'Sarah J.',
    location: 'Chicago',
    initials: 'SJ',
    avatarColor: '#fef3c7',
    avatarText: '#92400e',
    stars: 5,
    quote:
      "Love the responsible gaming tools — I set a weekly limit and the app actually respects it. No tricks. Got outbid twice but won on the third try. The sticky Bid button on mobile is super convenient.",
    item: 'Won Dell XPS 15',
    badge: 'Responsible Bidder',
  },
];

export default function TestimonialsSection() {
  return (
    <section style={{ padding: '100px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div className="section-label">Testimonials</div>
        <h2 className="section-title">What Winners Are Saying</h2>
        <p className="section-sub">
          Real stories from real winners. Join thousands of happy bidders worldwide.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="testimonial-card">
            {/* Star rating — text characters, no emoji */}
            <div
              style={{
                display: 'flex',
                gap: 2,
                marginBottom: 16,
                color: '#f59e0b',
                fontSize: '0.95rem',
                letterSpacing: '0.05em',
              }}
            >
              {'★'.repeat(t.stars)}
            </div>

            {/* Quote */}
            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--ink-2)',
                lineHeight: 1.75,
                margin: '0 0 24px',
                fontStyle: 'italic',
              }}
            >
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Author row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Initials avatar */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: t.avatarColor,
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: t.avatarText,
                  flexShrink: 0,
                  letterSpacing: '0.02em',
                }}
              >
                {t.initials}
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{t.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)' }}>{t.location}</div>
              </div>

              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '0.72rem',
                    padding: '3px 10px',
                    borderRadius: 100,
                    background: 'var(--green-dim)',
                    border: '1px solid rgba(29,153,84,0.2)',
                    color: 'var(--green)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    marginBottom: 4,
                  }}
                >
                  {t.badge}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>{t.item}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
