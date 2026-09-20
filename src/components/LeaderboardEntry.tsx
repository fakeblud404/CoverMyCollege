'use client';

import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import CountdownTimer from './CountdownTimer';
import type { Ad, AuctionStatus } from '@/lib/types';

interface LeaderboardEntryProps {
  ad: Ad;
  rank: number;
  onBid?: () => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  AI: '', SEO: '', Crypto: '₿', SaaS: '️',
  Marketing: '', 'Dev Tools': '', Finance: '',
  'E-Commerce': '️', Other: '',
};

function getAuctionStatus(ad: Ad): AuctionStatus {
  if (ad.auctionStatus) return ad.auctionStatus;
  if (!ad.endsAt) return 'live';
  const endsAtDate = new Date(ad.endsAt);
  if (isNaN(endsAtDate.getTime())) return 'live';
  const diff = endsAtDate.getTime() - Date.now();
  if (diff <= 0) return 'closed';
  if (diff <= 600_000) return 'ending-soon';
  return 'live';
}

export default function LeaderboardEntry({ ad, rank, onBid }: LeaderboardEntryProps) {
  const [hover, setHover] = useState(false);
  const isGold = rank === 1;
  const status = getAuctionStatus(ad);
  const isClosed = status === 'closed';

  const statusLabel = status === 'live' ? 'LIVE' : status === 'ending-soon' ? 'ENDING SOON' : 'CLOSED';
  const statusBadgeClass = status === 'live' ? 'badge-live' : status === 'ending-soon' ? 'badge-ending' : 'badge-closed';

  const handleBid = useCallback(() => {
    if (onBid) onBid();
  }, [onBid]);

  const handleVisit = useCallback(async () => {
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id }),
      });
    } catch { /* silent */ }
    window.open(ad.url, '_blank', 'noopener,noreferrer');
  }, [ad.id, ad.url]);

  const finalBidDisplay = `$${(ad.finalBid / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 20px',
        borderRadius: 'var(--radius-lg, 14px)',
        background: hover ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: isGold
          ? '1px solid rgba(217, 119, 6, 0.35)'
          : status === 'ending-soon'
          ? '1px solid rgba(220, 38, 38, 0.25)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: isGold
          ? '0 0 24px rgba(217, 119, 6, 0.15)'
          : hover
          ? '0 8px 28px rgba(0, 0, 0, 0.08)'
          : '0 4px 16px rgba(0, 0, 0, 0.04)',
        borderLeft: isGold ? '4px solid var(--accent-gold)' : undefined,
        transition: 'all 0.2s ease',
        opacity: isClosed ? 0.65 : 1,
        cursor: 'default',
        flexWrap: 'wrap',
      }}
      role="listitem"
    >
      {/* Rank */}
      <div
        style={{
          width: 36,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {isGold ? (
          <span style={{ fontSize: '1.4rem' }} className="trophy-glimmer"></span>
        ) : (
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: 800,
              color: rank <= 3 ? '#d97706' : '#64748b',
            }}
          >
            #{rank}
          </span>
        )}
      </div>

      {/* Product icon / image */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: isGold ? 'rgba(217, 119, 6, 0.1)' : 'rgba(37, 99, 235, 0.08)',
          border: `1px solid ${isGold ? 'rgba(217, 119, 6, 0.2)' : 'rgba(0, 0, 0, 0.08)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          fontWeight: 800,
          color: isGold ? '#d97706' : '#2563eb',
          flexShrink: 0,
        }}
      >
        {ad.title ? ad.title.charAt(0).toUpperCase() : 'A'}
      </div>

      {/* Title + Meta */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: '#0f172a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '240px',
            }}
          >
            {ad.title}
          </span>
          <span className={`badge ${statusBadgeClass}`} style={{ fontSize: '0.6rem', padding: '2px 7px' }}>
            {statusLabel}
          </span>
        </div>
        {ad.bidderName && (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 3, fontWeight: 500 }}>
            by {ad.bidderName}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.78rem',
            color: '#64748b',
            flexWrap: 'wrap',
          }}
        >
          <span className="badge badge-category" style={{ fontSize: '0.65rem' }}>{ad.category}</span>
          <span> {ad.clicks.toLocaleString()} clicks</span>
          <span>{formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true })}</span>
          {ad.bidderCount != null && (
            <span> {ad.bidderCount} bidders</span>
          )}
        </div>
      </div>

      {/* Bid info + Countdown */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div
          style={{
            fontSize: isGold ? '1.2rem' : '1rem',
            fontWeight: 800,
            color: isGold ? '#d97706' : '#0f172a',
            letterSpacing: '-0.02em',
          }}
        >
          {finalBidDisplay}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 4 }}>
          {ad.multiplier}× multiplier
        </div>
        {ad.endsAt && (
          <CountdownTimer endsAt={new Date(ad.endsAt)} compact />
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {!isClosed && (
          <button
            className="btn-bid"
            onClick={handleBid}
            id={`bid-btn-${ad.id}`}
            style={{ fontSize: '0.85rem', padding: '9px 18px', minHeight: 40 }}
            aria-label={`Bid on ${ad.title}`}
          >
             Bid
          </button>
        )}
        <button
          onClick={handleVisit}
          style={{
            padding: '9px 14px',
            borderRadius: 'var(--radius-md, 10px)',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            background: '#ffffff',
            color: '#334155',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            minHeight: 40,
          }}
          aria-label={`Visit ${ad.title}`}
        >
          Visit ↗
        </button>
      </div>
    </div>
  );
}
