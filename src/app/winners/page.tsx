'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatDistanceToNow } from 'date-fns';

interface WinnerEntry {
  id: string;
  name: string;
  avatarEmoji: string;
  item: string;
  amountDisplay: string;
  category: string;
  multiplier: number;
  bigWin: string;
  date: string;
  url: string;
}

interface PlinkoEntry {
  name: string;
  multiplier: string;
  amountDisplay: string;
}

interface MostWinsEntry {
  name: string;
  wins: number;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  AI: '', SEO: '', Crypto: '₿', SaaS: '️',
  Marketing: '', 'Dev Tools': '', Finance: '',
  'E-Commerce': '️', Other: '',
};

function SkeletonRow() {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 20px',
        background: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 'var(--radius-lg, 16px)',
        animation: 'pulse 2s ease-in-out infinite',
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.07)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ width: '40%', height: 14, borderRadius: 6, background: 'rgba(0,0,0,0.07)' }} />
        <div style={{ width: '60%', height: 11, borderRadius: 6, background: 'rgba(0,0,0,0.05)' }} />
      </div>
      <div style={{ width: 70, height: 22, borderRadius: 6, background: 'rgba(0,0,0,0.07)' }} />
    </div>
  );
}

export default function WinnersPage() {
  const [winners, setWinners] = useState<WinnerEntry[]>([]);
  const [plinkoLeaderboard, setPlinkoLeaderboard] = useState<PlinkoEntry[]>([]);
  const [mostWins, setMostWins] = useState<MostWinsEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWinners() {
      try {
        const res = await fetch('/api/winners');
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        setWinners(data.winners ?? []);
        setPlinkoLeaderboard(data.plinkoLeaderboard ?? []);
        setMostWins(data.mostWins ?? []);
      } catch {
        // Silently fail — show empty states
      } finally {
        setLoading(false);
      }
    }
    fetchWinners();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        {/* Hero */}
        <div className="page-hero" style={{ padding: '40px 0 32px', maxWidth: '100%', margin: 0, textAlign: 'left' }}>
          <div className="section-label">Winners</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
            Recent Winners
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Real bidders, live on the leaderboard — every entry funds a college education.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
          {/* Main winners list */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : winners.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                    No winners yet!
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: 24 }}>
                    Be the first to bid and claim your spot at the top.
                  </div>
                  <a href="/">
                    <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                      Place a Bid Now
                    </button>
                  </a>
                </div>
              ) : (
                winners.map((w, i) => (
                  <div
                    key={w.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '16px 20px',
                      background: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                      border: `1px solid ${i === 0 ? 'rgba(217,119,6,0.25)' : 'rgba(0,0,0,0.08)'}`,
                      borderRadius: 'var(--radius-lg, 16px)',
                      boxShadow: i === 0 ? '0 0 24px rgba(217,119,6,0.12)' : '0 4px 16px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Rank */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span
                        style={{
                          width: 28, textAlign: 'center', fontWeight: 800,
                          color: i === 0 ? '#d97706' : '#94a3b8', fontSize: '0.85rem',
                        }}
                      >
                        #{i + 1}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>{w.name}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {w.url ? (
                          <a href={w.url} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                            {w.item} ↗
                          </a>
                        ) : (
                          <strong style={{ color: '#0f172a' }}>{w.item}</strong>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {formatDistanceToNow(new Date(w.date), { addSuffix: true })}
                        </span>
                        <span className="badge badge-category" style={{ fontSize: '0.62rem' }}>{w.category}</span>
                      </div>
                    </div>

                    {/* Amount + Multiplier */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: '1.05rem', fontWeight: 800,
                        color: i === 0 ? '#d97706' : 'var(--text-primary)',
                      }}>
                        {w.amountDisplay}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>
                        Multiplier: {w.bigWin}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar leaderboards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Biggest Plinko wins */}
            <div
              style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(217,119,6,0.2)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
                Biggest Plinko Win — All Time
              </div>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ height: 28, borderRadius: 6, background: 'rgba(0,0,0,0.06)', marginBottom: 8, animation: 'pulse 2s ease-in-out infinite' }} />
                ))
              ) : plinkoLeaderboard.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No wins recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plinkoLeaderboard.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 800, color: i === 0 ? 'var(--blue)' : 'var(--text-muted)', width: 20, textAlign: 'center', fontSize: '0.85rem' }}>
                        #{i + 1}
                      </span>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{p.name}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: 'rgba(37,99,235,0.1)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.25)' }}>
                        {p.multiplier}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--blue)' }}>{p.amountDisplay}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Most bids placed */}
            <div
              style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(37,99,235,0.15)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
                Most Bids Placed
              </div>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ height: 28, borderRadius: 6, background: 'rgba(0,0,0,0.06)', marginBottom: 8, animation: 'pulse 2s ease-in-out infinite' }} />
                ))
              ) : mostWins.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No data yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mostWins.map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 800, color: i === 0 ? 'var(--blue)' : 'var(--text-muted)', width: 20, textAlign: 'center', fontSize: '0.85rem' }}>
                        #{i + 1}
                      </span>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{u.name}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--blue)', fontWeight: 700 }}>{u.wins} bid{u.wins !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 12, fontStyle: 'italic' }}>
                Bid more to climb the leaderboard!
              </p>
            </div>

            {/* CTA */}
            <a href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-bid" style={{ width: '100%', fontSize: '0.95rem', minHeight: 48 }}>
                 Fund College via Bidding
              </button>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
