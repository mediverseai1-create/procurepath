import { getCtx } from "@/lib/ctx";
import { PageHead, Badge, Empty, Flash, money, type SP } from "@/components/ui";
import { recordReceipt } from "../actions";

export const metadata = { title: "Purchase orders" };

export default async function Orders({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { supabase } = await getCtx();
  const { data } = await supabase.from("purchase_orders").select("*, vendors(name)").order("created_at", { ascending: false });
  return (
    <>
      <PageHead title="Purchase orders" sub="Issued from approved requests. Log receipts as goods or services arrive." />
      <Flash {...sp} />
      {!data?.length ? <Empty text="No purchase orders yet. Approve a request, then issue a PO from its page." href="/app/requests" cta="View requests" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr><th className="th">PO</th><th className="th">Vendor</th><th className="th">Amount</th><th className="th">Received</th><th className="th">Log receipt</th></tr></thead>
            <tbody>
              {data.map((o) => {
                const v = Array.isArray(o.vendors) ? o.vendors[0] : o.vendors;
                return (
                  <tr key={o.id}>
                    <td className="td font-medium">{o.po_number}</td><td className="td">{v?.name ?? "—"}</td>
                    <td className="td">{money(o.amount)}</td><td className="td">{money(o.received_amount)}</td>
                    <td className="td">
                      <form action={recordReceipt} className="flex gap-2">
                        <input type="hidden" name="id" value={o.id} />
                        <input name="amount" type="number" min="0" step="0.01" required aria-label="Received amount" className="inp w-28" />
                        <button className="btn-outline">Add</button>
                      </form>
                    </td>
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
