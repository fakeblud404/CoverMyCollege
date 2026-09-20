'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const QUICK_LINKS = [
  { q: 'How does the auction work?', href: '/faq#0' },
  { q: 'Is the Plinko game fair?', href: '/faq#2' },
  { q: 'What payment methods are accepted?', href: '/faq#4' },
  { q: 'What happens after I win?', href: '/faq#6' },
  { q: 'How do I set limits?', href: '/faq#7' },
];

export default function SupportClient() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    // TODO: BACKEND — POST to /api/support or send email via Resend/SendGrid
    await new Promise(r => setTimeout(r, 800)); // simulate
    setSubmitted(true);
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onPlaceBid={() => {}} />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div className="section-label"> Support</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginTop: 12 }}>
            How Can We Help?
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Average response time: <strong style={{ color: '#0f172a' }}>2 hours</strong> · Available 7 days a week
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          {/* Contact form */}
          <div
            style={{
              padding: '28px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            }}
          >
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}></div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>Ticket Submitted!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  We&apos;ve received your message and will reply to <strong>{form.email}</strong> within 2 hours.
                  Check your spam folder if you don&apos;t hear from us.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setSubmitted(false)}
                  style={{ marginTop: 20, minHeight: 44 }}
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px', color: '#0f172a' }}> Send Us a Message</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Your Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Jessica M."
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {['General', 'Billing & Payments', 'Auction Issues', 'Plinko Game', 'Responsible Gaming', 'Technical Issue', 'Shipping & Delivery', 'Account'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your issue in detail…"
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{ minHeight: 48, fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Sending…' : ' Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Live chat placeholder */}
            <div
              style={{
                padding: '20px',
                background: 'rgba(37, 99, 235, 0.06)',
                border: '1px solid rgba(37, 99, 235, 0.15)',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                 Live Chat
                <span className="badge badge-pending" style={{ fontSize: '0.6rem' }}>Coming Soon</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {/* TODO: BACKEND — integrate live chat widget (Crisp, Intercom, etc.) */}
                Live chat is coming soon. For now, use the contact form.
              </p>
            </div>

            {/* Quick FAQ links */}
            <div
              style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 14, fontSize: '0.9rem' }}> Quick Answers</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {QUICK_LINKS.map(l => (
                  <Link
                    key={l.q}
                    href={l.href}
                    style={{
                      fontSize: '0.83rem',
                      color: 'var(--accent-blue)',
                      textDecoration: 'none',
                      padding: '6px 0',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>›</span>
                    {l.q}
                  </Link>
                ))}
              </div>
              <Link href="/faq" style={{ display: 'block', marginTop: 12, fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
                View all FAQs →
              </Link>
            </div>

            {/* Responsible gaming urgent */}
            <div
              style={{
                padding: '16px',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.82rem',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: 'var(--accent-red)' }}> Problem gambling?</strong>
              <br />
              Call iCall: <a href="tel:9152987821" style={{ color: 'var(--accent-red)', fontWeight: 700 }}>9152987821</a>
              {' or '}
              <Link href="/responsible-gaming" style={{ color: 'var(--accent-red)' }}>set limits now</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
