type PushGiantConfig = {
  projectId: string;
  apiUrl: string;
  serviceWorkerPath?: string;
  anonymousId?: string;
  externalCustomerId?: string;
};

type PushGiantEvent = {
  type: string;
  payload?: Record<string, unknown>;
};

let currentConfig: PushGiantConfig | null = null;

export function init(config: PushGiantConfig) {
  currentConfig = {
    ...config,
    apiUrl: config.apiUrl.replace(/\/$/, "")
  };

  void heartbeat();
  return {
    subscribe,
    heartbeat,
    track,
    updateGeo
  };
}

export async function subscribe() {
  const config = requireConfig();
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { status: "unsupported" as const };
  }

  const projectConfig = await request(`${config.apiUrl}/v1/projects/${config.projectId}/config`);
  const registration = await navigator.serviceWorker.register(config.serviceWorkerPath ?? "/pushgiant-sw.js");
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(projectConfig.publicKey)
  });

  await request(`${config.apiUrl}/v1/subscriptions/upsert`, {
    method: "POST",
    body: JSON.stringify({
      project_id: config.projectId,
      anonymous_id: config.anonymousId ?? getAnonymousId(),
      external_customer_id: config.externalCustomerId,
      endpoint: subscription.endpoint,
      keys: subscription.toJSON().keys,
      permission: Notification.permission,
      platform: navigator.platform,
      user_agent: navigator.userAgent,
      locale: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  });

  return { status: "subscribed" as const };
}

export async function heartbeat() {
  const config = requireConfig();
  return request(`${config.apiUrl}/v1/subscribers/heartbeat`, {
    method: "POST",
    body: JSON.stringify({
      project_id: config.projectId,
      anonymous_id: config.anonymousId ?? getAnonymousId(),
      external_customer_id: config.externalCustomerId,
      permission: typeof Notification === "undefined" ? "default" : Notification.permission,
      platform: navigator.platform,
      user_agent: navigator.userAgent,
      locale: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  });
}

export async function track(event: PushGiantEvent) {
  const config = requireConfig();
  return request(`${config.apiUrl}/v1/events/track`, {
    method: "POST",
    body: JSON.stringify({
      project_id: config.projectId,
      anonymous_id: config.anonymousId ?? getAnonymousId(),
      external_customer_id: config.externalCustomerId,
      type: event.type,
      payload: event.payload ?? {}
    })
  });
}

export async function updateGeo(position: GeolocationPosition, consentVersion = "v1") {
  const config = requireConfig();
  return request(`${config.apiUrl}/v1/subscribers/geo`, {
    method: "POST",
    body: JSON.stringify({
      project_id: config.projectId,
      anonymous_id: config.anonymousId ?? getAnonymousId(),
      external_customer_id: config.externalCustomerId,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      consent_version: consentVersion
    })
  });
}

function requireConfig() {
  if (!currentConfig) {
    throw new Error("PushGiant SDK is not initialized");
  }
  return currentConfig;
}

async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? `Push Giant request failed: ${response.status}`);
  }
  return data;
}

function getAnonymousId() {
  const key = "pushgiant_anonymous_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const value = crypto.randomUUID();
  localStorage.setItem(key, value);
  return value;
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}
