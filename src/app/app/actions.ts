"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCtx } from "@/lib/ctx";
import { aiJson, AiError } from "@/lib/ai";
import {
  matchInvoice,
  requiredApprovalSteps,
  vendorRisk,
  startOfMonthISO,
} from "@/lib/logic";

const back = (path: string, kind: "error" | "ok", msg: string): never =>
  redirect(`${path}${path.includes("?") ? "&" : "?"}${kind}=${encodeURIComponent(msg)}`);

const num = z.coerce.number().finite().min(0).max(1e10);
const str = (max = 200) => z.string().trim().min(1).max(max);
const opt = (max = 2000) => z.string().trim().max(max).optional().transform((v) => v || undefined);
const uuid = z.string().uuid();
const fd = (f: FormData) => Object.fromEntries(f.entries());
const firstErr = (e: z.ZodError) => `${e.issues[0].path.join(".") || "input"}: ${e.issues[0].message}`;

/* ---------- Vendors ---------- */
const vendorSchema = z.object({
  name: str(), category: opt(80), contact_email: opt(200), country: opt(80),
  years_in_business: z.coerce.number().int().min(0).max(500).optional(),
});

export async function createVendor(form: FormData) {
  const { supabase, org } = await getCtx();
  const raw = fd(form);
  const p = vendorSchema.safeParse({ ...raw, years_in_business: raw.years_in_business || undefined });
  if (!p.success) back("/app/vendors", "error", firstErr(p.error));
  const flags = {
    has_soc2: form.get("has_soc2") === "on",
    has_dpa: form.get("has_dpa") === "on",
    handles_pii: form.get("handles_pii") === "on",
  };
  const v = p.data!;
  const risk = vendorRisk({ ...flags, years_in_business: v.years_in_business });
  const { error } = await supabase.from("vendors").insert({
    org_id: org.id, ...v, ...flags,
    risk_score: risk.score, risk_tier: risk.tier, risk_notes: risk.factors.join("; "),
  });
  if (error) back("/app/vendors", "error", "Could not save vendor.");
  revalidatePath("/app/vendors");
  back("/app/vendors", "ok", "Vendor added and risk-scored.");
}

export async function setVendorStatus(form: FormData) {
  const { supabase, role } = await getCtx();
  const id = uuid.safeParse(form.get("id"));
  const status = z.enum(["approved", "blocked", "pending"]).safeParse(form.get("status"));
  if (!id.success || !status.success) back("/app/vendors", "error", "Invalid request.");
  if (role !== "admin" && role !== "approver") back("/app/vendors", "error", "Only approvers can change vendor status.");
  await supabase.from("vendors").update({ status: status.data }).eq("id", id.data!);
  revalidatePath("/app/vendors");
  back("/app/vendors", "ok", "Vendor updated.");
}

const aiVendorSchema = z.object({ summary: z.string().max(1200), questions: z.array(z.string().max(300)).max(6) });

export async function explainVendorRisk(form: FormData) {
  const { supabase, org } = await getCtx();
  const id = uuid.safeParse(form.get("id"));
  if (!id.success) back("/app/vendors", "error", "Invalid vendor.");
  const { data: v } = await supabase.from("vendors").select("*").eq("id", id.data!).single();
  if (!v) back("/app/vendors", "error", "Vendor not found.");
  try {
    const out = await aiJson({
      supabase, orgId: org.id, plan: org.plan, schema: aiVendorSchema,
      system: "You are a procurement risk analyst. You explain a deterministic risk score; never change the score or invent facts beyond the data given. Reply as JSON {summary, questions[]} where questions are due-diligence questions to ask the vendor.",
      prompt: JSON.stringify({ vendor: { name: v!.name, category: v!.category, country: v!.country, soc2: v!.has_soc2, dpa: v!.has_dpa, handles_pii: v!.handles_pii, years: v!.years_in_business }, score: v!.risk_score, tier: v!.risk_tier, factors: v!.risk_notes }),
    });
    await supabase.from("vendors").update({ risk_notes: `${v!.risk_notes ?? ""}\n\nAI summary: ${out.summary}\nAsk: ${out.questions.join(" | ")}` }).eq("id", v!.id);
  } catch (e) {
    back("/app/vendors", "error", e instanceof AiError ? e.message : "AI request failed.");
  }
  revalidatePath("/app/vendors");
  back("/app/vendors", "ok", "AI risk summary added.");
}

