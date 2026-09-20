'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SurvivalBetCard from '@/components/SurvivalBetCard';
import RankMovementBetCard from '@/components/RankMovementBetCard';
import PredictionBetModal from '@/components/PredictionBetModal';
import UserBetsDashboard from '@/components/UserBetsDashboard';
import RealityCheckModal from '@/components/RealityCheckModal';
import Link from 'next/link';
import type { 
  SurvivalMarketApp, 
  RankMovementMarketApp, 
  MovementOddsOption, 
  UserPredictionBet 
} from '@/lib/types';

// Dummy Apps Data (Configurable via JSON/API)
const now = Date.now();
const DUMMY_SURVIVAL_APPS: SurvivalMarketApp[] = [
  {
    id: 'photoai',
    name: 'PhotoAI',
    iconEmoji: '',
    category: 'AI / Graphics',
    currentRank: 18,
    totalRanked: 100,
    targetTop: 25,
    closesAt: new Date(now + 23 * 3600 * 1000 + 14 * 60 * 1000),
    yesOdds: 1.80,
    noOdds: 2.10,
    yesPercentage: 72,
    recentBetSnippet: 'Jessica bet $50 on YES',
  },
  {
    id: 'fittrack',
    name: 'FitTrack Pro',
    iconEmoji: '️‍️',
    category: 'Health & Fitness',
    currentRank: 42,
    totalRanked: 100,
    targetTop: 50,
    closesAt: new Date(now + 19 * 3600 * 1000),
    yesOdds: 1.65,
    noOdds: 2.35,
    yesPercentage: 65,
    recentBetSnippet: 'Michael bet $100 on YES',
  },
  {
    id: 'budgetbuddy',
    name: 'BudgetBuddy',
    iconEmoji: '',
    category: 'Finance',
    currentRank: 7,
    totalRanked: 100,
    targetTop: 10,
    closesAt: new Date(now + 21 * 3600 * 1000),
    yesOdds: 1.95,
    noOdds: 1.90,
    yesPercentage: 54,
    recentBetSnippet: 'Sarah bet $75 on NO',
  },
  {
    id: 'notemaster',
    name: 'NoteMaster',
    iconEmoji: '',
    category: 'Productivity',
    currentRank: 63,
    totalRanked: 100,
    targetTop: 100,
    closesAt: new Date(now + 14 * 3600 * 1000),
    yesOdds: 1.25,
    noOdds: 4.10,
    yesPercentage: 88,
    recentBetSnippet: 'David bet $200 on YES',
  },
  {
    id: 'gamez',
    name: 'GameZ',
    iconEmoji: '',
    category: 'Games',
    currentRank: 31,
    totalRanked: 100,
    targetTop: 50,
    closesAt: new Date(now + 16 * 3600 * 1000),
    yesOdds: 1.50,
    noOdds: 2.70,
    yesPercentage: 78,
    recentBetSnippet: 'Emily bet $40 on YES',
  },
];

