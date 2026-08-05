import { z } from "zod";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export const CAMPAIGN_DELIVERY_QUEUE_NAME = "campaign-delivery";
export const DEFAULT_CAMPAIGN_BATCH_SIZE = 500;

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
  external_source: z.string().min(1).max(64).optional(),
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

export const subscriberHeartbeatSchema = z.object({
  project_id: z.string().uuid(),
  subscriber_id: z.string().uuid().optional(),
  anonymous_id: z.string().min(1).optional(),
  external_customer_id: z.string().min(1).optional(),
  endpoint: z.string().url().optional(),
  permission: z.enum(["default", "granted", "denied"]).optional(),
  platform: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  user_agent: z.string().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional()
});

export type SubscriberHeartbeat = z.infer<typeof subscriberHeartbeatSchema>;

export const eventTrackSchema = z.object({
  project_id: z.string().uuid(),
  subscriber_id: z.string().uuid().optional(),
  anonymous_id: z.string().min(1).optional(),
  external_customer_id: z.string().min(1).optional(),
  campaign_id: z.string().uuid().optional(),
  type: z.string().min(1).max(80),
  payload: z.record(z.unknown()).optional()
});

export type EventTrack = z.infer<typeof eventTrackSchema>;

export const geoUpdateSchema = z.object({
  project_id: z.string().uuid(),
  subscriber_id: z.string().uuid().optional(),
  anonymous_id: z.string().min(1).optional(),
  external_customer_id: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
  consent_version: z.string().min(1).max(64).optional()
});

export type GeoUpdate = z.infer<typeof geoUpdateSchema>;

export const trialRegistrationSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(240),
  company: z.string().min(1).max(160),
  siteUrl: z.string().url(),
  password: z.string().min(8).max(200)
});

export type TrialRegistration = z.infer<typeof trialRegistrationSchema>;

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

export type DataCipher = {
  encrypt(value: string): string;
  decrypt(envelope: string): string;
};

export function hashSecret(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function apiKeyPrefix(value: string): string {
  return value.slice(0, 16);
}

export function createDataCipher(rawKey?: string): DataCipher {
  const key = resolveEncryptionKey(rawKey);

  return {
    encrypt(value: string) {
      const iv = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", key, iv);
      const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
      const tag = cipher.getAuthTag();

      return [
        "v1",
        iv.toString("base64url"),
        tag.toString("base64url"),
        encrypted.toString("base64url")
      ].join(":");
    },
    decrypt(envelope: string) {
      if (!envelope.startsWith("v1:")) {
        return Buffer.from(envelope, "base64").toString("utf8");
      }

      const [, ivText, tagText, encryptedText] = envelope.split(":");
      if (!ivText || !tagText || !encryptedText) {
        throw new Error("Invalid encrypted envelope");
      }

      const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivText, "base64url"));
      decipher.setAuthTag(Buffer.from(tagText, "base64url"));
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedText, "base64url")),
        decipher.final()
      ]);

      return decrypted.toString("utf8");
    }
  };
}

function resolveEncryptionKey(rawKey?: string): Buffer {
  if (!rawKey) {
    return createHash("sha256").update("pushgiant-development-data-key").digest();
  }

  if (/^[a-f0-9]{64}$/i.test(rawKey)) {
    return Buffer.from(rawKey, "hex");
  }

  const decoded = Buffer.from(rawKey, "base64");
  if (decoded.length === 32) {
    return decoded;
  }

  return createHash("sha256").update(rawKey).digest();
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
