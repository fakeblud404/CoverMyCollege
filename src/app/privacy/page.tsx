import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — AppBids',
  description: 'AppBids Privacy Policy — learn how we collect, use, and protect your personal information.',
};

const year = new Date().getFullYear();

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <div className="section-label"> Privacy</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginTop: 12 }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Last updated: September {year} · Effective immediately
          </p>
        </div>

        {[
          {
            title: '1. Information We Collect',
            content: `We collect personal information you provide to us when creating an account, placing a bid, or contacting support. This includes your name, email address, shipping address, payment information (processed via Stripe), and KYC identity verification details. We also collect usage data such as IP address, browser type, and auction activity.`,
          },
          {
            title: '2. How We Use Your Information',
            content: `We use your information to: (a) operate and improve the Platform; (b) process bids, Plinko drops, and payment transactions; (c) verify your identity and age (18+ requirement); (d) ship won items to your address; (e) enforce responsible gaming limits and self-exclusions; (f) prevent fraud and unauthorized access.`,
          },
          {
            title: '3. Data Sharing & Third Parties',
            content: `We do not sell your personal data. We share information only with trusted third-party service providers necessary to operate AppBids: (a) Stripe for payment processing; (b) Firebase for secure data storage; (c) shipping carriers for prize delivery; (d) KYC providers for age and identity verification. All third parties are obligated to keep your data secure.`,
          },
          {
            title: '4. Data Security',
            content: `We implement industry-standard 256-bit SSL encryption, secure access controls, and regular security audits. Payment details are handled directly by Stripe and are never stored on our servers.`,
          },
          {
            title: '5. Responsible Gaming & Self-Exclusion Data',
            content: `If you set responsible gaming limits or self-exclude, this data is strictly processed to enforce your request. During self-exclusion, all promotional communications to your email/phone will be immediately blocked.`,
          },
          {
            title: '6. Cookies and Analytics',
            content: `We use cookies and similar technologies to maintain user sessions, remember preferences, and analyze site traffic. You can disable cookies in your browser settings, though some platform features may not function properly.`,
          },
          {
            title: '7. Your Rights',
            content: `You have the right to access, update, or request deletion of your personal data at any time. You can export your bidding history or request account deletion by contacting support.`,
          },
          {
            title: '8. Contact Us',
            content: `For any privacy-related questions or data requests, please contact our Data Protection Officer at support@covermycollege.com or via our support page.`,
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
          Questions about your privacy? Email us at{' '}
          <a href="mailto:support@covermycollege.com" style={{ color: 'var(--accent-blue)' }}>support@covermycollege.com</a>.
        </div>
      </main>

      <Footer />
    </div>
  );
}
