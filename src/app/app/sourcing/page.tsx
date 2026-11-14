import Link from "next/link";
import { getCtx } from "@/lib/ctx";
import { PageHead, Badge, Empty, Flash, type SP } from "@/components/ui";
import { createRfx } from "../actions";

export const metadata = { title: "Sourcing" };

export default async function Sourcing({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { supabase } = await getCtx();
  const { data } = await supabase.from("rfx_projects").select("id,title,status,created_at").order("created_at", { ascending: false });
  return (
    <>
      <PageHead title="Sourcing" sub="Compare bids against weighted criteria." />
      <Flash {...sp} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {!data?.length ? <Empty text="No sourcing projects yet." /> : data.map((p) => (
            <Link key={p.id} href={`/app/sourcing/${p.id}`} className="card flex items-center justify-between p-4 hover:bg-surface">
              <span className="font-medium">{p.title}</span><Badge v={p.status} />
            </Link>
          ))}
        </div>
        <form action={createRfx} className="card h-fit space-y-3 p-5">
          <h2 className="font-medium">New sourcing project</h2>
          <label className="block"><span className="lbl">Title</span><input name="title" required maxLength={160} className="inp" /></label>
          <label className="block"><span className="lbl">Brief</span><textarea name="brief" rows={3} maxLength={3000} className="inp" /></label>
          <p className="text-xs text-muted">Criteria and weights. Price is scored automatically (lowest bid scores 10).</p>
          <label className="block"><span className="lbl">Price weight</span><input name="price_weight" type="number" min="0" max="100" defaultValue={40} className="inp" /></label>
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-[1fr_80px] gap-2">
              <input name={`c${i}`} placeholder={["Quality", "Delivery time", "Support"][i - 1]} className="inp" maxLength={60} />
              <input name={`w${i}`} type="number" min="0" max="100" defaultValue={[30, 20, 10][i - 1]} className="inp" aria-label={`Weight ${i}`} />
            </div>
          ))}
          <button className="btn-primary w-full">Create project</button>
        </form>
      </div>
    </>
  );
}
