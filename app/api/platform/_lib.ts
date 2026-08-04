const DEFAULT_API_URL = "http://push-api:3100";

export type PlatformError = {
  error: string;
  detail?: unknown;
  status?: number;
};

export function loadPlatformEnv() {
  const apiUrl = (process.env.PUSHGIANT_API_URL ?? process.env.API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
  const projectId = process.env.PUSHGIANT_PROJECT_ID ?? process.env.NEXT_PUBLIC_PUSHGIANT_PROJECT_ID;
  const apiKey = process.env.PUSHGIANT_API_KEY;

  if (!projectId || !apiKey) {
    return {
      ok: false as const,
      error: {
        error: "platform_env_not_configured",
        detail: "Set PUSHGIANT_PROJECT_ID and PUSHGIANT_API_KEY for the admin container."
      }
    };
  }

  return {
    ok: true as const,
    apiUrl,
    projectId,
    apiKey
  };
}

export async function platformFetch(path: string, init?: RequestInit) {
  const env = loadPlatformEnv();
  if (!env.ok) {
    return Response.json(env.error, { status: 503 });
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.apiKey}`,
      ...init?.headers
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return Response.json(
      {
        error: "platform_api_failed",
        status: response.status,
        detail: data
      } satisfies PlatformError,
      { status: response.status }
    );
  }

  return Response.json(data, { status: response.status });
}