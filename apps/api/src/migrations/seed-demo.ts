import pg from "pg";
import { apiKeyPrefix, createDataCipher, hashSecret } from "@pushgiant/shared";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://pushgiant:pushgiant@localhost:5432/pushgiant";
const pool = new pg.Pool({ connectionString: databaseUrl });
const cipher = createDataCipher(process.env.DATA_ENCRYPTION_KEY);
const demoApiKey = process.env.DEMO_API_KEY ?? "pg_dev_demo_key_change_me";

const organizationId = "11111111-1111-4111-8111-111111111111";
const projectId = "22222222-2222-4222-8222-222222222222";
const domainId = "33333333-3333-4333-8333-333333333333";

await pool.query(
  `
    insert into organizations (id, name, status, plan)
    values ($1, 'Raschini Demo', 'active', 'demo')
    on conflict (id) do update set name = excluded.name, updated_at = now()
  `,
  [organizationId]
);

await pool.query(
  `
    insert into projects (id, organization_id, name, status)
    values ($1, $2, 'Raschini PWA Prototype', 'active')
    on conflict (id) do update set name = excluded.name, updated_at = now()
  `,
  [projectId, organizationId]
);

await pool.query(
  `
    insert into domains (id, organization_id, project_id, host, status, verified_at)
    values ($1, $2, $3, 'raschini-demo.local', 'verified', now())
    on conflict (project_id, host) do update set status = excluded.status, verified_at = excluded.verified_at
  `,
  [domainId, organizationId, projectId]
);

await pool.query(
  `
    update projects
    set default_domain_id = $1, updated_at = now()
    where id = $2
  `,
  [domainId, projectId]
);

await pool.query(
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
    values (
      $1,
      $2,
      'Raschini',
      'Raschini',
      'Demo tenant for the original PWA and Web Push prototype.',
      '/',
      '/',
      '#0f0f0f',
      '#ffffff',
      '[]'::jsonb,
      '{"title":"Add Raschini to Home Screen"}'::jsonb
    )
    on conflict (project_id) do update set
      name = excluded.name,
      short_name = excluded.short_name,
      updated_at = now()
  `,
  [projectId, organizationId]
);

await pool.query(
  `
    insert into vapid_credentials (project_id, organization_id, public_key, private_key_encrypted, subject)
    values ($1, $2, 'demo-public-vapid-key', $3, 'mailto:ops@example.com')
    on conflict (project_id) do update set public_key = excluded.public_key
  `,
  [projectId, organizationId, cipher.encrypt("demo-private-vapid-key")]
);

await pool.query(
  `
    insert into api_keys (organization_id, project_id, name, prefix, key_hash, scopes)
    values ($1, $2, 'Demo admin key', $3, $4, $5)
    on conflict (prefix) do update set
      key_hash = excluded.key_hash,
      scopes = excluded.scopes,
      revoked_at = null
  `,
  [
    organizationId,
    projectId,
    apiKeyPrefix(demoApiKey),
    hashSecret(demoApiKey),
    ["campaigns:write", "campaigns:send"]
  ]
);

await pool.end();
console.log(`Seeded demo organization ${organizationId} and project ${projectId}`);
console.log("Demo API key is read from DEMO_API_KEY or defaults to pg_dev_demo_key_change_me");
