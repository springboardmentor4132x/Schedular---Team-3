import { create } from "zustand";
import type {
  Post,
  PostStatus,
  ContentType,
  BackendMediaItem,
  PublishingLogsResponse,
  PublishLogEntry,
  AccountConnection,
} from "@/types";
import { type SocialPlatform } from "@/lib/constants";
import { api } from "@/lib/api";
import type { AxiosError } from "axios";

export interface BackendPostCreatePayload {
  title: string;
  caption: string;
  content_type: ContentType;
  platform: string;
  scheduled_time: string;
  campaign_id?: number;
  social_account_id: number;
  media: BackendMediaItem[];
}

export interface BackendPostUpdatePayload {
  title?: string;
  caption?: string;
  content_type?: ContentType;
  platform?: string;
  scheduled_time?: string;
  campaign_id?: number;
  social_account_id?: number;
  status?: PostStatus;
  media?: BackendMediaItem[];
}

export interface PostCreateInput {
  title?: string;
  caption: string;
  contentType: ContentType;
  platforms: string[];
  scheduledDate: string;
  scheduledTime: string;
  timezone?: string;
  status: "draft" | "scheduled";
  campaignId?: string | number;
  mediaItems: BackendMediaItem[];
}

export interface PlatformCreateResult {
  platform: string;
  success: boolean;
  error?: string;
  post?: Post;
}

export interface UploadMediaResponse {
  media_url: string;
  file_path: string;
  media_type: "image" | "gif" | "video" | "audio" | "document";
  mime_type: string;
  file_size: number;
}

/**
 * Normalizes backend post response into the frontend Post structure.
 */
function normalizePost(raw: Record<string, unknown>): Post {
  const scheduledTimeRaw = (raw.scheduled_time || raw.scheduledTime || "") as string;
  let scheduledDate = "";
  let scheduledTime = "";
  if (scheduledTimeRaw && scheduledTimeRaw.includes("T")) {
    const [d, t] = scheduledTimeRaw.split("T");
    scheduledDate = d;
    scheduledTime = t ? t.slice(0, 5) : "";
  }

  const rawMediaFiles = (raw.media_files || raw.media || []) as (BackendMediaItem | string)[];
  const mediaUrls: string[] = rawMediaFiles.map((m) =>
    typeof m === "string" ? m : m.media_url || ""
  );

  const rawPlatform = (raw.platform || "") as string;
  const rawPlatforms = (raw.platforms as string[]) || (rawPlatform ? [rawPlatform] : []);

  return {
    id: (raw.id as string | number) || "",
    title: (raw.title as string) || "",
    caption: (raw.caption as string) || "",
    contentType: ((raw.content_type || raw.contentType || "text") as ContentType),
    platform: rawPlatform || rawPlatforms[0] || "unknown",
    platforms: rawPlatforms,
    scheduledDate: (raw.scheduledDate as string) || scheduledDate,
    scheduledTime: (raw.scheduledTime as string) || scheduledTime,
    scheduled_time: scheduledTimeRaw,
    timezone: (raw.timezone as string) || "Asia/Kolkata",
    status: (raw.status as PostStatus) || "draft",
    campaignId: (raw.campaign_id ?? raw.campaignId) as string | number | undefined,
    campaign_id: raw.campaign_id as string | number | undefined,
    social_account_id: raw.social_account_id as string | number | undefined,
    mediaUrls,
    media_files: raw.media_files as BackendMediaItem[] | undefined,
    retry_count: typeof raw.retry_count === "number" ? raw.retry_count : 0,
    failure_reason: (raw.failure_reason as string) || null,
    published_at: (raw.published_at as string) || null,
    platform_post_id: (raw.platform_post_id as string) || null,
    published_url: (raw.published_url as string) || null,
    createdAt: (raw.created_at || raw.createdAt || new Date().toISOString()) as string,
    created_at: raw.created_at as string | undefined,
    updatedAt: (raw.updated_at || raw.updatedAt || new Date().toISOString()) as string,
    updated_at: raw.updated_at as string | undefined,
  };
}

