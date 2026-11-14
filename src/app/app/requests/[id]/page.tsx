import { notFound } from "next/navigation";
import { getCtx } from "@/lib/ctx";
import { PageHead, Badge, Flash, money, type SP } from "@/components/ui";
import { decideApproval, triageRequestAI, createPO } from "../../actions";

export default async function RequestDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, user, role } = await getCtx();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: r } = await supabase.from("requests").select("*, vendors(name,risk_tier)").eq("id", id).single();
  if (!r) notFound();
  const { data: approvals } = await supabase.from("approvals").select("*").eq("request_id", id).order("created_at");
  const v = Array.isArray(r.vendors) ? r.vendors[0] : r.vendors;
  const canDecide = (role === "admin" || role === "approver") && r.requester_id !== user.id && r.status === "pending_approval";

  return (
    <>
      <PageHead title={r.title} sub={`${money(r.amount, r.currency)} · ${r.category ?? "Uncategorized"} · ${v?.name ?? "No vendor yet"}`} action={<Badge v={r.status} />} />
      <Flash {...sp} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-medium">Details</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{r.description || "No description provided."}</p>
          </section>
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">AI review</h2>
              <form action={triageRequestAI}><input type="hidden" name="id" value={r.id} /><button className="btn-outline">{r.ai_summary ? "Re-run" : "Run AI review"}</button></form>
            </div>
            {r.ai_summary ? <p className="mt-3 whitespace-pre-wrap text-sm">{r.ai_summary}</p> : <p className="mt-3 text-sm text-muted">Generates a summary and flags missing information. Advisory only.</p>}
          </section>
          {r.status === "approved" && (
            <form action={createPO} className="card flex items-center justify-between p-5">
              <input type="hidden" name="request_id" value={r.id} />
              <p className="text-sm">Fully approved. Issue a purchase order to the vendor.</p>
              <button className="btn-primary">Issue PO</button>
            </form>
          )}
        </div>
        <section className="card h-fit p-5">
          <h2 className="font-medium">Approval chain</h2>
          <ol className="mt-3 space-y-3">
            {approvals?.map((a) => (
              <li key={a.id} className="rounded border border-line p-3 text-sm">
                <div className="flex justify-between"><span className="font-medium capitalize">{a.step}</span><Badge v={a.status} /></div>
                {a.comment && <p className="mt-1 text-muted">“{a.comment}”</p>}
                {canDecide && a.status === "pending" && (
                  <form action={decideApproval} className="mt-3 space-y-2">
                    <input type="hidden" name="id" value={a.id} /><input type="hidden" name="request_id" value={r.id} />
                    <input name="comment" placeholder="Comment (optional)" className="inp" maxLength={500} />
                    <div className="flex gap-2">
                      <button name="decision" value="approved" className="btn-primary btn-sm">Approve</button>
                      <button name="decision" value="rejected" className="btn-outline">Reject</button>
                    </div>
                  </form>
                )}
              </li>
            ))}
          </ol>
          {r.requester_id === user.id && r.status === "pending_approval" && <p className="mt-3 text-xs text-muted">You submitted this request, so someone else must approve it.</p>}
        </section>
      </div>
    </>
  );
}
