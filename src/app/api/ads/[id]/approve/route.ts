import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { password } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const docRef = adminDb.collection('ads').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    await docRef.update({
      status: 'active',
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, id, status: 'active' });
  } catch (error) {
    console.error('Error approving ad:', error);
    return NextResponse.json({ error: 'Failed to approve ad' }, { status: 500 });
  }
}
