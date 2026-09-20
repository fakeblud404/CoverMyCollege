import type { Metadata } from 'next';
import Header from '@/components/Header';
import HowItWorksSection from '@/components/HowItWorksSection';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'How It Works — AppBids',
  description: 'Learn how AppBids live auctions work: browse products, place bids, spin the Plinko multiplier, and win real prizes shipped to your door.',
};

export default function HowItWorksPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        {/* Page hero */}
        <div className="page-hero">
          <div className="section-label">How It Works</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            Winning is Simpler Than You Think
          </h1>
          <p className="section-sub">
            AppBids combines live auctions with a provably fair Plinko multiplier game.
            Here&apos;s exactly how it works — transparent, no surprises.
          </p>
        </div>

        <HowItWorksSection compact={false} />

        {/* Video placeholder */}
        <div style={{ margin: '40px 0', textAlign: 'center' }}>
          <div
            style={{
              maxWidth: 720,
              margin: '0 auto',
              aspectRatio: '16/9',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>Watch Demo (2 min)</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {/* TODO: embed demo video URL here */}
              See how a full bidding auction + Plinko multiplier round works
            </div>
          </div>
        </div>

        {/* RTP Table */}
        <section style={{ marginTop: 64 }}>
          <h2 className="section-title" style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: 8 }}>
            Plinko Multiplier Probabilities
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 28 }}>
            All probabilities are calculated server-side using cryptographic randomness.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                  {['Multiplier', 'Risk Level', 'Probability', 'Expected Value (per $100)'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { mult: '0.5×', risk: 'All', prob: '10–25%', ev: '$5–$12.50', color: '#6b7280' },
                  { mult: '1×', risk: 'Low/Med', prob: '20–25%', ev: '$20–$25', color: '#2563eb' },
                  { mult: '1.5×', risk: 'Low/Med', prob: '15–20%', ev: '$22.50–$30', color: '#2563eb' },
                  { mult: '2×', risk: 'Medium', prob: '15%', ev: '$30', color: '#2563eb' },
                  { mult: '3×', risk: 'Medium', prob: '10%', ev: '$30', color: '#2563eb' },
                  { mult: '5×', risk: 'High', prob: '7%', ev: '$35', color: '#2563eb' },
                  { mult: '10×', risk: 'High', prob: '3%', ev: '$30', color: '#2563eb' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: row.color }}>{row.mult}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{row.risk}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{row.prob}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--blue)', fontWeight: 600 }}>{row.ev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
            Theoretical RTP ≈ 97% on Medium risk. Results verified by provably fair SHA-256 seed hashing.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
