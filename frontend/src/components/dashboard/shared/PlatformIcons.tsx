import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import type { SocialPlatform } from "@/lib/constants";

export default function PlatformIcons({ platforms, cap = 3 }: { platforms: string[]; cap?: number }) {
  const shown = platforms.slice(0, cap);
  const overflow = platforms.length - shown.length;
  return (
    <span className="flex items-center gap-1.5">
      {shown.map((p) => {
        const meta = PLATFORM_META[p as SocialPlatform];
        return meta ? <meta.Icon key={p} size={13} color={meta.color} /> : null;
      })}
      {overflow > 0 ? <span className="font-mono text-[10px] text-muted">+{overflow}</span> : null}
    </span>
  );
}
