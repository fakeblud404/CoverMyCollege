import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_BASE =
  process.env.PAYPAL_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
  const secret = process.env.PAYPAL_SECRET || '';

  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

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

    // Admin bypass — skip real PayPal entirely
    if (bidderName && bidderName.trim().toLowerCase() === 'adminairy1') {
      return NextResponse.json({
        orderId: 'ADMIN_BYPASS_' + Math.random().toString(36).substring(2, 11).toUpperCase(),
        isAdminBypass: true,
      });
    }

    const amountUSD = (amount / 100).toFixed(2); // Convert cents → dollars

    const accessToken = await getPayPalAccessToken();

    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amountUSD,
            },
            description: 'Cover My College — App Leaderboard Bid',
          },
        ],
        application_context: {
          brand_name: 'Cover My College',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?payment=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?payment=cancelled`,
        },
      }),
    });

    if (!orderRes.ok) {
      const errData = await orderRes.json().catch(() => ({}));
      throw new Error(errData?.message || 'Failed to create PayPal order');
    }

    const orderData = await orderRes.json();

    return NextResponse.json({
      orderId: orderData.id,
      isAdminBypass: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create PayPal order';
    console.error('PayPal create-order error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
