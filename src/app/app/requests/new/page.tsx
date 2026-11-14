import { getCtx } from "@/lib/ctx";
import { PageHead, Flash, type SP } from "@/components/ui";
import { createRequest } from "../../actions";

export const metadata = { title: "New request" };

export default async function NewRequest({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { supabase } = await getCtx();
  const { data: vendors } = await supabase.from("vendors").select("id,name,status").neq("status", "blocked").order("name");
  return (
    <>
      <PageHead title="New purchase request" sub="Approvers are chosen automatically from amount, category and vendor data risk." />
      <Flash {...sp} />
      <form action={createRequest} className="card max-w-2xl space-y-4 p-6">
        <label className="block"><span className="lbl">What do you need?</span><input name="title" required maxLength={160} className="inp" /></label>
        <label className="block"><span className="lbl">Details and business justification</span><textarea name="description" rows={4} maxLength={4000} className="inp" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="lbl">Estimated amount (USD)</span><input name="amount" type="number" min="0" step="0.01" required className="inp" /></label>
          <label className="block"><span className="lbl">Category</span>
            <select name="category" className="inp" defaultValue="">
              <option value="">Select…</option>
              {["Software", "Hardware", "Marketing", "Consulting", "Legal", "Facilities", "Travel", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select></label>
          <label className="block"><span className="lbl">Vendor (optional)</span>
            <select name="vendor_id" className="inp" defaultValue="">
              <option value="">Not chosen yet</option>
              {vendors?.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select></label>
          <label className="block"><span className="lbl">Needed by</span><input name="needed_by" type="date" className="inp" /></label>
        </div>
        <button className="btn-primary">Submit request</button>
      </form>
    </>
  );
}
