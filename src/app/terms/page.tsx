import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service — AppBids',
  description: 'AppBids Terms of Service — read our terms for live auctions, Plinko, payments, and responsible gaming.',
};

const year = new Date().getFullYear();

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <div className="section-label"> Legal</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginTop: 12 }}>
            Terms of Service
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Last updated: September {year} · Effective immediately
          </p>
        </div>

        {[
          {
            title: '1. Acceptance of Terms',
            content: `By accessing or using AppBids ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, you may not use the Platform. You must be at least 18 years of age to use any real-money features of the Platform.`,
          },
          {
            title: '2. Eligibility',
            content: `You must be 18 years or older to participate in paid auctions or Plinko games. We reserve the right to request proof of age (KYC) at any time. Users found to be underage will be immediately suspended and any winnings forfeited. The Platform is available only in jurisdictions where online auction bidding and skill-based games are lawful.`,
          },
          {
            title: '3. Auctions & Bidding',
            content: `All bids are final. A bid constitutes a binding offer to purchase the item at your final bid price (base bid × Plinko multiplier) if you win. Payment is charged at the time of bidding. Winning bidders will be notified by email and must confirm their shipping address within 48 hours. Unclaimed prizes after 7 days will be forfeited.`,
          },
          {
            title: '4. Plinko Game',
            content: `The Plinko multiplier game is a provably fair, server-determined random outcome. The result is cryptographically committed before each drop using SHA-256 hashing. The theoretical return-to-player (RTP) is approximately 97% on Medium risk. Past results do not predict future outcomes. AppBids does not guarantee any specific payout.`,
          },
          {
            title: '5. Platform Fee',
            content: `AppBids charges a 5% platform fee on the base bid amount. This fee is non-refundable and is deducted before processing. The Plinko multiplier applies to your base bid only — fees are not multiplied.`,
          },
          {
            title: '6. Payments & Refunds',
            content: `All payments are processed securely via Stripe. We accept credit/debit cards, UPI, and NetBanking. Refunds are issued only in cases of platform error or item unavailability. Refunds for losing bids are not issued. Disputed charges must be reported within 30 days.`,
          },
          {
            title: '7. Responsible Gaming',
            content: `AppBids is committed to responsible gaming. We provide deposit limits, loss limits, session time limits, reality checks, cooling-off periods, and self-exclusion tools. By using the Platform, you agree to use these tools if you feel your bidding may be becoming a problem. We reserve the right to enforce limits on your behalf if we detect signs of problem gambling.`,
          },
          {
            title: '8. Prohibited Activities',
            content: `You may not: (a) use bots, scripts, or automation to place bids; (b) create multiple accounts to circumvent limits; (c) attempt to manipulate auction outcomes; (d) use the Platform for money laundering or fraudulent activity; (e) sell or transfer your account. Violations may result in immediate suspension and forfeiture of all winnings.`,
          },
          {
            title: '9. Intellectual Property',
            content: `All content on the Platform, including but not limited to software, text, graphics, logos, and auction listings, is owned by or licensed to AppBids. You may not copy, reproduce, or redistribute any content without our prior written consent.`,
          },
          {
            title: '10. Limitation of Liability',
            content: `To the maximum extent permitted by law, AppBids is not liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including losses from bids, Plinko outcomes, or technical failures. Our total liability to you shall not exceed the amount you paid to us in the preceding 30 days.`,
          },
          {
            title: '11. Changes to Terms',
            content: `We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms. Material changes will be notified via email or in-app notice with at least 7 days notice.`,
          },
          {
            title: '12. Governing Law',
            content: `These Terms are governed by the laws of World. Any disputes shall be resolved by binding arbitration in Mumbai, Maharashtra, World, in accordance with the Arbitration and Conciliation Act, 1996.`,
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
              {section.title}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
              {section.content}
            </p>
          </div>
        ))}

        <div
          style={{
            marginTop: 48,
            padding: '20px',
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: 'var(--radius-xl)',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          Questions about these Terms? Contact us at{' '}
          <a href="mailto:support@covermycollege.com" style={{ color: 'var(--accent-blue)' }}>support@covermycollege.com</a>
          {' or visit '}
          <a href="/support" style={{ color: 'var(--accent-blue)' }}>our support page</a>.
        </div>
      </main>

      <Footer />
    </div>
  );
}
