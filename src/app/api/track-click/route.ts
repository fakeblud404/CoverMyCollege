import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Simple in-memory rate limiter
const clickMap = new Map<string, number>();
const RATE_LIMIT_MS = 5000; // 5 seconds between clicks per IP per ad

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId } = body;

    if (!adId) {
      return NextResponse.json({ error: 'adId is required' }, { status: 400 });
    }

    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const key = `${ip}:${adId}`;
    const lastClick = clickMap.get(key);
    const now = Date.now();

    if (lastClick && now - lastClick < RATE_LIMIT_MS) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }
    clickMap.set(key, now);

    // Increment clicks atomically
    const docRef = adminDb.collection('ads').doc(adId);
    await docRef.update({
      clicks: FieldValue.increment(1),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
  }
}
