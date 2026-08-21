import { z } from "zod";
import { SOCIAL_PLATFORMS, CAMPAIGN_CATEGORY, CAMPAIGN_PRIORITY, CAMPAIGN_STATUS } from "@/lib/constants";

// Letters, spaces, hyphens, apostrophes only — 2 to 50 characters.
export const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]{1,49}$/;

// Gmail-only per project spec — reject every other domain explicitly.
export const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

// Min 8 chars, at least one lowercase, one uppercase, one number, one special char.
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const ROLE_VALUES = [
  "administrator",
  "marketing_team",
  "content_creator",
  "business_owner",
  "business_user",
] as const;

export type Role = (typeof ROLE_VALUES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  administrator: "Administrator",
  marketing_team: "Marketing Team",
  content_creator: "Content Creator",
  business_owner: "Business Owner",
  business_user: "Business Owner",
};

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .regex(NAME_REGEX, "Letters only, 2-50 characters"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .regex(GMAIL_REGEX, "Please use a Gmail address (name@gmail.com)"),
    password: z
      .string()
      .regex(
        STRONG_PASSWORD_REGEX,
        "Use 8+ characters with upper, lower, a number, and a symbol"
      ),
    confirmPassword: z.string(),
    organization: z.string().trim().optional().or(z.literal("")),
    role: z.enum(ROLE_VALUES, { error: "Select a role" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(GMAIL_REGEX, "Please use a Gmail address (name@gmail.com)"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// MODULE 4 - CAMPAIGN MANAGEMENT
export const campaignSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Campaign name is required")
      .max(100, "Keep it under 100 characters"),
    description: z.string().trim().optional().or(z.literal("")),
    objectives: z
      .string()
      .trim()
      .min(1, "Objective is required")
      .max(300, "Keep it under 300 characters"),
    budget: z.coerce
      .number({ error: "Budget is required" })
      .gt(0, "Budget must be greater than zero"),
    startDate: z.string().trim().min(1, "Start date is required"),
    endDate: z.string().trim().min(1, "End date is required"),
    platform: z.enum(SOCIAL_PLATFORMS, { error: "Select a platform" }),
    category: z.enum(CAMPAIGN_CATEGORY, { error: "Select a category" }),
    priority: z.enum(CAMPAIGN_PRIORITY, { error: "Select a priority" }),
    status: z.enum(CAMPAIGN_STATUS, { error: "Select a status" }),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date can't be before the start date",
    path: ["endDate"],
  });

export type CampaignInput = z.infer<typeof campaignSchema>;

// z.input is the pre-coercion shape (budget starts as whatever the <input>
// gives us, i.e. possibly a string) — this is what useForm's generic needs
// to match, since z.coerce.number() means input and output types differ.
export type CampaignFormValues = z.input<typeof campaignSchema>;

