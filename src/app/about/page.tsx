import type { Metadata } from "next";
import { Header, Footer } from "@/components/SiteChrome";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-light tracking-tight md:text-5xl">Procurement should not need an enterprise budget</h1>
        <div className="mt-6 space-y-4 text-muted">
          <p>ProcurePath is built for finance, operations and IT teams that buy a lot but have no dedicated procurement department. Spend leaks when requests arrive by chat, approvals live in inboxes and invoices are paid before anyone checks the order.</p>
          <p>We put the whole path in one workspace: intake, approvals, vendor vetting, sourcing, contracts, orders and invoice matching. Policy and arithmetic are handled by transparent rules. AI helps people read, summarise and ask better questions.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
