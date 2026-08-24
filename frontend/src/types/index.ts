export interface User {
  id: string;
  name: string;
  email: string;
  role: "content_creator" | "marketing_team" | "business_owner" | "business_user" | "administrator";
  phone?: string | null;
  organization?: string | null;
  designation?: string | null;
  bio?: string | null;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
}

export type ConnectionStatus = "not_connected" | "connecting" | "connected" | "expired";

export interface SocialAccount {
  id: number | string;
  platform: string;
  account_name?: string;
  handle?: string;
  account_id?: string;
  is_connected: boolean;
  is_active?: boolean;
}

export interface AccountConnection {
  id?: number | string;
  accountId?: number | string;
  platform: string;
  status: ConnectionStatus;
  handle?: string;
  lastSyncedAt?: string;
}

export type ContentType = "text" | "image" | "video" | "carousel" | "story" | "reel";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "failed"
  | "cancelled"
  | "pending_approval";

export type PlatformPublishStatus = "pending" | "published" | "failed";

export interface BackendMediaItem {
  id?: number | string;
  media_url: string;
  media_type: "image" | "gif" | "video" | "audio" | "document";
  thumbnail_url?: string;
  mime_type?: string;
  file_size?: number;
  duration?: number;
  display_order?: number;
}

export interface PlatformResult {
  platform: string;
  status: PlatformPublishStatus;
  publishedAt?: string; // time and date of the last attempt
  retryCount: number; // retry attempt number
  apiResponse?: string; // raw response message received from the platform's API
  platformPostId?: string; // the ID the platform assigned once published
  initiatedBy?: string; // which user (name) triggered this attempt
}

export interface Post {
  id: string | number;
  title?: string;
  caption: string;
  mediaUrls: string[];
  contentType: ContentType;
  platform?: string;
  platforms: string[];
  scheduledDate?: string; // "YYYY-MM-DD"
  scheduledTime?: string; // "HH:mm"
  scheduled_time?: string;
  timezone?: string;
  status: PostStatus;
  campaignId?: string | number;
  campaign_id?: number | string;
  social_account_id?: number | string;
  media_files?: BackendMediaItem[];
  retry_count?: number;
  failure_reason?: string | null;
  published_at?: string | null;
  platform_post_id?: string | null;
  published_url?: string | null;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface PublishLogEntry {
  id: string | number;
  postId: string | number;
  postCaption?: string;
  platform: string;
  status: "success" | "failed" | "pending" | string;
  attemptNumber: number;
  attempt_number?: number;
  apiResponse?: string;
  error_message?: string | null;
  platformPostId?: string | null;
  platform_post_id?: string | null;
  published_url?: string | null;
  initiatedBy?: string;
  timestamp: string;
  created_at?: string;
}

export interface PublishingLogsResponse {
  post_id: number | string;
  status: PostStatus;
  logs: {
    id: number | string;
    attempt_number: number;
    status: string;
    platform: string;
    error_message: string | null;
    platform_post_id?: string | null;
    published_url?: string | null;
    created_at: string;
  }[];
}


export type CampaignStatus = "draft" | "active" | "completed" | "paused";
export type CampaignCategory = "product_launch" | "brand_awareness" | "promotion" | "engagement" | "other";
export type CampaignPriority = "low" | "medium" | "high";

export interface CampaignMetrics {
  engagement: number;
  reach: number;
  impressions: number;
  clicks: number;
  roi: number;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  startDate: string;
  endDate: string;
  budget: number;
  objectives: string;
  // Added for MODULE 4 - CAMPAIGN MANAGEMENT. Existing fields above are
  // untouched so any code already relying on the original Campaign shape
  // keeps working unchanged.
  status: CampaignStatus;
  scheduledPosts: number;
  publishedPosts: number;
  // Added for the Create Campaign form. Optional so existing mock campaigns
  // (which predate these fields) still satisfy the type without changes.
  description?: string;
  category?: CampaignCategory;
  priority?: CampaignPriority;
  // Added for Campaign Analytics Overview. Optional — a newly created
  // campaign has no metrics yet, and the Analytics page must handle that
  // by showing defaults/"No data yet" rather than erroring.
  metrics?: CampaignMetrics;
}