/* ---------- Intake requests ---------- */
const requestSchema = z.object({
  title: str(160), description: opt(4000), category: opt(80), amount: num,
  vendor_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  needed_by: z.string().date().optional().or(z.literal("").transform(() => undefined)),
});

export async function createRequest(form: FormData) {
  const { supabase, org, user, plan } = await getCtx();
  const p = requestSchema.safeParse(fd(form));
  if (!p.success) back("/app/requests/new", "error", firstErr(p.error));
  const v = p.data!;

  const { count } = await supabase
    .from("requests").select("id", { count: "exact", head: true })
    .eq("org_id", org.id).gte("created_at", startOfMonthISO());
  if ((count ?? 0) >= plan.requests) back("/app/requests/new", "error", `Monthly request limit reached for ${plan.label}. Upgrade in Billing.`);

  let pii = false;
  if (v.vendor_id) {
    const { data: vend } = await supabase.from("vendors").select("handles_pii, status").eq("id", v.vendor_id).single();
    if (vend?.status === "blocked") back("/app/requests/new", "error", "That vendor is blocked.");
    pii = !!vend?.handles_pii;
  }
  const steps = requiredApprovalSteps({ amount: v.amount, category: v.category, vendorHandlesPii: pii });
  const { data: r, error } = await supabase.from("requests").insert({
    org_id: org.id, requester_id: user.id, title: v.title, description: v.description,
    category: v.category, amount: v.amount, vendor_id: v.vendor_id ?? null,
    needed_by: v.needed_by ?? null, required_steps: steps,
  }).select("id").single();
  if (error || !r) back("/app/requests/new", "error", "Could not create request.");
  await supabase.from("approvals").insert(steps.map((step) => ({ org_id: org.id, request_id: r!.id, step })));
  revalidatePath("/app");
  redirect(`/app/requests/${r!.id}?ok=${encodeURIComponent("Request submitted and routed for approval.")}`);
}

export async function decideApproval(form: FormData) {
  const { supabase, user, role } = await getCtx();
  const id = uuid.safeParse(form.get("id"));
  const request_id = uuid.safeParse(form.get("request_id"));
  const decision = z.enum(["approved", "rejected"]).safeParse(form.get("decision"));
  const comment = opt(500).parse(form.get("comment") ?? undefined);
  if (!id.success || !request_id.success || !decision.success) back("/app/approvals", "error", "Invalid request.");
  const path = `/app/requests/${request_id.data}`;
  if (role !== "admin" && role !== "approver") back(path, "error", "Only approvers can decide.");

  const { data: req } = await supabase.from("requests").select("requester_id, status").eq("id", request_id.data!).single();
  if (!req || req.status !== "pending_approval") back(path, "error", "This request is no longer pending.");
  if (req!.requester_id === user.id) back(path, "error", "You cannot approve your own request.");

  await supabase.from("approvals").update({
    status: decision.data, decided_by: user.id, comment, decided_at: new Date().toISOString(),
  }).eq("id", id.data!).eq("status", "pending");

  const { data: all } = await supabase.from("approvals").select("status").eq("request_id", request_id.data!);
  const status = all?.some((a) => a.status === "rejected") ? "rejected"
    : all?.every((a) => a.status === "approved") ? "approved" : "pending_approval";
  await supabase.from("requests").update({ status }).eq("id", request_id.data!);
  revalidatePath("/app", "layout");
  back(path, "ok", "Decision recorded.");
}

