import Link from "next/link";
import { Header, Footer } from "@/components/SiteChrome";

const modules = [
  { n: "01", t: "AI Intake", d: "AI reads every purchase request, flags missing business justification and suggests the right category, so approvers decide on complete information and cycle time drops." },
  { n: "02", t: "Automated Approvals", d: "Policy rules build the approval chain from amount, category and data risk. Every decision is logged, and no request can approve itself." },
  { n: "03", t: "Vendor Risk", d: "Each vendor receives an auditable risk score from security and data-handling evidence. AI explains the exposure and drafts the due-diligence questions." },
  { n: "04", t: "Sourcing", d: "Weighted bid scoring ranks suppliers on price and quality criteria you define, so awards are defensible and savings are measurable." },
  { n: "05", t: "Contract Intelligence", d: "AI reviews contract text for auto-renewal, liability, termination and data-protection exposure, and renewal windows are tracked before notice deadlines pass." },
  { n: "06", t: "Spend Control", d: "Purchase orders, receipts and invoices are matched automatically with a 2 percent tolerance and duplicate detection, stopping overpayment before cash leaves." },
];

const proof = [
  "Cut approval cycle time with automated routing and AI-completed requests",
  "Stop duplicate and unreceived-goods payments with three-way invoice matching",
  "Reduce vendor and contract risk with AI review on every record",
  "Keep each company's data isolated with row-level security",
];

export default function Home() {
  return (
    <>
      <div className="hero-bg text-white">
        <Header dark />
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 pt-16 md:grid-cols-2 md:pt-24">
          <h1 className="text-5xl font-light leading-[1.05] tracking-tight md:text-5xl lg:text-7xl">The AI procurement platform that controls spend before it happens</h1>
          <div className="self-end">
            <p className="text-lg text-white/90">ProcurePath analyzes every request, vendor and contract with AI, then automates approvals and invoice matching. Finance and operations leaders cut cycle time, stop payment leakage and reduce supplier risk from one system.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="rounded-[5px] bg-white px-5 py-3 font-medium text-brand-deep">Sign up</Link>
              <Link href="/login" className="btn-ghost px-5 py-3 text-white">Sign in</Link>
            </div>
          </div>
        </section>
      </div>

      <section id="platform" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="max-w-3xl text-3xl font-light tracking-tight md:text-4xl">One AI engine across the entire path from request to payment</h2>
        <p className="mt-3 max-w-2xl text-muted">Every module reads and writes the same records. A request becomes an approval, a purchase order and a matched invoice without re-keying or lost context.</p>
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
            <h2 className="text-3xl font-light tracking-tight md:text-4xl">Intelligence where judgment is needed. Hard rules where money moves.</h2>
            <p className="mt-3 text-muted">AI interprets language: requests, vendor evidence and contract clauses. Approval routing, risk scores, bid rankings and invoice matching run on deterministic logic your auditors can verify. Decision-makers get speed without giving up control.</p>
          </div>
          <ul className="space-y-3 text-sm">
            {proof.map((t) => (<li key={t} className="card px-4 py-3">{t}</li>))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-light tracking-tight md:text-4xl">Put AI in charge of the paperwork. Keep your team in charge of the decisions.</h2>
        <Link href="/signup" className="btn-primary mt-8 px-6 py-3">Create account</Link>
      </section>
      <Footer />
    </>
  );
}
