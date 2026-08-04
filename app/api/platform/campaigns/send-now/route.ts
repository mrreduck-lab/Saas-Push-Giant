import { loadPlatformEnv, platformFetch } from "../../_lib";

export const dynamic = "force-dynamic";

type CampaignPayload = {
  title?: string;
  body?: string;
  url?: string;
};

export async function POST(request: Request) {
  const env = loadPlatformEnv();
  if (!env.ok) {
    return Response.json(env.error, { status: 503 });
  }

  const payload = await request.json().catch(() => ({} as CampaignPayload));
  const title = payload.title?.trim();
  const body = payload.body?.trim();
  const url = payload.url?.trim();

  if (!title || !body) {
    return Response.json({ error: "title_and_body_required" }, { status: 400 });
  }

  const campaignResponse = await fetch(`${env.apiUrl}/v1/campaigns`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.apiKey}`
    },
    body: JSON.stringify({
      project_id: env.projectId,
      title,
      body,
      url: url || undefined,
      urgency: "normal"
    })
  });

  const campaign = await campaignResponse.json().catch(() => ({}));
  if (!campaignResponse.ok || !campaign.id) {
    return Response.json(
      {
        error: "campaign_create_failed",
        status: campaignResponse.status,
        detail: campaign
      },
      { status: campaignResponse.status }
    );
  }

  return platformFetch(`/v1/campaigns/${campaign.id}/send-now`, {
    method: "POST",
    body: JSON.stringify({})
  });
}