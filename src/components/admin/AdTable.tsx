'use client';

import { useState } from 'react';
import type { Ad } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface AdTableProps {
  ads: Ad[];
  onAction: (adId: string, action: 'approve' | 'reject') => void;
}

export default function AdTable({ ads, onAction }: AdTableProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');

  const filtered = statusFilter === 'all' ? ads : ads.filter((ad) => ad.status === statusFilter);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-active';
      case 'pending': return 'badge-pending';
      case 'rejected': return 'badge-rejected';
      default: return '';
    }
  };

  return (
    <div>
      {/* Status Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'active', 'pending', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="btn-ghost"
            style={{
              borderColor: statusFilter === s ? 'var(--accent-blue)' : undefined,
              color: statusFilter === s ? 'var(--accent-blue)' : undefined,
              textTransform: 'capitalize',
            }}
          >
            {s} ({s === 'all' ? ads.length : ads.filter((a) => a.status === s).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
          }}
        >
          <thead>
            <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
              {['Title', 'Category', 'Base Bid', 'Multi', 'Final Bid', 'Clicks', 'Status', 'Created', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 14px',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  No ads found
                </td>
              </tr>
            ) : (
              filtered.map((ad) => (
                <tr
                  key={ad.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600 }}>{ad.title}</div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ad.url}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="badge badge-category">{ad.category}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                    ${(ad.baseBid / 100).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {ad.multiplier}×
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                    ${(ad.finalBid / 100).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px' }}>{ad.clicks.toLocaleString()}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${getStatusBadgeClass(ad.status)}`}>{ad.status}</span>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {formatDistanceToNow(
                      ad.createdAt instanceof Date ? ad.createdAt : new Date(ad.createdAt),
                      { addSuffix: true }
                    )}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {ad.status !== 'active' && (
                        <button
                          className="btn-success"
                          onClick={() => onAction(ad.id, 'approve')}
                        >
                          Approve
                        </button>
                      )}
                      {ad.status !== 'rejected' && (
                        <button
                          className="btn-danger"
                          onClick={() => onAction(ad.id, 'reject')}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
