import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshot = await adminDb.collection('ads').get();
    const ads = snapshot.docs.map((doc) => doc.data());

    const totalRevenue = ads.reduce((sum, ad) => sum + (ad.baseBid || 0), 0);
    const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
    const totalAds = ads.length;
    const activeAds = ads.filter((ad) => ad.status === 'active').length;
    const pendingAds = ads.filter((ad) => ad.status === 'pending').length;

    // Top categories
    const categoryCounts: Record<string, number> = {};
    ads.forEach((ad) => {
      const cat = ad.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      totalRevenue,
      totalClicks,
      totalAds,
      activeAds,
      pendingAds,
      topCategories,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
