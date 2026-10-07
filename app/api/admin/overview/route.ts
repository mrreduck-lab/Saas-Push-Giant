export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = request.headers.get("x-admin-token");
  if (!process.env.PUSH_ADMIN_TOKEN || token !== process.env.PUSH_ADMIN_TOKEN) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const apiUrl = (process.env.PUSHGIANT_API_URL ?? process.env.API_URL ?? "http://push-api:3100").replace(/\/$/, "");
  const response = await fetch(`${apiUrl}/v1/admin/overview`, {
    cache: "no-store",
    headers: { "x-admin-token": token }
  });
  const data = await response.json().catch(() => ({}));
  return Response.json(data, { status: response.status });
}
