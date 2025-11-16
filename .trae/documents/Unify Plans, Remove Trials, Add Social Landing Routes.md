## Goals
- Remove all free-trial logic and displays across backend and frontend
- Enforce only three plans everywhere: Starter, SuperHost, Custom
- Require upgrade requests for any plan changes; no direct upgrades
- Show “Request upgrade” for Starter and SuperHost; “Contact us” only for Custom
- Add interest-capture landing pages at `/reddit`, `/fb`, `/instagram`, `/tiktok`

## Current State (Key References)
- Plan helpers and catalog: `src/lib/plans.ts:1,11,17-36,38-68,70-118`
- Plan API: `src/app/api/billing/plan/route.ts:4-19`
- Property limits enforcement: `src/app/api/properties/route.ts:44-61`
- Upgrade request API: `src/app/api/billing/upgrade-requests/route.ts:4-31`
- Admin approvals: `src/app/api/admin/upgrade-requests/route.ts:63-83`
- Billing UI: `src/app/dashboard/settings/billing-page.tsx:69-111,119-144`
- Marketing pricing: `src/app/page.tsx:291-316,318-320,310`
- DB schema: `supabase_plans.sql:2-8,46-71,73-107`

## Backend Changes
- Schema
  - Update `public.user_plans.plan` check to `('basic','super_host','custom')` and default `'basic'` (rename Business→Custom).
  - Remove or ignore `trial_started_at` and `trial_ends_at`; stop any writes to these columns.
  - Update `public.upgrade_requests.desired_plan` to `('super_host','custom')` and keep `status` flow as is.
  - Retire `public.ensure_trial_for_user(...)` function.
- Data Migration
  - Convert existing `user_plans.plan='business'` → `'custom'`.
  - Null out any existing `trial_started_at` and `trial_ends_at`.
- APIs
  - `ensureUserPlanRow` creates `'basic'` only, with no trial timestamps (`src/lib/plans.ts:38-68`).
  - `getEffectivePropertyLimit` becomes plan-only; remove trial branch (`src/lib/plans.ts:23-36`).
  - `GET /api/billing/plan` stops selecting trial fields (`src/app/api/billing/plan/route.ts:9-13`).
  - `POST /api/properties` uses plan limits only and messages point users to request upgrade (`src/app/api/properties/route.ts:55-61`).
  - `POST /api/billing/upgrade-requests` validates `desired_plan` in `["super_host","custom"]` (`src/app/api/billing/upgrade-requests/route.ts:16-18`).
  - `PATCH /api/admin/upgrade-requests` allows approvals to set plan to `super_host` or `custom` only (`src/app/api/admin/upgrade-requests/route.ts:63-67`).
- Enforcement
  - Users cannot change plan directly; only admin-approved upgrade-requests update `user_plans.plan`.
  - New accounts default to Starter and must submit an upgrade request to change plan.

## Frontend Changes
- Billing Page (`src/app/dashboard/settings/billing-page.tsx`)
  - Remove trial copy and UI (`lines 69-111`).
  - Desired plan select options: `Super Host` and `Custom` only (`lines 127-131`).
  - Keep “Request an upgrade” section; ensure it’s the sole path to change plan.
  - Cards:
    - Starter, SuperHost show “Request upgrade” CTA that pre-selects desired plan.
    - Custom card shows only “Contact us”.
- Catalog and Limits (`src/lib/plans.ts`)
  - `PlanName` union to `"basic" | "super_host" | "custom"` (`line 1`).
  - Remove `TRIAL_DAYS`, `TRIAL_LIMIT`, and trial-related helpers.
  - Keep limits: `BASIC_LIMIT`, `SUPER_HOST_LIMIT`, `CUSTOM_LIMIT=null` for unlimited.
  - Update `plansCatalog`: ids `basic`, `super_host`, `custom` with titles `Starter`, `Super Host`, `Custom`.
- Marketing Pricing (`src/app/page.tsx`)
  - Render only three cards via `plansCatalog`; any color/label logic for `business` replaced with `custom` (`lines 291-316`).
  - Remove any remaining trial mentions (`lines 318-320 already aligned`).
- New Account UX
  - After signup, surface billing link with “Request upgrade” path; no direct upgrade buttons.

## Landing Pages
- Create Next.js App Router pages:
  - `src/app/reddit/page.tsx` → simple interest-capture page
  - `src/app/fb/page.tsx`
  - `src/app/instagram/page.tsx`
  - `src/app/tiktok/page.tsx`
- Each page:
  - Headline + short pitch, minimal form or CTA to `/dashboard/settings` → “Request upgrade” or to a link you’ll provide later.
  - Once you share the final link, wire each page’s CTA accordingly.

## Verification
- Backend
  - Seed a test user; verify `user_plans` row is `basic` with no trial fields set; property creation enforces `BASIC_LIMIT`.
  - Submit upgrade request to `super_host`; approve in admin; confirm properties limit changes to `SUPER_HOST_LIMIT`.
  - Approve to `custom`; confirm unlimited.
- Frontend
  - Billing page shows correct CTAs and no trial UI.
  - Homepage pricing shows Starter, SuperHost, Custom only.
  - Social pages respond at `/reddit`, `/fb`, `/instagram`, `/tiktok`.

## Assumptions
- “Starter” maps to internal `basic`; “Custom” replaces “Business”.
- No Stripe/payments yet; all upgrades flow via requests and admin approval.
- Custom plan is unlimited properties.

If this plan looks good, I’ll implement the schema updates, API/UI changes, migrations, and add the social landing pages, then verify end-to-end.