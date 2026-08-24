"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import type { Post } from "@/types";
import PublishNowModal from "./PublishNowModal";

interface PublishNowButtonProps {
  post: Post;
  className?: string;
  variant?: "button" | "link" | "icon";
  onSuccess?: () => void;
}

export default function PublishNowButton({
  post,
  className = "",
  variant = "button",
  onSuccess,
}: PublishNowButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Backend allows Manual Publish Now ONLY for draft or scheduled posts.
  const isAllowed = post.status === "draft" || post.status === "scheduled";

  if (!isAllowed) {
    return null;
  }

  return (
    <>
      {variant === "button" && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setModalOpen(true);
          }}
          className={`inline-flex items-center gap-1 bg-accent px-3 py-1.5 text-xs font-medium text-ink hover:bg-accent-hover transition-colors ${className}`}
          title="Publish immediately to target social account(s)"
        >
          <Send size={12} />
          Publish Now
        </button>
      )}

      {variant === "link" && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setModalOpen(true);
          }}
          className={`inline-flex items-center gap-1 text-sm font-medium text-ink underline hover:no-underline ${className}`}
          title="Publish immediately"
        >
          <Send size={12} />
          Publish Now
        </button>
      )}

      {variant === "icon" && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setModalOpen(true);
          }}
          className={`text-muted hover:text-accent transition-colors ${className}`}
          title="Publish Now"
          aria-label="Publish Now"
        >
          <Send size={16} />
        </button>
      )}

      <PublishNowModal
        post={post}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onSuccess}
      />
    </>
  );
}
