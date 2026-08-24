# SocialPilot

Social media scheduler & campaign management platform.

```
socialpilot/
├── frontend/        # Next.js 16 (App Router) + TypeScript + Tailwind v4
├── backend/         # empty — teammate is building this separately
└── README.md
```

No `docker-compose.yml` or Dockerfiles yet — those get added once every
module (frontend + backend) actually exists, not before.

## Design system — yellow / black / gray

| Role | Hex | Where it's used |
|---|---|---|
| Ink (text, dark surfaces) | `#141414` | body text, dark panels, borders on dark bg |
| Muted | `#6B6B6B` | secondary text, labels |
| Border | `#D9D9D6` | dividers, input borders |
| Background | `#F5F5F3` | page background |
| Surface | `#FFFFFF` | cards |
| Accent | `#F4C430` | **one element per screen only** — the action that moves the user forward (Register, Sign in, Publish, pricing CTA) |
| Accent hover | `#D9A80A` | hover/pressed state of the accent |

All of this lives in `frontend/src/app/globals.css` as CSS variables mapped
through Tailwind's `@theme inline`. Change a hex there and every component
picks it up — nothing is hardcoded per-component.

## Folder structure — built to keep scaling

```
frontend/src/
├── app/
│   ├── (marketing)/      landing page (hero, pipeline, platforms, pricing,
│   │                     final CTA — pricing lives IN the page, not its own route)
│   ├── (auth)/           login, register — no dashboard chrome
│   └── (dashboard)/
│       ├── dashboard/    router only — redirects to the signed-in user's
│       │                 role-specific workspace based on their role
│       ├── administrator/
│       ├── business-owner/
│       ├── marketing-team/
│       ├── content-creator/
│       └── (settings, notifications, calendar, campaigns, analytics, ...
│            shared pages that aren't role-exclusive yet)
├── components/
│   ├── landing/          Hero, Pipeline, Pricing, Platforms, DeparturesBoard
│   ├── auth/              RegisterForm, LoginForm, AuthShell, FormFields
│   ├── dashboard/, layout/, ui/
├── lib/                  api.ts (the ONLY file that knows the backend URL),
│                         utils.ts, constants.ts, validation.ts (zod schemas)
├── hooks/                useAuth, useAdminExists
├── store/                zustand (auth state)
└── types/                shared TS types + api.d.ts (generated from backend)
```

**Why the role subfolders exist already, even though they're just
placeholders:** an Administrator, a Business Owner, a Marketing Team member,
and a Content Creator all see genuinely different dashboards per the
project spec. Giving each one its own route folder now means adding real
pages later is additive — you're filling in a folder that already has a
home, not restructuring routes while pages depend on them. `/dashboard`
itself is just a thin router: it reads the logged-in user's role and
forwards to `/administrator`, `/business-owner`, `/marketing-team`, or
`/content-creator`.

## Registration — one-time Administrator, then role-restricted

- `GET /api/v1/users/admin-exists` is called on page load (see
  `hooks/useAdminExists.ts`). "Administrator" only appears in the role
  dropdown if this returns `false`. Once it returns `true`, the dropdown
  offers Marketing Team, Content Creator, Business Owner only.
- Fields: Name (letters/spaces/hyphens, 2–50 chars), Email (**Gmail only**,
  `/^[a-zA-Z0-9._%+-]+@gmail\.com$/`), Password (8+ chars, upper, lower,
  number, symbol — live strength meter), Confirm password, Organisation
  (optional).
- Submits to `POST /api/v1/users/register`.

## Login

Email (Gmail-only) + password. Submits to `POST /api/v1/auth/login`,
redirects based on the role in the response.

## Running it

```bash
cd frontend
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your teammate's backend
npm run dev                         # http://localhost:3000
```

## Pages built so far

- [x] Landing page — hero (3D signal-ring scene), departures board, pipeline,
      platforms, pricing, final CTA
- [x] Register, Login
- [ ] Role-specific dashboards (administrator / business-owner /
      marketing-team / content-creator) — folders exist, pages are placeholders
- [ ] Social account OAuth connection flow (Business Owner)
- [ ] Marketing Team → Business Owner assignment & client workspace isolation
- [ ] Calendar, Create Post, Campaigns, Analytics, Notifications, Settings

## Backend integration status (for final integration)

### What's actually wired to a real backend
- **Registration, Login, admin-exists check** — calls go to real endpoints via
  `lib/api.ts`, with every path centralized in **`lib/endpoints.ts`**. These
  paths are educated guesses at REST convention (`/auth/login`,
  `/auth/register`, `/users/admin-exists`) — **not yet confirmed** against
  the real backend. Once confirmed, `lib/endpoints.ts` is the only file that
  needs editing.
- **LinkedIn connection** — the one real OAuth integration. Clicking Connect
  does a full browser redirect to `${NEXT_PUBLIC_API_URL}/accounts/linkedin/connect`
  (not a fetch call — OAuth requires the actual browser to leave the SPA).
  The accounts page detects the `?linkedin=connected` / `?linkedin=error`
  query param on landing back, and calls `GET /accounts/linkedin/status` to
  refresh real connection state. See `store/useAccountsStore.ts` —
  `refreshLinkedInStatus()` has a clearly marked guess at the response shape
  that needs confirming.

### What's still mocked (by design, not oversight)
- Facebook, Instagram, X, YouTube, Pinterest connections — simulated
  round-trip, no backend yet. Flip `BACKEND_WIRED.<platform>` to `true` in
  `useAccountsStore.ts` once each one has a real endpoint — nothing else
  needs to change.
- Content Scheduling, Campaigns, Analytics, Publishing — all in-memory
  zustand stores (`usePostsStore`, `useCampaignsStore`, etc.), no backend
  yet.
- `RequireAuth.tsx`'s dev-only role switcher — **must be removed** once real
  login sets a real session. It's gated behind `NODE_ENV === "development"`
  already, but the whole mock-role mechanism should come out, not just stay
  dormant, once auth is real.

### Still need from the backend teammate before this is truly final
1. Confirmed exact paths + methods for register/login/admin-exists
   (currently guessed in `lib/endpoints.ts`)
2. Exact request/response field names — snake_case vs camelCase — for the
   same three endpoints
3. Whether the JWT comes back in the response body or as an `httpOnly`
   cookie (changes `LoginForm.tsx`'s handling)
4. The exact role string values her `User` model uses (must match
   `administrator` / `business_owner` / `marketing_team` / `content_creator`
   in `lib/validation.ts`, or that file needs updating to match hers)
5. LinkedIn endpoint paths + the exact JSON shape `/accounts/linkedin/status`
   returns
