import { FileEdit, PlayCircle, CheckCircle2, PauseCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CampaignStatus } from "@/types";

const STATUS_META: Record<CampaignStatus, { label: string; Icon: LucideIcon; className: string }> = {
  draft: { label: "Draft", Icon: FileEdit, className: "text-muted" },
  active: { label: "Active", Icon: PlayCircle, className: "text-ink" },
  paused: { label: "Paused", Icon: PauseCircle, className: "text-muted" },
  completed: { label: "Completed", Icon: CheckCircle2, className: "text-ink" },
};

export default function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const { label, Icon, className } = STATUS_META[status];

  return (
    <span
      className={`flex w-fit items-center gap-1 border border-border px-2 py-0.5 font-mono text-[11px] uppercase ${className}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}