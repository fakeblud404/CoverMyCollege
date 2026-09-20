'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Ad, AdminStats } from '@/lib/types';
import AdTable from '@/components/admin/AdTable';
import Analytics from '@/components/admin/Analytics';

export default function AdminPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'ads' | 'analytics'>('ads');

  const getPassword = () => sessionStorage.getItem('admin_auth') || '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [adsRes, statsRes] = await Promise.all([
        fetch('/api/ads?limit=100'),
        fetch(`/api/admin/stats?password=${encodeURIComponent(getPassword())}`),
      ]);

      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setAds(adsData.ads || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (adId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/ads/${adId}/${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: getPassword() }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      // silent fail
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {(['ads', 'analytics'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: tab === t ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
              background: tab === t ? 'var(--accent-blue-dim)' : 'transparent',
              color: tab === t ? 'var(--accent-blue)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize',
            }}
          >
            {t === 'ads' ? ' Manage Ads' : ' Analytics'}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-muted)',
          }}
        >
          <div className="animate-pulse" style={{ fontSize: '1rem' }}>
            Loading...
          </div>
        </div>
      ) : tab === 'ads' ? (
        <AdTable ads={ads} onAction={handleAction} />
      ) : (
        <Analytics stats={stats} />
      )}
    </div>
  );
}
