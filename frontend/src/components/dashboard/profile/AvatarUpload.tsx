"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";

export default function AvatarUpload({ initial }: { initial: string }) {
  const { avatarUrl, setAvatar } = useProfileStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    setAvatar(URL.createObjectURL(file));
  }

  return (
    <div className="flex items-center gap-5">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => inputRef.current?.click()}
        className="group relative h-24 w-24 shrink-0 overflow-hidden border border-border bg-ink"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-background">
            {initial}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-background opacity-0 transition-all group-hover:bg-ink/60 group-hover:opacity-100">
          <Camera size={20} />
        </span>
      </motion.button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div>
        <div className="flex gap-3">
          <button
            onClick={() => inputRef.current?.click()}
            className="border border-ink/30 px-4 py-2 text-sm font-medium hover:bg-background"
          >
            {avatarUrl ? "Change photo" : "Upload photo"}
          </button>
          {avatarUrl ? (
            <button
              onClick={() => setAvatar(null)}
              className="flex items-center gap-1 text-sm text-muted hover:text-danger"
            >
              <X size={14} />
              Remove
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-muted">JPG or PNG, at least 200×200px.</p>
      </div>
    </div>
  );
}