const DUMMY_MOVEMENT_APPS: RankMovementMarketApp[] = [
  {
    id: 'photoai',
    name: 'PhotoAI',
    iconEmoji: '',
    category: 'AI / Graphics',
    currentRank: 18,
    totalRanked: 100,
    closesAt: new Date(now + 23 * 3600 * 1000 + 14 * 60 * 1000),
    recentBetSnippet: 'Michael bet $100 on "Rise 5+"',
    movementOptions: [
      { type: 'rise_5_plus', label: 'Rise 5+ spots', odds: 3.50 },
      { type: 'rise_1_4', label: 'Rise 1–4 spots', odds: 2.00 },
      { type: 'stay_same', label: 'Stay same (±0)', odds: 4.00 },
      { type: 'drop_1_4', label: 'Drop 1–4 spots', odds: 2.20 },
      { type: 'drop_5_plus', label: 'Drop 5+ spots', odds: 3.80 },
    ],
  },
  {
    id: 'fittrack',
    name: 'FitTrack Pro',
    iconEmoji: '️‍️',
    category: 'Health & Fitness',
    currentRank: 42,
    totalRanked: 100,
    closesAt: new Date(now + 19 * 3600 * 1000),
    recentBetSnippet: 'Ashley bet $50 on "Rise 1–4"',
    movementOptions: [
      { type: 'rise_5_plus', label: 'Rise 5+ spots', odds: 4.20 },
      { type: 'rise_1_4', label: 'Rise 1–4 spots', odds: 1.85 },
      { type: 'stay_same', label: 'Stay same (±0)', odds: 3.60 },
      { type: 'drop_1_4', label: 'Drop 1–4 spots', odds: 2.40 },
      { type: 'drop_5_plus', label: 'Drop 5+ spots', odds: 3.10 },
    ],
  },
  {
    id: 'budgetbuddy',
    name: 'BudgetBuddy',
    iconEmoji: '',
    category: 'Finance',
    currentRank: 7,
    totalRanked: 100,
    closesAt: new Date(now + 21 * 3600 * 1000),
    recentBetSnippet: 'Christopher bet $150 on "Drop 1–4"',
    movementOptions: [
      { type: 'rise_5_plus', label: 'Rise 5+ spots', odds: 6.50 },
      { type: 'rise_1_4', label: 'Rise 1–4 spots', odds: 2.50 },
      { type: 'stay_same', label: 'Stay same (±0)', odds: 2.80 },
      { type: 'drop_1_4', label: 'Drop 1–4 spots', odds: 1.90 },
      { type: 'drop_5_plus', label: 'Drop 5+ spots', odds: 4.50 },
    ],
  },
  {
    id: 'notemaster',
    name: 'NoteMaster',
    iconEmoji: '',
    category: 'Productivity',
    currentRank: 63,
    totalRanked: 100,
    closesAt: new Date(now + 14 * 3600 * 1000),
    recentBetSnippet: 'Amanda bet $80 on "Stay same (±0)"',
    movementOptions: [
      { type: 'rise_5_plus', label: 'Rise 5+ spots', odds: 3.10 },
      { type: 'rise_1_4', label: 'Rise 1–4 spots', odds: 2.10 },
      { type: 'stay_same', label: 'Stay same (±0)', odds: 3.50 },
      { type: 'drop_1_4', label: 'Drop 1–4 spots', odds: 2.30 },
      { type: 'drop_5_plus', label: 'Drop 5+ spots', odds: 4.00 },
    ],
  },
  {
    id: 'gamez',
    name: 'GameZ',
    iconEmoji: '',
    category: 'Games',
    currentRank: 31,
    totalRanked: 100,
    closesAt: new Date(now + 16 * 3600 * 1000),
    recentBetSnippet: 'Matthew bet $120 on "Rise 5+"',
    movementOptions: [
      { type: 'rise_5_plus', label: 'Rise 5+ spots', odds: 2.90 },
      { type: 'rise_1_4', label: 'Rise 1–4 spots', odds: 1.95 },
      { type: 'stay_same', label: 'Stay same (±0)', odds: 4.20 },
      { type: 'drop_1_4', label: 'Drop 1–4 spots', odds: 2.60 },
      { type: 'drop_5_plus', label: 'Drop 5+ spots', odds: 5.00 },
    ],
  },
];

