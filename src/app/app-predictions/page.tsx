import type { Metadata } from 'next';
import AppPredictionsClient from './AppPredictionsClient';

export const metadata: Metadata = {
  title: 'App Store Prediction Markets — AppBids',
  description: 'Bet on App Store leaderboards & rank movement futures. Fast payouts, provably fair odds, and live prediction markets.',
};

export default function AppPredictionsPage() {
  return <AppPredictionsClient />;
}
