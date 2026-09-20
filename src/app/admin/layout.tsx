'use client';

import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check session storage for existing auth
    const saved = sessionStorage.getItem('admin_auth');
    if (saved) setAuthenticated(true);
  }, []);

  if (!mounted) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check — actual verification happens on API calls
    if (password.length > 0) {
      sessionStorage.setItem('admin_auth', password);
      setAuthenticated(true);
    } else {
      setError('Please enter the admin password');
    }
  };

  if (!authenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: 32,
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}></div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Admin Access</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
              Enter admin password to continue
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-red-dim)',
                color: 'var(--accent-red)',
                fontSize: '0.85rem',
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Admin Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a
            href="/"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.85rem',
            }}
          >
            ← Back to site
          </a>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>️ Admin Dashboard</span>
        </div>
        <button
          className="btn-ghost"
          onClick={() => {
            sessionStorage.removeItem('admin_auth');
            setAuthenticated(false);
          }}
        >
          Sign Out
        </button>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        {children}
      </main>
    </div>
  );
}
