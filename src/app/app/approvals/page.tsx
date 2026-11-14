import Link from "next/link";
import { getCtx } from "@/lib/ctx";
import { PageHead, Empty, money } from "@/components/ui";

export const metadata = { title: "Approvals" };

export default async function Approvals() {
  const { supabase, user } = await getCtx();
  const { data } = await supabase
    .from("approvals").select("id, step, request_id, requests(id,title,amount,requester_id,status)")
    .eq("status", "pending").order("created_at");
  const rows = (data ?? []).map((a) => ({ ...a, r: Array.isArray(a.requests) ? a.requests[0] : a.requests }))
    .filter((a) => a.r?.status === "pending_approval");
  return (
    <>
      <PageHead title="Approvals" sub="Steps waiting on a decision." />
      {!rows.length ? <Empty text="Nothing is waiting for approval." /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead><tr><th className="th">Request</th><th className="th">Step</th><th className="th">Amount</th><th className="th" /></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td className="td">{a.r!.title}</td><td className="td capitalize">{a.step}</td><td className="td">{money(a.r!.amount)}</td>
                  <td className="td text-right">
                    {a.r!.requester_id === user.id ? <span className="text-xs text-muted">Your request</span> : <Link href={`/app/requests/${a.request_id}`} className="btn-outline">Review</Link>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
