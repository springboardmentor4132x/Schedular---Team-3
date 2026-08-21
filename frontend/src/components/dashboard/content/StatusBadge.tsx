import { STATUS_META } from "@/lib/content";
import type { PostStatus } from "@/types";

export default function StatusBadge({ status }: { status: PostStatus }) {
  const { label, icon: Icon, className } = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}>
      <Icon size={13} />
      {label.toUpperCase()}
    </span>
  );
}
