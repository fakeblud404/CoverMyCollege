import type { Metadata } from 'next';
import LiveAuctionsClient from './LiveAuctionsClient';

export const metadata: Metadata = {
  title: 'Live Auctions — AppBids',
  description: 'Browse all live auctions on AppBids. Place bids, win real products. Countdown timers, real-time updates, provably fair Plinko multipliers.',
};

export default function LiveAuctionsPage() {
  return <LiveAuctionsClient />;
}
