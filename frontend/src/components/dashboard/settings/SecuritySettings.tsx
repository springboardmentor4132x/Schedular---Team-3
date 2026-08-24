"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ShieldCheck, Monitor, AlertTriangle } from "lucide-react";
import { STRONG_PASSWORD_REGEX } from "@/lib/validation";
import { useProfileStore } from "@/store/useProfileStore";
import ToggleSwitch from "./ToggleSwitch";

import { api } from "@/lib/api";
import type { AxiosError } from "axios";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().regex(STRONG_PASSWORD_REGEX, "Use 8+ characters with upper, lower, a number, and a symbol"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormInput = z.infer<typeof schema>;

export default function SecuritySettings() {
  const { twoFactorEnabled, toggleTwoFactor } = useProfileStore();
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({ resolver: zodResolver(schema), mode: "onBlur" });

  async function onSubmit(data: FormInput) {
    setSubmitError(null);
    try {
      await api.patch("/auth/change-password", {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
      setSaved(true);
      reset();
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      const detail = axiosErr.response?.data?.detail;
      setSubmitError(detail || "Failed to update password. Please check your current password.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="border border-border bg-surface p-5">
        <p className="mb-4 font-display font-bold">Change password</p>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-3" noValidate>
          {submitError ? (
            <p className="text-xs font-medium text-danger">{submitError}</p>
          ) : null}
          <div>
            <input
              type="password"
              placeholder="Current password"
              {...register("currentPassword")}
              className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent-hover"
            />
            {errors.currentPassword ? (
              <p className="mt-1 text-xs font-medium text-danger">{errors.currentPassword.message}</p>
            ) : null}
          </div>
          <div>
            <input
              type="password"
              placeholder="New password"
              {...register("newPassword")}
              className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent-hover"
            />
            {errors.newPassword ? (
              <p className="mt-1 text-xs font-medium text-danger">{errors.newPassword.message}</p>
            ) : null}
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm new password"
              {...register("confirmPassword")}
              className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent-hover"
            />
            {errors.confirmPassword ? (
              <p className="mt-1 text-xs font-medium text-danger">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-accent px-5 py-2.5 text-sm font-medium text-ink hover:bg-accent-hover disabled:opacity-60"
            >
              Update password
            </button>
            <AnimatePresence>
              {saved ? (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-sm text-success"
                >
                  <CheckCircle2 size={15} /> Updated
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>
        </form>
      </div>

      <div className="border border-border bg-surface p-5">
        <ToggleSwitch
          checked={twoFactorEnabled}
          onChange={toggleTwoFactor}
          label="Two-factor authentication"
          description="Require a code from your phone at login. (Coming soon — UI preview only.)"
        />
        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          <ShieldCheck size={13} />
          Not backend-wired yet — toggling this won&apos;t change actual login behavior.
        </div>
      </div>

      <div className="border border-border bg-surface p-5">
        <p className="mb-3 font-display font-bold">Active sessions</p>
        <div className="flex items-center justify-between border border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Monitor size={16} className="text-muted" />
            <div>
              <p className="text-sm">This device</p>
              <p className="text-xs text-muted">Chrome on Windows &middot; Active now</p>
            </div>
          </div>
          <span className="font-mono text-[10px] text-success">CURRENT</span>
        </div>
        <button className="mt-3 text-sm underline hover:no-underline">Log out of all other sessions</button>
      </div>

      <div className="border border-danger/40 bg-surface p-5">
        <p className="flex items-center gap-2 font-display font-bold text-danger">
          <AlertTriangle size={16} />
          Danger zone
        </p>
        <p className="mt-2 text-sm text-muted">
          Deleting your account removes all your posts, campaigns, and connected accounts. This
          can&apos;t be undone.
        </p>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="mt-4 border border-danger px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10"
          >
            Delete account
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <p className="text-sm font-medium text-danger">Are you sure? This is permanent.</p>
            <div className="mt-2 flex gap-3">
              <button className="border border-danger bg-danger/10 px-4 py-2 text-sm font-medium text-danger">
                Yes, delete my account
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="border border-ink/30 px-4 py-2 text-sm font-medium hover:bg-background"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
