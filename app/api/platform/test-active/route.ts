import { loadPlatformEnv, platformFetch } from "../_lib";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const env = loadPlatformEnv(request);
  if (!env.ok) return Response.json(env.error, { status: 503 });
  const body = await request.json().catch(() => ({}));
  return platformFetch(`/v1/projects/${env.projectId}/test-active-notification`, {
    method: "POST",
    body: JSON.stringify(body)
  }, request);
}
