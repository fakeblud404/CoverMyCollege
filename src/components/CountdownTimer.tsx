'use client';

import { useEffect, useState } from 'react';
import type { AuctionStatus } from '@/lib/types';

interface CountdownTimerProps {
  endsAt: Date | string | number;
  className?: string;
  compact?: boolean; // short format: "2h 14m"
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  status: AuctionStatus;
  totalSeconds: number;
}

function computeTimeLeft(endsAtInput: Date | string | number): TimeLeft {
  const endsAt = new Date(endsAtInput);
  if (isNaN(endsAt.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, status: 'live', totalSeconds: 0 };
  }
  const diff = endsAt.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, status: 'closed', totalSeconds: 0 };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const status: AuctionStatus = totalSeconds <= 600 ? 'ending-soon' : 'live';
  return { days, hours, minutes, seconds, status, totalSeconds };
}

export default function CountdownTimer({ endsAt, className = '', compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(endsAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const colorClass =
    timeLeft.status === 'closed'
      ? 'countdown-closed'
      : timeLeft.status === 'ending-soon'
        ? 'countdown-ending'
        : 'countdown-live';

  if (timeLeft.status === 'closed') {
    return (
      <span className={`countdown-digit countdown-closed ${className}`} style={{ fontSize: '0.82rem' }}>
        Ended
      </span>
    );
  }

  if (compact) {
    const parts: string[] = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    if (timeLeft.hours > 0) parts.push(`${timeLeft.hours}h`);
    if (timeLeft.minutes > 0) parts.push(`${timeLeft.minutes}m`);
    if (timeLeft.days === 0 && timeLeft.hours === 0) parts.push(`${timeLeft.seconds}s`);
    return (
      <span className={`countdown-digit ${colorClass} ${className}`} style={{ fontSize: '0.82rem' }}>
        ⏱ {parts.join(' ')}
      </span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className={`${colorClass} ${className}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {timeLeft.days > 0 && (
        <>
          <span className="countdown-digit" style={{ fontSize: '0.9rem' }}>{timeLeft.days}d</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>:</span>
        </>
      )}
      <span className="countdown-digit" style={{ fontSize: '0.9rem' }}>{pad(timeLeft.hours)}h</span>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>:</span>
      <span className="countdown-digit" style={{ fontSize: '0.9rem' }}>{pad(timeLeft.minutes)}m</span>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>:</span>
      <span className="countdown-digit" style={{ fontSize: '0.9rem' }}>{pad(timeLeft.seconds)}s</span>
    </div>
  );
}
