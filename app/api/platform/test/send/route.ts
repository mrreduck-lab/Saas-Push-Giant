import { loadPlatformEnv } from "../../_lib";

export const dynamic = "force-dynamic";

type TestSendPayload = {
  anonymousId?: string;
  subscription?: {
    endpoint?: string;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };
  title?: string;
  body?: string;
  url?: string;
  platform?: string;
  browser?: string;
  userAgent?: string;
  locale?: string;
  timezone?: string;
  permission?: "default" | "granted" | "denied";
};

export async function POST(request: Request) {
  const env = loadPlatformEnv();
  if (!env.ok) {
    return Response.json(env.error, { status: 503 });
  }

  const payload = await request.json().catch(() => ({} as TestSendPayload));
  const anonymousId = payload.anonymousId?.trim();
  const endpoint = payload.subscription?.endpoint?.trim();
  const p256dh = payload.subscription?.keys?.p256dh?.trim();
  const auth = payload.subscription?.keys?.auth?.trim();
  const title = payload.title?.trim() || "Push Giant test";
  const body = payload.body?.trim() || "Тестовое уведомление отправлено только на это устройство.";
  const url = payload.url?.trim();

  if (!anonymousId || !/^pg_test_[a-zA-Z0-9_-]+$/.test(anonymousId)) {
    return Response.json({ error: "invalid_test_anonymous_id" }, { status: 400 });
  }

  if (!endpoint || !p256dh || !auth) {
    return Response.json({ error: "invalid_test_subscription" }, { status: 400 });
  }

  const upsertResponse = await fetch(`${env.apiUrl}/v1/subscriptions/upsert`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_id: env.projectId,
      anonymous_id: anonymousId,
      external_source: "pushgiant_test",
      endpoint,
      keys: { p256dh, auth },
      permission: payload.permission ?? "granted",
      platform: payload.platform,
      browser: payload.browser,
      user_agent: payload.userAgent,
      locale: payload.locale,
      timezone: payload.timezone
    })
  });
  const upsertData = await upsertResponse.json().catch(() => ({}));

  if (!upsertResponse.ok) {
    return Response.json(
      {
        error: "test_subscription_upsert_failed",
        status: upsertResponse.status,
        detail: upsertData
      },
      { status: upsertResponse.status }
    );
  }

  const sendResponse = await fetch(`${env.apiUrl}/v1/projects/${env.projectId}/test-notification`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.apiKey}`
    },
    body: JSON.stringify({
      project_id: env.projectId,
      anonymous_id: anonymousId,
      title,
      body,
      url: url || undefined
    })
  });
  const sendData = await sendResponse.json().catch(() => ({}));

  if (!sendResponse.ok) {
    return Response.json(
      {
        error: "test_notification_failed",
        status: sendResponse.status,
        detail: sendData
      },
      { status: sendResponse.status }
    );
  }

  return Response.json(sendData, { status: sendResponse.status });
}
