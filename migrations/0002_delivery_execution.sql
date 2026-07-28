alter table campaign_batches
  add column if not exists sent_count integer not null default 0,
  add column if not exists failed_count integer not null default 0;

create index if not exists api_keys_active_lookup_idx
  on api_keys(prefix, key_hash)
  where revoked_at is null;

create index if not exists campaigns_scheduled_due_idx
  on campaigns(scheduled_at asc)
  where status = 'scheduled';

create index if not exists campaigns_queued_idx
  on campaigns(queued_at asc)
  where status = 'queued';

create index if not exists delivery_attempts_subscription_created_idx
  on delivery_attempts(subscription_id, created_at desc);
