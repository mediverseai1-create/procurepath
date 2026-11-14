import { notFound } from "next/navigation";
import { getCtx } from "@/lib/ctx";
import { PageHead, Badge, Flash, money, type SP } from "@/components/ui";
import { scoreBids, type Criterion } from "@/lib/logic";
import { addBid, awardRfx } from "../../actions";

export default async function RfxDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await getCtx();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: p } = await supabase.from("rfx_projects").select("*").eq("id", id).single();
  if (!p) notFound();
  const [{ data: bids }, { data: vendors }] = await Promise.all([
    supabase.from("bids").select("*, vendors(name)").eq("rfx_id", id),
    supabase.from("vendors").select("id,name").neq("status", "blocked").order("name"),
  ]);
  const criteria = p.criteria as Criterion[];
  const ranked = scoreBids(criteria, (bids ?? []).map((b) => ({ id: b.id, price: Number(b.price), scores: b.scores as Record<string, number> })));
  const byId = new Map((bids ?? []).map((b) => [b.id, b]));

  return (
    <>
      <PageHead title={p.title} sub={p.brief ?? undefined} action={<Badge v={p.status} />} />
      <Flash {...sp} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="card overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead><tr><th className="th">Rank</th><th className="th">Vendor</th><th className="th">Price</th>
              {criteria.map((c) => <th key={c.name} className="th">{c.name} ({c.weight})</th>)}<th className="th">Total /10</th></tr></thead>
            <tbody>
              {ranked.length === 0 && <tr><td className="td text-muted" colSpan={criteria.length + 4}>No bids recorded yet.</td></tr>}
              {ranked.map((r, i) => {
                const b = byId.get(r.id)!;
                const v = Array.isArray(b.vendors) ? b.vendors[0] : b.vendors;
                return (
                  <tr key={r.id}>
                    <td className="td">{i + 1}</td><td className="td font-medium">{v?.name}</td><td className="td">{money(b.price)}</td>
                    {r.parts.map((pt) => <td key={pt.name} className="td">{pt.raw.toFixed(1)}</td>)}
                    <td className="td font-medium">{r.total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {p.status === "open" && ranked.length > 0 && (
            <form action={awardRfx} className="border-t border-line p-4"><input type="hidden" name="id" value={p.id} /><button className="btn-primary">Mark project awarded</button></form>
          )}
        </section>
        {p.status === "open" && (
          <form action={addBid} className="card h-fit space-y-3 p-5">
            <h2 className="font-medium">Record a bid</h2>
            <input type="hidden" name="rfx_id" value={p.id} />
            <label className="block"><span className="lbl">Vendor</span>
              <select name="vendor_id" required className="inp" defaultValue="">
                <option value="" disabled>Select vendor</option>
                {vendors?.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select></label>
            <label className="block"><span className="lbl">Bid price (USD)</span><input name="price" type="number" min="0" step="0.01" required className="inp" /></label>
            {criteria.filter((c) => c.name !== "Price").map((c) => (
              <label key={c.name} className="block"><span className="lbl">{c.name} score (0 to 10)</span><input name={`score_${c.name}`} type="number" min="0" max="10" step="0.5" className="inp" /></label>
            ))}
            <button className="btn-primary w-full">Add bid</button>
          </form>
        )}
      </div>
    </>
  );
}
