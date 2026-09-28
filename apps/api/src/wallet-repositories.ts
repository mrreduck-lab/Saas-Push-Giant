import type { Pool } from "pg";
import type { ApiKeyIdentity } from "./repositories.js";

export type WalletGeoCampaignInput = {
  project_id: string;
  name: string;
  relevant_text: string;
  level_filter?: number[];
  starts_at?: string;
  ends_at?: string;
  locations: Array<{ latitude: number; longitude: number }>;
};

async function allowedProject(pool: Pool, apiKey: ApiKeyIdentity, projectId: string) {
  const result = await pool.query(
    `select id, organization_id from projects
     where id = $1 and organization_id = $2
       and ($3::uuid is null or id = $3)
       and status = 'active' limit 1`,
    [projectId, apiKey.organization_id, apiKey.project_id]
  );
  return result.rows[0] ?? null;
}

export async function listWalletGeoCampaigns(pool: Pool, apiKey: ApiKeyIdentity, projectId: string) {
  const project = await allowedProject(pool, apiKey, projectId);
  if (!project) return null;
  const result = await pool.query(
    `select c.id, c.name, c.relevant_text, c.status, c.level_filter, c.starts_at, c.ends_at,
            c.activated_at, c.stopped_at, c.created_at, c.updated_at,
            coalesce(json_agg(json_build_object('id', l.id, 'latitude', l.latitude, 'longitude', l.longitude)
              order by l.created_at) filter (where l.id is not null), '[]'::json) as locations
       from wallet_geo_campaigns c
       left join wallet_geo_locations l on l.campaign_id = c.id
      where c.project_id = $1 and c.organization_id = $2
      group by c.id order by c.created_at desc`,
    [project.id, project.organization_id]
  );
  return result.rows;
}

export async function createWalletGeoCampaign(pool: Pool, apiKey: ApiKeyIdentity, input: WalletGeoCampaignInput) {
  const project = await allowedProject(pool, apiKey, input.project_id);
  if (!project) return null;
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await client.query(
      `insert into wallet_geo_campaigns
        (organization_id, project_id, name, relevant_text, level_filter, starts_at, ends_at)
       values ($1,$2,$3,$4,$5::smallint[],$6,$7)
       returning id, name, relevant_text, status, level_filter, starts_at, ends_at, created_at`,
      [project.organization_id, project.id, input.name, input.relevant_text,
       input.level_filter ?? [], input.starts_at ?? null, input.ends_at ?? null]
    );
    const campaign = result.rows[0];
    for (const location of input.locations) {
      await client.query(
        `insert into wallet_geo_locations (campaign_id, latitude, longitude) values ($1,$2,$3)`,
        [campaign.id, location.latitude, location.longitude]
      );
    }
    await client.query("commit");
    return { ...campaign, locations: input.locations };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function setWalletGeoCampaignStatus(
  pool: Pool, apiKey: ApiKeyIdentity, campaignId: string, status: "active" | "cancelled"
) {
  const result = await pool.query(
    `update wallet_geo_campaigns c
        set status=$1,
            activated_at=case when $1='active' then now() else activated_at end,
            stopped_at=case when $1='cancelled' then now() else stopped_at end,
            updated_at=now()
      where c.id=$2 and c.organization_id=$3
        and ($4::uuid is null or c.project_id=$4)
        and c.status in ('draft','active')
      returning c.id, c.project_id, c.status`,
    [status, campaignId, apiKey.organization_id, apiKey.project_id]
  );
  return result.rows[0] ?? null;
}
