import { loadPlatformEnv } from "../../_lib";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = loadPlatformEnv();
  if (!env.ok) {
    return Response.json(env.error, { status: 503 });
  }

  const response = await fetch(`${env.apiUrl}/v1/projects/${env.projectId}/config`, {
    cache: "no-store"
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.publicKey) {
    return Response.json(
      {
        error: "test_config_failed",
        status: response.status,
        detail: data
      },
      { status: response.ok ? 503 : response.status }
    );
  }

  return Response.json({
    projectId: env.projectId,
    publicKey: data.publicKey,
    serviceWorkerPath: "/sw.js"
  });
}
