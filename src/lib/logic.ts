// Deterministic business logic. AI never computes these numbers.

export type Step = "manager" | "finance" | "legal" | "security" | "executive";

export function requiredApprovalSteps(input: {
  amount: number;
  category?: string | null;
  vendorHandlesPii?: boolean;
}): Step[] {
  const steps: Step[] = ["manager"];
  const cat = (input.category ?? "").toLowerCase();
  if (input.amount >= 5000) steps.push("finance");
  if (input.vendorHandlesPii || ["software", "saas", "data", "cloud"].includes(cat)) steps.push("security");
  if (input.amount >= 10000 && ["legal", "consulting", "professional services"].includes(cat)) steps.push("legal");
  if (input.amount >= 25000) steps.push("executive");
  return steps;
}

export function vendorRisk(v: {
  has_soc2: boolean;
  has_dpa: boolean;
  handles_pii: boolean;
  years_in_business?: number | null;
}) {
  const factors: string[] = [];
  let score = 0;
  if (!v.has_soc2) { score += v.handles_pii ? 35 : 20; factors.push("No SOC 2 report on file"); }
  if (v.handles_pii && !v.has_dpa) { score += 25; factors.push("Handles personal data without a signed DPA"); }
  if (v.handles_pii) { score += 10; factors.push("Processes personal data"); }
  const yrs = v.years_in_business ?? 0;
  if (yrs < 2) { score += 20; factors.push("Less than 2 years in business"); }
  else if (yrs < 5) { score += 10; factors.push("Less than 5 years in business"); }
  score = Math.min(100, score);
  const tier = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
  return { score, tier, factors };
}

export type Criterion = { name: string; weight: number };

export function scoreBids(
  criteria: Criterion[],
  bids: { id: string; price: number; scores: Record<string, number> }[],
) {
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0) || 1;
  const minPrice = Math.min(...bids.map((b) => b.price).filter((p) => p > 0));
  return bids
    .map((b) => {
      const parts = criteria.map((c) => {
        const raw =
          c.name.toLowerCase() === "price"
            ? b.price > 0 ? (minPrice / b.price) * 10 : 0
            : Math.min(10, Math.max(0, Number(b.scores[c.name] ?? 0)));
        return { name: c.name, raw, weighted: (raw * c.weight) / totalWeight };
      });
      const total = parts.reduce((s, p) => s + p.weighted, 0);
      return { id: b.id, total: Math.round(total * 100) / 100, parts };
    })
    .sort((a, b) => b.total - a.total);
}

export const MATCH_TOLERANCE = 0.02;

export function matchInvoice(args: {
  invoiceAmount: number;
  invoiceNumber: string;
  po: { amount: number; received_amount: number; status: string } | null;
  duplicate: boolean;
}) {
  const checks: { name: string; pass: boolean; detail: string }[] = [];
  checks.push({ name: "Purchase order found", pass: !!args.po, detail: args.po ? "Linked" : "No PO linked" });
  checks.push({
    name: "Not a duplicate",
    pass: !args.duplicate,
    detail: args.duplicate ? `Invoice ${args.invoiceNumber} already exists for this vendor` : "Unique",
  });
  if (args.po) {
    const cap = args.po.amount * (1 + MATCH_TOLERANCE);
    checks.push({
      name: "Within PO amount (2% tolerance)",
      pass: args.invoiceAmount <= cap,
      detail: `Invoice ${args.invoiceAmount.toFixed(2)} vs PO ${args.po.amount.toFixed(2)}`,
    });
    const rcap = args.po.received_amount * (1 + MATCH_TOLERANCE);
    checks.push({
      name: "Goods/services received",
      pass: args.invoiceAmount <= rcap,
      detail: `Invoice ${args.invoiceAmount.toFixed(2)} vs received ${args.po.received_amount.toFixed(2)}`,
    });
  }
  const ok = checks.every((c) => c.pass);
  return { ok, checks };
}

export const PLANS = {
  free: { label: "Starter", price: "Free", requests: 15, ai: 10, blurb: "Put AI-controlled intake and approvals in place for one team." },
  growth: { label: "Growth", price: "$499 / mo", requests: 250, ai: 300, blurb: "Run procurement across finance and operations with full AI coverage." },
  scale: { label: "Scale", price: "$1,499 / mo", requests: 5000, ai: 3000, blurb: "Control spend across multiple teams at high volume." },
} as const;
export type PlanKey = keyof typeof PLANS;

export function startOfMonthISO() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}
