import { getCtx } from "@/lib/ctx";
import { PageHead, Badge, Empty, Flash, type SP } from "@/components/ui";
import { createVendor, setVendorStatus, explainVendorRisk } from "../actions";

export const metadata = { title: "Vendors" };

export default async function Vendors({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { supabase } = await getCtx();
  const { data } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
  return (
    <>
      <PageHead title="Vendors" sub="Risk scores are calculated from the evidence you record, not guessed." />
      <Flash {...sp} />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {!data?.length ? <Empty text="No vendors yet. Add one to score its risk." /> : data.map((v) => (
            <div key={v.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><p className="font-medium">{v.name}</p><p className="text-xs text-muted">{[v.category, v.country, v.contact_email].filter(Boolean).join(" · ")}</p></div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Risk {v.risk_score}</span><Badge v={v.risk_tier ?? "low"} /><Badge v={v.status} />
                </div>
              </div>
              {v.risk_notes && <p className="mt-3 whitespace-pre-wrap text-sm text-muted">{v.risk_notes}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {v.status !== "approved" && <StatusBtn id={v.id} status="approved" label="Approve" />}
                {v.status !== "blocked" && <StatusBtn id={v.id} status="blocked" label="Block" />}
                <form action={explainVendorRisk}><input type="hidden" name="id" value={v.id} /><button className="btn-outline">AI risk summary</button></form>
              </div>
            </div>
          ))}
        </div>
        <form action={createVendor} className="card h-fit space-y-3 p-5">
          <h2 className="font-medium">Add vendor</h2>
          <label className="block"><span className="lbl">Name</span><input name="name" required maxLength={200} className="inp" /></label>
          <label className="block"><span className="lbl">Category</span><input name="category" maxLength={80} className="inp" /></label>
          <label className="block"><span className="lbl">Contact email</span><input name="contact_email" type="email" className="inp" /></label>
          <label className="block"><span className="lbl">Country</span><input name="country" maxLength={80} className="inp" /></label>
          <label className="block"><span className="lbl">Years in business</span><input name="years_in_business" type="number" min="0" className="inp" /></label>
          {[["has_soc2", "Has a current SOC 2 report"], ["has_dpa", "Signed data processing agreement"], ["handles_pii", "Handles personal data"]].map(([n, l]) => (
            <label key={n} className="flex items-center gap-2 text-sm"><input type="checkbox" name={n} /> {l}</label>
          ))}
          <button className="btn-primary w-full">Save and score</button>
        </form>
      </div>
    </>
  );
}

function StatusBtn({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setVendorStatus}>
      <input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} />
      <button className="btn-outline">{label}</button>
    </form>
  );
}
