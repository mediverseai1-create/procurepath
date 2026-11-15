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

Growth ($47) and Scale ($97) upgrade through Selar checkout links (defaults built in; override with `NEXT_PUBLIC_PAYMENT_LINK_GROWTH` / `_SCALE`). Returning from checkout never activates a plan. Until a verified Selar webhook is wired in, an admin activates a plan after confirming the payment in the Selar dashboard, matching on the buyer email:

```sql
update organizations set plan = 'growth', subscription_status = 'active'
where id = (select m.org_id from memberships m join auth.users u on u.id = m.user_id where u.email = 'buyer@example.com' and m.role = 'admin' limit 1);
```

A Stripe-signed webhook (`/api/webhooks/stripe`) is also included for use if you move to Stripe.

## Deploy to Vercel

Import the repo, add every variable from `.env.example` (service-role and Gemini keys as server-only), deploy, then update Supabase redirect URLs and the Stripe webhook URL.

## Known gaps

- Pricing tiers and limits are placeholders; the reference product is quote-only. Edit `PLANS` in `src/lib/logic.ts`.
- Team invitations and role assignment UI are not built (new users become admin of their own workspace; roles are set in the `memberships` table).
- No file upload or invoice OCR. Contract text is pasted in.
- Authenticated flows have not been exercised against a live Supabase project yet.
