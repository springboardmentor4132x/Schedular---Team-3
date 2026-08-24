"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X as XIcon, Megaphone, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { usePostsStore } from "@/store/usePostsStore";
import { useAccountsStore } from "@/store/useAccountsStore";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import { useAuth } from "@/hooks/useAuth";
import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import PostPreviewCard from "./PostPreviewCard";
import { CONTENT_TYPES, TIMEZONES } from "@/lib/content";
import type { ContentType, BackendMediaItem } from "@/types";
import type { SocialPlatform } from "@/lib/constants";
import type { PlatformCreateResult } from "@/store/usePostsStore";
import PublishNowButton from "@/components/dashboard/publishing/PublishNowButton";

const ACCEPT_BY_TYPE: Record<ContentType, string> = {
  text: "",
  image: "image/*",
  carousel: "image/*",
  story: "image/*,video/*",
  reel: "video/*",
  video: "video/*",
};

/** Derive the upload media_type from a browser File object. */
function getMediaType(file: File): "image" | "gif" | "video" | "audio" | "document" {
  if (file.type === "image/gif") return "gif";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "document";
}

function FormSection({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border bg-surface p-5">
      <label className="mb-3 block text-sm font-semibold">
        {label}
        {hint ? <span className="ml-2 font-normal text-muted">{hint}</span> : null}
      </label>
      {children}
    </div>
  );
}

/**
 * Local media item used only for preview within the composer.
 * previewUrl is a blob URL — never sent to the backend.
 * serverUrl is set after uploadMedia() succeeds and is used in the API payload.
 * uploaded BackendMediaItem is the complete server response for the post payload.
 */
interface LocalMediaItem {
  previewUrl: string;
  serverUrl?: string;
  serverItem?: BackendMediaItem;
  isVideo: boolean;
  name: string;
  file?: File; // undefined when loading existing media_files from server
}

