import type { Pool } from "pg";
import { apiKeyPrefix, hashSecret } from "@pushgiant/shared";
import type { CampaignCreate, DataCipher, SubscriptionUpsert } from "@pushgiant/shared";

export type ProjectIdentity = {
  id: string;
  organization_id: string;
};

export type CampaignIdentity = {
  id: string;
  organization_id: string;
  project_id: string;
  status: string;
};

export type ApiKeyIdentity = {
  id: string;
  organization_id: string;
  project_id: string | null;
  scopes: string[];
};

export async function findActiveProject(pool: Pool, projectId: string): Promise<ProjectIdentity | null> {
  const result = await pool.query<ProjectIdentity>(
    `
      select id, organization_id
      from projects
      where id = $1 and status = 'active'
      limit 1
    `,
    [projectId]
  );

  return result.rows[0] ?? null;
}

async function findActiveProjectForApiKey(
  pool: Pool,
  projectId: string,
  apiKey: ApiKeyIdentity
): Promise<ProjectIdentity | null> {
  const result = await pool.query<ProjectIdentity>(
    `
      select id, organization_id
      from projects
      where id = $1
        and organization_id = $2
        and ($3::uuid is null or id = $3)
        and status = 'active'
      limit 1
    `,
    [projectId, apiKey.organization_id, apiKey.project_id]
  );

  return result.rows[0] ?? null;
}

export function hashEndpoint(endpoint: string): string {
  return hashSecret(endpoint);
}

export async function authenticateApiKey(pool: Pool, apiKey: string): Promise<ApiKeyIdentity | null> {
  const result = await pool.query<ApiKeyIdentity>(
    `
      update api_keys
      set last_used_at = now()
      where prefix = $1
        and key_hash = $2
        and revoked_at is null
      returning id, organization_id, project_id, scopes
    `,
    [apiKeyPrefix(apiKey), hashSecret(apiKey)]
  );

  return result.rows[0] ?? null;
}

export async function upsertSubscription(pool: Pool, cipher: DataCipher, payload: SubscriptionUpsert) {
  const project = await findActiveProject(pool, payload.project_id);
  if (!project) {
    return null;
  }

  const subscriberId = await upsertSubscriber(pool, project, payload);
  const endpointHash = hashEndpoint(payload.endpoint);

  const result = await pool.query(
    `
      insert into push_subscriptions (
        organization_id,
        project_id,
        subscriber_id,
        endpoint_hash,
        endpoint_encrypted,
        p256dh_encrypted,
        auth_encrypted,
        content_encoding,
        platform,
        browser,
        user_agent,
        locale,
        timezone,
        permission,
        status,
        updated_at,
        last_seen_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'active', now(), now())
      on conflict (project_id, endpoint_hash) do update set
        subscriber_id = excluded.subscriber_id,
        endpoint_encrypted = excluded.endpoint_encrypted,
        p256dh_encrypted = excluded.p256dh_encrypted,
        auth_encrypted = excluded.auth_encrypted,
        content_encoding = excluded.content_encoding,
        platform = excluded.platform,
        browser = excluded.browser,
        user_agent = excluded.user_agent,
        locale = excluded.locale,
        timezone = excluded.timezone,
        permission = excluded.permission,
        status = 'active',
        disabled_at = null,
        updated_at = now(),
        last_seen_at = now()
      returning id, endpoint_hash, status
    `,
    [
      project.organization_id,
      project.id,
      subscriberId,
      endpointHash,
      cipher.encrypt(payload.endpoint),
      cipher.encrypt(payload.keys.p256dh),
      cipher.encrypt(payload.keys.auth),
      payload.content_encoding ?? null,
      payload.platform ?? null,
      payload.browser ?? null,
      payload.user_agent ?? null,
      payload.locale ?? null,
      payload.timezone ?? null,
      payload.permission ?? null
    ]
  );

  return result.rows[0];
}

async function upsertSubscriber(pool: Pool, project: ProjectIdentity, payload: SubscriptionUpsert): Promise<string | null> {
  if (payload.subscriber_id) {
    return payload.subscriber_id;
  }

  if (payload.external_customer_id) {
    const result = await pool.query<{ id: string }>(
      `
        insert into subscribers (organization_id, project_id, external_customer_id, anonymous_id, updated_at)
        values ($1, $2, $3, $4, now())
        on conflict (project_id, external_customer_id) do update set
          anonymous_id = coalesce(excluded.anonymous_id, subscribers.anonymous_id),
          updated_at = now()
        returning id
      `,
      [project.organization_id, project.id, payload.external_customer_id, payload.anonymous_id ?? null]
    );
    return result.rows[0]?.id ?? null;
  }

  if (payload.anonymous_id) {
    const result = await pool.query<{ id: string }>(
      `
        insert into subscribers (organization_id, project_id, anonymous_id, updated_at)
        values ($1, $2, $3, now())
        on conflict (project_id, anonymous_id) do update set updated_at = now()
        returning id
      `,
      [project.organization_id, project.id, payload.anonymous_id]
    );
    return result.rows[0]?.id ?? null;
  }

  const result = await pool.query<{ id: string }>(
    `
      insert into subscribers (organization_id, project_id)
      values ($1, $2)
      returning id
    `,
    [project.organization_id, project.id]
  );
  return result.rows[0]?.id ?? null;
}

export async function createCampaign(pool: Pool, apiKey: ApiKeyIdentity, payload: CampaignCreate) {
  const project = await findActiveProjectForApiKey(pool, payload.project_id, apiKey);
  if (!project) {
    return null;
  }

  const result = await pool.query<CampaignIdentity>(
    `
      insert into campaigns (
        organization_id,
        project_id,
        status,
        title,
        body,
        url,
        image_asset_id,
        ttl_seconds,
        urgency,
        topic,
        scheduled_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      returning id, organization_id, project_id, status
    `,
    [
      project.organization_id,
      project.id,
      payload.scheduled_at ? "scheduled" : "draft",
      payload.title,
      payload.body,
      payload.url ?? null,
      payload.image_asset_id ?? null,
      payload.ttl_seconds ?? null,
      payload.urgency ?? null,
      payload.topic ?? null,
      payload.scheduled_at ?? null
    ]
  );

  return result.rows[0] ?? null;
}

export async function markCampaignQueued(
  pool: Pool,
  apiKey: ApiKeyIdentity,
  campaignId: string
): Promise<CampaignIdentity | null> {
  const result = await pool.query<CampaignIdentity>(
    `
      update campaigns
      set status = 'queued', queued_at = now(), updated_at = now()
      where id = $1
        and organization_id = $2
        and ($3::uuid is null or project_id = $3)
        and status in ('draft', 'scheduled', 'failed')
      returning id, organization_id, project_id, status
    `,
    [campaignId, apiKey.organization_id, apiKey.project_id]
  );

  return result.rows[0] ?? null;
}
