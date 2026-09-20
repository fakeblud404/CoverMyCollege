'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import LeaderboardEntry from '@/components/LeaderboardEntry';
import RecentMultipliersTicker from '@/components/RecentMultipliersTicker';
import BidModal from '@/components/BidModal';
import LeaderboardHero from '@/components/LeaderboardHero';
import TuitionProgressTracker from '@/components/TuitionProgressTracker';
import PurposeBanner from '@/components/PurposeBanner';
import AboutMeSection from '@/components/AboutMeSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQAccordion from '@/components/FAQAccordion';
import Footer from '@/components/Footer';
import type { Ad, Category } from '@/lib/types';

export default function HomePage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [category, setCategory] = useState<Category>('All');
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      const res = await fetch(`/api/ads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAds((data.ads as Ad[]) ?? []);
      }
    } catch {
      // Keep whatever was previously displayed
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchAds();
    const interval = setInterval(fetchAds, 30000);
    return () => clearInterval(interval);
  }, [fetchAds]);

  const filteredAds = category === 'All' ? ads : ads.filter((a) => a.category === category);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.4s ease' }}>
      {/* Progress bar — sits directly under header */}
      <TuitionProgressTracker onBidClick={() => setBidModalOpen(true)} />

      <Header onPlaceBid={() => setBidModalOpen(true)} />

      <main style={{ flex: 1, maxWidth: 1080, margin: '0 auto', width: '100%', padding: '0 24px' }}>
        {/* Hero */}
        <LeaderboardHero activeAdsCount={filteredAds.length} onStartBidding={() => setBidModalOpen(true)} />

        {/* Purpose banner */}
        <PurposeBanner />

        {/* Category Filter */}
        <div style={{ paddingTop: 40 }}>
          <CategoryFilter selected={category} onSelect={setCategory} />
        </div>

        {/* Live Auctions label */}
        <div style={{ marginBottom: 20, marginTop: 8 }}>
          <div className="section-label">Live Auctions</div>
        </div>

        {/* Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 32 }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 80,
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--off-white)',
                  border: '1px solid var(--border)',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            ))
          ) : filteredAds.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: 'var(--off-white)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, color: 'var(--ink)' }}>
                No bids yet{category !== 'All' ? ` in ${category}` : ''}
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: 28, color: 'var(--ink-3)' }}>
                Be the first to place a bid and claim the top spot on the leaderboard.
              </div>
              <button
                className="btn-bid"
                onClick={() => setBidModalOpen(true)}
                style={{ padding: '14px 32px', fontSize: '1rem' }}
              >
                Place the First Bid
              </button>
            </div>
          ) : (
            filteredAds.map((ad, index) => (
              <LeaderboardEntry
                key={ad.id}
                ad={ad}
                rank={index + 1}
                onBid={() => setBidModalOpen(true)}
              />
            ))
          )}
        </div>

        <hr className="section-divider" />

        {/* About Me */}
        <AboutMeSection onBidClick={() => setBidModalOpen(true)} />

        <hr className="section-divider" />

        {/* How It Works */}
        <HowItWorksSection onStartBidding={() => setBidModalOpen(true)} />

        <hr className="section-divider" />

        {/* Testimonials */}
        <TestimonialsSection />

        <hr className="section-divider" />

        {/* FAQ */}
        <section style={{ padding: '80px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-sub">Everything you need to know about bidding, Plinko, and winning.</p>
          </div>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <FAQAccordion limit={6} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <a href="/faq" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
              View all FAQs &rarr;
            </a>
          </div>
        </section>

        <hr className="section-divider" />

        {/* Support */}
        <section style={{ padding: '60px 0 80px', textAlign: 'center' }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Support</div>
          <h2 className="section-title" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)' }}>Need Help?</h2>
          <p className="section-sub" style={{ marginBottom: 32 }}>
            Our support team is available 7 days a week. Average response time: 2 hours.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/support">
              <button className="btn-primary" id="support-contact-btn" style={{ minHeight: 48, padding: '13px 28px' }}>Contact Support</button>
            </a>
            <a href="/faq">
              <button className="btn-ghost" id="support-faq-btn" style={{ minHeight: 48, padding: '13px 28px' }}>Browse FAQ</button>
            </a>
          </div>
        </section>
      </main>

      {/* Fixed Winners Ticker at bottom */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90 }}>
        <RecentMultipliersTicker />
      </div>

      {/* Footer */}
      <div style={{ paddingBottom: 80 }}>
        <Footer />
      </div>

      {/* Bid Modal */}
      <BidModal
        isOpen={bidModalOpen}
        onClose={() => setBidModalOpen(false)}
        onBidPlaced={fetchAds}
      />
    </div>
  );
}
