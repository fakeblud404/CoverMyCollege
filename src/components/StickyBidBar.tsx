'use client';

interface StickyBidBarProps {
  onBid: () => void;
  currentHighBid?: number; // in cents
  label?: string;
}

export default function StickyBidBar({ onBid, currentHighBid, label = 'Bid Now' }: StickyBidBarProps) {
  return null;
}
