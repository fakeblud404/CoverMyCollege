'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import PlinkoGame from './PlinkoGame';
import RealityCheckModal from './RealityCheckModal';
import type { PlinkoRisk, PlinkoSession } from '@/lib/types';
import { PLINKO_RISK_CONFIGS } from '@/lib/types';

const ROW_OPTIONS = [8, 10, 12, 14, 16];

function generateSeed(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashSeed(seed: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface PlinkoStandaloneGameProps {
  realityCheckInterval?: number; // minutes, 0 = off
}

export default function PlinkoStandaloneGame({ realityCheckInterval = 30 }: PlinkoStandaloneGameProps) {
  const [risk, setRisk] = useState<PlinkoRisk>('medium');
  const [rows, setRows] = useState(8);
  const [wager, setWager] = useState(100); // cents — demo only
  const [autoMode, setAutoMode] = useState(false);
  const [autoCooldown, setAutoCooldown] = useState(3); // seconds between auto-drops
  const [ageVerified, setAgeVerified] = useState(false);
  const [seedPhase, setSeedPhase] = useState<'idle' | 'ready' | 'revealed'>('idle');
  const [currentSeed, setCurrentSeed] = useState('');
  const [currentHash, setCurrentHash] = useState('');
  const [revealedSeed, setRevealedSeed] = useState('');
  const [hashCopied, setHashCopied] = useState(false);
  const [targetSlots, setTargetSlots] = useState<number[]>([]);
  const [gameKey, setGameKey] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [session, setSession] = useState<PlinkoSession>({
    totalDrops: 0,
    totalWagered: 0,
    totalWon: 0,
    biggestWinMultiplier: 0,
    sessionStartedAt: new Date(),
    drops: [],
  });

  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const riskConfig = PLINKO_RISK_CONFIGS[risk];

  // Generate provably fair seed on risk/row change
  const prepareRound = useCallback(async () => {
    const seed = generateSeed();
    const hash = await hashSeed(seed);
    setCurrentSeed(seed);
    setCurrentHash(hash);
    setSeedPhase('ready');
  }, []);

  useEffect(() => {
    prepareRound();
  }, [prepareRound]);

  // Weighted random slot selection based on risk config
  const selectTargetSlot = useCallback((): number => {
    const weights = riskConfig.weights;
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return i;
    }
    return Math.floor(weights.length / 2);
  }, [riskConfig]);

  const dropBall = useCallback(async () => {
    if (!ageVerified) return;
    if (playing) return;

    // Record the seed before the drop
    setRevealedSeed(''); // Will reveal after
    setSeedPhase('ready');

    const slot = selectTargetSlot();
    setTargetSlots([slot]);
    setGameKey(k => k + 1);
    setPlaying(true);
  }, [ageVerified, playing, selectTargetSlot]);

  const handleComplete = useCallback(async (multiplier: number) => {
    setPlaying(false);
    const payout = Math.round(wager * multiplier);

    setSession(prev => ({
      ...prev,
      totalDrops: prev.totalDrops + 1,
      totalWagered: prev.totalWagered + wager,
      totalWon: prev.totalWon + payout,
      biggestWinMultiplier: Math.max(prev.biggestWinMultiplier, multiplier),
      drops: [...prev.drops, {
        timestamp: new Date(),
        wager,
        multiplier,
        payout,
        seed: currentSeed,
        hash: currentHash,
      }],
    }));

    // Reveal the seed for provably fair verification
    setRevealedSeed(currentSeed);
    setSeedPhase('revealed');

    // TODO: BACKEND — POST /api/plinko/session to record this drop for RTP stats

    // Prepare next round
    await prepareRound();

    // Auto-mode continuation
    if (autoMode && !stopped) {
      autoRef.current = setTimeout(() => {
        dropBall();
      }, autoCooldown * 1000);
    }
  }, [wager, currentSeed, currentHash, autoMode, autoCooldown, stopped, dropBall, prepareRound]);

  // Cleanup auto-drop on unmount
  useEffect(() => {
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, []);

  const copyHash = async () => {
    await navigator.clipboard.writeText(currentHash);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  const rtp = session.totalWagered > 0
    ? ((session.totalWon / session.totalWagered) * 100).toFixed(1)
    : '—';
  const netPL = session.totalWon - session.totalWagered;

  if (!ageVerified) {
    return (
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          textAlign: 'center',
          padding: '48px 24px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}></div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 12px', color: '#0f172a' }}>Age Verification Required</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65, margin: '0 0 24px' }}>
          AppBids Plinko is for adults aged <strong>18 and over</strong> only.
          By continuing you confirm you are 18+ and agree to our{' '}
          <a href="/terms" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Terms</a>{' '}
          and{' '}
          <a href="/responsible-gaming" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Responsible Gaming</a> policy.
        </p>

        <div className="rg-banner" style={{ marginBottom: 24, textAlign: 'left', background: 'rgba(0, 113, 227, 0.08)', color: 'var(--blue)', border: '1px solid rgba(0, 113, 227, 0.2)', padding: '10px 14px', borderRadius: 8 }}>
          ️ Plinko involves real-money risk. Please gamble responsibly. Set limits before you play.
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, cursor: 'pointer', textAlign: 'left' }}>
          <input
            type="checkbox"
            id="age-check"
            onChange={e => {
              if (e.target.checked) {
                // TODO: BACKEND — trigger KYC verification flow here
                setAgeVerified(true);
              }
            }}
            style={{ marginTop: 4, accentColor: 'var(--accent-blue)', width: 18, height: 18, flexShrink: 0 }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            I confirm I am <strong style={{ color: '#0f172a' }}>18 years or older</strong>, I have read the responsible gaming policy, and I understand the risks involved in real-money play.
          </span>
        </label>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Need help? Call{' '}
          <a href="tel:9152987821" style={{ color: 'var(--accent-blue)' }}>iCall: 9152987821</a> (World) or visit{' '}
          <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>
            BeGambleAware.org
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {realityCheckInterval > 0 && (
        <RealityCheckModal
          intervalMinutes={realityCheckInterval}
          sessionStartedAt={session.sessionStartedAt}
          totalWagered={session.totalWagered}
          onContinue={() => setStopped(false)}
          onStop={() => {
            setStopped(true);
            if (autoRef.current) clearTimeout(autoRef.current);
            setAutoMode(false);
          }}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 24, alignItems: 'start' }}>
        {/* Left — Game */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Risk + Rows Controls */}
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 20,
              alignItems: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Risk Level
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['low', 'medium', 'high'] as PlinkoRisk[]).map(r => (
                  <button
                    key={r}
                    className={`risk-btn${risk === r ? ` active-${r}` : ''}`}
                    onClick={() => setRisk(r)}
                    disabled={playing}
                    title={PLINKO_RISK_CONFIGS[r].description}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Rows
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {ROW_OPTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRows(r)}
                    disabled={playing}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: rows === r ? '1px solid var(--accent-blue)' : '1px solid rgba(0,0,0,0.08)',
                      background: rows === r ? 'var(--accent-blue)' : '#ffffff',
                      color: rows === r ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: playing ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      minHeight: 36,
                      transition: 'all 0.15s',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Wager */}
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Wager (demo $)
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 5, 10, 50].map(w => (
                  <button
                    key={w}
                    onClick={() => setWager(w * 100)}
                    disabled={playing}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: wager === w * 100 ? '1px solid var(--accent-blue)' : '1px solid rgba(0,0,0,0.08)',
                      background: wager === w * 100 ? 'var(--accent-blue)' : '#ffffff',
                      color: wager === w * 100 ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: playing ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      minHeight: 36,
                    }}
                  >
                    ${w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Plinko Canvas */}
          <div
            style={{
              padding: 16,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(0, 0, 0, 0.15)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)',
            }}
          >
            <PlinkoGame
              key={gameKey}
              targetSlotIndices={targetSlots}
              onComplete={handleComplete}
            />
          </div>

          {/* Multiplier Color Guide */}
          <div
            style={{
              padding: '14px 18px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk — Leaderboard Position Boost Layout
            </div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
              {riskConfig.slotMultipliers.map((m, i) => {
                const color = '#2563eb';
                return (
                  <div
                    key={i}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: `${color}14`,
                      border: `1px solid ${color}33`,
                      color,
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      textAlign: 'center',
                      minWidth: 44,
                    }}
                  >
                    +{m} Ranks
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
              {riskConfig.description} · Theoretical RTP: ~97%
            </div>
          </div>

          {/* Drop Button */}
          {!playing && (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn-bid"
                onClick={dropBall}
                disabled={stopped}
                style={{ flex: 1, fontSize: '1.05rem', minHeight: 52 }}
              >
                 Drop Ball (${(wager / 100).toLocaleString('en-US')})
              </button>
            </div>
          )}

          {/* Auto-drop toggle */}
          <div
            style={{
              padding: '14px 18px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Auto-Drop Mode</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Drops automatically with a {autoCooldown}s cooldown between each
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range"
                min={2}
                max={10}
                value={autoCooldown}
                onChange={e => setAutoCooldown(Number(e.target.value))}
                style={{ width: 80, accentColor: 'var(--accent-blue)' }}
                aria-label="Auto-drop cooldown seconds"
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: 28 }}>{autoCooldown}s</span>
              <label className="toggle-switch" aria-label="Toggle auto-drop">
                <input
                  type="checkbox"
                  checked={autoMode}
                  onChange={e => {
                    setAutoMode(e.target.checked);
                    if (!e.target.checked && autoRef.current) clearTimeout(autoRef.current);
                  }}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </div>

        {/* Right — Stats + Provably Fair + RG */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Session Stats */}
          <div
            style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
              Session Stats
            </div>
            {[
              { label: 'Total Drops', value: session.totalDrops },
              { label: 'Total Wagered', value: session.totalWagered > 0 ? `$${(session.totalWagered / 100).toLocaleString('en-US')}` : '$0' },
              { label: 'Total Won', value: session.totalWon > 0 ? `$${(session.totalWon / 100).toLocaleString('en-US')}` : '$0' },
              { label: 'Net P/L', value: session.totalDrops > 0 ? `${netPL >= 0 ? '+' : ''}$${(netPL / 100).toLocaleString('en-US')}` : '—', color: netPL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
              { label: 'Best Multiplier', value: session.biggestWinMultiplier > 0 ? `${session.biggestWinMultiplier}×` : '—', color: 'var(--accent-gold)' },
              { label: 'Session RTP', value: `${rtp}%` },
            ].map(stat => (
              <div
                key={stat.label}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
              >
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{stat.label}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: (stat as { color?: string }).color || 'var(--text-primary)' }}>
                  {String(stat.value)}
                </span>
              </div>
            ))}
          </div>

          {/* Provably Fair */}
          <div
            style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
               Provably Fair
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
              We generate a secret seed before each drop and show you its SHA-256 hash. After the drop, we reveal the seed so you can verify the result.
            </p>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6 }}>Pre-game Hash (SHA-256)</div>
              <div className="seed-box" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.1)', padding: '6px 10px', borderRadius: 8, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {currentHash || 'Generating…'}
                </span>
                <button
                  onClick={copyHash}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0, padding: 0 }}
                >
                  {hashCopied ? '' : ''}
                </button>
              </div>
            </div>
            {seedPhase === 'revealed' && revealedSeed && (
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)', marginBottom: 6 }}> Revealed Seed (verify above hash)</div>
                <div className="seed-box" style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', padding: '6px 10px', borderRadius: 8, fontSize: '0.75rem' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {revealedSeed}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Responsible Gaming */}
          <div
            style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(217, 119, 6, 0.2)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              ️ Responsible Gaming
            </div>
            <a
              href="/responsible-gaming"
              style={{
                display: 'block',
                padding: '10px 14px',
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-amber)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: 10,
                transition: 'all 0.2s',
              }}
            >
              ️ Set Deposit & Loss Limits →
            </a>
            <a
              href="/responsible-gaming#self-exclusion"
              style={{
                display: 'block',
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-red)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                marginBottom: 14,
              }}
            >
               Self-Exclude →
            </a>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Need support?{' '}
              <a href="tel:9152987821" style={{ color: 'var(--accent-amber)' }}>iCall: 9152987821</a>
              {' · '}
              <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-amber)' }}>
                BeGambleAware
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
