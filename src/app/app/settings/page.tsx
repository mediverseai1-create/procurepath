import { getCtx } from "@/lib/ctx";
import { PageHead, Flash, type SP } from "@/components/ui";
import { renameOrg } from "../actions";

export const metadata = { title: "Settings" };

export default async function Settings({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { org, user, role } = await getCtx();
  return (
    <>
      <PageHead title="Settings" sub="Account and company details." />
      <Flash {...sp} />
      <div className="max-w-lg space-y-6">
        <section className="card p-5 text-sm"><p><span className="text-muted">Signed in as</span> {user.email}</p><p className="mt-1"><span className="text-muted">Role</span> {role}</p></section>
        <form action={renameOrg} className="card space-y-3 p-5">
          <label className="block"><span className="lbl">Company name</span><input name="name" defaultValue={org.name} required maxLength={120} className="inp" disabled={role !== "admin"} /></label>
          {role === "admin" && <button className="btn-primary">Save</button>}
        </form>
      </div>
    </>
  );
}
