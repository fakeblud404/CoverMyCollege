import { NextResponse } from 'next/server';
import { INITIAL_LEADERBOARD_ADS } from '@/lib/initial-ads';

declare global {
  // eslint-disable-next-line no-var
  var __MEMO_ADS_STORE: any[] | undefined;
}

// GET /api/stats — Returns aggregated bid stats from the leaderboard apps
export async function GET() {
  try {
    const ads = globalThis.__MEMO_ADS_STORE || INITIAL_LEADERBOARD_ADS;
    const totalRaisedCents = ads.reduce((sum, ad) => sum + (ad.baseBid ?? 0), 0);
    const totalAds = ads.length;
    const bidderCount = new Set(ads.map(ad => ad.bidderName || ad.id)).size;

    return NextResponse.json({
      totalRaisedCents,
      totalAds,
      bidderCount,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    const fallbackCents = INITIAL_LEADERBOARD_ADS.reduce((sum, ad) => sum + (ad.baseBid ?? 0), 0);
    return NextResponse.json({
      totalRaisedCents: fallbackCents,
      totalAds: INITIAL_LEADERBOARD_ADS.length,
      bidderCount: INITIAL_LEADERBOARD_ADS.length,
    });
  }
}
