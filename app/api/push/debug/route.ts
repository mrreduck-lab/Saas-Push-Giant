import { NextRequest, NextResponse } from 'next/server';
import { pushStorageStatus } from '@/lib/push-store';

export const dynamic = 'force-dynamic';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('x-admin-token') || request.nextUrl.searchParams.get('token');
  if (!process.env.PUSH_ADMIN_TOKEN || token !== process.env.PUSH_ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let storage: Awaited<ReturnType<typeof pushStorageStatus>> | { configured: false; error: string };
  try {
    storage = await pushStorageStatus();
  } catch (error: unknown) {
    storage = { configured: false, error: errorMessage(error) };
  }

  return NextResponse.json({
    ok: storage.configured,
    vapid: {
      publicKey: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      privateKey: Boolean(process.env.VAPID_PRIVATE_KEY),
      subject: process.env.VAPID_SUBJECT || null,
    },
    adminToken: Boolean(process.env.PUSH_ADMIN_TOKEN),
    storage,
    timestamp: new Date().toISOString(),
  });
}
