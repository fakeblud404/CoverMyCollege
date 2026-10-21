import { NextRequest, NextResponse } from 'next/server';
import { whop } from '@/lib/whop';
import { getAuthenticatedUser, attachUserCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Early check: fail fast with a helpful message if Whop is not configured
    const whopApiKey = process.env.WHOP_COMPANY_API_KEY;
    if (!whopApiKey || whopApiKey === 'your_whop_company_api_key_here' || whopApiKey === 'mock_whop_key') {
      return NextResponse.json(
        { error: 'Whop is not configured. Please set WHOP_COMPANY_API_KEY in your Vercel environment variables (or .env.local for local dev).' },
        { status: 503 }
      );
    }

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

    // Whop strictly rejects "localhost" domains for redirect_url, even if prefixed with https://
    // It requires a valid, publicly resolvable HTTPS URL.
    let baseHost = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
    
    // Check if running on localhost or not set
    const isLocalhost = !baseHost || baseHost.includes('localhost') || baseHost.includes('127.0.0.1');

    let redirectUrl: string;
    if (isLocalhost) {
      // In local development, use a valid https domain as fallback or ngrok/public tunnel if defined
      // Local dev payment verification works via redirect or client polling
      const publicBase = process.env.NEXT_PUBLIC_FALLBACK_URL || 'https://covermycollege.com';
      redirectUrl = `${publicBase.replace(/\/+$/, '')}/payment-completion?user_id=${encodeURIComponent(user.id)}&ad_id=${encodeURIComponent(adId || '')}`;
    } else {
      let cleaned = baseHost.replace(/\/+$/, '');
      if (cleaned.startsWith('http://')) {
        cleaned = cleaned.replace('http://', 'https://');
      } else if (!cleaned.startsWith('https://')) {
        cleaned = `https://${cleaned}`;
      }
      redirectUrl = `${cleaned}/payment-completion?user_id=${encodeURIComponent(user.id)}&ad_id=${encodeURIComponent(adId || '')}`;
    }

    console.log('[Whop Checkout API] Using redirectUrl for Whop:', redirectUrl);



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

    // 2. Try creating checkout configuration
    // Method A: Inline one-time plan with product_id (if WHOP_PRODUCT_ID is defined) or inline plan
    console.log('[Whop Checkout API] Initializing checkout configuration for amount:', {
      amountUSD: amountInDollars,
      amountCents: amountInCents,
      hasAdTitle: Boolean(adData?.title),
      hasAdUrl: Boolean(adData?.url),
      hasPlanId: Boolean(planId),
    });

    const productId = process.env.WHOP_PRODUCT_ID;

    try {
      const planPayload: Record<string, any> = {
        currency: 'usd',
        initial_price: amountInDollars,
        plan_type: 'one_time',
        title: adData?.title ? `App Promotion: ${adData.title}` : `App Promotion ($${amountInDollars.toFixed(2)})`,
      };

      if (productId) {
        planPayload.product_id = productId;
      }

      console.log('[Whop Checkout API] Attempting checkout creation with inline plan...');
      checkoutConfig = await whop.checkoutConfigurations.create({
        mode: 'payment',
        redirect_url: redirectUrl,
        account_id: accountId || undefined,
        metadata,
        plan: planPayload as any,
      });
      console.log('[Whop Checkout API] Checkout configuration created via inline plan.');
    } catch (inlineErr: any) {
      console.warn('[Whop Checkout API] Inline plan creation error:', inlineErr?.message || inlineErr);

      // If missing product_id or inline plan fails and we have a product list or planId, try fallbacks
      if (planId) {
        console.log('[Whop Checkout API] Retrying with pre-configured plan_id:', planId);
        checkoutConfig = await whop.checkoutConfigurations.create({
          mode: 'payment',
          plan_id: planId,
          redirect_url: redirectUrl,
          account_id: accountId || undefined,
          metadata,
        });
        console.log('[Whop Checkout API] Checkout configuration created via plan_id.');
      } else {
        // Try fetching first available product to attach product_id to inline plan
        try {
          console.log('[Whop Checkout API] Attempting to auto-discover product for inline plan...');
          const productsRes = await whop.products.list({ account_id: accountId || undefined });
          const productsList = (productsRes as any)?.data || productsRes;
          const firstProduct = Array.isArray(productsList) ? productsList[0] : null;

          if (firstProduct?.id) {
            console.log('[Whop Checkout API] Found product ID:', firstProduct.id, 'retrying inline plan...');
            checkoutConfig = await whop.checkoutConfigurations.create({
              mode: 'payment',
              redirect_url: redirectUrl,
              account_id: accountId || undefined,
              metadata,
              plan: {
                product_id: firstProduct.id,
                currency: 'usd',
                initial_price: amountInDollars,
                plan_type: 'one_time',
                title: adData?.title ? `App Promotion: ${adData.title}` : `App Promotion ($${amountInDollars.toFixed(2)})`,
              },
            });
            console.log('[Whop Checkout API] Checkout created with auto-discovered product.');
          } else {
            throw inlineErr;
          }
        } catch {
          // Re-throw the original error if fallback also failed
          throw inlineErr;
        }
      }
    }

    // Resolve purchase_url (can be relative e.g. "/checkout/ch_xxx" or absolute "https://whop.com/checkout/ch_xxx")
    let rawUrl: string | undefined = checkoutConfig?.purchase_url;
    if (!rawUrl && checkoutConfig?.data?.purchase_url) {
      rawUrl = checkoutConfig.data.purchase_url;
    }

    if (!rawUrl) {
      console.error('[Whop Checkout API] No purchase_url in Whop response:', checkoutConfig);
      return NextResponse.json(
        { error: 'Failed to generate Whop checkout URL. Please verify your Whop settings and plan configuration.' },
        { status: 502 }
      );
    }

    // Ensure valid absolute HTTPS URL
    let checkoutUrl = rawUrl.trim();
    if (checkoutUrl.startsWith('/')) {
      checkoutUrl = `https://whop.com${checkoutUrl}`;
    } else if (!checkoutUrl.startsWith('http://') && !checkoutUrl.startsWith('https://')) {
      checkoutUrl = `https://${checkoutUrl}`;
    }

    console.log('[Whop Checkout API] Successfully resolved checkout URL:', {
      checkoutId: checkoutConfig?.id || checkoutConfig?.data?.id,
      isHttps: checkoutUrl.startsWith('https://'),
      domain: new URL(checkoutUrl).hostname,
    });

    const response = NextResponse.json({
      checkoutUrl,
      checkoutId: checkoutConfig?.id || checkoutConfig?.data?.id,
      amountCents: amountInCents,
      amountUSD: amountInDollars,
    });

    if (isNewSession) {
      attachUserCookie(response, user.id);
    }

    return response;
  } catch (error: any) {
    console.error('[Whop Checkout API] Error creating Whop hosted checkout session:', error);

    // Extract exact details from Whop error object or HTTP response
    let errorMessage = 'Failed to create Whop checkout session.';
    if (error?.body?.error?.message) {
      errorMessage = error.body.error.message;
    } else if (error?.body?.message) {
      errorMessage = error.body.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    if (error?.statusCode === 401 || error?.status === 401 || errorMessage.includes('Unauthorized') || errorMessage.includes('unauthorized')) {
      errorMessage = 'Whop authentication failed (401). Please verify WHOP_COMPANY_API_KEY in your Vercel Environment Variables.';
    } else if (error?.statusCode === 403 || error?.status === 403) {
      errorMessage = 'Whop permission denied (403). Make sure your API key has checkout and plan creation permissions.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: error?.statusCode || error?.status || 500 }
    );
  }
}
