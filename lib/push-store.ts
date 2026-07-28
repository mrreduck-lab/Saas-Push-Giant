export type StoredPushSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
};

const STORE_KEY = 'raschini:push:subscriptions';
const REDIS_TIMEOUT_MS = 8000;

function firstDefined(names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

function discoverRestUrl() {
  const explicit = firstDefined([
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REST_API_URL',
    'UPSTASH_KV_REST_API_URL',
    'KV_REST_API_URL',
    'STORAGE_REST_API_URL',
    'STORAGE_REST_URL',
  ]);
  if (explicit) return explicit;

  const candidate = Object.entries(process.env).find(([key, value]) => {
    if (!value?.startsWith('http')) return false;
    const upper = key.toUpperCase();
    return (upper.includes('UPSTASH') || upper.includes('KV') || upper.includes('REDIS')) &&
      (upper.endsWith('_REST_API_URL') || upper.endsWith('_REST_URL'));
  });

  return candidate?.[1];
}

function discoverRestToken() {
  const explicit = firstDefined([
    'UPSTASH_REDIS_REST_TOKEN',
    'UPSTASH_REST_API_TOKEN',
    'UPSTASH_KV_REST_API_TOKEN',
    'KV_REST_API_TOKEN',
    'STORAGE_REST_API_TOKEN',
    'STORAGE_REST_TOKEN',
  ]);
  if (explicit) return explicit;

  const candidates = Object.entries(process.env).filter(([key, value]) => {
    if (!value) return false;
    const upper = key.toUpperCase();
    return (upper.includes('UPSTASH') || upper.includes('KV') || upper.includes('REDIS')) &&
      upper.includes('TOKEN') && !upper.includes('READ_ONLY');
  });

  return candidates[0]?.[1];
}

function config() {
  const url = discoverRestUrl();
  const token = discoverRestToken();

  if (!url || !token) {
    const availableKeys = Object.keys(process.env)
      .filter((key) => /UPSTASH|KV|REDIS|STORAGE/i.test(key))
      .sort();
    throw new Error(`Push storage is not configured. Available storage variables: ${availableKeys.join(', ') || 'none'}`);
  }

  return { url: url.replace(/\/$/, ''), token };
}

async function command<T>(args: Array<string | number>): Promise<T> {
  const { url, token } = config();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDIS_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Redis request failed: ${response.status}`);
    const data = await response.json() as { result: T; error?: string };
    if (data.error) throw new Error(data.error);
    return data.result;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Redis request timed out after ${REDIS_TIMEOUT_MS} ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function saveSubscription(subscription: StoredPushSubscription) {
  await command<number>(['SADD', STORE_KEY, JSON.stringify(subscription)]);
}

export async function listSubscriptions(): Promise<StoredPushSubscription[]> {
  const values = await command<string[]>(['SMEMBERS', STORE_KEY]);
  return (values || []).flatMap((value) => {
    try { return [JSON.parse(value) as StoredPushSubscription]; }
    catch { return []; }
  });
}

export async function removeSubscription(subscription: StoredPushSubscription) {
  await command<number>(['SREM', STORE_KEY, JSON.stringify(subscription)]);
}

export async function pushStorageStatus() {
  const startedAt = Date.now();
  const count = await command<number>(['SCARD', STORE_KEY]);
  return {
    configured: true,
    count: Number(count || 0),
    latencyMs: Date.now() - startedAt,
  };
}
