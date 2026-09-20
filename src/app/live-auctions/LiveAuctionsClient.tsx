'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import LeaderboardEntry from '@/components/LeaderboardEntry';
import BidModal from '@/components/BidModal';
import Footer from '@/components/Footer';
import BigPlinkoWinners from '@/components/BigPlinkoWinners';
import type { Ad, Category } from '@/lib/types';

export default function LiveAuctionsClient() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [category, setCategory] = useState<Category>('All');
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      const res = await fetch(`/api/ads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAds((data.ads as Ad[]) || []);
      }
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, [category]);

  useEffect(() => {
    fetchAds();
    // TODO: BACKEND — replace with WebSocket / SSE for real-time updates
    const interval = setInterval(fetchAds, 30000);
    return () => clearInterval(interval);
  }, [fetchAds]);

  const filtered = category === 'All' ? ads : ads.filter(a => a.category === category);
  const topBid = filtered[0]?.finalBid;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onPlaceBid={() => setBidModalOpen(true)} />
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <BigPlinkoWinners />
      </div>

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        {/* Page Hero */}
        <div className="page-hero" style={{ padding: '40px 0 32px', textAlign: 'left', maxWidth: '100%', margin: 0 }}>
          <div className="section-label">Live Now</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
            Live Auctions
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
              {filtered.length} active auctions · Real-time updates
            </p>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span
                className="live-pulse-dot"
                style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)' }}
              />
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <CategoryFilter selected={category} onSelect={setCategory} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 80 }}>
          {loading && filtered.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: 82, borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)', animation: 'pulse 2s ease-in-out infinite' }} />
            ))
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontWeight: 600 }}>No auctions in this category yet</div>
              <div style={{ fontSize: '0.85rem', marginTop: 6 }}>Be the first to start one!</div>
            </div>
          ) : (
            filtered.map((ad, i) => (
              <LeaderboardEntry key={ad.id} ad={ad} rank={i + 1} onBid={() => setBidModalOpen(true)} />
            ))
          )}
        </div>
      </main>

      <Footer />
      <BidModal isOpen={bidModalOpen} onClose={() => setBidModalOpen(false)} onBidPlaced={fetchAds} />
    </div>
  );
}
