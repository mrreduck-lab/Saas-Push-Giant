alter table organizations
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists trial_push_limit integer not null default 100,
  add column if not exists trial_push_sent integer not null default 0;

alter table subscribers
  add column if not exists external_source text,
  add column if not exists status text not null default 'active',
  add column if not exists first_seen_at timestamptz not null default now(),
  add column if not exists last_seen_at timestamptz not null default now();

alter table push_subscriptions
  add column if not exists os text,
  add column if not exists last_success_at timestamptz,
  add column if not exists last_confirmed_at timestamptz;

create table if not exists segments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  description text,
  definition_json jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name)
);

create table if not exists integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  kind text not null,
  name text not null,
  status text not null default 'pending',
  config_json jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, kind)
);

create index if not exists subscribers_project_status_seen_idx
  on subscribers(project_id, status, last_seen_at desc);

create index if not exists push_subscriptions_project_success_idx
  on push_subscriptions(project_id, last_success_at desc);

create index if not exists segments_project_status_idx
  on segments(project_id, status);

create index if not exists integration_connections_project_kind_idx
  on integration_connections(project_id, kind);
