import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

import { INITIAL_LEADERBOARD_ADS } from '@/lib/initial-ads';

declare global {
  // eslint-disable-next-line no-var
  var __MEMO_ADS_STORE: any[] | undefined;
}

if (!globalThis.__MEMO_ADS_STORE) {
  globalThis.__MEMO_ADS_STORE = [...INITIAL_LEADERBOARD_ADS];
}

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

      // Add a quick timeout (1.5s) to Firestore call so it never blocks page loading if Firebase is slow/disabled
      const firestorePromise = query.get();
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 1500)
      );

      const snapshot = (await Promise.race([firestorePromise, timeoutPromise])) as any;
      if (snapshot && snapshot.docs) {
        ads = snapshot.docs.map((doc: any) => {
          const data = doc.data();
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
      }

      if (ads.length === 0) {
        ads = [...(globalThis.__MEMO_ADS_STORE || [])];
        if (category && category !== 'All') {
          ads = ads.filter((ad) => ad.category === category);
        }
      }
    } catch {
      ads = [...(globalThis.__MEMO_ADS_STORE || [])];
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
      paypalOrderId,
      bidderName,
      bidderEmail,
      logoUrl,
    } = body;

    const paymentId = paypalOrderId || stripePaymentId;

    if (!title || !url || !baseBid || !multiplier || !paymentId) {
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
      stripePaymentId: stripePaymentId || null,
      paypalOrderId: paypalOrderId || null,
      bidderName: bidderName?.trim() || 'Anonymous',
      bidderEmail: bidderEmail?.trim() || '', // Stored but never returned to client
      logoUrl: logoUrl || null,
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
    }

    // Always keep in-memory store updated for instant client leaderboard feedback
    if (!globalThis.__MEMO_ADS_STORE) {
      globalThis.__MEMO_ADS_STORE = [];
    }
    globalThis.__MEMO_ADS_STORE.unshift({ id: docId, ...adData });

    // Return public data only (no bidderEmail)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bidderEmail: _omit, ...publicAdData } = adData;
    return NextResponse.json({ id: docId, ...publicAdData });
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
  }
}
