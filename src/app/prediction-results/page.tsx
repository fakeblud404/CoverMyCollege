import type { Metadata } from 'next';
import PredictionResultsClient from './PredictionResultsClient';

export const metadata: Metadata = {
  title: 'Prediction Results & Payouts — AppBids',
  description: 'View settled 24-hour prediction results, claim your payouts, or attempt a bonus Plinko round.',
};

export default function PredictionResultsPage() {
  return <PredictionResultsClient />;
}
