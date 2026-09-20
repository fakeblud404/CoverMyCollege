'use client';

import { CATEGORIES, type Category } from '@/lib/types';

interface CategoryFilterProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
        overflowX: 'auto',
        padding: '16px 0',
        scrollbarWidth: 'none',
      }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            style={{
              padding: '8px 18px',
              borderRadius: 100,
              fontSize: '0.82rem',
              fontWeight: isActive ? 700 : 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: isActive ? '1px solid #2563eb' : '1px solid rgba(0, 0, 0, 0.08)',
              background: isActive ? '#2563eb' : 'rgba(255, 255, 255, 0.8)',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
