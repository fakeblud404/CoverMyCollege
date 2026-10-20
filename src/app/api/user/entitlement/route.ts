import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthenticatedUser } from '@/lib/auth';

declare global {
  // eslint-disable-next-line no-var
  var __MEMO_USER_ENTITLEMENTS: Map<string, any> | undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { user } = getAuthenticatedUser(request);
    const requestedUserId = request.nextUrl.searchParams.get('userId') || user.id;

    if (!requestedUserId) {
      return NextResponse.json({ hasAccess: false, status: 'unauthenticated' }, { status: 401 });
    }

    // Check Firestore
    try {
      const doc = await adminDb.collection('user_entitlements').doc(requestedUserId).get();
      if (doc.exists) {
        const data = doc.data();
        return NextResponse.json({
          hasAccess: Boolean(data?.hasAccess),
          status: data?.status || 'inactive',
          planId: data?.planId || null,
          unlockedAt: data?.unlockedAt?.toDate?.() || data?.unlockedAt || null,
        });
      }
    } catch (dbErr) {
      console.warn('[Entitlement API] Firestore read failed, checking in-memory cache:', dbErr);
    }

    // Check in-memory store
    const memEntitlement = globalThis.__MEMO_USER_ENTITLEMENTS?.get(requestedUserId);
    if (memEntitlement) {
      return NextResponse.json({
        hasAccess: Boolean(memEntitlement.hasAccess),
        status: memEntitlement.status || 'inactive',
        planId: memEntitlement.planId || null,
        unlockedAt: memEntitlement.unlockedAt || null,
      });
    }

    return NextResponse.json({
      hasAccess: false,
      status: 'none',
      planId: null,
    });
  } catch (error) {
    console.error('Error checking entitlement:', error);
    return NextResponse.json({ error: 'Failed to check entitlement' }, { status: 500 });
  }
}
