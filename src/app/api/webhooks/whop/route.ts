import { NextRequest, NextResponse } from 'next/server';
import { unwrapWebhook, WebhookVerificationError } from '@whop/sdk/helpers';
import { adminDb } from '@/lib/firebase-admin';

declare global {
  // In-memory fallbacks when Firebase credentials are in sandbox demo mode
  // eslint-disable-next-line no-var
  var __MEMO_PROCESSED_WEBHOOKS: Set<string> | undefined;
  // eslint-disable-next-line no-var
  var __MEMO_USER_ENTITLEMENTS: Map<string, any> | undefined;
}

if (!globalThis.__MEMO_PROCESSED_WEBHOOKS) {
  globalThis.__MEMO_PROCESSED_WEBHOOKS = new Set<string>();
}

if (!globalThis.__MEMO_USER_ENTITLEMENTS) {
  globalThis.__MEMO_USER_ENTITLEMENTS = new Map<string, any>();
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('WHOP_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // 1. Read raw body text for cryptographic signature check
  const rawBody = await request.text();

  // 2. Extract headers as a record
  const headers: Record<string, string> = {};
  request.headers.forEach((val, key) => {
    headers[key.toLowerCase()] = val;
  });

  // 3. Verify webhook signature using the official Whop SDK unwrapWebhook
  let event: any;
  try {
    event = unwrapWebhook(rawBody, {
      headers,
      key: webhookSecret,
    });
  } catch (err) {
    if (err instanceof WebhookVerificationError || (err as Error)?.message?.includes('signature')) {
      console.error('Invalid Whop webhook signature:', err);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }
    console.error('Failed to verify or parse webhook:', err);
    return NextResponse.json({ error: 'Webhook verification error' }, { status: 400 });
  }

  const eventId = event?.id || event?.webhook_id || `evt_${Date.now()}`;
  const eventType = event?.type || event?.action;
  const eventData = event?.data || {};

  // 4. Idempotency Check: Prevent duplicate processing
  try {
    const processedDoc = await adminDb.collection('whop_webhook_events').doc(eventId).get();
    if (processedDoc.exists) {
      console.log(`[Whop Webhook] Duplicate event ${eventId} already processed.`);
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }
  } catch {
    if (globalThis.__MEMO_PROCESSED_WEBHOOKS?.has(eventId)) {
      console.log(`[Whop Webhook] In-memory duplicate event ${eventId} ignored.`);
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }
  }

  console.log(`[Whop Webhook] Processing event: ${eventType} (ID: ${eventId})`);

  // 5. Handle Event Types
  try {
    const metadata = eventData?.metadata || {};
    const userId = metadata.userId || metadata.user_id;
    const paymentId = eventData?.id || eventData?.payment_id || `pay_${Date.now()}`;
    const planId = eventData?.plan_id || eventData?.plan?.id;
    const expectedPlanId = process.env.WHOP_ONE_TIME_PLAN_ID;

    switch (eventType) {
      case 'payment.succeeded': {
        // Confirm payment corresponds to expected plan if configured
        if (expectedPlanId && planId && planId !== expectedPlanId) {
          console.warn(`[Whop Webhook] Payment plan mismatch: received ${planId}, expected ${expectedPlanId}`);
        }

        if (userId) {
          const entitlementData = {
            userId,
            hasAccess: true,
            status: 'active',
            planId: planId || expectedPlanId || 'one_time_unlock',
            paymentId,
            amount: eventData?.amount || eventData?.final_amount || 0,
            currency: eventData?.currency || 'usd',
            unlockedAt: new Date(),
            updatedAt: new Date(),
          };

          // Save entitlement in Firestore
          try {
            await adminDb.collection('user_entitlements').doc(userId).set(entitlementData, { merge: true });
            // Save purchase record
            await adminDb.collection('purchases').doc(paymentId).set({
              ...entitlementData,
              eventId,
              rawEventData: eventData,
            });
          } catch (dbErr) {
            console.warn('[Whop Webhook] Firestore write error, saving to in-memory store:', dbErr);
          }

          // Always sync in-memory for instant resilience
          globalThis.__MEMO_USER_ENTITLEMENTS?.set(userId, entitlementData);
          console.log(`[Whop Webhook] Granted paid features to user: ${userId}`);
        } else {
          console.warn(`[Whop Webhook] payment.succeeded event missing userId in metadata`);
        }
        break;
      }

      case 'payment.failed': {
        console.log(`[Whop Webhook] Payment failed for transaction ${paymentId}`);
        if (userId) {
          try {
            await adminDb.collection('purchases').doc(paymentId).set(
              {
                userId,
                status: 'failed',
                failedAt: new Date(),
                eventId,
              },
              { merge: true }
            );
          } catch (dbErr) {
            console.warn('[Whop Webhook] Could not write failed payment:', dbErr);
          }
        }
        break;
      }

      case 'refund.created':
      case 'refund.updated':
      case 'payment.refunded': {
        console.log(`[Whop Webhook] Processing refund for payment ${paymentId}`);
        if (userId) {
          const refundData = {
            hasAccess: false,
            status: 'refunded',
            refundedAt: new Date(),
            updatedAt: new Date(),
          };

          try {
            await adminDb.collection('user_entitlements').doc(userId).set(refundData, { merge: true });
            await adminDb.collection('purchases').doc(paymentId).set(
              {
                status: 'refunded',
                refundedAt: new Date(),
              },
              { merge: true }
            );
          } catch (dbErr) {
            console.warn('[Whop Webhook] Could not write refund status:', dbErr);
          }

          const existing = globalThis.__MEMO_USER_ENTITLEMENTS?.get(userId) || {};
          globalThis.__MEMO_USER_ENTITLEMENTS?.set(userId, { ...existing, ...refundData });
          console.log(`[Whop Webhook] Revoked entitlement for refunded user: ${userId}`);
        }
        break;
      }

      default:
        console.log(`[Whop Webhook] Unhandled event type: ${eventType}`);
    }

    // 6. Record event as processed (Idempotency ledger)
    try {
      await adminDb.collection('whop_webhook_events').doc(eventId).set({
        processedAt: new Date(),
        type: eventType,
        paymentId: eventData?.id || null,
        userId: userId || null,
      });
    } catch {
      // In-memory fallback
    }
    globalThis.__MEMO_PROCESSED_WEBHOOKS?.add(eventId);

    return NextResponse.json({ received: true });
  } catch (processError) {
    console.error('[Whop Webhook] Error processing event data:', processError);
    return NextResponse.json({ error: 'Failed to process event' }, { status: 500 });
  }
}
