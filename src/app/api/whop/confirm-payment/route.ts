import { NextRequest, NextResponse } from 'next/server';
import { whop } from '@/lib/whop';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

declare global {
  // eslint-disable-next-line no-var
  var __MEMO_ADS_STORE: any[] | undefined;
  // eslint-disable-next-line no-var
  var __MEMO_CONFIRMED_PAYMENTS: Set<string> | undefined;
}

if (!globalThis.__MEMO_CONFIRMED_PAYMENTS) {
  globalThis.__MEMO_CONFIRMED_PAYMENTS = new Set<string>();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      confirmationTokenId,
      amount, // In cents (e.g. 1000 = $10.00)
      adId, // If boosting an existing ad
      adData, // If submitting a new ad listing { title, url, description, category, bidderName, bidderEmail, logoUrl, multiplier }
    } = body;

    // 1. Validate Amount
    const parsedAmount = Math.round(Number(amount));
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 100) {
      return NextResponse.json(
        { error: 'Invalid amount: Minimum payment is $1.00 (100 cents)' },
        { status: 400 }
      );
    }

    if (!confirmationTokenId) {
      return NextResponse.json(
        { error: 'Missing confirmation token' },
        { status: 400 }
      );
    }

    // 2. Prevent replay/duplicate confirmation token processing
    if (globalThis.__MEMO_CONFIRMED_PAYMENTS?.has(confirmationTokenId)) {
      return NextResponse.json(
        { error: 'This payment confirmation token has already been processed.' },
        { status: 409 }
      );
    }

    const accountId = process.env.NEXT_PUBLIC_WHOP_ACCOUNT_ID || process.env.WHOP_ACCOUNT_ID;
    if (!accountId) {
      return NextResponse.json(
        { error: 'WHOP_ACCOUNT_ID is not configured on the server.' },
        { status: 500 }
      );
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const returnUrl = `${appUrl}/payment-completion`;

    // 3. Confirm payment with Whop Payments API
    let paymentResponse: any;
    try {
      paymentResponse = await whop.payments.create({
        account_id: accountId,
        confirmation_token: confirmationTokenId,
        capture: true,
        return_url: returnUrl,
        plan: {
          currency: 'usd',
          initial_price: parsedAmount / 100, // Dollar unit for plan initial_price
          plan_type: 'one_time',
          title: adData?.title ? `Promotion: ${adData.title}` : 'App Promotion Bid',
        },
      });
    } catch (whopErr: any) {
      console.error('Whop payment creation failed:', whopErr);
      const msg = whopErr?.message || whopErr?.error || 'Payment confirmation failed with Whop.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const paymentId = paymentResponse?.id || `pay_${Date.now()}`;
    const paymentStatus = paymentResponse?.status || 'succeeded';

    // Verify payment status
    if (paymentStatus !== 'succeeded' && paymentStatus !== 'completed' && paymentStatus !== 'processing') {
      return NextResponse.json(
        { error: `Payment was not completed. Status: ${paymentStatus}` },
        { status: 400 }
      );
    }

    // Record token as consumed
    if (!globalThis.__MEMO_CONFIRMED_PAYMENTS) {
      globalThis.__MEMO_CONFIRMED_PAYMENTS = new Set<string>();
    }
    globalThis.__MEMO_CONFIRMED_PAYMENTS.add(confirmationTokenId);

    // 4. Update Leaderboard / Promotion Spend safely
    let targetAdId = adId;
    let finalRankedBid = parsedAmount;

    if (targetAdId) {
      // Boosting existing listing
      try {
        const adRef = adminDb.collection('ads').doc(targetAdId);
        const snap = await adRef.get();
        if (snap.exists) {
          const current = snap.data();
          const mult = current?.multiplier || 1.0;
          const newBaseBid = (current?.baseBid || 0) + parsedAmount;
          const newFinalBid = Math.round(newBaseBid * mult);
          finalRankedBid = newFinalBid;

          await adRef.update({
            baseBid: newBaseBid,
            finalBid: newFinalBid,
            whopPaymentId: paymentId,
            updatedAt: new Date(),
          });
        }
      } catch (dbErr) {
        console.warn('Firestore existing ad update error:', dbErr);
      }

      // Sync in-memory
      if (globalThis.__MEMO_ADS_STORE) {
        const item = globalThis.__MEMO_ADS_STORE.find((a) => a.id === targetAdId);
        if (item) {
          item.baseBid = (item.baseBid || 0) + parsedAmount;
          item.finalBid = Math.round(item.baseBid * (item.multiplier || 1.0));
          finalRankedBid = item.finalBid;
        }
      }
    } else if (adData) {
      // Creating a new promoted ad listing
      const mult = Number(adData.multiplier) || 1.0;
      finalRankedBid = Math.round(parsedAmount * mult);
      const now = new Date();

      const newListing = {
        title: adData.title,
        description: adData.description || '',
        url: adData.url,
        category: adData.category || 'Other',
        baseBid: parsedAmount,
        multiplier: mult,
        finalBid: finalRankedBid,
        clicks: 0,
        status: 'active',
        whopPaymentId: paymentId,
        bidderName: adData.bidderName?.trim() || 'Anonymous',
        bidderEmail: adData.bidderEmail?.trim() || '',
        logoUrl: adData.logoUrl || null,
        createdAt: now,
        updatedAt: now,
        endsAt: new Date(now.getTime() + 7 * 86400000),
      };

      try {
        const docRef = await adminDb.collection('ads').add(newListing);
        targetAdId = docRef.id;

        // Atomically update meta/stats
        const statsRef = adminDb.collection('meta').doc('stats');
        await statsRef.set(
          {
            totalRaisedCents: FieldValue.increment(parsedAmount),
            totalAds: FieldValue.increment(1),
            bidderCount: FieldValue.increment(1),
            updatedAt: now,
          },
          { merge: true }
        );
      } catch (dbErr) {
        console.warn('Firestore new ad write failed, using memory store:', dbErr);
        targetAdId = 'whop-' + Math.random().toString(36).substring(2, 9);
      }

      if (!globalThis.__MEMO_ADS_STORE) {
        globalThis.__MEMO_ADS_STORE = [];
      }
      const { bidderEmail: _, ...publicListing } = newListing;
      globalThis.__MEMO_ADS_STORE.unshift({ id: targetAdId, ...publicListing });
    }

    // Record purchase ledger in Firestore
    try {
      await adminDb.collection('purchases').doc(paymentId).set({
        paymentId,
        confirmationTokenId,
        amount: parsedAmount,
        adId: targetAdId,
        status: 'succeeded',
        confirmedAt: new Date(),
      });
    } catch {
      // Ignore fallback
    }

    return NextResponse.json({
      success: true,
      paymentId,
      adId: targetAdId,
      creditedAmount: parsedAmount,
      finalBid: finalRankedBid,
    });
  } catch (err: unknown) {
    console.error('Error confirming payment:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
