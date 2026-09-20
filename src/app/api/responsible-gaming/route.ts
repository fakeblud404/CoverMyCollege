import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  // TODO: BACKEND — fetch responsible gaming limits from Firestore for authenticated user
  return NextResponse.json({
    userId,
    limits: {
      dailyDepositLimit: null,
      weeklyDepositLimit: null,
      monthlyDepositLimit: null,
      dailyLossLimit: null,
      weeklyLossLimit: null,
      monthlyLossLimit: null,
      sessionTimeLimit: null,
      realityCheckInterval: 30,
      selfExclusionUntil: null,
      coolingOffUntil: null,
      isExcluded: false,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, limits, exclusion, coolingOff } = body;

    // TODO: BACKEND — save limits and self-exclusion to Firestore under user document
    // TODO: BACKEND — validate that limit increases enforce a mandatory 24-hour cooling off period

    return NextResponse.json({
      success: true,
      message: 'Responsible gaming settings updated successfully',
      settings: { userId, limits, exclusion, coolingOff, updatedAt: new Date() },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
