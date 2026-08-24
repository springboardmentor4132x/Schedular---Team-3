"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { Field } from "./FormFields";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { AxiosError } from "axios";
import type { User } from "@/types";

// Where each role lands after sign-in. The actual role comes back from the
// backend on /auth/login — this map just centralizes the redirect logic.
const ROLE_REDIRECT: Record<string, string> = {
  administrator: "/administrator",
  marketing_team: "/marketing-team",
  content_creator: "/content-creator",
  business_owner: "/business-owner",
  business_user: "/business-owner",
};

// Shape of the flat login response the backend returns.
interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: LoginInput) {
    setSubmitError(null);
    try {
      // FastAPI OAuth2PasswordRequestForm requires application/x-www-form-urlencoded
      // with the field named "username" (even though the value is the user's email).
      const body = new URLSearchParams();
      body.append("username", data.email);
      body.append("password", data.password);

      const res = await api.post<LoginResponse>("/auth/login", body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      // Store the JWT for the axios request interceptor.
      localStorage.setItem("token", res.data.access_token);

      // Populate auth state BEFORE navigating so RequireAuth doesn't
      // redirect the user back to /login on the first render.
      setUser({
        id: String(res.data.user_id),
        name: res.data.name,
        email: res.data.email,
        // The backend role strings match the User type union exactly.
        role: res.data.role as User["role"],
      });

      router.push(ROLE_REDIRECT[res.data.role] ?? "/dashboard");
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>;
      const detail = axiosErr.response?.data?.detail;
      setSubmitError(
        detail ?? "Sign-in failed. Please check your credentials and try again."
      );
    }
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

      <div className="mb-6 flex justify-end">
        <a href="/forgot-password" className="text-xs text-ink underline hover:no-underline">
          Forgot password?
        </a>
      </div>

      {submitError ? <p className="mb-4 text-xs font-medium text-ink">{submitError}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-accent px-5 py-3 font-medium text-ink transition-transform hover:scale-[1.01] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </motion.form>
  );
}
