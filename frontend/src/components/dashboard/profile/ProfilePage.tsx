"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStore } from "@/store/useProfileStore";
import { ROLE_LABELS, type Role } from "@/lib/validation";
import { api } from "@/lib/api";
import AvatarUpload from "./AvatarUpload";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { bio, organization, phone, designation, updateProfile } = useProfileStore();
  const [localBio, setLocalBio] = useState(bio);
  const [localOrg, setLocalOrg] = useState(organization);
  const [localPhone, setLocalPhone] = useState(phone);
  const [localDesignation, setLocalDesignation] = useState(designation);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get<{
          id: number | string;
          name: string;
          email: string;
          phone?: string | null;
          organization?: string | null;
          organisation?: string | null;
          designation?: string | null;
          bio?: string | null;
          role: string;
          is_active?: boolean;
          is_verified?: boolean;
          created_at?: string;
        }>("/auth/me");

        if (res.data) {
          const org = res.data.organization || res.data.organisation || "";
          setUser({
            id: String(res.data.id),
            name: res.data.name,
            email: res.data.email,
            role: res.data.role as Role,
            phone: res.data.phone ?? null,
            organization: org || null,
            designation: res.data.designation ?? null,
            bio: res.data.bio ?? null,
            is_active: res.data.is_active,
            is_verified: res.data.is_verified,
            created_at: res.data.created_at,
          });
          if (res.data.bio !== undefined && res.data.bio !== null) setLocalBio(res.data.bio);
          if (org) setLocalOrg(org);
          if (res.data.phone) setLocalPhone(res.data.phone);
          if (res.data.designation) setLocalDesignation(res.data.designation);
        }
      } catch (err) {
        console.error("Could not refresh profile from /auth/me:", err);
      }
    }
    loadProfile();
  }, [setUser]);

  const name = user?.name ?? "Preview User";
  const initial = name.charAt(0).toUpperCase();
  const role = (user?.role ?? "content_creator") as Role;

  function handleSave() {
    updateProfile({
      bio: localBio,
      organization: localOrg,
      organisation: localOrg,
      phone: localPhone,
      designation: localDesignation,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="max-w-2xl">
      <div className="border border-border bg-surface p-6">
        <AvatarUpload initial={initial} />

        <div className="mt-6 grid gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Full name</label>
            <input
              defaultValue={name}
              className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent-hover"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <div className="flex items-center gap-2 border border-border bg-background px-3 py-2.5 text-sm text-muted">
              {user?.email ?? "you@gmail.com"}
              <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-success">
                <CheckCircle2 size={12} /> {user?.is_verified ? "VERIFIED" : "VERIFIED"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Email is tied to your login and can&apos;t be changed here.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Role</label>
            <span className="inline-flex border border-border bg-background px-3 py-1.5 text-sm">
              {ROLE_LABELS[role] ?? role}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Organisation <span className="text-muted">(optional)</span>
              </label>
              <input
                value={localOrg}
                onChange={(e) => setLocalOrg(e.target.value)}
                placeholder="Your company or team name"
                className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent-hover"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Designation <span className="text-muted">(optional)</span>
              </label>
              <input
                value={localDesignation}
                onChange={(e) => setLocalDesignation(e.target.value)}
                placeholder="e.g. Content Lead"
                className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent-hover"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Phone <span className="text-muted">(optional)</span>
            </label>
            <input
              value={localPhone}
              onChange={(e) => setLocalPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent-hover"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Bio <span className="text-muted">(optional)</span>
            </label>
            <textarea
              value={localBio}
              onChange={(e) => setLocalBio(e.target.value)}
              rows={3}
              placeholder="A short line about what you do"
              className="w-full border border-border bg-background p-3 text-sm outline-none focus:border-accent-hover"
            />
          </div>

          {user?.created_at && (
            <p className="font-mono text-xs text-muted">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="bg-accent px-5 py-2.5 text-sm font-medium text-ink hover:bg-accent-hover"
          >
            Save changes
          </motion.button>

          <AnimatePresence>
            {saved ? (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-sm text-success"
              >
                <CheckCircle2 size={15} />
                Saved
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
