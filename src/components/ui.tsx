import Link from "next/link";

export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <p role={error ? "alert" : "status"} className={`mb-4 rounded border px-3 py-2 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
      {error ?? ok}
    </p>
  );
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-light tracking-tight md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export const money = (n: number | string | null | undefined, cur = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(Number(n ?? 0));

const tone: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-800", matched: "bg-emerald-100 text-emerald-800", paid: "bg-emerald-100 text-emerald-800", low: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800", pending_approval: "bg-amber-100 text-amber-800", review: "bg-amber-100 text-amber-800", medium: "bg-amber-100 text-amber-800", open: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800", blocked: "bg-red-100 text-red-800", exception: "bg-red-100 text-red-800", high: "bg-red-100 text-red-800",
  ordered: "bg-brand-soft text-brand-deep", awarded: "bg-brand-soft text-brand-deep",
};
export const Badge = ({ v }: { v: string }) => (
  <span className={`badge ${tone[v] ?? ""}`}>{v.replace("_", " ")}</span>
);

export function Empty({ text, href, cta }: { text: string; href?: string; cta?: string }) {
  return (
    <div className="card p-10 text-center text-sm text-muted">
      <p>{text}</p>
      {href && <Link href={href} className="btn-primary mt-4">{cta}</Link>}
    </div>
  );
}

export type SP = Promise<{ ok?: string; error?: string }>;
