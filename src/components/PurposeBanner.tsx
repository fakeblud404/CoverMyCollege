'use client';

interface PurposeBannerProps {
  onReadStoryClick?: () => void;
}

export default function PurposeBanner({ onReadStoryClick }: PurposeBannerProps) {
  const scrollToAbout = () => {
    const el = document.getElementById('about-me');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (onReadStoryClick) {
      onReadStoryClick();
    }
  };

  return (
    <section
      style={{
        margin: '0 0 0',
        padding: '48px 40px',
        background: 'var(--off-white)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 28,
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--blue)',
              marginBottom: 10,
            }}
          >
            Dual Purpose Mission
          </div>
          <h2
            style={{
              margin: '0 0 10px',
              fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
              fontWeight: 700,
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
            }}
          >
            Promote Your App &amp; Fund My $15,000 College Tuition
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '0.95rem',
              color: 'var(--ink-2)',
              lineHeight: 1.65,
              maxWidth: 680,
            }}
          >
            <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>Cover My College</strong> is a win-win platform: app developers bid for prime #1 leaderboard visibility, while 100% of proceeds directly fund my college degree.
          </p>
        </div>

        <button
          onClick={scrollToAbout}
          className="btn-ghost"
          style={{ padding: '11px 24px', fontSize: '0.9rem', flexShrink: 0 }}
        >
          Read Full Story
          <span style={{ opacity: 0.5, marginLeft: 4 }}>↓</span>
        </button>
      </div>
    </section>
  );
}
