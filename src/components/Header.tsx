'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onPlaceBid?: () => void;
}

const NAV_LINKS = [
  { href: '/live-auctions', label: 'Live Auctions' },
  { href: '/app-predictions', label: 'Bet on Apps' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/plinko', label: 'Plinko' },
  { href: '/winners', label: 'Winners' },
];

export default function Header({ onPlaceBid }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      style={{
        position: 'sticky',
        top: 12,
        zIndex: 50,
        maxWidth: 1080,
        margin: '0 auto',
        width: 'calc(100% - 32px)',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: '100px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        padding: '8px 8px 8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
        <img
          src="/logo-covermycollege.png"
          alt="Cover My College"
          style={{ height: 32, objectFit: 'contain' }}
        />
      </Link>

      {/* Desktop Nav — center */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }} className="hide-mobile">
        {NAV_LINKS.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Right CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {onPlaceBid ? (
          <button
            className="btn-bid"
            onClick={onPlaceBid}
            id="header-bid-btn"
            style={{ fontSize: '0.88rem', padding: '9px 22px', minHeight: 38 }}
          >
            Fund College
          </button>
        ) : (
          <Link href="/live-auctions">
            <button
              className="btn-bid"
              id="header-bid-btn"
              style={{ fontSize: '0.88rem', padding: '9px 22px', minHeight: 38 }}
            >
              Fund College
            </button>
          </Link>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          style={{
            background: menuOpen ? 'rgba(0,0,0,0.06)' : 'transparent',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '50%',
            color: 'var(--ink)',
            cursor: 'pointer',
            width: 38,
            height: 38,
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            transition: 'background 0.18s',
            flexShrink: 0,
          }}
          className="show-mobile-flex"
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                display: 'block',
                width: 18,
                height: 1.5,
                background: 'currentColor',
                borderRadius: 2,
                transition: 'all 0.22s ease',
                transform:
                  menuOpen && i === 0 ? 'rotate(45deg) translate(4.5px, 4.5px)' :
                  menuOpen && i === 2 ? 'rotate(-45deg) translate(4.5px, -4.5px)' :
                  menuOpen && i === 1 ? 'scaleX(0)' : 'none',
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <nav
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            right: 0,
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 'var(--radius-xl)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideDown 0.18s ease',
          }}
        >
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
                style={{ padding: '11px 16px', borderRadius: 'var(--radius-md)', width: '100%' }}
              >
                {link.label}
              </Link>
            );
          })}
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 6px' }} />
          <Link href="/responsible-gaming" className="nav-link" onClick={() => setMenuOpen(false)} style={{ padding: '11px 16px', borderRadius: 'var(--radius-md)' }}>
            Responsible Gaming
          </Link>
          <Link href="/faq" className="nav-link" onClick={() => setMenuOpen(false)} style={{ padding: '11px 16px', borderRadius: 'var(--radius-md)' }}>
            FAQ
          </Link>
        </nav>
      )}
    </header>
  );
}
