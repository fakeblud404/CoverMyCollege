'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type ExclusionPeriod = 'none' | '1d' | '7d' | '30d' | 'permanent';
type CoolingOff = 'none' | '24h' | '72h' | '7d';

interface Limits {
  dailyDeposit: string;
  weeklyDeposit: string;
  monthlyDeposit: string;
  dailyLoss: string;
  weeklyLoss: string;
  monthlyLoss: string;
  sessionTime: string;
  realityCheck: string;
}

export default function ResponsibleGamingClient() {
  const [limits, setLimits] = useState<Limits>({
    dailyDeposit: '', weeklyDeposit: '', monthlyDeposit: '',
    dailyLoss: '', weeklyLoss: '', monthlyLoss: '',
    sessionTime: '', realityCheck: '30',
  });
  const [exclusion, setExclusion] = useState<ExclusionPeriod>('none');
  const [coolingOff, setCoolingOff] = useState<CoolingOff>('none');
  const [saved, setSaved] = useState(false);
  const [exclusionConfirmed, setExclusionConfirmed] = useState(false);

  const handleSave = async () => {
    // TODO: BACKEND — POST /api/responsible-gaming with limits + userId from auth
    // For now, save to localStorage
    localStorage.setItem('rg_limits', JSON.stringify(limits));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExclusion = () => {
    if (exclusion === 'none') return;
    setExclusionConfirmed(true);
    // TODO: BACKEND — POST /api/responsible-gaming/exclude { period: exclusion, userId }
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
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onPlaceBid={() => {}} />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div className="section-label" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--accent-amber)', borderColor: 'rgba(245,158,11,0.2)' }}>
            ️ Responsible Gaming
          </div>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginTop: 12 }}>
            Stay in Control
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 600, lineHeight: 1.65, margin: 0 }}>
            AppBids is committed to responsible gaming. Set limits, take breaks, or exclude yourself at any time.
            Your limits are enforced immediately — no loopholes.
          </p>
        </div>

        {/* Deposit & Loss Limits */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
             Deposit & Loss Limits
          </h2>
          <div
            style={{
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            }}
          >
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Once set, limits take effect immediately. Increasing a limit requires a <strong>24-hour cooling-off period</strong>.
              Decreasing a limit takes effect immediately.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Daily Deposit Limit ($)', key: 'dailyDeposit' },
                { label: 'Weekly Deposit Limit ($)', key: 'weeklyDeposit' },
                { label: 'Monthly Deposit Limit ($)', key: 'monthlyDeposit' },
                { label: 'Daily Loss Limit ($)', key: 'dailyLoss' },
                { label: 'Weekly Loss Limit ($)', key: 'weeklyLoss' },
                { label: 'Monthly Loss Limit ($)', key: 'monthlyLoss' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="No limit"
                    value={limits[f.key as keyof Limits]}
                    onChange={e => setLimits(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Session Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  placeholder="No limit"
                  value={limits.sessionTime}
                  onChange={e => setLimits(prev => ({ ...prev, sessionTime: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Reality Check Interval (minutes)
                </label>
                <select
                  value={limits.realityCheck}
                  onChange={e => setLimits(prev => ({ ...prev, realityCheck: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="0">Disabled</option>
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every 60 minutes</option>
                </select>
              </div>
            </div>

            {/* Prediction Markets Limits Sub-Section */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 20, marginTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-purple)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                 App Prediction Market Limits
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Max Bet Per Prediction ($)
                  </label>
                  <input type="number" min="1" max="500" placeholder="e.g. $100" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Prediction Daily Loss Limit ($)
                  </label>
                  <input type="number" min="1" placeholder="e.g. $250" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Cooldown Between Bets (minutes)
                  </label>
                  <input type="number" min="0" placeholder="e.g. 5 mins" style={inputStyle} />
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleSave}
              style={{ minHeight: 44 }}
            >
              {saved ? ' Limits Saved' : ' Save Limits'}
            </button>
          </div>
        </section>

        {/* Cooling-Off Period */}
        <section style={{ marginBottom: 40 }} id="cooling-off">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            ⏸️ Cooling-Off Period
          </h2>
          <div
            style={{
              padding: '24px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
            }}
          >
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Take a short break from the platform. During a cooling-off period you cannot place bids or play Plinko.
              You can still log in to check order status.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              {([['none', 'No Break'], ['24h', '24 Hours'], ['72h', '72 Hours'], ['7d', '7 Days']] as [CoolingOff, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setCoolingOff(val)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: coolingOff === val ? '1px solid var(--accent-blue)' : '1px solid rgba(0,0,0,0.08)',
                    background: coolingOff === val ? 'var(--accent-blue)' : 'rgba(241, 245, 249, 0.6)',
                    color: coolingOff === val ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minHeight: 44,
                    fontSize: '0.88rem',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {coolingOff !== 'none' && (
              <button className="btn-primary" style={{ minHeight: 44 }} onClick={() => alert('Cooling-off period activated.')}>
                Activate {coolingOff} Cooling-Off
              </button>
            )}
          </div>
        </section>

        {/* Self-Exclusion */}
        <section style={{ marginBottom: 40 }} id="self-exclusion">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
             Self-Exclusion
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
            Self-exclusion is a serious step. Once activated, you will be blocked from all real-money features.
            <strong style={{ color: 'var(--accent-red)' }}> This cannot be reversed until the period ends.</strong>
          </p>
          <div
            style={{
              padding: '24px',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              {([
                ['none', 'Not Now'],
                ['1d', '1 Day'],
                ['7d', '1 Week'],
                ['30d', '1 Month'],
                ['permanent', 'Permanent'],
              ] as [ExclusionPeriod, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setExclusion(val)}
                  disabled={exclusionConfirmed}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: exclusion === val ? '1px solid var(--accent-red)' : '1px solid rgba(0,0,0,0.08)',
                    background: exclusion === val ? 'var(--accent-red)' : 'rgba(255,255,255,0.8)',
                    color: exclusion === val ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: exclusionConfirmed ? 'not-allowed' : 'pointer',
                    minHeight: 44,
                    fontSize: '0.88rem',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {exclusion !== 'none' && !exclusionConfirmed && (
              <button
                onClick={handleExclusion}
                style={{
                  minHeight: 44,
                  padding: '12px 24px',
                  background: 'var(--accent-red)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                 Activate Self-Exclusion ({exclusion})
              </button>
            )}
            {exclusionConfirmed && (
              <div style={{ color: 'var(--accent-red)', fontWeight: 600, fontSize: '0.9rem' }}>
                 Self-exclusion activated. You will be locked out for {exclusion}.
              </div>
            )}
          </div>
        </section>

        {/* Problem Gambling Resources */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: '#0f172a' }}>
             Need Help? Gambling Support Resources
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { name: 'iCall (World)', desc: 'Free mental health counselling', contact: '9152987821', type: 'phone', color: 'rgba(37,99,235,0.06)', border: 'rgba(37,99,235,0.2)' },
              { name: 'NIMHANS', desc: 'National mental health institute', contact: '080-46110007', type: 'phone', color: 'rgba(147,51,234,0.06)', border: 'rgba(147,51,234,0.2)' },
              { name: 'BeGambleAware', desc: 'International gambling support', contact: 'https://www.begambleaware.org', type: 'url', color: 'rgba(217,119,6,0.06)', border: 'rgba(217,119,6,0.2)' },
              { name: 'GamCare', desc: 'Free gambling support services', contact: 'https://www.gamcare.org.uk', type: 'url', color: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
            ].map(r => (
              <div
                key={r.name}
                style={{
                  padding: '20px',
                  background: r.color,
                  border: `1px solid ${r.border}`,
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{r.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>{r.desc}</div>
                {r.type === 'phone' ? (
                  <a
                    href={`tel:${r.contact}`}
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: '#0f172a',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      minHeight: 36,
                    }}
                  >
                     {r.contact}
                  </a>
                ) : (
                  <a
                    href={r.contact}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: '#0f172a',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                    }}
                  >
                    Visit Website ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
