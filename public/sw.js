self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}

  const title = data.title || 'Push Giant';
  const fallbackIcon = '/brand/push-icon-192.png';
  const image = typeof data.image === 'string' && data.image ? data.image : undefined;
  const campaignId = data.campaign_id || data.campaignId || null;
  const projectId = data.project_id || data.projectId || null;
  const subscriberId = data.subscriber_id || data.subscriberId || null;
  const apiUrl = normalizeApiUrl(data.api_url || data.apiUrl);

  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: image || data.icon || fallbackIcon,
    image,
    badge: fallbackIcon,
    data: {
      url: data.url || '/',
      apiUrl,
      campaignId,
      projectId,
      subscriberId,
    },
    tag: data.tag || `pushgiant-${Date.now()}`,
    renotify: true,
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  const target = new URL(notificationData.url || '/', self.location.origin).href;
  event.waitUntil((async () => {
    await trackNotificationOpen(notificationData).catch(() => {});

    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if ('focus' in client) {
        await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});

function normalizeApiUrl(value) {
  if (typeof value === 'string' && value.trim()) {
    return value.replace(/\/$/, '');
  }

  return 'https://api.pushgiant.ru';
}

async function trackNotificationOpen(data) {
  if (!data.projectId) return;

  await fetch(`${normalizeApiUrl(data.apiUrl)}/v1/events/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: data.projectId,
      subscriber_id: data.subscriberId || undefined,
      campaign_id: data.campaignId || undefined,
      type: 'push.open',
      payload: {
        source: 'service-worker',
        url: data.url || '/',
      },
    }),
  });
}
