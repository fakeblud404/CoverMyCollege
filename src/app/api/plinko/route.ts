import { NextRequest, NextResponse } from 'next/server';
import { PLINKO_MULTIPLIERS } from '@/lib/types';

// Weighted random selection using crypto RNG
function getWeightedRandom(): { multiplier: number; slotIndex: number } {
  const totalWeight = PLINKO_MULTIPLIERS.reduce((sum, m) => sum + m.weight, 0);

  // Use crypto for secure randomness
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  let random = (array[0] / (0xffffffff + 1)) * totalWeight;

  for (let i = 0; i < PLINKO_MULTIPLIERS.length; i++) {
    random -= PLINKO_MULTIPLIERS[i].weight;
    if (random <= 0) {
      const multiplier = PLINKO_MULTIPLIERS[i].value;
      // Map the multiplier to a slot index on the board
      // Board slots: [10, 5, 2, 1.5, 1, 1.5, 2, 5, 10]
      const slotMap: Record<number, number[]> = {
        10: [0, 8],
        5: [1, 7],
        2: [2, 6],
        1.5: [3, 5],
        1: [4],
        0.8: [4],
        0.5: [4],
      };

      const possibleSlots = slotMap[multiplier] || [4];
      const slotIndex = possibleSlots[Math.floor(Math.random() * possibleSlots.length)];

      return { multiplier, slotIndex };
    }
  }

  // Fallback
  return { multiplier: 1, slotIndex: 4 };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, baseBid } = body; // baseBid in cents

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'paymentIntentId is required' },
        { status: 400 }
      );
    }

    // Determine ball count based on bid amount (cents)
    // $1k - $4,999 -> 5 balls
    // $5k - $14,999 -> 15 balls
    // $15k - $49,999 -> 30 balls
    // $50k+ -> 50 balls
    const bidInDollars = (baseBid || 100000) / 100;
    let ballCount = 5;
    if (bidInDollars >= 50000) {
      ballCount = 50;
    } else if (bidInDollars >= 15000) {
      ballCount = 30;
    } else if (bidInDollars >= 5000) {
      ballCount = 15;
    }

    const ballsResults = [];
    let sumMultiplier = 0;

    for (let i = 0; i < ballCount; i++) {
      const ball = getWeightedRandom();
      ballsResults.push(ball);
      sumMultiplier += ball.multiplier;
    }

    // Round average multiplier to 2 decimal places
    const averageMultiplier = Math.round((sumMultiplier / ballCount) * 100) / 100;
    const targetSlotIndices = ballsResults.map(b => b.slotIndex);

    return NextResponse.json({
      multiplier: averageMultiplier,
      targetSlotIndices,
      ballCount,
      paymentIntentId,
    });
  } catch (error) {
    console.error('Error generating Plinko result:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
