import { NextRequest, NextResponse } from 'next/server';
import { whop } from '@/lib/whop';
import { getAuthenticatedUser, attachUserCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { user, isNewSession } = getAuthenticatedUser(request);
    const body = await request.json().catch(() => ({}));
    const {
      amount, // In cents (e.g. 1000 = $10.00) or USD
      adId, // If promoting/boosting an existing listing
      adData, // If submitting a new listing
    } = body;

    // 1. Amount validation: minimum $1.00 (100 cents), positive integer cents
    const rawAmount = Number(amount);
    if (!rawAmount || isNaN(rawAmount)) {
      return NextResponse.json({ error: 'Please provide a valid promotion amount.' }, { status: 400 });
    }

    // Accept either dollar amount ($10) or cents (1000)
    const amountInCents = Math.round(rawAmount < 50 ? rawAmount * 100 : rawAmount);
    if (amountInCents < 100) {
      return NextResponse.json(
        { error: 'Minimum promotion amount is $1.00 USD (100 cents).' },
        { status: 400 }
      );
    }
    const amountInDollars = parseFloat((amountInCents / 100).toFixed(2));

    const accountId = process.env.NEXT_PUBLIC_WHOP_ACCOUNT_ID || process.env.WHOP_ACCOUNT_ID;
    const planId = process.env.WHOP_ONE_TIME_PLAN_ID;

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const redirectUrl = `${appUrl}/payment-completion?user_id=${encodeURIComponent(user.id)}&ad_id=${encodeURIComponent(adId || '')}`;

    // Metadata to associate payment with listing/app
    const metadata: Record<string, string> = {
      userId: user.id,
      amountCents: amountInCents.toString(),
      amountUSD: amountInDollars.toString(),
      targetAdId: adId || '',
      adTitle: adData?.title || '',
      adUrl: adData?.url || '',
      adCategory: adData?.category || '',
      bidderName: adData?.bidderName || '',
      bidderEmail: adData?.bidderEmail || '',
      logoUrl: adData?.logoUrl ? (adData.logoUrl.length < 500 ? adData.logoUrl : '') : '',
      multiplier: (adData?.multiplier || 1.0).toString(),
    };

    let checkoutConfig: any;

    // First attempt: create dynamic variable-amount hosted checkout via inline plan
    try {
      checkoutConfig = await whop.checkoutConfigurations.create({
        mode: 'payment',
        redirect_url: redirectUrl,
        account_id: accountId || undefined,
        metadata,
        plan: {
          currency: 'usd',
          initial_price: amountInDollars,
          plan_type: 'one_time',
          title: adData?.title ? `App Promotion: ${adData.title}` : `App Promotion ($${amountInDollars.toFixed(2)})`,
        },
      });
    } catch (inlineErr: any) {
      console.warn('Inline plan checkout creation not permitted or failed, falling back to configured plan:', inlineErr?.message);
      
      // Fallback: if account requires pre-created plan_id
      if (planId) {
        checkoutConfig = await whop.checkoutConfigurations.create({
          mode: 'payment',
          plan_id: planId,
          redirect_url: redirectUrl,
          account_id: accountId || undefined,
          metadata,
        });
      } else {
        throw inlineErr;
      }
    }

    if (!checkoutConfig || !checkoutConfig.purchase_url) {
      return NextResponse.json(
        { error: 'Failed to generate Whop hosted checkout URL.' },
        { status: 502 }
      );
    }

    const response = NextResponse.json({
      checkoutUrl: checkoutConfig.purchase_url,
      checkoutId: checkoutConfig.id,
      amountCents: amountInCents,
      amountUSD: amountInDollars,
    });

    if (isNewSession) {
      attachUserCookie(response, user.id);
    }

    return response;
  } catch (error: unknown) {
    console.error('Error creating Whop hosted checkout session:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