interface PostsState {
  posts: Post[];
  logs: PublishLogEntry[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;

  clearError: () => void;
  getPost: (id: string | number) => Post | undefined;

  /**
   * Fetches posts with server-side query filters.
   */
  fetchPosts: (params?: {
    status?: PostStatus;
    platform?: string;
    skip?: number;
    limit?: number;
  }) => Promise<Post[]>;

  /**
   * Uploads media file to POST /api/posts/upload-media using multipart FormData.
   */
  uploadMedia: (
    file: File,
    mediaType: "image" | "gif" | "video" | "audio" | "document"
  ) => Promise<UploadMediaResponse>;

  /**
   * Creates posts for multiple selected platforms (one request per platform/account).
   * Preserves successful posts and returns per-platform results for partial failure handling.
   */
  createPostMulti: (
    input: PostCreateInput,
    connectedAccounts: Record<SocialPlatform, AccountConnection>
  ) => Promise<{ results: PlatformCreateResult[] }>;

  /**
   * Partially updates a post via PUT /api/posts/{post_id}.
   */
  updatePost: (
    postId: string | number,
    patch: BackendPostUpdatePayload
  ) => Promise<Post>;

  /**
   * Cancels a scheduled post via PUT /api/posts/{post_id} with { status: "cancelled" }.
   */
  cancelPost: (postId: string | number) => Promise<void>;

  /**
   * Deletes a post via DELETE /api/posts/{post_id}.
   */
  deletePost: (postId: string | number) => Promise<void>;

  /**
   * Fetches real publishing logs from GET /api/publishing/logs/{post_id}.
   */
  fetchPublishingLogs: (postId: string | number) => Promise<PublishingLogsResponse>;

  /**
   * Retries publishing a failed post via POST /api/publishing/retry/{post_id}.
   */
  retryPublishing: (postId: string | number) => Promise<{ status: string; post_id: number | string }>;

  /**
   * Immediately publishes a draft or scheduled post via POST /api/publishing/publish/{post_id}.
   */
  publishNow: (
    postId: string | number
  ) => Promise<{ status: string; post_id: number | string; message: string }>;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  logs: [],
  isLoading: false,
  hasLoaded: false,
  error: null,

  clearError: () => set({ error: null }),

  getPost: (postId) => {
    return get().posts.find((p) => String(p.id) === String(postId));
  },

  fetchPosts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Record<string, unknown>[]>("/posts/", { params });
      const rawList = Array.isArray(res.data) ? res.data : [];
      const normalized = rawList.map(normalizePost);

      set({
        posts: normalized,
        isLoading: false,
        hasLoaded: true,
      });
      return normalized;
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      const detail = axiosErr.response?.data?.detail || "Failed to load posts.";
      set({ isLoading: false, hasLoaded: true, error: detail });
      return [];
    }
  },

  uploadMedia: async (file, mediaType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("media_type", mediaType);

    const res = await api.post<UploadMediaResponse>("/posts/upload-media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },

  createPostMulti: async (input, connectedAccounts) => {
    const results: PlatformCreateResult[] = [];
    const newPosts: Post[] = [];

    for (const platform of input.platforms) {
      const conn = connectedAccounts[platform as SocialPlatform];
      const accountId = conn?.id || conn?.accountId;

      if (!accountId || conn.status !== "connected") {
        results.push({
          platform,
          success: false,
          error: `Account for ${platform} is not connected.`,
        });
        continue;
      }

      const scheduledTimeStr =
        input.status === "scheduled" && input.scheduledDate && input.scheduledTime
          ? `${input.scheduledDate}T${input.scheduledTime}:00`
          : new Date().toISOString().slice(0, 19);

      const payload: BackendPostCreatePayload = {
        title: input.title || (input.caption.length > 50 ? input.caption.slice(0, 47) + "..." : input.caption),
        caption: input.caption,
        content_type: input.contentType,
        platform,
        scheduled_time: scheduledTimeStr,
        campaign_id: input.campaignId ? Number(input.campaignId) : undefined,
        social_account_id: Number(accountId),
        media: input.mediaItems,
      };

      try {
        const res = await api.post<Record<string, unknown>>("/posts/", payload);
        const post = normalizePost(res.data);
        results.push({ platform, success: true, post });
        newPosts.push(post);
      } catch (err) {
        const axiosErr = err as AxiosError<{ detail?: string }>;
        const detail = axiosErr.response?.data?.detail || axiosErr.message || "Failed to create post.";
        results.push({ platform, success: false, error: detail });
      }
    }

    if (newPosts.length > 0) {
      set((s) => ({ posts: [...newPosts, ...s.posts] }));
    }

    return { results };
  },

  updatePost: async (postId, patch) => {
    const res = await api.put<Record<string, unknown>>(`/posts/${postId}`, patch);
    const updated = normalizePost(res.data);

    set((s) => ({
      posts: s.posts.map((p) => (String(p.id) === String(postId) ? updated : p)),
    }));

    return updated;
  },

  cancelPost: async (postId) => {
    await api.put(`/posts/${postId}`, { status: "cancelled" });

    set((s) => ({
      posts: s.posts.map((p) =>
        String(p.id) === String(postId) ? { ...p, status: "cancelled" } : p
      ),
    }));
  },

  deletePost: async (postId) => {
    await api.delete(`/posts/${postId}`);

    set((s) => ({
      posts: s.posts.filter((p) => String(p.id) !== String(postId)),
    }));
  },

  fetchPublishingLogs: async (postId) => {
    const res = await api.get<PublishingLogsResponse>(`/publishing/logs/${postId}`);
    return res.data;
  },

  retryPublishing: async (postId) => {
    const res = await api.post<{ status: string; post_id: number | string }>(
      `/publishing/retry/${postId}`
    );
    return res.data;
  },

  publishNow: async (postId) => {
    const res = await api.post<{ status: string; post_id: number | string; message: string }>(
      `/publishing/publish/${postId}`
    );
    return res.data;
  },
}));

