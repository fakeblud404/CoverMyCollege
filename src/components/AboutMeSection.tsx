'use client';

interface AboutMeSectionProps {
  onBidClick?: () => void;
}

export default function AboutMeSection({ onBidClick }: AboutMeSectionProps) {
  return (
    <section
      id="about-me"
      style={{
        padding: '80px 0',
        position: 'relative',
      }}
      aria-label="About Airy"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(180px, 220px) 1fr',
          gap: 64,
          alignItems: 'center',
        }}
        className="about-grid"
      >
        {/* Left: Photo */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 180,
              height: 180,
              margin: '0 auto 20px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
              background: 'var(--off-white)',
            }}
          >
            <img
              src="/airy.png"
              alt="Airy - Computer Engineering Student"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ink)', marginBottom: 4 }}>Airy</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--ink-3)' }}>Computer Engineering Student</div>
        </div>

        {/* Right: Story */}
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--blue)',
              marginBottom: 14,
            }}
          >
            About Me &amp; My Mission
          </div>

          <h2
            style={{
              margin: '0 0 20px',
              fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
              lineHeight: 1.25,
            }}
          >
            Hi, I&apos;m Airy — Final Year Computer Engineering Student
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: 'var(--ink-2)',
              lineHeight: 1.75,
              margin: '0 0 16px',
            }}
          >
            I am currently completing my Computer Engineering degree and am almost in my final year.
            Throughout my studies, my parents sacrificed so much to support my education. My main goal is to{' '}
            <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>
              repay the money spent on my degree by my parents ($15,000 total)
            </strong>.
          </p>

          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--ink-3)',
              lineHeight: 1.7,
              margin: '0 0 28px',
            }}
          >
            By creating Cover My College, app developers and founders get top-ranked advertisement exposure on our live leaderboard, while every single bid goes directly toward helping me pay back my parents for my degree.
          </p>

          {/* Info tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {[
              { label: 'Degree', value: 'Computer Engineering' },
              { label: 'Status', value: 'Final Year Student' },
              { label: 'Mission', value: 'Repay Parents ($15,000)', highlight: true },
            ].map(tag => (
              <div
                key={tag.label}
                style={{
                  background: tag.highlight ? 'var(--green-dim)' : 'var(--off-white)',
                  border: `1px solid ${tag.highlight ? 'rgba(29,153,84,0.2)' : 'var(--border)'}`,
                  padding: '7px 14px',
                  borderRadius: 10,
                  fontSize: '0.82rem',
                  color: tag.highlight ? 'var(--green)' : 'var(--ink)',
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                <span style={{ fontWeight: 700 }}>{tag.label}:</span> {tag.value}
              </div>
            ))}

            {onBidClick && (
              <button
                onClick={onBidClick}
                className="btn-bid"
                style={{ padding: '9px 20px', fontSize: '0.88rem', minHeight: 38, marginLeft: 'auto' }}
              >
                Support Airy &amp; Bid
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 640px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            text-align: center;
          }
          .about-grid > div:last-child {
            text-align: left;
          }
        }
      `}</style>
    </section>
  );
}
