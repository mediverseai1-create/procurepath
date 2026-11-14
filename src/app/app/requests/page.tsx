import Link from "next/link";
import { getCtx } from "@/lib/ctx";
import { PageHead, Badge, Empty, Flash, money, type SP } from "@/components/ui";

export const metadata = { title: "Requests" };

export default async function Requests({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { supabase } = await getCtx();
  const { data } = await supabase.from("requests").select("id,title,amount,currency,status,category,created_at,vendors(name)").order("created_at", { ascending: false });
  return (
    <>
      <PageHead title="Requests" sub="Every purchase request and where it stands." action={<Link href="/app/requests/new" className="btn-primary">New request</Link>} />
      <Flash {...sp} />
      {!data?.length ? <Empty text="No requests yet. Submit one and the approval chain is built for you." href="/app/requests/new" cta="New request" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr><th className="th">Title</th><th className="th">Vendor</th><th className="th">Category</th><th className="th">Amount</th><th className="th">Status</th></tr></thead>
            <tbody>
              {data.map((r) => {
                const v = Array.isArray(r.vendors) ? r.vendors[0] : r.vendors;
                return (
                  <tr key={r.id}>
                    <td className="td"><Link className="font-medium underline-offset-2 hover:underline" href={`/app/requests/${r.id}`}>{r.title}</Link></td>
                    <td className="td">{v?.name ?? "None"}</td><td className="td">{r.category ?? "None"}</td>
                    <td className="td">{money(r.amount, r.currency)}</td><td className="td"><Badge v={r.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
