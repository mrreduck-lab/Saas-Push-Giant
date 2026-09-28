import { loadPlatformEnv, platformFetch } from "../../_lib";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const env = loadPlatformEnv(request);
  if (!env.ok) return Response.json(env.error, { status: 503 });
  return platformFetch(`/v1/projects/${env.projectId}/wallet/geo-campaigns`, undefined, request);
}
export async function POST(request: Request) {
  const env = loadPlatformEnv(request);
  if (!env.ok) return Response.json(env.error, { status: 503 });
  const payload = await request.json().catch(() => ({}));
  return platformFetch("/v1/wallet/geo-campaigns", {
    method: "POST",
    body: JSON.stringify({ ...payload, project_id: env.projectId })
  }, request);
}