const triageSchema = z.object({
  summary: z.string().max(800),
  missing_info: z.array(z.string().max(200)).max(6),
  suggested_category: z.string().max(60),
  alternatives_to_consider: z.array(z.string().max(200)).max(4),
});

export async function triageRequestAI(form: FormData) {
  const { supabase, org } = await getCtx();
  const id = uuid.safeParse(form.get("id"));
  if (!id.success) back("/app/requests", "error", "Invalid request.");
  const path = `/app/requests/${id.data}`;
  const { data: r } = await supabase.from("requests").select("*").eq("id", id.data!).single();
  if (!r) back("/app/requests", "error", "Request not found.");
  try {
    const out = await aiJson({
      supabase, orgId: org.id, plan: org.plan, schema: triageSchema,
      system: "You review purchase requests for a procurement team. Be concise and factual. Do not invent vendors, prices or policies. Respond as JSON {summary, missing_info[], suggested_category, alternatives_to_consider[]}.",
      prompt: JSON.stringify({ title: r!.title, description: r!.description, category: r!.category, amount: r!.amount, currency: r!.currency, approvals_required: r!.required_steps }),
    });
    const text = `${out.summary}\n\nMissing information: ${out.missing_info.join("; ") || "none"}\nSuggested category: ${out.suggested_category}\nAlternatives: ${out.alternatives_to_consider.join("; ") || "none"}`;
    await supabase.from("requests").update({ ai_summary: text }).eq("id", r!.id);
  } catch (e) {
    back(path, "error", e instanceof AiError ? e.message : "AI request failed.");
  }
  revalidatePath(path);
  back(path, "ok", "AI review added.");
}

/* ---------- Purchase orders, receipts, invoices ---------- */
export async function createPO(form: FormData) {
  const { supabase, org } = await getCtx();
  const request_id = uuid.safeParse(form.get("request_id"));
  if (!request_id.success) back("/app/orders", "error", "Invalid request.");
  const { data: r } = await supabase.from("requests").select("*").eq("id", request_id.data!).single();
  if (!r || r.status !== "approved") back("/app/orders", "error", "Only approved requests can become purchase orders.");
  if (!r!.vendor_id) back(`/app/requests/${r!.id}`, "error", "Attach a vendor to the request first.");
  const { count } = await supabase.from("purchase_orders").select("id", { count: "exact", head: true }).eq("org_id", org.id);
  const po_number = `PO-${String((count ?? 0) + 1001)}`;
  const { error } = await supabase.from("purchase_orders").insert({
    org_id: org.id, request_id: r!.id, vendor_id: r!.vendor_id, po_number, amount: r!.amount,
  });
  if (error) back(`/app/requests/${r!.id}`, "error", "Could not create PO (it may already exist).");
  await supabase.from("requests").update({ status: "ordered" }).eq("id", r!.id);
  revalidatePath("/app", "layout");
  back("/app/orders", "ok", `${po_number} issued.`);
}

export async function recordReceipt(form: FormData) {
  const { supabase } = await getCtx();
  const id = uuid.safeParse(form.get("id"));
  const amount = num.safeParse(form.get("amount"));
  if (!id.success || !amount.success) back("/app/orders", "error", "Enter a valid amount.");
  const { data: po } = await supabase.from("purchase_orders").select("amount, received_amount").eq("id", id.data!).single();
  if (!po) back("/app/orders", "error", "PO not found.");
  const next = Math.min(Number(po!.amount), Number(po!.received_amount) + amount.data!);
  await supabase.from("purchase_orders").update({ received_amount: next }).eq("id", id.data!);
  revalidatePath("/app/orders");
  back("/app/orders", "ok", "Receipt recorded.");
}

