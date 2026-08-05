export const dynamic = "force-dynamic";

type TrialPayload = {
  name?: string;
  email?: string;
  company?: string;
  siteUrl?: string;
  password?: string;
};

export async function POST(request: Request) {
  const apiUrl = (process.env.PUSHGIANT_API_URL ?? process.env.API_URL ?? "http://push-api:3100").replace(/\/$/, "");
  const payload = await request.json().catch(() => ({} as TrialPayload));

  const response = await fetch(`${apiUrl}/v1/trials`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  return Response.json(data, { status: response.status });
}
