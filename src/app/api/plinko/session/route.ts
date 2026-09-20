import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wager, multiplier, payout, seed, hash, risk, rows } = body;

    // TODO: BACKEND — verify seed & hash provable fairness on server
    // TODO: BACKEND — record drop in Firestore user session stats & global RTP stats collection

    return NextResponse.json({
      success: true,
      drop: {
        wager,
        multiplier,
        payout,
        seed,
        hash,
        risk,
        rows,
        timestamp: new Date(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to record session drop' }, { status: 500 });
  }
}
