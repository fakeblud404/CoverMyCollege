'use client';

import type { AdminStats } from '@/lib/types';

interface AnalyticsProps {
  stats: AdminStats | null;
}

export default function Analytics({ stats }: AnalyticsProps) {
  if (!stats) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: 12 }}></div>
        <div>No analytics data available</div>
        <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
          Configure Firebase and add ads to see stats
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${(stats.totalRevenue / 100).toLocaleString()}`,
      icon: '',
      color: 'var(--accent-green)',
      bgColor: 'var(--accent-green-dim)',
    },
    {
      label: 'Total Clicks',
      value: stats.totalClicks.toLocaleString(),
      icon: '',
      color: 'var(--accent-blue)',
      bgColor: 'var(--accent-blue-dim)',
    },
    {
      label: 'Total Ads',
      value: stats.totalAds.toString(),
      icon: '',
      color: 'var(--accent-gold)',
      bgColor: 'var(--accent-gold-dim)',
    },
    {
      label: 'Active Ads',
      value: stats.activeAds.toString(),
      icon: '',
      color: 'var(--accent-green)',
      bgColor: 'var(--accent-green-dim)',
    },
    {
      label: 'Pending Review',
      value: stats.pendingAds.toString(),
      icon: '⏳',
      color: 'var(--accent-gold)',
      bgColor: 'var(--accent-gold-dim)',
    },
  ];

  return (
    <div>
      {/* Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: card.color,
                  letterSpacing: '-0.02em',
                }}
              >
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Categories */}
      {stats.topCategories.length > 0 && (
        <div className="card">
          <h3
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              marginBottom: 16,
              margin: '0 0 16px 0',
            }}
          >
             Top Categories
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.topCategories.map((cat, index) => (
              <div
                key={cat.category}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-card-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {index + 1}
                  </span>
                  <span className="badge badge-category">{cat.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      height: 4,
                      width: 100,
                      borderRadius: 2,
                      background: 'var(--border)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(cat.count / (stats.topCategories[0]?.count || 1)) * 100}%`,
                        background: 'var(--accent-blue)',
                        borderRadius: 2,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      minWidth: 30,
                      textAlign: 'right',
                    }}
                  >
                    {cat.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
