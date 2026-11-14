import { getCtx } from "@/lib/ctx";
import { PageHead, Badge, Empty, Flash, money, type SP } from "@/components/ui";
import { createInvoice, markInvoicePaid } from "../actions";

export const metadata = { title: "Invoices" };

type Check = { name: string; pass: boolean; detail: string };

export default async function Invoices({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { supabase, role } = await getCtx();
  const [{ data }, { data: pos }] = await Promise.all([
    supabase.from("invoices").select("*, vendors(name), purchase_orders(po_number)").order("created_at", { ascending: false }),
    supabase.from("purchase_orders").select("id,po_number").order("created_at", { ascending: false }),
  ]);
  return (
    <>
      <PageHead title="Invoices" sub="Each invoice is matched to its PO, receipt and duplicates before payment." />
      <Flash {...sp} />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {!data?.length ? <Empty text="No invoices yet." /> : data.map((i) => {
            const v = Array.isArray(i.vendors) ? i.vendors[0] : i.vendors;
            const po = Array.isArray(i.purchase_orders) ? i.purchase_orders[0] : i.purchase_orders;
            const checks = ((i.match_result as { checks?: Check[] } | null)?.checks ?? []);
            return (
              <div key={i.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{i.invoice_number} <span className="font-normal text-muted">· {v?.name ?? "None"} · {po?.po_number ?? "no PO"}</span></p>
                  <span className="flex items-center gap-2">{money(i.amount)} <Badge v={i.status} /></span>
                </div>
                <ul className="mt-3 space-y-1 text-sm">
                  {checks.map((c) => <li key={c.name} className={c.pass ? "text-emerald-800" : "text-red-800"}>{c.pass ? "Pass" : "Fail"}: {c.name}: <span className="text-muted">{c.detail}</span></li>)}
                </ul>
                {i.status === "matched" && role === "admin" && (
                  <form action={markInvoicePaid} className="mt-3"><input type="hidden" name="id" value={i.id} /><button className="btn-outline">Mark paid</button></form>
                )}
              </div>
            );
          })}
        </div>
        <form action={createInvoice} className="card h-fit space-y-3 p-5">
          <h2 className="font-medium">Enter invoice</h2>
          <label className="block"><span className="lbl">Purchase order</span>
            <select name="po_id" required defaultValue="" className="inp"><option value="" disabled>Select PO</option>{pos?.map((p) => <option key={p.id} value={p.id}>{p.po_number}</option>)}</select></label>
          <label className="block"><span className="lbl">Invoice number</span><input name="invoice_number" required maxLength={60} className="inp" /></label>
          <label className="block"><span className="lbl">Amount (USD)</span><input name="amount" type="number" min="0" step="0.01" required className="inp" /></label>
          <button className="btn-primary w-full">Match invoice</button>
        </form>
      </div>
    </>
  );
}
