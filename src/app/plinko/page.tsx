import type { Metadata } from 'next';
import PlinkoPageClient from './PlinkoPageClient';

export const metadata: Metadata = {
  title: 'Plinko Game — AppBids',
  description: 'Play the provably fair Plinko multiplier game on AppBids. Choose risk level, rows, and win up to 10× your wager. Responsible gaming controls included.',
};

export default function PlinkoPage() {
  return <PlinkoPageClient />;
}