export default function AppPredictionsPageClient() {
  const [activeTab, setActiveTab] = useState<'survival' | 'movement'>('survival');
  const [selectedApp, setSelectedApp] = useState<{
    appId: string;
    appName: string;
    appIconEmoji: string;
    choiceLabel: string;
    odds: number;
    marketType: 'survival' | 'movement';
  } | null>(null);

  const [userBets, setUserBets] = useState<UserPredictionBet[]>([
    {
      id: 'b1',
      marketType: 'survival',
      appId: 'photoai',
      appName: 'PhotoAI',
      appIconEmoji: '',
      betChoiceLabel: 'YES (Stay in Top 25)',
      odds: 1.80,
      wagerAmount: 50,
      potentialPayout: 90,
      status: 'active',
      placedAt: new Date(now - 3600 * 1000),
      settlesAt: new Date(now + 23 * 3600 * 1000),
    },
  ]);

  const [sessionStartTime] = useState<Date>(new Date());

  const handleOpenSurvivalModal = (app: SurvivalMarketApp, choice: 'YES' | 'NO', odds: number) => {
    setSelectedApp({
      appId: app.id,
      appName: app.name,
      appIconEmoji: app.iconEmoji,
      choiceLabel: `${choice} (Stay in Top ${app.targetTop})`,
      odds,
      marketType: 'survival',
    });
  };

  const handleOpenMovementModal = (app: RankMovementMarketApp, option: MovementOddsOption) => {
    setSelectedApp({
      appId: app.id,
      appName: app.name,
      appIconEmoji: app.iconEmoji,
      choiceLabel: option.label,
      odds: option.odds,
      marketType: 'movement',
    });
  };

  const handleConfirmBet = (wager: number) => {
    if (!selectedApp) return;

    const newBet: UserPredictionBet = {
      id: Date.now().toString(),
      marketType: selectedApp.marketType,
      appId: selectedApp.appId,
      appName: selectedApp.appName,
      appIconEmoji: selectedApp.appIconEmoji,
      betChoiceLabel: selectedApp.choiceLabel,
      odds: selectedApp.odds,
      wagerAmount: wager,
      potentialPayout: Number((wager * selectedApp.odds).toFixed(2)),
      status: 'active',
      placedAt: new Date(),
      settlesAt: new Date(Date.now() + 24 * 3600 * 1000),
    };

    setUserBets((prev) => [newBet, ...prev]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Reality Check Modal (30 min) */}
      <RealityCheckModal
        intervalMinutes={30}
        sessionStartedAt={sessionStartTime}
        onContinue={() => {}}
        onStop={() => {}}
      />

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        {/* Page Hero */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="section-label">Prediction Markets</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
            App Store Prediction Markets
          </h1>
          <p className="section-sub">
            Bet on App Store leaderboards & rank movements over 24 hours. Real odds, fast payouts, provably fair.
          </p>

          {/* Quick Links Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/prediction-results">
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--accent-gold)',
                  background: 'var(--accent-gold-dim)',
                  color: 'var(--accent-gold)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                View Settled Results & Payouts →
              </button>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 36 }}>
          <button
            onClick={() => setActiveTab('survival')}
            style={{
              padding: '12px 28px',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              border: activeTab === 'survival' ? '2px solid var(--accent-blue)' : '1px solid var(--border)',
              background: activeTab === 'survival' ? 'var(--accent-blue-dim)' : '#ffffff',
              color: activeTab === 'survival' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>️</span> Tab 1: Survival Bets
          </button>

          <button
            onClick={() => setActiveTab('movement')}
            style={{
              padding: '12px 28px',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              border: activeTab === 'movement' ? '2px solid var(--accent-purple)' : '1px solid var(--border)',
              background: activeTab === 'movement' ? 'rgba(168, 85, 247, 0.15)' : '#ffffff',
              color: activeTab === 'movement' ? 'var(--accent-purple)' : 'var(--text-secondary)',
              transition: 'all 0.25s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span></span> Tab 2: Rank Movement Futures
          </button>
        </div>

        {/* Tab 1: Survival Bets */}
        {activeTab === 'survival' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                ️ App Survival Bets
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Will the app maintain its position in the top leaderboard bracket over the next 24 hours?
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 48 }}>
              {DUMMY_SURVIVAL_APPS.map((app) => (
                <SurvivalBetCard key={app.id} app={app} onBetClick={handleOpenSurvivalModal} />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Rank Movement */}
        {activeTab === 'movement' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                 Rank Movement Futures
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Predict how many spots an app will rise or drop in the leaderboard over the next 24 hours.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 48 }}>
              {DUMMY_MOVEMENT_APPS.map((app) => (
                <RankMovementBetCard key={app.id} app={app} onBetClick={handleOpenMovementModal} />
              ))}
            </div>
          </div>
        )}

        {/* User My Bets Dashboard Section */}
        <div style={{ marginTop: 24, marginBottom: 48 }}>
          <UserBetsDashboard bets={userBets} />
        </div>

        {/* Responsible Gaming Banner */}
        <div className="rg-banner" style={{ textAlign: 'center', justifyContent: 'center' }}>
          ️ Predictions involve risk. Please play responsibly. Set your deposit and bet limits in{' '}
          <Link href="/responsible-gaming" style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
            Responsible Gaming Settings
          </Link>.
        </div>
      </main>

      {/* Bet Modal */}
      {selectedApp && (
        <PredictionBetModal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          appName={selectedApp.appName}
          appIconEmoji={selectedApp.appIconEmoji}
          betChoiceLabel={selectedApp.choiceLabel}
          odds={selectedApp.odds}
          marketType={selectedApp.marketType}
          appId={selectedApp.appId}
          onBetPlaced={handleConfirmBet}
        />
      )}

      <Footer />
    </div>
  );
}
