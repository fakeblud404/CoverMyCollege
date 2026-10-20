'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

type Status = 'loading' | 'pending' | 'success' | 'failed';

export default function PaymentCompletionClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [attempts, setAttempts] = useState(0);
  const [planId, setPlanId] = useState<string | null>(null);

  const userId = searchParams.get('user_id') || '';

  const checkEntitlement = useCallback(async () => {
    try {
      const url = userId ? `/api/user/entitlement?userId=${encodeURIComponent(userId)}` : '/api/user/entitlement';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Entitlement query failed');
      const data = await res.json();

      if (data.hasAccess && data.status === 'active') {
        setStatus('success');
        setPlanId(data.planId);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [userId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const poll = async () => {
      const isGranted = await checkEntitlement();
      if (!isGranted) {
        setAttempts((prev) => {
          const next = prev + 1;
          if (next >= 10) {
            // After 20 seconds, mark as pending rather than failed (webhooks can have network lag)
            setStatus('pending');
          } else {
            timer = setTimeout(poll, 2000);
          }
          return next;
        });
      }
    };

    poll();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [checkEntitlement]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg, #fbfbfd)' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 640, margin: '60px auto', width: '100%', padding: '0 24px', textAlign: 'center' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid rgba(0,0,0,0.08)',
            padding: '48px 32px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
          }}
        >
          {status === 'loading' && (
            <div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #0071e3',
                  borderRadius: '50%',
                  margin: '0 auto 24px',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink, #1d1d1f)', marginBottom: 8 }}>
                Verifying Your Payment
              </h2>
              <p style={{ color: '#6e6e73', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Please hold on while we confirm your transaction with Whop and activate your access...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(52, 199, 89, 0.15)',
                  color: '#34c759',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  margin: '0 auto 24px',
                }}
              >
                ✓
              </div>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1d1d1f', marginBottom: 8 }}>
                Payment Successful!
              </h2>
              <p style={{ color: '#6e6e73', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
                Thank you! Your payment was verified and your paid features are now unlocked.
                {planId && <span style={{ display: 'block', marginTop: 6, fontSize: '0.85rem' }}>Plan: {planId}</span>}
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Link
                  href="/"
                  className="btn-bid"
                  style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 28px', fontSize: '0.95rem' }}
                >
                  Return to Home
                </Link>
                <Link
                  href="/live-auctions"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-block',
                    padding: '12px 24px',
                    fontSize: '0.95rem',
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: '100px',
                    color: '#1d1d1f',
                    fontWeight: 600,
                  }}
                >
                  View Auctions
                </Link>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(255, 149, 0, 0.15)',
                  color: '#ff9500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 24px',
                }}
              >
                ⏳
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1d1d1f', marginBottom: 8 }}>
                Payment Processing
              </h2>
              <p style={{ color: '#6e6e73', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
                Whop has received your checkout and is finalizing the transaction. Your access will be automatically unlocked as soon as confirmation completes.
              </p>
              <button
                onClick={() => {
                  setStatus('loading');
                  setAttempts(0);
                  checkEntitlement();
                }}
                className="btn-bid"
                style={{ padding: '12px 24px', fontSize: '0.95rem', marginBottom: 12 }}
              >
                Refresh Status
              </button>
              <div>
                <Link href="/" style={{ color: '#0071e3', fontSize: '0.88rem', textDecoration: 'none', fontWeight: 600 }}>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(255, 59, 48, 0.15)',
                  color: '#ff3b30',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  margin: '0 auto 24px',
                }}
              >
                ✕
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1d1d1f', marginBottom: 8 }}>
                Payment Not Completed
              </h2>
              <p style={{ color: '#6e6e73', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
                We were unable to confirm a completed payment. If you were charged, please allow a moment or contact support.
              </p>
              <Link
                href="/"
                className="btn-bid"
                style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 28px', fontSize: '0.95rem' }}
              >
                Return to App
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
