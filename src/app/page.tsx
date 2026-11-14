import Link from "next/link";
import { Header, Footer } from "@/components/SiteChrome";

const modules = [
  { n: "01", t: "Intake", d: "One request form for every purchase. Policy decides who needs to approve, so requesters never guess." },
  { n: "02", t: "Approvals", d: "Threshold, category and data-risk rules create the approval chain automatically, with a full decision trail." },
  { n: "03", t: "Vendors", d: "Keep a vendor directory with a transparent risk score based on security and data-handling evidence." },
  { n: "04", t: "Sourcing", d: "Run competitive bids with weighted criteria and see a ranked, explainable comparison." },
  { n: "05", t: "Contracts", d: "Store agreements, track renewal notice windows and get an AI-assisted first-pass clause review." },
  { n: "06", t: "Orders & invoices", d: "Issue purchase orders, log receipts and match invoices before anything is paid." },
];

export default function Home() {
  return (
    <>
      <div className="hero-bg text-white">
        <Header dark />
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 pt-16 md:grid-cols-2 md:pt-24">
          <h1 className="text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">Procurement that runs itself, from request to payment</h1>
          <div className="self-end">
            <p className="text-lg text-white/90">ProcurePath is the workspace where purchase requests are routed, vetted, ordered and matched to invoices, with AI to explain and summarise and rules to decide.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-[5px] bg-white px-5 py-3 font-medium text-brand-deep">Start free</Link>
              <Link href="/pricing" className="btn-ghost px-5 py-3 text-white">See pricing</Link>
            </div>
          </div>
        </section>
      </div>

      <section id="platform" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="max-w-2xl text-3xl font-light tracking-tight md:text-4xl">One connected path instead of six disconnected tools</h2>
        <p className="mt-3 max-w-2xl text-muted">Every module shares the same records, so a request becomes an approval, a purchase order and a matched invoice without re-keying.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div key={m.n} className="card p-6">
              <span className="text-sm text-brand">{m.n}</span>
              <h3 className="mt-2 text-lg font-medium">{m.t}</h3>
              <p className="mt-2 text-sm text-muted">{m.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-light tracking-tight md:text-4xl">Rules make the decisions. AI explains them.</h2>
            <p className="mt-3 text-muted">Approval routing, vendor risk scores, bid rankings and three-way invoice matching are calculated by deterministic logic you can audit. AI is used where language helps: triaging requests, summarising vendor risk and flagging contract clauses.</p>
          </div>
          <ul className="space-y-3 text-sm">
            {["Approvals are created by policy and cannot be skipped or self-approved", "Invoice matching checks the PO, receipt and duplicates with a 2% tolerance", "Row-level security keeps each company's data isolated", "AI output is labelled and never overrides a calculated number"].map((t) => (
              <li key={t} className="card px-4 py-3">{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="text-3xl font-light tracking-tight md:text-4xl">Bring your first purchase request in today</h2>
        <Link href="/signup" className="btn-primary mt-8 px-6 py-3">Create your workspace</Link>
      </section>
      <Footer />
    </>
  );
}
