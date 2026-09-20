export interface Ad {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  baseBid: number; // in cents
  multiplier: number; // Plinko result e.g. 3.4
  finalBid: number; // baseBid × multiplier
  clicks: number;
  status: 'active' | 'pending' | 'rejected';
  stripePaymentId: string;
  paypalOrderId?: string; // PayPal order ID (replaces stripePaymentId for new bids)
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
  // Bidder identity (bidderEmail is never returned to the client)
  bidderName?: string; // Display name shown on leaderboard
  // Auction-style fields (optional — used for live auction UX)
  endsAt?: Date | string | number;
  bidderCount?: number;
  productImage?: string; // URL or emoji fallback
  logoUrl?: string; // Optional custom app logo URL/base64
  auctionStatus?: AuctionStatus;
}

export type AuctionStatus = 'live' | 'ending-soon' | 'closed';

export interface AdFormData {
  title: string;
  description: string;
  url: string;
  category: string;
  baseBid: number; // in dollars (converted to cents on submit)
  bidderName: string; // Display name for the leaderboard
  bidderEmail: string; // Private — for receipts only, never rendered
  logoUrl?: string; // Optional custom app logo URL/base64
}

export interface PlinkoResult {
  multiplier: number;
  slotIndex: number;
}

export interface AdminStats {
  totalRevenue: number;
  totalClicks: number;
  totalAds: number;
  activeAds: number;
  pendingAds: number;
  topCategories: { category: string; count: number }[];
}

// Winner entry for the winners gallery
export interface Winner {
  id: string;
  name: string; // Display name (anonymized if needed)
  avatarEmoji: string;
  itemWon: string;
  amountPaid: number; // in cents
  date: Date;
  category: string;
  biggestPlinkoWin?: number; // multiplier
}

// Responsible gaming user settings
export interface ResponsibleGamingSettings {
  dailyDepositLimit?: number; // in cents
  weeklyDepositLimit?: number;
  monthlyDepositLimit?: number;
  dailyLossLimit?: number;
  weeklyLossLimit?: number;
  monthlyLossLimit?: number;
  sessionTimeLimit?: number; // minutes
  realityCheckInterval?: number; // minutes; 0 = disabled
  selfExclusionUntil?: Date | null;
  coolingOffUntil?: Date | null;
  isExcluded?: boolean;
}

// Standalone Plinko game session stats
export interface PlinkoSession {
  totalDrops: number;
  totalWagered: number; // cents
  totalWon: number; // cents
  biggestWinMultiplier: number;
  sessionStartedAt: Date;
  drops: PlinkoDropRecord[];
}

export interface PlinkoDropRecord {
  timestamp: Date;
  wager: number; // cents
  multiplier: number;
  payout: number; // cents
  seed: string;
  hash: string;
}

// Plinko risk config
export type PlinkoRisk = 'low' | 'medium' | 'high';

export interface PlinkoRiskConfig {
  label: string;
  slotMultipliers: number[];
  weights: number[];
  description: string;
}

export const PLINKO_RISK_CONFIGS: Record<PlinkoRisk, PlinkoRiskConfig> = {
  low: {
    label: 'Low',
    slotMultipliers: [0.5, 0.8, 1, 1.2, 1.5, 1.2, 1, 0.8, 0.5],
    weights: [5, 15, 25, 25, 10, 25, 25, 15, 5],
    description: 'Stable returns, lower variance',
  },
  medium: {
    label: 'Medium',
    slotMultipliers: [0.5, 1, 1.5, 2, 3, 2, 1.5, 1, 0.5],
    weights: [10, 20, 20, 15, 10, 15, 20, 20, 10],
    description: 'Balanced risk and reward',
  },
  high: {
    label: 'High',
    slotMultipliers: [10, 5, 2, 1, 0.5, 1, 2, 5, 10],
    weights: [3, 7, 10, 20, 25, 20, 10, 7, 3],
    description: 'High variance — big wins or big losses',
  },
};

export const CATEGORIES = [
  'All',
  'AI',
  'SEO',
  'Crypto',
  'SaaS',
  'Marketing',
  'Dev Tools',
  'Finance',
  'E-Commerce',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PLINKO_MULTIPLIERS = [
  { value: 0.5, weight: 25 },
  { value: 0.8, weight: 20 },
  { value: 1, weight: 20 },
  { value: 1.5, weight: 15 },
  { value: 2, weight: 10 },
  { value: 5, weight: 7 },
  { value: 10, weight: 3 },
] as const;

// Slot layout for the Plinko board (9 slots, symmetric)
export const PLINKO_SLOT_LABELS = [10, 5, 2, 1.5, 1, 1.5, 2, 5, 10] as const;

// ─── App Prediction Markets Types ───────────────────────────────

export type RankMovementType = 
  | 'rise_5_plus' 
  | 'rise_1_4' 
  | 'stay_same' 
  | 'drop_1_4' 
  | 'drop_5_plus';

export interface MovementOddsOption {
  type: RankMovementType;
  label: string;
  odds: number;
}

export interface SurvivalMarketApp {
  id: string;
  name: string;
  iconEmoji: string;
  category: string;
  currentRank: number; // e.g. 18
  totalRanked: number; // e.g. 100
  targetTop: number; // e.g. 25 for "Top 25"
  closesAt: Date;
  yesOdds: number; // e.g. 1.8
  noOdds: number; // e.g. 2.1
  yesPercentage: number; // e.g. 72
  recentBetSnippet: string; // e.g. "Jessica bet $50 on YES"
}

export interface RankMovementMarketApp {
  id: string;
  name: string;
  iconEmoji: string;
  category: string;
  currentRank: number;
  totalRanked: number;
  closesAt: Date;
  movementOptions: MovementOddsOption[];
  recentBetSnippet: string; // e.g. "Michael bet $100 on 'Rise 5+'"
}

export interface UserPredictionBet {
  id: string;
  marketType: 'survival' | 'movement';
  appId: string;
  appName: string;
  appIconEmoji: string;
  betChoiceLabel: string; // "YES", "NO", "Rise 5+ spots", etc.
  odds: number;
  wagerAmount: number; // in USD dollars
  potentialPayout: number; // wager * odds
  status: 'active' | 'won' | 'lost';
  placedAt: Date;
  settlesAt: Date;
  actualResult?: string;
  claimed?: boolean;
}

export interface PredictionLimitsSettings {
  dailyLossLimit?: number; // USD
  maxBetPerPrediction?: number; // USD
  cooldownMinutes?: number;
  selfExclusionUntil?: Date | null;
}
