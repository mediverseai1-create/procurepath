# ProcurePath

Intake-to-pay procurement workspace for growing teams. Next.js 16 (App Router), TypeScript, Tailwind 4, Supabase (Auth, Postgres, RLS), Gemini for AI assistance.

Product direction was informed by a public-site review of zip.com (since moved from ziphq.com): intake → approvals → vendor risk → sourcing → contracts → PO → invoice matching, with AI assistance. All copy, branding and code here are original.

## Modules

| Module | Deterministic logic (`src/lib/logic.ts`) | AI (Gemini, server-side, validated with zod) |
|---|---|---|
| Intake & approvals | Approval chain from amount, category, vendor data risk; no self-approval | Request triage / missing-info review |
| Vendors | Risk score and tier from SOC 2 / DPA / PII / age | Plain-language summary and due-diligence questions |
| Sourcing | Weighted bid scoring, automatic price score | none |
| Contracts | Renewal and notice-window tracking | Clause review (advisory) |
| Orders & invoices | PO numbering, receipts, 2% tolerance match, duplicate check | none |
| Billing | Plan limits (requests, AI actions per month) | none |

## Setup

1. `npm install`
2. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local` and fill it in.
4. In Supabase Auth settings, add `http://localhost:3000/auth/callback` (and your production URL) to redirect URLs.
5. `npm run dev`; `node --experimental-strip-types scripts/test-logic.mts` runs the logic tests.

## Payments

Billing page links to `NEXT_PUBLIC_PAYMENT_LINK_GROWTH` / `_SCALE` with the organisation id as `client_reference_id`. Plans change only in `/api/webhooks/stripe`, which verifies the Stripe signature, is idempotent, and maps the verified amount paid (`PLAN_AMOUNT_*_CENTS`) to a plan. Point a Stripe webhook at `https://<domain>/api/webhooks/stripe` for `checkout.session.completed`. Cancellation downgrades need `org_id` in subscription metadata (not set by plain payment links), so cancellations are not yet automatic.

## Deploy to Vercel

Import the repo, add every variable from `.env.example` (service-role and Gemini keys as server-only), deploy, then update Supabase redirect URLs and the Stripe webhook URL.

## Known gaps

- Pricing tiers and limits are placeholders; the reference product is quote-only. Edit `PLANS` in `src/lib/logic.ts`.
- Team invitations and role assignment UI are not built (new users become admin of their own workspace; roles are set in the `memberships` table).
- No file upload or invoice OCR. Contract text is pasted in.
- Authenticated flows have not been exercised against a live Supabase project yet.
