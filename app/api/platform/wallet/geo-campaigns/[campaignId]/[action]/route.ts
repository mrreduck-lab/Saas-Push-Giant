import { platformFetch } from "../../../../_lib";
export const dynamic = "force-dynamic";
export async function POST(request: Request, { params }: { params: { campaignId: string; action: string } }) {
  return platformFetch(`/v1/wallet/geo-campaigns/${params.campaignId}/${params.action}`, {
    method: "POST",
    body: JSON.stringify({})
  }, request);
}
