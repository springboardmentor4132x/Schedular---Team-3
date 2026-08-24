import {
  FileText,
  Image as ImageIcon,
  Video,
  GalleryHorizontal,
  CircleDot,
  Clapperboard,
  FileEdit,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Hourglass,
  type LucideIcon,
} from "lucide-react";
import type { ContentType, PostStatus } from "@/types";

export const CONTENT_TYPES: { value: ContentType; label: string; icon: LucideIcon }[] = [
  { value: "text", label: "Text", icon: FileText },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "video", label: "Video", icon: Video },
  { value: "carousel", label: "Carousel", icon: GalleryHorizontal },
  { value: "story", label: "Story", icon: CircleDot },
  { value: "reel", label: "Reel", icon: Clapperboard },
];

export const STATUS_META: Record<PostStatus, { label: string; icon: LucideIcon; className: string }> = {
  draft: { label: "Draft", icon: FileEdit, className: "text-muted" },
  scheduled: { label: "Scheduled", icon: Clock, className: "text-info" },
  published: { label: "Published", icon: CheckCircle2, className: "text-success font-semibold" },
  failed: { label: "Failed", icon: AlertTriangle, className: "text-danger" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "text-muted line-through" },
  pending_approval: { label: "Pending Review", icon: Hourglass, className: "text-muted" },
};

export const TIMEZONES = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
];
