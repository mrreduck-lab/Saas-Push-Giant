import { NextRequest, NextResponse } from 'next/server';
import { saveSubscription, type StoredPushSubscription } from '@/lib/push-store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json() as StoredPushSubscription;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    await saveSubscription(subscription);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Push subscription failed', error);
    return NextResponse.json({ error: 'Unable to save subscription' }, { status: 500 });
  }
}
