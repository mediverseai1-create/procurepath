import { getCtx } from "@/lib/ctx";
import { PageHead, Badge, Empty, Flash, money, type SP } from "@/components/ui";
import { createContract, reviewContractAI } from "../actions";

export const metadata = { title: "Contracts" };

type Finding = { clause: string; risk: string; issue: string; suggestion: string };

export default async function Contracts({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { supabase } = await getCtx();
  const [{ data }, { data: vendors }] = await Promise.all([
    supabase.from("contracts").select("*, vendors(name)").order("end_date", { ascending: true, nullsFirst: false }),
    supabase.from("vendors").select("id,name").order("name"),
  ]);
  return (
    <>
      <PageHead title="Contracts" sub="Repository, renewal windows and AI first-pass review." />
      <Flash {...sp} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {!data?.length ? <Empty text="No contracts stored yet." /> : data.map((c) => {
            const v = Array.isArray(c.vendors) ? c.vendors[0] : c.vendors;
            const rev = c.ai_review as { summary: string; findings: Finding[] } | null;
            return (
              <div key={c.id} className="card p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div><p className="font-medium">{c.title}</p><p className="text-xs text-muted">{v?.name ?? "No vendor"} · {money(c.value)} · {c.start_date ?? "?"} to {c.end_date ?? "?"}{c.auto_renew ? ` · auto-renews, ${c.notice_days}d notice` : ""}</p></div>
                  <form action={reviewContractAI}><input type="hidden" name="id" value={c.id} /><button className="btn-outline">{rev ? "Re-run AI review" : "AI review"}</button></form>
                </div>
                {rev && (
                  <div className="mt-3 text-sm">
                    <p>{rev.summary}</p>
                    <ul className="mt-2 space-y-2">
                      {rev.findings.map((f, i) => (
                        <li key={i} className="rounded border border-line p-2"><span className="font-medium">{f.clause}</span> <Badge v={f.risk} />
                          <p className="text-muted">{f.issue}</p><p>Suggestion: {f.suggestion}</p></li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-muted">AI-generated and advisory. Confirm with legal counsel.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <form action={createContract} className="card h-fit space-y-3 p-5">
          <h2 className="font-medium">Add contract</h2>
          <label className="block"><span className="lbl">Title</span><input name="title" required maxLength={160} className="inp" /></label>
          <label className="block"><span className="lbl">Vendor</span>
            <select name="vendor_id" className="inp" defaultValue=""><option value="">None</option>{vendors?.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
          <label className="block"><span className="lbl">Annual value (USD)</span><input name="value" type="number" min="0" step="0.01" defaultValue={0} className="inp" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="lbl">Start</span><input name="start_date" type="date" className="inp" /></label>
            <label className="block"><span className="lbl">End</span><input name="end_date" type="date" className="inp" /></label>
          </div>
          <label className="block"><span className="lbl">Notice period (days)</span><input name="notice_days" type="number" min="0" max="365" defaultValue={30} className="inp" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="auto_renew" /> Auto-renews</label>
          <label className="block"><span className="lbl">Contract text (for AI review)</span><textarea name="body" rows={5} className="inp" /></label>
          <button className="btn-primary w-full">Save contract</button>
        </form>
      </div>
    </>
  );
}
