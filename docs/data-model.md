# Data Model Draft

Every tenant-owned table must include `organization_id` and/or `project_id`.

## Core Tables

| Table | Key fields |
| --- | --- |
| `organizations` | `id`, `name`, `status`, `plan`, `created_at`, `updated_at` |
| `organization_members` | `organization_id`, `user_id`, `role` |
| `users` | `id`, `email`, `name`, `password_hash`, `created_at` |
| `projects` | `id`, `organization_id`, `name`, `status`, `default_domain_id` |
| `domains` | `id`, `organization_id`, `project_id`, `host`, `status`, `verified_at` |
| `pwa_configs` | `project_id`, `name`, `short_name`, `theme_color`, `background_color`, `start_url`, `scope`, `icons_json` |
| `vapid_credentials` | `project_id`, `public_key`, `private_key_encrypted`, `subject`, `rotated_at` |
| `api_keys` | `project_id`, `name`, `prefix`, `key_hash`, `scopes`, `last_used_at`, `revoked_at` |
| `subscribers` | `id`, `organization_id`, `project_id`, `external_customer_id`, `anonymous_id`, `mindbox_customer_id` |
| `push_subscriptions` | `id`, `organization_id`, `project_id`, `subscriber_id`, `endpoint_hash`, `endpoint_encrypted`, `p256dh_encrypted`, `auth_encrypted`, `status` |
| `campaigns` | `id`, `organization_id`, `project_id`, `status`, `title`, `body`, `url`, `image_asset_id`, `scheduled_at` |
| `campaign_batches` | `id`, `campaign_id`, `status`, `subscriber_count`, `attempt`, `scheduled_at`, `started_at`, `finished_at` |
| `delivery_attempts` | `id`, `campaign_id`, `batch_id`, `subscription_id`, `status`, `provider_status_code`, `attempt`, `error_code` |
| `events` | `id`, `organization_id`, `project_id`, `subscriber_id`, `campaign_id`, `type`, `payload_json`, `created_at` |
| `assets` | `id`, `organization_id`, `project_id`, `kind`, `storage_key`, `mime`, `size_bytes`, `width`, `height` |
| `locations` | `id`, `organization_id`, `project_id`, `name`, `latitude`, `longitude`, `radius_meters` |
| `geo_consents` | `subscriber_id`, `consent_version`, `status`, `updated_at` |
| `audit_log` | `id`, `organization_id`, `actor_user_id`, `action`, `target_type`, `target_id`, `created_at` |

## Subscription Fields

`push_subscriptions` must store:

- `endpoint_hash`
- encrypted/raw endpoint depending on security policy
- encrypted `p256dh`
- encrypted `auth`
- `content_encoding`
- `platform`
- `browser`
- `user_agent`
- `locale`
- `timezone`
- `permission`
- `status`
- `created_at`
- `updated_at`
- `last_seen_at`
- `failure_count`
- `last_failure_at`
- `disabled_at`

## Campaign Statuses

- `draft`
- `scheduled`
- `queued`
- `sending`
- `completed`
- `partially_failed`
- `failed`
- `cancelled`

## Event Types

- `pwa_installed`
- `push_permission_granted`
- `push_permission_denied`
- `subscribed`
- `unsubscribed`
- `notification_accepted`
- `notification_clicked`
- `geo_updated`
- `campaign_created`
- `campaign_queued`
- `campaign_completed`
