import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// In-memory fallback store for local sandbox (no real Firebase credentials)
let MEMO_ADS_STORE: any[] = [];

// GET /api/ads — Fetch leaderboard sorted by finalBid desc
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    let ads: any[] = [];
    try {
      let query = adminDb
        .collection('ads')
        .where('status', '==', 'active')
        .orderBy('finalBid', 'desc')
        .limit(limit);

      if (category && category !== 'All') {
        query = adminDb
          .collection('ads')
          .where('status', '==', 'active')
          .where('category', '==', category)
          .orderBy('finalBid', 'desc')
          .limit(limit);
      }

      const snapshot = await query.get();
      ads = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Strip private bidderEmail before returning to client
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { bidderEmail: _omit, ...publicData } = data;
        return {
          id: doc.id,
          ...publicData,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          endsAt: data.endsAt?.toDate?.() ?? null,
        };
      });
    } catch (dbError) {
      console.warn('Firestore not initialized or failed, using local in-memory store:', dbError);
      ads = [...MEMO_ADS_STORE];
      if (category && category !== 'All') {
        ads = ads.filter((ad) => ad.category === category);
      }
      ads.sort((a, b) => b.finalBid - a.finalBid);
      ads = ads.slice(0, limit);
    }

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}

// POST /api/ads — Submit new ad/bid after payment + Plinko
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      url,
      category,
      baseBid,
      multiplier,
      finalBid,
      stripePaymentId,
      bidderName,
      bidderEmail,
    } = body;

    if (!title || !url || !baseBid || !multiplier || !stripePaymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date();
    // Auctions run for 7 days by default
    const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const adData = {
      title,
      description: description || '',
      url,
      category: category || 'Other',
      baseBid,
      multiplier,
      finalBid: finalBid || Math.round(baseBid * multiplier),
      clicks: 0,
      status: 'active', // Auto-approve
      stripePaymentId,
      bidderName: bidderName?.trim() || 'Anonymous',
      bidderEmail: bidderEmail?.trim() || '', // Stored but never returned to client
      createdAt: now,
      updatedAt: now,
      endsAt,
    };

    let docId = 'demo-' + Math.random().toString(36).substr(2, 9);
    try {
      // Write the ad document
      const docRef = await adminDb.collection('ads').add(adData);
      docId = docRef.id;

      // Atomically update aggregated stats in meta/stats
      const statsRef = adminDb.collection('meta').doc('stats');
      await statsRef.set(
        {
          totalRaisedCents: FieldValue.increment(baseBid),
          totalAds: FieldValue.increment(1),
          bidderCount: FieldValue.increment(1),
          updatedAt: now,
        },
        { merge: true }
      );
    } catch (dbError) {
      console.warn('Firestore writing failed, appending to local in-memory store:', dbError);
      MEMO_ADS_STORE.push({ id: docId, ...adData });
    }

    // Return public data only (no bidderEmail)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bidderEmail: _omit, ...publicAdData } = adData;
    return NextResponse.json({ id: docId, ...publicAdData });
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
  }
}
