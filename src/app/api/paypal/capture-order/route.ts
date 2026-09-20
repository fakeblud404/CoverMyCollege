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
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Admin bypass — no real order to capture
    if (typeof orderId === 'string' && orderId.startsWith('ADMIN_BYPASS_')) {
      return NextResponse.json({
        success: true,
        orderId,
        isAdminBypass: true,
      });
    }

    const accessToken = await getPayPalAccessToken();

    const captureRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!captureRes.ok) {
      const errData = await captureRes.json().catch(() => ({}));
      throw new Error(errData?.message || 'Failed to capture PayPal order');
    }

    const captureData = await captureRes.json();

    if (captureData.status !== 'COMPLETED') {
      throw new Error(`PayPal capture status: ${captureData.status}`);
    }

    return NextResponse.json({
      success: true,
      orderId: captureData.id,
      isAdminBypass: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to capture PayPal order';
    console.error('PayPal capture-order error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