export default function CreatePostForm({
  postId,
  backHref,
}: {
  postId?: string;
  backHref: string;
}) {
  const router = useRouter();
  const { getPost, createPostMulti, updatePost, fetchPosts, uploadMedia } = usePostsStore();
  const { user } = useAuth();
  const connections = useAccountsStore((s) => s.connections);
  const fetchAccounts = useAccountsStore((s) => s.fetchAccounts);
  const campaigns = useCampaignsStore((s) => s.campaigns);
  const fetchCampaigns = useCampaignsStore((s) => s.fetchCampaigns);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure campaign picker is populated even when navigated to directly.
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Ensure platform picker reflects real server account state even when
  // the user opens Create Post without first visiting the Accounts page.
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // TODO: Switch to GET /api/posts/{post_id} when the backend single-post
  // endpoint becomes available. For now we get the post from the in-memory
  // store (populated by fetchPosts), falling back to a server fetch.
  const [existingLoaded, setExistingLoaded] = useState(false);
  const existing = postId ? getPost(postId) : undefined;

  useEffect(() => {
    if (!postId) return;
    if (existing) { setExistingLoaded(true); return; }
    // Fallback: fetch the full list and let getPost() pick the right one.
    fetchPosts().then(() => setExistingLoaded(true));
  }, [postId, existing, fetchPosts]);

  const connectedPlatforms = (Object.keys(connections) as SocialPlatform[]).filter(
    (p) => connections[p].status === "connected"
  );

  const [caption, setCaption] = useState(existing?.caption ?? "");
  const [contentType, setContentType] = useState<ContentType>(existing?.contentType ?? "text");
  const [platforms, setPlatforms] = useState<string[]>(existing?.platforms ?? []);
  const [campaignId, setCampaignId] = useState<string>(String(existing?.campaignId ?? ""));
  const [scheduledDate, setScheduledDate] = useState(existing?.scheduledDate ?? "");
  const [scheduledTime, setScheduledTime] = useState(existing?.scheduledTime ?? "");
  const [timezone, setTimezone] = useState(existing?.timezone ?? "Asia/Kolkata");

  // Media items: previewUrl is blob-only for local preview; serverUrl is
  // set after a successful upload and is the value sent to the backend.
  const [media, setMedia] = useState<LocalMediaItem[]>(() => {
    if (!existing?.media_files?.length) return [];
    // Existing server media_files: no local File, server URL already known.
    return existing.media_files.map((mf) => ({
      previewUrl: mf.media_url,
      serverUrl: mf.media_url,
      serverItem: mf,
      isVideo: mf.media_type === "video",
      name: mf.media_url.split("/").pop() ?? "media",
    }));
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResults, setSubmitResults] = useState<PlatformCreateResult[] | null>(null);

  const isPublished = existing?.status === "published";
  const isEditing = !!postId;

  // Revoke blob URLs created for local preview when the component unmounts.
  useEffect(() => {
    return () => {
      media.forEach((m) => {
        if (m.previewUrl.startsWith("blob:")) URL.revokeObjectURL(m.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const next: LocalMediaItem[] = Array.from(files).map((file) => ({
      previewUrl: URL.createObjectURL(file), // local preview only
      isVideo: file.type.startsWith("video"),
      name: file.name,
      file,
    }));
    setMedia((prev) => [...prev, ...next]);
  }

  function removeMedia(previewUrl: string) {
    setMedia((prev) => prev.filter((m) => m.previewUrl !== previewUrl));
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  }

  function togglePlatform(p: string) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function validate(requireSchedule: boolean): string | null {
    if (!caption.trim()) return "Write a caption first.";
    if (!isEditing && platforms.length === 0) return "Select at least one connected platform.";
    if (contentType !== "text" && media.length === 0) {
      return `Upload at least one ${contentType === "video" || contentType === "reel" ? "video" : "image"}.`;
    }
    if (requireSchedule && (!scheduledDate || !scheduledTime)) {
      return "Choose a publishing date and time.";
    }
    return null;
  }

  /**
   * Upload any media items that do not yet have a server URL.
   * Returns the complete list of BackendMediaItem for the request payload,
   * or null if an upload failed.
   */
  async function uploadPendingMedia(): Promise<BackendMediaItem[] | null> {
    const results: BackendMediaItem[] = [];

    for (let i = 0; i < media.length; i++) {
      const item = media[i];

      // Already uploaded (existing server media or previously uploaded this session).
      if (item.serverItem) {
        results.push(item.serverItem);
        continue;
      }

      if (!item.file) {
        setError(`Media item "${item.name}" has no file to upload.`);
        return null;
      }

      try {
        const uploaded = await uploadMedia(item.file, getMediaType(item.file));
        const backendItem: BackendMediaItem = {
          media_url: uploaded.media_url,
          media_type: uploaded.media_type,
          mime_type: uploaded.mime_type,
          file_size: uploaded.file_size,
          display_order: i + 1,
        };
        results.push(backendItem);
        // Mark the local item as uploaded so re-submits don't re-upload.
        setMedia((prev) =>
          prev.map((m) =>
            m.previewUrl === item.previewUrl
              ? { ...m, serverUrl: uploaded.media_url, serverItem: backendItem }
              : m
          )
        );
      } catch {
        setError(`Failed to upload "${item.name}". Please try again.`);
        return null;
      }
    }

    return results;
  }

  async function handleSave(status: "draft" | "scheduled") {
    if (isPublished) return; // Published posts cannot be edited.
    const err = validate(status === "scheduled");
    if (err) { setError(err); return; }
    setError(null);
    setSubmitting(true);
    setSubmitResults(null);

    // 1. Upload any new media files first.
    const uploadedMedia = await uploadPendingMedia();
    if (uploadedMedia === null) {
      setSubmitting(false);
      return;
    }

    // 2. Build the scheduled_time ISO string.
    // The API accepts a single ISO datetime; we combine the date/time picker
    // values directly without timezone conversion (the backend stores as-is).
    const scheduledTimeStr =
      status === "scheduled" && scheduledDate && scheduledTime
        ? `${scheduledDate}T${scheduledTime}:00`
        : new Date().toISOString().slice(0, 19);

    if (isEditing && existing) {
      // ── EDIT PATH ────────────────────────────────────────────────────────
      // Send only fields that actually changed.
      const originalMedia = existing.media_files ?? [];
      const mediaChanged = uploadedMedia.some(
        (m, i) => m.media_url !== (originalMedia[i]?.media_url ?? "")
      ) || uploadedMedia.length !== originalMedia.length;

      const patch: Record<string, unknown> = {};
      if (caption !== existing.caption) patch.caption = caption;
      if (contentType !== existing.contentType) patch.content_type = contentType;
      if (scheduledDate && scheduledTime) {
        const orig = existing.scheduled_time ?? "";
        if (scheduledTimeStr !== orig) patch.scheduled_time = scheduledTimeStr;
      }
      if (campaignId && String(campaignId) !== String(existing.campaignId ?? "")) {
        patch.campaign_id = Number(campaignId);
      }
      // CRITICAL: only include media if it actually changed.
      if (mediaChanged) patch.media = uploadedMedia;

      try {
        await updatePost(existing.id, patch);
        router.push(backHref);
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
          ?? "Failed to update post.";
        setError(msg);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // ── CREATE PATH ───────────────────────────────────────────────────────
    const { results } = await createPostMulti(
      {
        title: caption.length > 50 ? caption.slice(0, 47) + "..." : caption,
        caption,
        contentType,
        platforms,
        scheduledDate,
        scheduledTime,
        status,
        campaignId: campaignId || undefined,
        mediaItems: uploadedMedia,
      },
      connections
    );

    setSubmitting(false);
    setSubmitResults(results);

    const allFailed = results.every((r) => !r.success);
    if (!allFailed) {
      // At least one platform succeeded — navigate away after a short delay
      // so the user can read the results summary.
      setTimeout(() => router.push(backHref), 2000);
    }
  }

  const needsMedia = contentType !== "text";
  const previewMedia = media.map((m) => ({
    url: m.previewUrl, // use preview URL for the live composer preview
    isVideo: m.isVideo,
  }));

  // If the edit page is still loading the post (no existing and postId provided),
  // show a simple loading state.
  if (postId && !existingLoaded && !existing) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted">
        <Loader2 size={16} className="animate-spin" />
        Loading post…
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      {/* Compose */}
      <div className="space-y-5">
        {isPublished && (
          <div className="border border-border bg-surface p-4 text-sm text-muted">
            Published posts cannot be edited.
          </div>
        )}

        <FormSection label="Caption">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={5}
            placeholder="Write your post…"
            disabled={isPublished}
            className="w-full border border-border bg-background p-3 text-sm outline-none focus:border-accent-hover disabled:opacity-60"
          />
        </FormSection>

        <FormSection label="Content type">
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((t) => (
              <motion.button
                key={t.value}
                whileTap={{ scale: 0.96 }}
                onClick={() => setContentType(t.value)}
                disabled={isPublished}
                className={`relative flex items-center gap-1.5 border px-3 py-1.5 text-xs disabled:opacity-60 ${
                  contentType === t.value ? "border-ink" : "border-border text-muted"
                }`}
              >
                {contentType === t.value ? (
                  <motion.span
                    layoutId="content-type-active"
                    className="absolute inset-0 bg-ink"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                ) : null}
                <t.icon size={13} className={`relative z-10 ${contentType === t.value ? "text-background" : ""}`} />
                <span className={`relative z-10 ${contentType === t.value ? "text-background" : ""}`}>
                  {t.label}
                </span>
              </motion.button>
            ))}
          </div>
        </FormSection>

        {needsMedia ? (
          <FormSection label="Media" hint={`(${contentType})`}>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_BY_TYPE[contentType]}
              multiple={contentType === "carousel"}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            {!isPublished && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
                className="flex w-full flex-col items-center gap-2 border border-dashed border-border bg-background py-8 text-muted hover:border-accent-hover hover:text-ink disabled:opacity-60"
              >
                {submitting ? <Loader2 size={22} className="animate-spin" /> : <UploadCloud size={22} />}
                <span className="text-sm">
                  {submitting ? "Uploading…" : `Click to upload ${contentType === "video" || contentType === "reel" ? "a video" : "images"}`}
                </span>
              </motion.button>
            )}

            {media.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <AnimatePresence>
                  {media.map((m) => (
                    <motion.div
                      key={m.previewUrl}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className="group relative h-20 w-20 overflow-hidden border border-border bg-background"
                    >
                      {m.isVideo ? (
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <video src={m.previewUrl} className="h-full w-full object-cover" muted />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.previewUrl} alt={m.name} className="h-full w-full object-cover" />
                      )}
                      {/* Show a tick when the server URL is confirmed */}
                      {m.serverUrl && (
                        <span className="absolute left-0.5 top-0.5 text-success">
                          <CheckCircle2 size={12} />
                        </span>
                      )}
                      {!isPublished && (
                        <button
                          onClick={() => removeMedia(m.previewUrl)}
                          className="absolute right-0.5 top-0.5 bg-ink/80 p-0.5 text-background opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <XIcon size={12} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : null}
          </FormSection>
        ) : null}

        {/* Platform picker — only shown for new posts */}
        {!isEditing && (
          <FormSection label="Publish to">
            {connectedPlatforms.length === 0 ? (
              <p className="text-sm text-muted">
                No connected accounts yet — connect one first from Connected Accounts.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {connectedPlatforms.map((p) => {
                  const meta = PLATFORM_META[p];
                  const active = platforms.includes(p);
                  return (
                    <motion.button
                      key={p}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => togglePlatform(p)}
                      className={`flex items-center gap-2 border px-3 py-2 text-sm transition-colors ${
                        active ? "border-ink bg-accent-soft" : "border-border"
                      }`}
                    >
                      <meta.Icon size={15} color={meta.color} />
                      {meta.label}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </FormSection>
        )}

        <FormSection label="Campaign" hint="(optional)">
          <div className="flex items-center gap-2">
            <Megaphone size={16} className="text-muted" />
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              disabled={isPublished}
              className="w-full border border-border bg-background px-3 py-2 text-sm outline-none disabled:opacity-60"
            >
              <option value="">No campaign</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </FormSection>

        <FormSection label="When">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="mb-1.5 text-xs text-muted">Date</p>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                disabled={isPublished}
                className="w-full border border-border bg-background px-3 py-2 text-sm outline-none disabled:opacity-60"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs text-muted">Time</p>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                disabled={isPublished}
                className="w-full border border-border bg-background px-3 py-2 text-sm outline-none disabled:opacity-60"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs text-muted">Timezone</p>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={isPublished}
                className="w-full border border-border bg-background px-3 py-2 text-sm outline-none disabled:opacity-60"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-2 font-mono text-[10px] text-muted">
            Timezone is displayed for your reference. The backend stores{" "}
            <code>scheduled_time</code> as provided.
          </p>
        </FormSection>

        {/* Per-platform submission results */}
        <AnimatePresence>
          {submitResults && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2 border border-border bg-surface p-4"
            >
              <p className="text-sm font-semibold">Submission results</p>
              {submitResults.map((r) => (
                <div key={r.platform} className="flex items-start gap-2 text-sm">
                  {r.success ? (
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />
                  ) : (
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" />
                  )}
                  <span>
                    <span className="font-medium capitalize">{r.platform}</span>
                    {r.success ? " — created successfully" : ` — ${r.error ?? "failed"}`}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm font-medium text-danger"
            >
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>

        {!isPublished && (
          <div className="flex flex-wrap gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSave("draft")}
              disabled={submitting}
              className="border border-ink/30 px-5 py-2.5 text-sm font-medium hover:bg-background disabled:opacity-60"
            >
              {submitting ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
              Save as draft
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleSave("scheduled")}
              disabled={submitting}
              className="bg-accent px-5 py-2.5 text-sm font-medium text-ink hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
              Schedule
            </motion.button>
            {isEditing && existing && (existing.status === "draft" || existing.status === "scheduled") ? (
              <PublishNowButton
                post={existing}
                className="px-5 py-2.5 text-sm"
                onSuccess={() => router.push(backHref)}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Live preview */}
      <div>
        <p className="mb-2 font-mono text-xs text-muted">
          PREVIEW {media.length > 1 ? `· ${media.length} MEDIA` : ""}
        </p>
        {platforms.length === 0 ? (
          <div className="border border-border bg-surface p-5">
            <p className="text-sm text-muted">Select a platform to see how this will look.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {platforms.map((p) => (
              <PostPreviewCard
                key={p}
                platform={p as SocialPlatform}
                caption={caption}
                media={previewMedia}
                contentType={contentType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
