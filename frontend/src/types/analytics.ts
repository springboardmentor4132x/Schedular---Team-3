import type { SocialPlatform } from "@/lib/constants";

// MODULE 6 - ANALYTICS DASHBOARD
// Kept fully isolated from Post/Campaign/AccountConnection (Modules 3/4/2)
// on purpose — this is mock-only frontend data until a teammate wires up
// the real analytics API/database.

// Per-post engagement data. Keyed by postId rather than added onto Post
// itself, so this stays fully isolated from Module 3/5's Post interface.
export interface PostAnalytics {
  postId: string;
  platform: SocialPlatform;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  clicks: number;
  engagementRate: number; // percentage, e.g. 4.8 means 4.8%
  date: string; // ISO date — when this platform result was published
}

export interface AudienceDemographic {
  ageRange: string; // e.g. "18-24"
  percentage: number;
}

export interface AudienceGenderSplit {
  label: string; // "Male" | "Female" | "Other"
  percentage: number;
}

export interface AudienceLocation {
  country: string;
  percentage: number;
}

export interface AudienceCity {
  city: string;
  percentage: number;
}

export interface AudienceLanguage {
  language: string;
  percentage: number;
}

export interface AudienceActivityPoint {
  hour: number; // 0-23
  level: number; // relative activity, 0-100
}

export interface AudienceActivityDay {
  day: string; // "Mon".."Sun"
  level: number; // relative activity, 0-100
}

// One per platform — audience data doesn't exist anywhere in the project
// today, so this is a fully new, isolated shape.
export interface AudienceSnapshot {
  platform: SocialPlatform;
  followers: number;
  newFollowers: number;
  lostFollowers: number;
  followerGrowth: number; // net growth = newFollowers - lostFollowers
  growthRate: number; // percentage
  genderDistribution: AudienceGenderSplit[];
  demographics: AudienceDemographic[]; // age distribution
  locations: AudienceLocation[]; // country distribution
  cities: AudienceCity[];
  languages: AudienceLanguage[];
  activityByHour: AudienceActivityPoint[];
  activityByDay: AudienceActivityDay[];
}

// One row per day. Performance Trends buckets these into
// weekly/monthly/quarterly/yearly later — this file only defines the shape.
export interface TrendPoint {
  date: string; // ISO "YYYY-MM-DD"
  engagement: number;
  reach: number;
  impressions: number;
  clicks: number;
}

// One row per platform — used by Platform Comparison. Followers mirrors the
// matching AudienceSnapshot's followers count (generated together, see
// useAnalyticsStore.ts) so the two pages never disagree on that number;
// the remaining metrics are generated independently since Reach/
// Impressions/Engagement/etc. are platform-comparison-specific.
export interface PlatformComparisonMetrics {
  platform: SocialPlatform;
  followers: number;
  reach: number;
  impressions: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

// ...(all existing types unchanged above this point)...

export type DateRangeFilter = "7d" | "30d" | "90d" | "12m" | "all";

// Performance Trends (Module 6 Part 8A) — how TrendPoint rows get bucketed
// for display. Purely a UI-level grouping; the underlying TrendPoint shape
// (one row per day) is unchanged.
export type TrendGranularity = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";