export async function createInvoice(form: FormData) {
  const { supabase, org } = await getCtx();
  const p = z.object({ po_id: uuid, invoice_number: str(60), amount: num }).safeParse(fd(form));
  if (!p.success) back("/app/invoices", "error", firstErr(p.error));
  const { po_id, invoice_number, amount } = p.data!;
  const { data: po } = await supabase.from("purchase_orders").select("*").eq("id", po_id).single();
  if (!po) back("/app/invoices", "error", "PO not found.");
  const { count: dup } = await supabase.from("invoices").select("id", { count: "exact", head: true })
    .eq("org_id", org.id).eq("vendor_id", po!.vendor_id).eq("invoice_number", invoice_number);
  const result = matchInvoice({
    invoiceAmount: amount, invoiceNumber: invoice_number,
    po: { amount: Number(po!.amount), received_amount: Number(po!.received_amount), status: po!.status },
    duplicate: (dup ?? 0) > 0,
  });
  await supabase.from("invoices").insert({
    org_id: org.id, po_id, vendor_id: po!.vendor_id, invoice_number, amount,
    status: result.ok ? "matched" : "exception", match_result: result,
  });
  revalidatePath("/app/invoices");
  back("/app/invoices", result.ok ? "ok" : "error", result.ok ? "Invoice matched and ready to pay." : "Invoice flagged: see failed checks.");
}

export async function markInvoicePaid(form: FormData) {
  const { supabase, role } = await getCtx();
  const id = uuid.safeParse(form.get("id"));
  if (!id.success) back("/app/invoices", "error", "Invalid invoice.");
  if (role !== "admin") back("/app/invoices", "error", "Only admins can mark invoices paid.");
  await supabase.from("invoices").update({ status: "paid" }).eq("id", id.data!).eq("status", "matched");
  revalidatePath("/app/invoices");
  back("/app/invoices", "ok", "Invoice marked paid.");
}

/* ---------- Sourcing ---------- */
export async function createRfx(form: FormData) {
  const { supabase, org } = await getCtx();
  const p = z.object({ title: str(160), brief: opt(3000), price_weight: z.coerce.number().min(0).max(100),
    c1: opt(60), w1: z.coerce.number().min(0).max(100).default(0), c2: opt(60), w2: z.coerce.number().min(0).max(100).default(0),
    c3: opt(60), w3: z.coerce.number().min(0).max(100).default(0) }).safeParse(fd(form));
  if (!p.success) back("/app/sourcing", "error", firstErr(p.error));
  const d = p.data!;
  const criteria = [{ name: "Price", weight: d.price_weight }];
  ([[d.c1, d.w1], [d.c2, d.w2], [d.c3, d.w3]] as const).forEach(([n, w]) => { if (n) criteria.push({ name: n, weight: w }); });
  if (criteria.reduce((s, c) => s + c.weight, 0) <= 0) back("/app/sourcing", "error", "Weights must add up to more than zero.");
  const { data, error } = await supabase.from("rfx_projects").insert({ org_id: org.id, title: d.title, brief: d.brief, criteria }).select("id").single();
  if (error || !data) back("/app/sourcing", "error", "Could not create project.");
  redirect(`/app/sourcing/${data!.id}`);
}

export async function addBid(form: FormData) {
  const { supabase, org } = await getCtx();
  const rfx = uuid.safeParse(form.get("rfx_id"));
  if (!rfx.success) back("/app/sourcing", "error", "Invalid project.");
  const path = `/app/sourcing/${rfx.data}`;
  const p = z.object({ vendor_id: uuid, price: num }).safeParse(fd(form));
  if (!p.success) back(path, "error", firstErr(p.error));
  const { data: proj } = await supabase.from("rfx_projects").select("criteria").eq("id", rfx.data!).single();
  const scores: Record<string, number> = {};
  for (const c of (proj?.criteria ?? []) as { name: string }[]) {
    if (c.name === "Price") continue;
    const n = z.coerce.number().min(0).max(10).safeParse(form.get(`score_${c.name}`));
    scores[c.name] = n.success ? n.data : 0;
  }
  await supabase.from("bids").insert({ org_id: org.id, rfx_id: rfx.data!, vendor_id: p.data!.vendor_id, price: p.data!.price, scores });
  revalidatePath(path);
  back(path, "ok", "Bid recorded.");
}

