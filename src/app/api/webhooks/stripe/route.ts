import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// Verified payment confirmation. Plans change ONLY here.
// Configure the endpoint in Stripe for: checkout.session.completed, customer.subscription.deleted.

function verify(raw: string, header: string | null, secret: string) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = parts.t, sig = parts.v1;
  if (!t || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !url || !service) return new Response("Not configured", { status: 503 });

  const raw = await req.text();
  if (!verify(raw, req.headers.get("stripe-signature"), secret)) return new Response("Bad signature", { status: 400 });

  const event = JSON.parse(raw);
  const admin = createClient(url, service, { auth: { persistSession: false } });

  const { error: dupErr } = await admin.from("payment_events").insert({ id: event.id, type: event.type, payload: { id: event.id, type: event.type } });
  if (dupErr?.code === "23505") return new Response("Already processed", { status: 200 });

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const orgId: string | undefined = s.client_reference_id;
    // The plan is resolved from the verified amount paid (cents), configured per plan in env.
    const planByAmount: Record<string, "growth" | "scale"> = {};
    if (process.env.PLAN_AMOUNT_GROWTH_CENTS) planByAmount[process.env.PLAN_AMOUNT_GROWTH_CENTS] = "growth";
    if (process.env.PLAN_AMOUNT_SCALE_CENTS) planByAmount[process.env.PLAN_AMOUNT_SCALE_CENTS] = "scale";
    const plan = planByAmount[String(s.amount_total)];
    if (orgId && plan && s.payment_status === "paid") {
      await admin.from("organizations").update({ plan, subscription_status: "active" }).eq("id", orgId);
      await admin.from("payment_events").update({ org_id: orgId }).eq("id", event.id);
    }
  } else if (event.type === "customer.subscription.deleted") {
    const orgId = event.data.object?.metadata?.org_id;
    if (orgId) await admin.from("organizations").update({ plan: "free", subscription_status: "canceled" }).eq("id", orgId);
  }
  return new Response("ok", { status: 200 });
}
