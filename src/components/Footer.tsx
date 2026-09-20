'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* Top grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 48,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 14 }}>
              <img src="/logo-transparent.png" alt="AppBids" style={{ height: 24, objectFit: 'contain' }} />
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-3)', lineHeight: 1.7, margin: '0 0 20px' }}>
              Cover My College — Apps bid to rank #1 on the leaderboard while 100% of proceeds fund a $15,000 college tuition goal.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span className="ssl-badge">SSL Secured</span>
              <span className="payment-icon">Stripe</span>
              <span className="payment-icon">UPI</span>
              <span className="payment-icon">NetBanking</span>
            </div>
          </div>

          {/* Auctions */}
          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>
              Auctions
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/live-auctions" className="footer-link">Live Auctions</Link>
              <Link href="/winners" className="footer-link">Recent Winners</Link>
              <Link href="/how-it-works" className="footer-link">How It Works</Link>
              <Link href="/plinko" className="footer-link">Plinko Game</Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>
              Support
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/faq" className="footer-link">FAQ</Link>
              <Link href="/support" className="footer-link">Contact Support</Link>
              <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@covermycollege.com'}`} className="footer-link">
                support@covermycollege.com
              </a>
            </nav>
          </div>

          {/* Responsible Gaming */}
          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>
              Responsible Gaming
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/responsible-gaming" className="footer-link">Set Your Limits</Link>
              <Link href="/responsible-gaming#self-exclusion" className="footer-link">Self-Exclusion</Link>
              <a href="tel:9152987821" className="footer-link" style={{ color: 'var(--blue)' }}>
                iCall: 9152987821
              </a>
              <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="footer-link">
                BeGambleAware
              </a>
            </nav>
          </div>
        </div>

        {/* Responsible gaming disclaimer */}
        <div
          style={{
            padding: '16px 20px',
            background: 'rgba(0,113,227,0.05)',
            border: '1px solid rgba(0,113,227,0.12)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 28,
            fontSize: '0.8rem',
            color: 'var(--ink-3)',
            lineHeight: 1.65,
          }}
        >
          <strong style={{ color: 'var(--blue)' }}>18+ Only.</strong> AppBids involves real-money bidding. Please bid responsibly. Set limits before you start. If you feel your bidding is a problem, call iCall at{' '}
          <strong>9152987821</strong> or visit{' '}
          <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', textDecoration: 'underline' }}>
            BeGambleAware.org
          </a>.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            paddingTop: 24,
            borderTop: '1px solid var(--border)',
          }}
        >
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-3)', margin: 0 }}>
            {year} AppBids. All rights reserved.
          </p>
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <Link href="/terms" className="footer-link">Terms of Service</Link>
            <Link href="/privacy" className="footer-link">Privacy Policy</Link>
            <Link href="/responsible-gaming" className="footer-link">Responsible Gaming</Link>
            <Link href="/faq" className="footer-link">FAQ</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
