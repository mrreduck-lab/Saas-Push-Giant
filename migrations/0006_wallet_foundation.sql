-- Wallet foundation: tenant-safe pass profiles and geo relevance campaigns.
create table if not exists wallet_pass_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  external_customer_id text not null,
  customer_name text not null,
  level smallint not null check (level between 1 and 6),
  discount_percent numeric(5,2) not null default 0,
  rolling_12m_spend numeric(14,2) not null default 0,
  amount_to_next_level numeric(14,2) not null default 0,
  barcode_value text not null,
  barcode_format text not null default 'PKBarcodeFormatCode128',
  status text not null default 'active' check (status in ('active','suspended','revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, external_customer_id)
);

create table if not exists wallet_geo_campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  relevant_text text not null,
  status text not null default 'draft' check (status in ('draft','active','completed','cancelled')),
  level_filter smallint[] not null default '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  activated_at timestamptz,
  stopped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wallet_geo_locations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references wallet_geo_campaigns(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  created_at timestamptz not null default now()
);

create index if not exists wallet_pass_profiles_project_idx on wallet_pass_profiles(project_id, status);
create index if not exists wallet_geo_campaigns_project_idx on wallet_geo_campaigns(project_id, status);
create index if not exists wallet_geo_locations_campaign_idx on wallet_geo_locations(campaign_id);
