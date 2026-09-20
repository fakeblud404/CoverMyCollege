import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET /api/stats — Returns aggregated bid stats for the tuition progress tracker
// Reads from meta/stats (maintained atomically by POST /api/ads).
// Falls back to summing the ads collection if the meta doc doesn't yet exist.
export async function GET() {
  try {
    // Try the fast path: pre-aggregated meta document
    try {
      const statsDoc = await adminDb.collection('meta').doc('stats').get();
      if (statsDoc.exists) {
        const data = statsDoc.data()!;
        return NextResponse.json({
          totalRaisedCents: data.totalRaisedCents ?? 0,
          totalAds: data.totalAds ?? 0,
          bidderCount: data.bidderCount ?? 0,
        });
      }
    } catch {
      // Fall through to the collection scan below
    }

    // Slow path: scan the ads collection (used before any bids exist or if meta is missing)
    const snapshot = await adminDb
      .collection('ads')
      .where('status', '==', 'active')
      .get();

    let totalRaisedCents = 0;
    let totalAds = 0;
    const bidderSet = new Set<string>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalRaisedCents += data.baseBid ?? 0;
      totalAds += 1;
      if (data.bidderEmail) bidderSet.add(data.bidderEmail);
    });

    return NextResponse.json({
      totalRaisedCents,
      totalAds,
      bidderCount: bidderSet.size,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return zeros so the UI degrades gracefully rather than crashing
    return NextResponse.json({
      totalRaisedCents: 0,
      totalAds: 0,
      bidderCount: 0,
    });
  }
}
