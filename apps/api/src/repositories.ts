import type { Pool } from "pg";
import { randomBytes } from "node:crypto";
import { apiKeyPrefix, hashSecret } from "@pushgiant/shared";
import type {
  CampaignCreate,
  DataCipher,
  EventTrack,
  GeoUpdate,
  SubscriberHeartbeat,
  SubscriptionUpsert,
  TestNotification,
  TrialRegistration
} from "@pushgiant/shared";

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

export type TrialCredentials = {
  organizationId: string;
  projectId: string;
  apiKey: string;
  trialEndsAt: string;
};

export type TestNotificationTarget = {
  organization_id: string;
  project_id: string;
  subscriber_id: string;
  subscription_id: string;
  endpoint_encrypted: string;
  p256dh_encrypted: string;
  auth_encrypted: string;
  public_key: string;
  private_key_encrypted: string;
  subject: string;
};

type SubscriberIdentityPayload = {
  subscriber_id?: string;
  anonymous_id?: string;
  external_customer_id?: string;
  external_source?: string;
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
  return upsertSubscriberIdentity(pool, project, payload);
}

async function upsertSubscriberIdentity(
  pool: Pool,
  project: ProjectIdentity,
  payload: SubscriberIdentityPayload
): Promise<string | null> {
  if (payload.subscriber_id) {
    await pool.query(
      `
        update subscribers
        set last_seen_at = now(), updated_at = now()
        where id = $1 and project_id = $2
      `,
      [payload.subscriber_id, project.id]
    );
    return payload.subscriber_id;
  }

  if (payload.external_customer_id) {
    const result = await pool.query<{ id: string }>(
      `
        insert into subscribers (
          organization_id,
          project_id,
          external_customer_id,
          anonymous_id,
          external_source,
          last_seen_at,
          updated_at
        )
        values ($1, $2, $3, $4, $5, now(), now())
        on conflict (project_id, external_customer_id) do update set
          anonymous_id = coalesce(excluded.anonymous_id, subscribers.anonymous_id),
          external_source = coalesce(excluded.external_source, subscribers.external_source),
          last_seen_at = now(),
          updated_at = now()
        returning id
      `,
      [
        project.organization_id,
        project.id,
        payload.external_customer_id,
        payload.anonymous_id ?? null,
        payload.external_source ?? null
      ]
    );
    return result.rows[0]?.id ?? null;
  }

  if (payload.anonymous_id) {
    const result = await pool.query<{ id: string }>(
      `
        insert into subscribers (organization_id, project_id, anonymous_id, external_source, last_seen_at, updated_at)
        values ($1, $2, $3, $4, now(), now())
        on conflict (project_id, anonymous_id) do update set
          external_source = coalesce(excluded.external_source, subscribers.external_source),
          last_seen_at = now(),
          updated_at = now()
        returning id
      `,
      [project.organization_id, project.id, payload.anonymous_id, payload.external_source ?? null]
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

export async function recordHeartbeat(pool: Pool, payload: SubscriberHeartbeat) {
  const project = await findActiveProject(pool, payload.project_id);
  if (!project) {
    return null;
  }

  const subscriberId = await upsertSubscriberIdentity(pool, project, payload);
  if (payload.endpoint) {
    await pool.query(
      `
        update push_subscriptions
        set
          permission = coalesce($3, permission),
          platform = coalesce($4, platform),
          browser = coalesce($5, browser),
          os = coalesce($6, os),
          user_agent = coalesce($7, user_agent),
          locale = coalesce($8, locale),
          timezone = coalesce($9, timezone),
          last_seen_at = now(),
          last_confirmed_at = now(),
          updated_at = now()
        where project_id = $1 and endpoint_hash = $2
      `,
      [
        project.id,
        hashEndpoint(payload.endpoint),
        payload.permission ?? null,
        payload.platform ?? null,
        payload.browser ?? null,
        payload.os ?? null,
        payload.user_agent ?? null,
        payload.locale ?? null,
        payload.timezone ?? null
      ]
    );
  }

  return { subscriber_id: subscriberId, project_id: project.id };
}

export async function recordEvent(pool: Pool, payload: EventTrack) {
  const project = await findActiveProject(pool, payload.project_id);
  if (!project) {
    return null;
  }

  const subscriberId = await upsertSubscriberIdentity(pool, project, payload);
  const result = await pool.query<{ id: string }>(
    `
      insert into events (
        organization_id,
        project_id,
        subscriber_id,
        campaign_id,
        type,
        payload_json
      )
      values ($1, $2, $3, $4, $5, $6::jsonb)
      returning id
    `,
    [
      project.organization_id,
      project.id,
      subscriberId,
      payload.campaign_id ?? null,
      payload.type,
      JSON.stringify(payload.payload ?? {})
    ]
  );

  return { id: result.rows[0].id, subscriber_id: subscriberId };
}

export async function updateSubscriberGeo(pool: Pool, payload: GeoUpdate) {
  const project = await findActiveProject(pool, payload.project_id);
  if (!project) {
    return null;
  }

  const subscriberId = await upsertSubscriberIdentity(pool, project, payload);
  if (!subscriberId) {
    return null;
  }

  await pool.query(
    `
      update subscribers
      set
        latitude = $3,
        longitude = $4,
        accuracy = $5,
        geo_updated_at = now(),
        last_seen_at = now(),
        updated_at = now()
      where id = $1 and project_id = $2
    `,
    [subscriberId, project.id, payload.latitude, payload.longitude, payload.accuracy ?? null]
  );

  if (payload.consent_version) {
    await pool.query(
      `
        insert into geo_consents (subscriber_id, organization_id, project_id, consent_version, status, updated_at)
        values ($1, $2, $3, $4, 'granted', now())
        on conflict (subscriber_id) do update set
          consent_version = excluded.consent_version,
          status = excluded.status,
          updated_at = now()
      `,
      [subscriberId, project.organization_id, project.id, payload.consent_version]
    );
  }

  return { subscriber_id: subscriberId };
}

export async function getProjectOverview(pool: Pool, apiKey: ApiKeyIdentity, projectId: string) {
  const project = await findActiveProjectForApiKey(pool, projectId, apiKey);
  if (!project) {
    return null;
  }

  const result = await pool.query(
    `
      select
        (select count(*)::int from subscribers where project_id = $1) as subscribers,
        (select count(*)::int from push_subscriptions where project_id = $1 and status = 'active') as active_devices,
        (select count(*)::int from subscribers where project_id = $1 and created_at >= now() - interval '1 day') as new_subscriptions,
        (select count(*)::int from delivery_attempts where project_id = $1 and status = 'sent') as sent_pushes,
        (select count(*)::int from events where project_id = $1 and type = 'push.open') as opens,
        (select status from domains where project_id = $1 order by verified_at desc nulls last, created_at desc limit 1) as site_status
    `,
    [project.id]
  );

  return result.rows[0];
}

export async function listProjectSubscribers(
  pool: Pool,
  apiKey: ApiKeyIdentity,
  projectId: string,
  limit = 100
) {
  const project = await findActiveProjectForApiKey(pool, projectId, apiKey);
  if (!project) {
    return null;
  }

  const result = await pool.query(
    `
      select
        s.id,
        s.anonymous_id,
        s.external_customer_id,
        s.external_source,
        s.status,
        s.created_at,
        s.last_seen_at,
        ps.id as subscription_id,
        ps.platform,
        ps.browser,
        ps.os,
        ps.permission,
        ps.status as subscription_status,
        ps.last_success_at,
        ps.last_seen_at as subscription_last_seen_at
      from subscribers s
      left join lateral (
        select *
        from push_subscriptions ps
        where ps.subscriber_id = s.id
        order by ps.last_seen_at desc
        limit 1
      ) ps on true
      where s.project_id = $1
      order by s.last_seen_at desc
      limit $2
    `,
    [project.id, Math.min(Math.max(limit, 1), 500)]
  );

  return result.rows;
}

export async function createTrialRegistration(
  pool: Pool,
  cipher: DataCipher,
  payload: TrialRegistration,
  vapid: { publicKey: string; privateKey: string; subject: string }
): Promise<TrialCredentials> {
  const client = await pool.connect();
  const apiKey = `pg_${randomBytes(32).toString("base64url")}`;
  const email = payload.email.trim().toLowerCase();
  const host = new URL(payload.siteUrl).host.toLowerCase();

  try {
    await client.query("begin");

    const organizationResult = await client.query<{ id: string; trial_ends_at: Date }>(
      `
        insert into organizations (
          name,
          status,
          plan,
          trial_started_at,
          trial_ends_at,
          trial_push_limit,
          trial_push_sent
        )
        values ($1, 'active', 'trial', now(), now() + interval '14 days', 100, 0)
        returning id, trial_ends_at
      `,
      [payload.company.trim()]
    );
    const organization = organizationResult.rows[0];

    const userResult = await client.query<{ id: string }>(
      `
        insert into users (email, name, password_hash)
        values ($1, $2, $3)
        on conflict (email) do update set
          name = coalesce(excluded.name, users.name),
          password_hash = excluded.password_hash
        returning id
      `,
      [email, payload.name.trim(), hashSecret(`password:${payload.password}`)]
    );
    const userId = userResult.rows[0].id;

    await client.query(
      `
        insert into organization_members (organization_id, user_id, role)
        values ($1, $2, 'owner')
        on conflict (organization_id, user_id) do update set role = excluded.role
      `,
      [organization.id, userId]
    );

    const projectResult = await client.query<{ id: string }>(
      `
        insert into projects (organization_id, name, status)
        values ($1, $2, 'active')
        returning id
      `,
      [organization.id, `${payload.company.trim()} PWA`]
    );
    const projectId = projectResult.rows[0].id;

    const domainResult = await client.query<{ id: string }>(
      `
        insert into domains (organization_id, project_id, host, status)
        values ($1, $2, $3, 'pending')
        returning id
      `,
      [organization.id, projectId, host]
    );

    await client.query(
      `
        update projects
        set default_domain_id = $1, updated_at = now()
        where id = $2
      `,
      [domainResult.rows[0].id, projectId]
    );

    await client.query(
      `
        insert into pwa_configs (
          project_id,
          organization_id,
          name,
          short_name,
          description,
          start_url,
          scope,
          theme_color,
          background_color,
          icons_json,
          install_prompt_json
        )
        values ($1, $2, $3, $4, $5, '/', '/', '#15120f', '#f5f1ea', '[]'::jsonb, $6::jsonb)
      `,
      [
        projectId,
        organization.id,
        payload.company.trim(),
        payload.company.trim().slice(0, 12) || "PWA",
        `Trial PWA project for ${host}`,
        JSON.stringify({
          title: "Получать уведомления",
          text: "Новые материалы, акции и важные обновления"
        })
      ]
    );

    await client.query(
      `
        insert into vapid_credentials (project_id, organization_id, public_key, private_key_encrypted, subject)
        values ($1, $2, $3, $4, $5)
      `,
      [projectId, organization.id, vapid.publicKey, cipher.encrypt(vapid.privateKey), vapid.subject]
    );

    await client.query(
      `
        insert into api_keys (organization_id, project_id, name, prefix, key_hash, scopes)
        values ($1, $2, 'Trial admin key', $3, $4, $5)
      `,
      [
        organization.id,
        projectId,
        apiKeyPrefix(apiKey),
        hashSecret(apiKey),
        ["campaigns:write", "campaigns:send", "analytics:read", "subscribers:read"]
      ]
    );

    await client.query(
      `
        insert into segments (organization_id, project_id, name, description, definition_json)
        values
          ($1, $2, 'All active subscribers', 'Default trial audience', '{"subscription_status":"active"}'::jsonb),
          ($1, $2, 'Recent subscribers', 'Subscribed or seen in the last 7 days', '{"last_seen_days":7}'::jsonb)
      `,
      [organization.id, projectId]
    );

    await client.query(
      `
        insert into integration_connections (organization_id, project_id, kind, name, status, config_json)
        values
          ($1, $2, 'wordpress', 'WordPress plugin', 'pending', '{"download":"/downloads/pushgiant-wordpress.zip"}'::jsonb),
          ($1, $2, 'universal_js', 'Universal JS SDK', 'pending', '{}'::jsonb)
      `,
      [organization.id, projectId]
    );

    await client.query("commit");

    return {
      organizationId: organization.id,
      projectId,
      apiKey,
      trialEndsAt: organization.trial_ends_at.toISOString()
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
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

export async function loadTestNotificationTarget(
  pool: Pool,
  apiKey: ApiKeyIdentity,
  payload: TestNotification
): Promise<TestNotificationTarget | null> {
  const project = await findActiveProjectForApiKey(pool, payload.project_id, apiKey);
  if (!project) {
    return null;
  }

  const result = await pool.query<TestNotificationTarget>(
    `
      select
        s.organization_id,
        s.project_id,
        s.id as subscriber_id,
        ps.id as subscription_id,
        ps.endpoint_encrypted,
        ps.p256dh_encrypted,
        ps.auth_encrypted,
        vc.public_key,
        vc.private_key_encrypted,
        vc.subject
      from subscribers s
      join push_subscriptions ps on ps.subscriber_id = s.id
      join vapid_credentials vc on vc.project_id = s.project_id
      where s.project_id = $1
        and s.organization_id = $2
        and s.anonymous_id = $3
        and s.anonymous_id like 'pg_test_%'
        and ps.status = 'active'
      order by ps.last_seen_at desc
      limit 1
    `,
    [project.id, project.organization_id, payload.anonymous_id]
  );

  return result.rows[0] ?? null;
}

export async function resetTestNotificationTarget(
  pool: Pool,
  target: TestNotificationTarget,
  status: "sent" | "failed",
  providerStatusCode?: number,
  errorCode?: string
) {
  await pool.query(
    `
      update push_subscriptions
      set
        status = 'disabled',
        disabled_at = now(),
        last_success_at = case when $2 = 'sent' then now() else last_success_at end,
        last_failure_at = case when $2 = 'failed' then now() else last_failure_at end,
        failure_count = case when $2 = 'failed' then failure_count + 1 else 0 end,
        updated_at = now()
      where id = $1
    `,
    [target.subscription_id, status]
  );

  await pool.query(
    `
      insert into events (
        organization_id,
        project_id,
        subscriber_id,
        type,
        payload_json
      )
      values ($1, $2, $3, $4, $5::jsonb)
    `,
    [
      target.organization_id,
      target.project_id,
      target.subscriber_id,
      status === "sent" ? "test.notification.sent" : "test.notification.failed",
      JSON.stringify({
        subscription_id: target.subscription_id,
        provider_status_code: providerStatusCode ?? null,
        error_code: errorCode ?? null,
        reset: true
      })
    ]
  );
}
