import Link from "next/link";
import { getCtx } from "@/lib/ctx";
import { PageHead, Badge, Empty, money } from "@/components/ui";
import SpendChart from "@/components/SpendChart";
import { startOfMonthISO } from "@/lib/logic";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const { supabase, org, plan } = await getCtx();
  const [reqs, pending, contracts, invs, usage, monthReqs] = await Promise.all([
    supabase.from("requests").select("id,title,amount,status,category,created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("approvals").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("contracts").select("id,title,end_date,notice_days,auto_renew").not("end_date", "is", null),
    supabase.from("invoices").select("id,status"),
    supabase.from("usage_events").select("id", { count: "exact", head: true }).eq("kind", "ai_call").gte("created_at", startOfMonthISO()),
    supabase.from("requests").select("id", { count: "exact", head: true }).gte("created_at", startOfMonthISO()),
  ]);
  const all = reqs.data ?? [];
  const spend = new Map<string, number>();
  all.filter((r) => r.status === "approved" || r.status === "ordered").forEach((r) => {
    const k = r.category || "Uncategorised";
    spend.set(k, (spend.get(k) ?? 0) + Number(r.amount));
  });
  const chart = [...spend.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 8);
  const today = new Date().getTime();
  const renewals = (contracts.data ?? [])
    .map((c) => ({ ...c, days: Math.ceil((new Date(c.end_date!).getTime() - today) / 864e5) }))
    .filter((c) => c.days >= 0 && c.days <= 90).sort((a, b) => a.days - b.days);
  const exceptions = (invs.data ?? []).filter((i) => i.status === "exception").length;

  const stats = [
    ["Awaiting approval", String(pending.count ?? 0), "/app/approvals"],
    ["Approved spend", money(chart.reduce((s, c) => s + c.total, 0)), "/app/requests"],
    ["Invoice exceptions", String(exceptions), "/app/invoices"],
    ["Renewals in 90 days", String(renewals.length), "/app/contracts"],
  ];

  return (
    <>
      <PageHead title={`Welcome, ${org.name}`} sub="What needs attention across your procurement path."
        action={<Link href="/app/requests/new" className="btn-primary">New request</Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([l, v, h]) => (
          <Link key={l} href={h} className="card p-5 hover:bg-surface">
            <p className="text-sm text-muted">{l}</p><p className="mt-1 text-3xl font-light">{v}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-medium">Approved spend by category</h2>
          {chart.length ? <SpendChart data={chart} /> : <p className="py-10 text-center text-sm text-muted">Spend appears here once requests are approved.</p>}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 font-medium">Recent requests</h2>
          {all.length === 0 ? <Empty text="No requests yet." href="/app/requests/new" cta="Create the first request" /> : (
            <ul className="divide-y divide-line">
              {all.slice(0, 6).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <Link href={`/app/requests/${r.id}`} className="truncate underline-offset-2 hover:underline">{r.title}</Link>
                  <span className="flex shrink-0 items-center gap-2">{money(r.amount)} <Badge v={r.status} /></span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 font-medium">Upcoming renewals</h2>
          {renewals.length === 0 ? <p className="text-sm text-muted">No contracts ending in the next 90 days.</p> : (
            <ul className="divide-y divide-line text-sm">
              {renewals.map((c) => (
                <li key={c.id} className="flex justify-between py-2">
                  <span>{c.title}</span>
                  <span className={c.days <= c.notice_days ? "font-medium text-red-700" : "text-muted"}>
                    {c.days}d{c.days <= c.notice_days ? " · inside notice window" : ""}{c.auto_renew ? " · auto-renews" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 font-medium">Plan usage this month</h2>
          <Meter label="Requests" used={monthReqs.count ?? 0} max={plan.requests} />
          <Meter label="AI actions" used={usage.count ?? 0} max={plan.ai} />
          <Link href="/app/billing" className="mt-3 inline-block text-sm underline">Manage plan</Link>
        </section>
      </div>
    </>
  );
}

function Meter({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm"><span>{label}</span><span className="text-muted">{used} / {max}</span></div>
      <div className="mt-1 h-2 rounded bg-surface" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
        <div className="h-2 rounded bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
