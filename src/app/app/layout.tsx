import Link from "next/link";
import { getCtx } from "@/lib/ctx";
import { signOut } from "./actions";
import { Logo } from "@/components/SiteChrome";

const nav = [
  ["/app", "Dashboard"], ["/app/requests", "Requests"], ["/app/approvals", "Approvals"],
  ["/app/vendors", "Vendors"], ["/app/sourcing", "Sourcing"], ["/app/contracts", "Contracts"],
  ["/app/orders", "Purchase orders"], ["/app/invoices", "Invoices"],
  ["/app/billing", "Billing"], ["/app/settings", "Settings"],
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { org, user, plan } = await getCtx();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <aside className="border-b border-line bg-surface p-4 md:border-b-0 md:border-r">
        <Logo />
        <p className="mt-4 truncate text-sm font-medium">{org.name}</p>
        <p className="text-xs text-muted">{plan.label} plan</p>
        <nav aria-label="Application" className="mt-4 flex flex-wrap gap-1 md:flex-col">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className="rounded px-2 py-1.5 text-sm text-muted hover:bg-white hover:text-ink">{label}</Link>
          ))}
        </nav>
        <form action={signOut} className="mt-4">
          <p className="truncate text-xs text-muted">{user.email}</p>
          <button className="btn-outline mt-2">Sign out</button>
        </form>
      </aside>
      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
