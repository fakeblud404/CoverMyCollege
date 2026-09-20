import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, bidderName } = body;

    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Minimum bid is $1.00 (100 cents)' },
        { status: 400 }
      );
    }

    // Check for Admin Bypass key
    if (bidderName && bidderName.trim().toLowerCase() === 'adminairy1') {
      return NextResponse.json({
        clientSecret: 'admin_bypass_secret',
        paymentIntentId: 'pi_admin_bypass_' + Math.random().toString(36).substr(2, 9),
        isAdminBypass: true,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'usd',
      metadata: {
        type: 'ad_bid',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      isAdminBypass: false,
    });
  } catch (error) {
    console.error('Stripe PaymentIntent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
