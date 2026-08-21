# Modules 4, 6, 8 — Extracted Source

This ZIP contains the files that belong to Module 4 (Campaign
Management), Module 6 (Analytics Dashboard), and Module 8 (Reports &
Export), pulled out of the full merged SocialPilot project — **plus**
the shared files those modules depend on, so this now type-checks and
installs on its own.

## Making it type-check standalone

To get a clean `npm install` and no red squiggles in VS Code, these
shared dependency files were copied in alongside the module code
(they belong to Modules 1/2/3/5/7, included here only so 4/6/8 resolve):

- `lib/api.ts`, `lib/constants.ts`, `lib/content.ts`, `lib/validation.ts`
- `types/index.ts` (base types incl. `Campaign`)
- `store/useAuthStore.ts`, `store/usePostsStore.ts`
- `components/dashboard/StatCard.tsx`
- `components/dashboard/content/StatusBadge.tsx`
- `components/dashboard/accounts/platformMeta.ts`
- `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.check.json`,
  `next.config.ts`, `next-env.d.ts`, `postcss.config.mjs`, `eslint.config.mjs`

Run `npm install` inside `frontend/`, then `npx tsc --noEmit` — it
should come back clean. Note this still won't run as a working app
(`next dev`) since there's no root layout, `DashboardShell`, or auth
flow here — it's a type-checkable code extract, not a bootable app.

**Pre-existing repo note (unrelated to this extract):** the source
project has a stray `marketing-team/.../analytics/page.tx` file (missing
the final "s") sitting next to the real `page.tsx` — looks like a leftover
duplicate of the Audience Analytics page. Harmless (Next.js ignores it
since the filename doesn't match `page.tsx`), but worth deleting from the
main repo when you get a chance.

## Module 4 — Campaign Management
- `frontend/src/components/dashboard/campaigns/` (11 components)
- `frontend/src/store/useCampaignsStore.ts`
- Routes: `business-owner/campaigns/**`, `content-creator/campaigns/**`,
  `marketing-team/clients/[businessOwnerId]/campaigns/**`

## Module 6 — Analytics Dashboard
- `frontend/src/components/dashboard/analytics/` (8 components)
- `frontend/src/store/useAnalyticsStore.ts`
- `frontend/src/types/analytics.ts`
- Routes: `business-owner/analytics/**`,
  `marketing-team/clients/[businessOwnerId]/analytics/**`
- Content Creator has no standalone analytics dashboard — that role only
  sees per-campaign analytics, which lives under
  `content-creator/campaigns/[campaignId]/analytics/` (included in the
  Module 4 route set above since it's nested under the campaign route).

## Module 8 — Reports & Export
- `frontend/src/components/dashboard/reports/` (6 components)
- `frontend/src/lib/reportExport.ts`, `frontend/src/lib/reportsApi.ts`
- `frontend/src/store/useGeneratedReportsStore.ts`
- Routes: `business-owner/reports/**`,
  `marketing-team/clients/[businessOwnerId]/reports/**`
- Content Creator has no reports section (by design — reporting/export
  is a Business Owner and Marketing Team capability in this app).

## Role coverage summary

| Module | Business Owner | Marketing Team | Content Creator |
|---|---|---|---|
| 4 — Campaigns | Full dashboard | Full dashboard (per client) | Full dashboard |
| 6 — Analytics | Full dashboard | Full dashboard (per client) | Per-campaign only |
| 8 — Reports | Full dashboard | Full dashboard (per client) | Not available |
