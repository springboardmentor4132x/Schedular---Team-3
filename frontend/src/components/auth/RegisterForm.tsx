"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { registerSchema, ROLE_LABELS, ROLE_VALUES, type RegisterInput } from "@/lib/validation";
import { useAdminExists } from "@/hooks/useAdminExists";
import { Field, PasswordStrength } from "./FormFields";
import { api } from "@/lib/api";
import type { AxiosError } from "axios";

export default function RegisterForm() {
  const { adminExists, loading } = useAdminExists();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const password = watch("password") || "";

  // Administrator only ever shows before the one admin account exists.
  const availableRoles = ROLE_VALUES.filter((r) => {
    if (r === "administrator") return adminExists === false;
    if (r === "business_owner") return false; // use business_user for backend alignment
    return true;
  });

  async function onSubmit(data: RegisterInput) {
    setSubmitError(null);
    try {
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        organization: data.organization || null,
        role: data.role === "business_owner" ? "business_user" : data.role,
      });
      setSubmitted(true);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      const detail = axiosErr.response?.data?.detail;
      setSubmitError(
        detail ?? "Registration failed. Please try again."
      );
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <p className="font-display text-lg font-bold">Account created</p>
        <p className="mt-2 text-sm text-muted">You can sign in now.</p>
        <a
          href="/login"
          className="mt-6 inline-flex items-center justify-center bg-accent px-5 py-2.5 text-sm font-medium text-ink"
        >
          Go to sign in
        </a>
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Field
        id="name"
        label="Full name"
        placeholder="Jordan Lee"
        error={errors.name?.message}
        {...register("name")}
      />

      <Field
        id="email"
        label="Email"
        type="email"
        placeholder="you@gmail.com"
        hint="Gmail addresses only"
        error={errors.email?.message}
        {...register("email")}
      />

      <Field
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordStrength value={password} />

      <Field
        id="confirmPassword"
        label="Confirm password"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Field
        id="organization"
        label="Organisation name"
        placeholder="Optional"
        hint="Only if you're registering on behalf of a company"
        error={errors.organization?.message}
        {...register("organization")}
      />

      <div className="mb-6">
        <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-ink">
          Role
        </label>
        <select
          id="role"
          disabled={loading}
          defaultValue=""
          className={`w-full border bg-background px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent-hover ${
            errors.role ? "border-accent" : "border-border"
          }`}
          {...register("role")}
        >
          <option value="" disabled>
            {loading ? "Checking available roles…" : "Select a role"}
          </option>
          {availableRoles.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        {errors.role ? (
          <p className="mt-1 text-xs font-medium text-ink">{errors.role.message}</p>
        ) : adminExists === false ? (
          <p className="mt-1 text-xs text-muted">
            No administrator exists yet — this account can claim that role.
          </p>
        ) : null}
      </div>

      {submitError ? <p className="mb-4 text-xs font-medium text-ink">{submitError}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-accent px-5 py-3 font-medium text-ink transition-transform hover:scale-[1.01] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </motion.form>
  );
}
