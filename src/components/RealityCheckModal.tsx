'use client';

import { useEffect, useState, useCallback } from 'react';

interface RealityCheckModalProps {
  intervalMinutes?: number; // default 30
  onContinue: () => void;
  onStop: () => void;
  sessionStartedAt: Date;
  totalWagered?: number; // cents
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} minute${m !== 1 ? 's' : ''}`;
}

export default function RealityCheckModal({
  intervalMinutes = 30,
  onContinue,
  onStop,
  sessionStartedAt,
  totalWagered = 0,
}: RealityCheckModalProps) {
  const [show, setShow] = useState(false);
  const [sessionDuration, setSessionDuration] = useState('');

  const triggerCheck = useCallback(() => {
    setSessionDuration(formatDuration(Date.now() - sessionStartedAt.getTime()));
    setShow(true);
  }, [sessionStartedAt]);

  useEffect(() => {
    if (intervalMinutes <= 0) return;
    const ms = intervalMinutes * 60 * 1000;
    const timer = setTimeout(triggerCheck, ms);
    return () => clearTimeout(timer);
  }, [intervalMinutes, triggerCheck]);

  if (!show) return null;

  const wageredFormatted =
    totalWagered > 0
      ? `$${(totalWagered / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      : 'N/A';

  return (
    <div className="reality-check-overlay" role="alertdialog" aria-modal="true" aria-labelledby="rc-title">
      <div className="reality-check-card">
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⏰</div>
        <h2
          id="rc-title"
          style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}
        >
          Reality Check
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 24px', lineHeight: 1.6 }}>
          You&apos;ve been playing for <strong style={{ color: '#0f172a' }}>{sessionDuration}</strong>.
          Take a moment to review your session.
        </p>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            { label: 'Session Duration', value: sessionDuration },
            { label: 'Total Wagered', value: wageredFormatted },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'rgba(241, 245, 249, 0.8)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Responsible gaming note */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '0.8rem',
            color: 'var(--accent-amber)',
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
           Bidding should be fun. If it stops feeling fun, it&apos;s okay to stop.
          <br />
          <a
            href="tel:9152987821"
            style={{ color: 'var(--accent-amber)', fontWeight: 700, display: 'block', marginTop: 6 }}
          >
             Need help? iCall: 9152987821
          </a>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
          <button
            className="btn-bid"
            onClick={() => { setShow(false); onContinue(); }}
            style={{ width: '100%', minHeight: 48 }}
          >
             I&apos;m in control — Continue
          </button>
          <button
            onClick={() => { setShow(false); onStop(); }}
            style={{
              width: '100%',
              minHeight: 48,
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
          >
             Stop Playing for Now
          </button>
        </div>
      </div>
    </div>
  );
}
