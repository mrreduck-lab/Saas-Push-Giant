import { loadPlatformEnv, platformFetch } from "../_lib";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = loadPlatformEnv();
  if (!env.ok) {
    return Response.json(env.error, { status: 503 });
  }

  return platformFetch(`/v1/projects/${env.projectId}/subscribers?limit=50`);
}