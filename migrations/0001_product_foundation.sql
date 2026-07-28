create extension if not exists pgcrypto;

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active',
  plan text not null default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  password_hash text,
  created_at timestamptz not null default now()
);

create table organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'marketer', 'viewer', 'technical')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  status text not null default 'active',
  default_domain_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table domains (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  host text not null,
  status text not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (project_id, host)
);

alter table projects
  add constraint projects_default_domain_fk
  foreign key (default_domain_id) references domains(id) on delete set null;

create table pwa_configs (
  project_id uuid primary key references projects(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  short_name text not null,
  description text,
  start_url text not null default '/',
  scope text not null default '/',
  display text not null default 'standalone',
  theme_color text not null default '#111111',
  background_color text not null default '#ffffff',
  orientation text,
  icons_json jsonb not null default '[]'::jsonb,
  install_prompt_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table vapid_credentials (
  project_id uuid primary key references projects(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  public_key text not null,
  private_key_encrypted text not null,
  subject text not null,
  rotated_at timestamptz,
  created_at timestamptz not null default now()
);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  prefix text not null,
  key_hash text not null,
  scopes text[] not null default '{}',
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (prefix)
);

create table subscribers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  external_customer_id text,
  mindbox_customer_id text,
  email_hash text,
  phone_hash text,
  anonymous_id text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  accuracy numeric(10,2),
  geo_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, anonymous_id),
  unique (project_id, external_customer_id)
);

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  subscriber_id uuid references subscribers(id) on delete set null,
  endpoint_hash text not null,
  endpoint_encrypted text not null,
  p256dh_encrypted text not null,
  auth_encrypted text not null,
  content_encoding text,
  platform text,
  browser text,
  user_agent text,
  locale text,
  timezone text,
  permission text,
  status text not null default 'active',
  failure_count integer not null default 0,
  last_failure_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (project_id, endpoint_hash)
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  kind text not null,
  storage_key text not null,
  mime text not null,
  size_bytes integer not null,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  status text not null default 'draft' check (
    status in ('draft', 'scheduled', 'queued', 'sending', 'completed', 'partially_failed', 'failed', 'cancelled')
  ),
  title text not null,
  body text not null,
  url text,
  image_asset_id uuid references assets(id) on delete set null,
  ttl_seconds integer,
  urgency text,
  topic text,
  scheduled_at timestamptz,
  queued_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table campaign_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  status text not null default 'queued',
  subscriber_count integer not null default 0,
  attempt integer not null default 0,
  scheduled_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  batch_id uuid references campaign_batches(id) on delete set null,
  subscription_id uuid references push_subscriptions(id) on delete set null,
  status text not null,
  provider_status_code integer,
  attempt integer not null default 1,
  error_code text,
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  subscriber_id uuid references subscribers(id) on delete set null,
  campaign_id uuid references campaigns(id) on delete set null,
  type text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  radius_meters integer not null default 500,
  created_at timestamptz not null default now()
);

create table geo_consents (
  subscriber_id uuid primary key references subscribers(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  consent_version text not null,
  status text not null,
  updated_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_user_id uuid references users(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index projects_organization_idx on projects(organization_id);
create index subscribers_project_idx on subscribers(project_id);
create index push_subscriptions_project_status_idx on push_subscriptions(project_id, status);
create index campaigns_project_status_idx on campaigns(project_id, status);
create index campaign_batches_campaign_status_idx on campaign_batches(campaign_id, status);
create index delivery_attempts_campaign_idx on delivery_attempts(campaign_id);
create index events_project_type_created_idx on events(project_id, type, created_at desc);
create index locations_project_idx on locations(project_id);
