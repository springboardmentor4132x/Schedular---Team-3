"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { campaignSchema, type CampaignInput, type CampaignFormValues } from "@/lib/validation";
import { SOCIAL_PLATFORMS, CAMPAIGN_CATEGORY, CAMPAIGN_PRIORITY, CAMPAIGN_STATUS } from "@/lib/constants";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import type { AxiosError } from "axios";
import type { Campaign } from "@/types";

// Local form controls mirroring components/auth/FormFields.tsx's exact
// styling. Kept local to this file (rather than importing from the auth
// domain) so Module 4 stays self-contained.

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, hint, id, ...props },
  ref
) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        {...props}
        aria-invalid={!!error}
        className={`w-full border bg-background px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent-hover ${
          error ? "border-accent" : "border-border"
        }`}
      />
      {error ? (
        <p className="mt-1 text-xs font-medium text-ink">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
});

type FormTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(function FormTextarea(
  { label, error, hint, id, ...props },
  ref
) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        ref={ref}
        rows={3}
        {...props}
        aria-invalid={!!error}
        className={`w-full resize-none border bg-background px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent-hover ${
          error ? "border-accent" : "border-border"
        }`}
      />
      {error ? (
        <p className="mt-1 text-xs font-medium text-ink">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
});

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(function FormSelect(
  { label, error, id, children, ...props },
  ref
) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        ref={ref}
        {...props}
        aria-invalid={!!error}
        className={`w-full border bg-background px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent-hover ${
          error ? "border-accent" : "border-border"
        }`}>
        {children}
      </select>
      {error ? <p className="mt-1 text-xs font-medium text-ink">{error}</p> : null}
    </div>
  );
});

const CATEGORY_LABELS: Record<(typeof CAMPAIGN_CATEGORY)[number], string> = {
  product_launch: "Product Launch",
  brand_awareness: "Brand Awareness",
  promotion: "Promotion",
  engagement: "Engagement",
  other: "Other",
};

const PRIORITY_LABELS: Record<(typeof CAMPAIGN_PRIORITY)[number], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const STATUS_LABELS: Record<(typeof CAMPAIGN_STATUS)[number], string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};

export default function CampaignForm({ campaign }: { campaign?: Campaign }) {
  const isEditMode = !!campaign;
  const addCampaign = useCampaignsStore((s) => s.addCampaign);
  const updateCampaign = useCampaignsStore((s) => s.updateCampaign);
  const pathname = usePathname();

  // Create lives at .../campaigns/create -> back to .../campaigns (the list).
  // Edit lives at .../campaigns/[id]/edit -> back to .../campaigns/[id] (Details).
  const listHref = pathname.endsWith("/create")
    ? pathname.slice(0, pathname.length - "/create".length)
    : pathname.endsWith("/edit")
    ? pathname.slice(0, pathname.length - "/edit".length)
    : pathname;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormValues, unknown, CampaignInput>({
    resolver: zodResolver(campaignSchema),
    mode: "onBlur",
    defaultValues: campaign
      ? {
          name: campaign.name,
          description: campaign.description ?? "",
          objectives: campaign.objectives,
          budget: campaign.budget,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          platform: campaign.platform as CampaignFormValues["platform"],
          category: campaign.category,
          priority: campaign.priority ?? "medium",
          status: campaign.status,
        }
      : { status: "draft", priority: "medium" },
  });

  async function onSubmit(data: CampaignInput) {
    setSubmitError(null);
    try {
      // The store now talks to the real backend directly (POST/PUT
      // /api/campaigns/...) and updates local state from its response —
      // see useCampaignsStore.ts. No need to call the API separately here.
      if (isEditMode) {
        await updateCampaign(campaign.id, data);
      } else {
        await addCampaign(data);
      }
      setSubmitted(true);
    } catch (error) {
      const axiosErr = error as AxiosError<{ detail?: string }>;
      setSubmitError(axiosErr.response?.data?.detail ?? "Couldn't save this campaign. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="border border-border bg-surface py-10 text-center">
        <p className="font-display text-lg font-bold">
          {isEditMode ? "Campaign updated" : "Campaign created"}
        </p>
        <p className="mt-2 text-sm text-muted">
          {submitError ??
            (isEditMode
              ? "Your changes are now reflected on the campaign."
              : "It's now showing on your campaign dashboard.")}
        </p>
        <Link
          href={listHref}
          className="mt-6 inline-flex items-center justify-center bg-accent px-5 py-2.5 text-sm font-medium text-ink hover:bg-accent-hover">
          {isEditMode ? "Back to Campaign Details" : "Back to Campaign Dashboard"}
        </Link>
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
      className="max-w-2xl border border-border bg-surface p-6">
      <FormField
        id="name"
        label="Campaign Name"
        placeholder="Summer Launch Push"
        error={errors.name?.message}
        {...register("name")}
      />

      <FormTextarea
        id="description"
        label="Description"
        placeholder="Optional — internal notes about this campaign"
        error={errors.description?.message}
        {...register("description")}
      />

      <FormTextarea
        id="objectives"
        label="Objective"
        placeholder="What is this campaign trying to achieve?"
        error={errors.objectives?.message}
        {...register("objectives")}
      />

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField
          id="budget"
          label="Budget"
          type="number"
          min="0"
          step="0.01"
          placeholder="5000"
          error={errors.budget?.message}
          {...register("budget")}
        />

        {/* Target Platforms: multi-select is deferred for now — this stays a
            single-select bound to Campaign.platform, per current scope. */}
        <FormSelect id="platform" label="Platform" error={errors.platform?.message} {...register("platform")}>
          <option value="" disabled>
            Select a platform
          </option>
          {SOCIAL_PLATFORMS.map((p) => (
            <option key={p} value={p} className="capitalize">
              {p}
            </option>
          ))}
        </FormSelect>
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FormField
          id="startDate"
          label="Start Date"
          type="date"
          error={errors.startDate?.message}
          {...register("startDate")}
        />

        <FormField
          id="endDate"
          label="End Date"
          type="date"
          error={errors.endDate?.message}
          {...register("endDate")}
        />
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
        <FormSelect id="category" label="Campaign Category" error={errors.category?.message} {...register("category")}>
          <option value="" disabled>
            Select a category
          </option>
          {CAMPAIGN_CATEGORY.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </FormSelect>

        <FormSelect id="priority" label="Priority" error={errors.priority?.message} {...register("priority")}>
          {CAMPAIGN_PRIORITY.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </FormSelect>

        <FormSelect id="status" label="Campaign Status" error={errors.status?.message} {...register("status")}>
          {CAMPAIGN_STATUS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </FormSelect>
      </div>

      {submitError ? <p className="mb-4 text-xs font-medium text-danger">{submitError}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full bg-accent px-5 py-3 font-medium text-ink transition-transform hover:scale-[1.01] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2">
        {isSubmitting
          ? isEditMode
            ? "Saving changes…"
            : "Creating campaign…"
          : isEditMode
          ? "Save Changes"
          : "Create Campaign"}
      </button>
    </motion.form>
  );
}