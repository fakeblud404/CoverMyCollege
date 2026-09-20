import type { Metadata } from 'next';
import Header from '@/components/Header';
import FAQAccordion from '@/components/FAQAccordion';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ — AppBids',
  description: 'Frequently asked questions about AppBids live auctions, Plinko game, payments, responsible gaming, and account management.',
};

export default function FAQPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 860, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        <div className="page-hero" style={{ padding: '40px 0 32px', maxWidth: '100%', margin: 0, textAlign: 'left' }}>
          <div className="section-label"> FAQ</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Can&apos;t find what you&apos;re looking for?{' '}
            <Link href="/support" style={{ color: 'var(--accent-blue)' }}>Contact our support team →</Link>
          </p>
        </div>

        <FAQAccordion showCategories />

        <div
          style={{
            marginTop: 48,
            padding: '24px',
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Still have questions?</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Our support team responds within 2 hours.</div>
          </div>
          <Link href="/support">
            <button className="btn-primary" style={{ minHeight: 44 }}> Contact Support</button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