export async function awardRfx(form: FormData) {
  const { supabase, role } = await getCtx();
  const id = uuid.safeParse(form.get("id"));
  if (!id.success) back("/app/sourcing", "error", "Invalid project.");
  if (role !== "admin" && role !== "approver") back(`/app/sourcing/${id.data}`, "error", "Only approvers can award.");
  await supabase.from("rfx_projects").update({ status: "awarded" }).eq("id", id.data!);
  revalidatePath("/app/sourcing");
  back(`/app/sourcing/${id.data}`, "ok", "Project marked awarded.");
}

/* ---------- Contracts ---------- */
export async function createContract(form: FormData) {
  const { supabase, org } = await getCtx();
  const p = z.object({
    title: str(160), value: num, notice_days: z.coerce.number().int().min(0).max(365),
    vendor_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
    start_date: z.string().date().optional().or(z.literal("").transform(() => undefined)),
    end_date: z.string().date().optional().or(z.literal("").transform(() => undefined)),
    body: opt(60000),
  }).safeParse(fd(form));
  if (!p.success) back("/app/contracts", "error", firstErr(p.error));
  const d = p.data!;
  const { error } = await supabase.from("contracts").insert({
    org_id: org.id, ...d, vendor_id: d.vendor_id ?? null, start_date: d.start_date ?? null,
    end_date: d.end_date ?? null, auto_renew: form.get("auto_renew") === "on",
  });
  if (error) back("/app/contracts", "error", "Could not save contract.");
  revalidatePath("/app/contracts");
  back("/app/contracts", "ok", "Contract saved.");
}

const reviewSchema = z.object({
  summary: z.string().max(1000),
  findings: z.array(z.object({
    clause: z.string().max(120), risk: z.enum(["low", "medium", "high"]),
    issue: z.string().max(400), suggestion: z.string().max(400),
  })).max(10),
});

export async function reviewContractAI(form: FormData) {
  const { supabase, org } = await getCtx();
  const id = uuid.safeParse(form.get("id"));
  if (!id.success) back("/app/contracts", "error", "Invalid contract.");
  const { data: c } = await supabase.from("contracts").select("*").eq("id", id.data!).single();
  if (!c?.body) back("/app/contracts", "error", "Paste the contract text before requesting a review.");
  try {
    const out = await aiJson({
      supabase, orgId: org.id, plan: org.plan, schema: reviewSchema,
      system: "You are a commercial contracts reviewer supporting (not replacing) legal counsel. Only cite issues present in the supplied text; if a clause is absent say so. Cover: auto-renewal, termination, liability caps, indemnity, data protection, payment terms. JSON {summary, findings[{clause,risk,issue,suggestion}]}.",
      prompt: `Contract "${c!.title}":\n${c!.body!.slice(0, 30000)}`,
    });
    await supabase.from("contracts").update({ ai_review: out }).eq("id", c!.id);
  } catch (e) {
    back("/app/contracts", "error", e instanceof AiError ? e.message : "AI request failed.");
  }
  revalidatePath("/app/contracts");
  back("/app/contracts", "ok", "AI review complete. Have counsel confirm before relying on it.");
}

/* ---------- Auth ---------- */
export async function signOut() {
  const { supabase } = await getCtx();
  await supabase.auth.signOut();
  redirect("/");
}

export async function renameOrg(form: FormData) {
  const { supabase, org, role } = await getCtx();
  const name = str(120).safeParse(form.get("name"));
  if (!name.success) back("/app/settings", "error", "Enter a company name.");
  if (role !== "admin") back("/app/settings", "error", "Only admins can rename the company.");
  await supabase.from("organizations").update({ name: name.data }).eq("id", org.id);
  revalidatePath("/app", "layout");
  back("/app/settings", "ok", "Saved.");
}
