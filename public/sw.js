self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}

  const title = data.title || 'Push Giant';
  const fallbackIcon = '/brand/push-icon-192.png';
  const image = typeof data.image === 'string' && data.image ? data.image : undefined;

  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: image || data.icon || fallbackIcon,
    image,
    badge: fallbackIcon,
    data: { url: data.url || '/' },
    tag: data.tag || `pushgiant-${Date.now()}`,
    renotify: true,
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil((async () => {
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
