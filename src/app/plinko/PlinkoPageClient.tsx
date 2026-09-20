'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlinkoStandaloneGame from '@/components/PlinkoStandaloneGame';
import Link from 'next/link';

export default function PlinkoPageClient() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onPlaceBid={() => {}} />

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Plinko</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: 8 }}>
            Provably Fair Plinko
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 600, lineHeight: 1.6, margin: 0 }}>
            Drop the ball. Land a multiplier. Every result is cryptographically verifiable.
            Set your risk level, choose rows, and play responsibly.
          </p>
        </div>

        {/* Responsible gaming top banner */}
        <div className="rg-banner" style={{ marginBottom: 28 }}>
          <div>
            <strong>18+ only.</strong> Plinko involves real-money risk. Please set{' '}
            <Link href="/responsible-gaming" style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
              deposit and loss limits
            </Link>{' '}
            before you play. Need help?{' '}
            <a href="tel:9152987821" style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
              iCall: 9152987821
            </a>
          </div>
        </div>

        {/* Game */}
        <PlinkoStandaloneGame realityCheckInterval={30} />

        {/* Rules + RTP section */}
        <section style={{ marginTop: 56 }}>
          <hr className="section-divider" style={{ margin: '0 0 40px' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 20 }}>Game Rules & RTP</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                title: 'Rules',
                content: [
                  'Select risk level: Low, Medium, or High',
                  'Choose number of rows (8–16)',
                  'Drop the ball — it bounces through pegs and lands in a multiplier slot',
                  'Your payout = wager × multiplier',
                  'All results are determined server-side before the drop animation',
                ],
              },
              {
                title: 'Provably Fair',
                content: [
                  'Server generates a random seed before each drop',
                  'You see the SHA-256 hash of the seed before dropping',
                  'After the drop, the seed is revealed',
                  'You can verify: SHA256(seed) == displayed hash',
                  'Use any online SHA-256 tool to verify',
                ],
              },
              {
                title: 'Responsible Gaming',
                content: [
                  'Set daily, weekly, and monthly deposit limits',
                  'Set loss limits to cap your losses',
                  'Reality checks pop up every 30 minutes',
                  'Self-exclusion and cooling-off periods available',
                  '18+ only. KYC verification required for real-money play',
                ],
              },
            ].map(section => (
              <div
                key={section.title}
                style={{
                  padding: '20px',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}
              >
                <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem' }}>{section.title}</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {section.content.map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--accent-green)', flexShrink: 0 }}></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Helplines */}
        <section
          style={{
            marginTop: 40,
            padding: '24px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <h3 style={{ fontWeight: 700, marginBottom: 12, color: 'var(--accent-red)', fontSize: '0.95rem' }}>
             Problem Gambling Resources
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {[
              { name: 'iCall (World)', contact: '9152987821', type: 'phone' },
              { name: 'NIMHANS', contact: '080-46110007', type: 'phone' },
              { name: 'BeGambleAware', contact: 'https://www.begambleaware.org', type: 'url' },
              { name: 'GamCare', contact: 'https://www.gamcare.org.uk', type: 'url' },
            ].map(r => (
              <div key={r.name} style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{r.name}: </span>
                {r.type === 'phone' ? (
                  <a href={`tel:${r.contact}`} style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{r.contact}</a>
                ) : (
                  <a href={r.contact} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{r.contact} ↗</a>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
