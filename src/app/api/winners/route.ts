import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET /api/winners — Returns recent closed/completed bids for the Winners page.
// Priority: dedicated 'winners' collection → fallback: ads with auctionStatus='closed'
export async function GET() {
  try {
    let winners: any[] = [];

    try {
      // 1) Try dedicated winners collection first
      const winnersSnap = await adminDb
        .collection('winners')
        .orderBy('finalBid', 'desc')
        .limit(20)
        .get();

      if (!winnersSnap.empty) {
        winners = winnersSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.bidderName || 'Anonymous',
            avatarEmoji: data.avatarEmoji || '',
            item: data.title,
            amountCents: data.finalBid ?? 0,
            amountDisplay: `$${((data.finalBid ?? 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            category: data.category || 'Other',
            multiplier: data.multiplier ?? 1,
            bigWin: `${data.multiplier ?? 1}×`,
            date: data.closedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date(),
            url: data.url || '',
          };
        });
      } else {
        // 2) Fallback: closed ads from the main ads collection
        const closedSnap = await adminDb
          .collection('ads')
          .where('auctionStatus', '==', 'closed')
          .orderBy('finalBid', 'desc')
          .limit(20)
          .get();

        if (closedSnap.empty) {
          // 3) Also try ads whose endsAt has passed
          const pastSnap = await adminDb
            .collection('ads')
            .where('status', '==', 'active')
            .orderBy('finalBid', 'desc')
            .limit(20)
            .get();

          winners = pastSnap.docs
            .map((doc) => {
              const data = doc.data();
              const endsAt = data.endsAt?.toDate?.();
              if (endsAt && endsAt > new Date()) return null; // still live
              return {
                id: doc.id,
                name: data.bidderName || 'Anonymous',
                avatarEmoji: '',
                item: data.title,
                amountCents: data.finalBid ?? 0,
                amountDisplay: `$${((data.finalBid ?? 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                category: data.category || 'Other',
                multiplier: data.multiplier ?? 1,
                bigWin: `${data.multiplier ?? 1}×`,
                date: data.createdAt?.toDate?.() || new Date(),
                url: data.url || '',
              };
            })
            .filter(Boolean);
        } else {
          winners = closedSnap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.bidderName || 'Anonymous',
              avatarEmoji: '',
              item: data.title,
              amountCents: data.finalBid ?? 0,
              amountDisplay: `$${((data.finalBid ?? 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              category: data.category || 'Other',
              multiplier: data.multiplier ?? 1,
              bigWin: `${data.multiplier ?? 1}×`,
              date: data.createdAt?.toDate?.() || new Date(),
              url: data.url || '',
            };
          });
        }
      }
    } catch (dbError) {
      console.warn('Firestore query failed in /api/winners:', dbError);
      // Return empty array — page will show its empty state
    }

    // Derive sidebar leaderboards from the same dataset
    const plinkoLeaderboard = [...winners]
      .sort((a, b) => b.multiplier - a.multiplier)
      .slice(0, 5)
      .map((w) => ({
        name: w.name,
        multiplier: w.bigWin,
        amountDisplay: w.amountDisplay,
      }));

    // Count wins per name
    const winCounts: Record<string, number> = {};
    winners.forEach((w) => {
      winCounts[w.name] = (winCounts[w.name] || 0) + 1;
    });
    const mostWins = Object.entries(winCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, wins]) => ({ name, wins }));

    return NextResponse.json({ winners, plinkoLeaderboard, mostWins });
  } catch (error) {
    console.error('Error fetching winners:', error);
    return NextResponse.json({ winners: [], plinkoLeaderboard: [], mostWins: [] });
  }
}
