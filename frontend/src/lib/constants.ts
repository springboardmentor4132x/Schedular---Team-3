export const APP_NAME = "SocialPilot";

export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "linkedin",
  "twitter",
  "youtube",
  "pinterest",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const POST_STATUS = [
  "scheduled",
  "published",
  "failed",
  "cancelled",
  "pending_approval",
] as const;

// MODULE 4 - CAMPAIGN MANAGEMENT
export const CAMPAIGN_STATUS = ["draft", "active", "completed", "paused"] as const;

export const CAMPAIGN_CATEGORY = [
  "product_launch",
  "brand_awareness",
  "promotion",
  "engagement",
  "other",
] as const;

export const CAMPAIGN_PRIORITY = ["low", "medium", "high"] as const;
