import { z } from "zod";

export const campaignStatusSchema = z.enum([
  "draft",
  "scheduled",
  "queued",
  "sending",
  "completed",
  "partially_failed",
  "failed",
  "cancelled"
]);

export type CampaignStatus = z.infer<typeof campaignStatusSchema>;

export const projectConfigSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1),
  publicKey: z.string().min(8),
  pwa: z.object({
    name: z.string().min(1),
    shortName: z.string().min(1),
    themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    startUrl: z.string().min(1),
    scope: z.string().min(1)
  })
});

export type ProjectConfig = z.infer<typeof projectConfigSchema>;

export const subscriptionUpsertSchema = z.object({
  project_id: z.string().uuid(),
  subscriber_id: z.string().uuid().optional(),
  anonymous_id: z.string().min(1).optional(),
  external_customer_id: z.string().min(1).optional(),
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1)
  }),
  content_encoding: z.string().optional(),
  platform: z.string().optional(),
  browser: z.string().optional(),
  user_agent: z.string().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  permission: z.enum(["default", "granted", "denied"]).optional()
});

export type SubscriptionUpsert = z.infer<typeof subscriptionUpsertSchema>;

export const campaignCreateSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(240),
  url: z.string().url().optional(),
  image_asset_id: z.string().uuid().optional(),
  ttl_seconds: z.number().int().positive().max(2_419_200).optional(),
  urgency: z.enum(["very-low", "low", "normal", "high"]).optional(),
  topic: z.string().max(32).optional(),
  scheduled_at: z.string().datetime().optional()
});

export type CampaignCreate = z.infer<typeof campaignCreateSchema>;

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
