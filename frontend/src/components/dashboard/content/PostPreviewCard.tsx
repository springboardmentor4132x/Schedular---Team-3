"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Share2 } from "lucide-react";
import { PLATFORM_META } from "@/components/dashboard/accounts/platformMeta";
import type { SocialPlatform } from "@/lib/constants";

export interface PreviewMedia {
  url: string;
  isVideo: boolean;
}

export default function PostPreviewCard({
  platform,
  caption,
  media,
  contentType,
}: {
  platform: SocialPlatform;
  caption: string;
  media: PreviewMedia[];
  contentType: string;
}) {
  const meta = PLATFORM_META[platform];
  const [index, setIndex] = useState(0);

  if (!meta) return null;

  const current = media[index];

  function go(delta: number) {
    setIndex((i) => (i + delta + media.length) % media.length);
  }

  return (
    <div className="overflow-hidden border border-border bg-surface">
      <div className="h-1" style={{ backgroundColor: meta.color }} />

      <div className="flex items-center gap-2 px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center bg-ink font-mono text-[10px] text-background">
          SP
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-none">your-brand</p>
          <p className="mt-0.5 text-[11px] text-muted leading-none">Just now</p>
        </div>
        <meta.Icon size={16} color={meta.color} />
      </div>

      <div className="relative h-56 bg-background">
        {media.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.url}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                {current.isVideo ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={current.url} className="h-full w-full object-cover" muted controls />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.url} alt="" className="h-full w-full object-cover" />
                )}
              </motion.div>
            </AnimatePresence>

            {media.length > 1 ? (
              <>
                <button
                  onClick={() => go(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-ink/70 p-1 text-background hover:bg-ink"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => go(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-ink/70 p-1 text-background hover:bg-ink"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                  {media.map((m, i) => (
                    <span
                      key={m.url}
                      className={`h-1.5 w-1.5 ${i === index ? "bg-accent" : "bg-background/60"}`}
                    />
                  ))}
                </div>
                <span className="absolute right-2 top-2 bg-ink/70 px-1.5 py-0.5 font-mono text-[10px] text-background">
                  {index + 1}/{media.length}
                </span>
              </>
            ) : null}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            {contentType === "text" ? "Text post" : `${contentType} media`}
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        <p className="text-sm">{caption || "Your caption will appear here."}</p>
        <div className="mt-3 flex items-center gap-4 text-muted">
          <Heart size={15} />
          <MessageCircle size={15} />
          <Share2 size={15} />
        </div>
      </div>
    </div>
  );
}
