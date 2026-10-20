import { NextRequest, NextResponse } from 'next/server';
import { whop } from '@/lib/whop';
import { getAuthenticatedUser, attachUserCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { user, isNewSession } = getAuthenticatedUser(request);

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized: User authentication required' }, { status: 401 });
    }

    const planId = process.env.WHOP_ONE_TIME_PLAN_ID;
    if (!planId) {
      return NextResponse.json(
        { error: 'Server configuration error: WHOP_ONE_TIME_PLAN_ID is not configured' },
        { status: 500 }
      );
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const redirectUrl = `${appUrl}/payment-completion?user_id=${encodeURIComponent(user.id)}`;

    // Create Whop hosted checkout session configuration
    const checkoutConfig = await whop.checkoutConfigurations.create({
      plan_id: planId,
      mode: 'payment',
      redirect_url: redirectUrl,
      metadata: {
        userId: user.id,
        purchaseType: 'one_time_unlock',
        appName: 'Cover My College',
      },
    });

    if (!checkoutConfig || !checkoutConfig.purchase_url) {
      return NextResponse.json(
        { error: 'Failed to generate Whop checkout URL' },
        { status: 502 }
      );
    }

    const response = NextResponse.json({
      checkoutUrl: checkoutConfig.purchase_url,
      checkoutId: checkoutConfig.id,
      userId: user.id,
    });

    if (isNewSession) {
      attachUserCookie(response, user.id);
    }

    return response;
  } catch (error: unknown) {
    console.error('Error creating Whop checkout configuration:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
