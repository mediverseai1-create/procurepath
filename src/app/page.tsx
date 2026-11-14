import Link from "next/link";
import { Header, Footer } from "@/components/SiteChrome";

const modules = [
  { n: "01", t: "AI Intake", d: "AI reads every purchase request, flags missing business justification and suggests the right category, so approvers decide on complete information and cycle time drops." },
  { n: "02", t: "Automated Approvals", d: "Policy rules build the approval chain from amount, category and data risk. Every decision is logged, and no request can approve itself." },
  { n: "03", t: "Vendor Risk", d: "Each vendor receives an auditable risk score from security and data-handling evidence. AI explains the exposure and drafts the due-diligence questions." },
  { n: "04", t: "Sourcing", d: "Weighted bid scoring ranks suppliers on price and the quality criteria you define, so awards are defensible and savings are measurable." },
  { n: "05", t: "Contract Intelligence", d: "AI reviews contract text for auto-renewal, liability, termination and data-protection exposure, and renewal windows are tracked before notice deadlines pass." },
  { n: "06", t: "Spend Control", d: "Purchase orders, receipts and invoices are matched automatically with a 2 percent tolerance and duplicate detection, stopping overpayment before cash leaves." },
];

const steps = [
  { t: "Capture", d: "A team member describes the purchase. AI reviews it, flags what is missing and proposes a category before it reaches an approver." },
  { t: "Route", d: "Policy builds the approval chain from amount, category and vendor data risk. Approvers see the full context in one place." },
  { t: "Vet", d: "The vendor is risk-scored from evidence on file. AI summarizes the exposure and lists the questions worth asking." },
  { t: "Order", d: "Approved requests become purchase orders. Receipts are logged as goods and services arrive." },
  { t: "Match", d: "Each invoice is checked against its purchase order, the received amount and prior invoices. Exceptions stop before payment." },
];

const ai = [
  { t: "Reads requests", d: "Summarizes the business case, identifies missing information and suggests alternatives to evaluate before money is committed." },
  { t: "Analyzes vendors", d: "Explains a vendor's risk factors in plain language and generates due-diligence questions for security and legal teams." },
  { t: "Reviews contracts", d: "Scans pasted agreements for renewal, liability, indemnity, termination, payment and data-protection clauses, and proposes revisions." },
  { t: "Automates the workflow", d: "Routes approvals, builds purchase orders and matches invoices without manual re-keying between systems." },
];

const roles = [
  { t: "Finance", d: "Control cash before it leaves. Every payment is tied to an approved request, an order and a received amount." },
  { t: "Procurement", d: "Compare bids on weighted criteria and keep every vendor decision on the record." },
  { t: "IT and Security", d: "See which vendors handle personal data and which lack a SOC 2 report or a signed data processing agreement." },
  { t: "Legal", d: "Get a structured first-pass clause review and renewal alerts, so counsel spends time on judgment, not triage." },
];

const security = [
  "Row-level security isolates every company's data at the database",
  "Approval steps cannot be skipped, and requesters cannot approve their own spend",
  "AI output is labeled as advisory and never overrides a calculated number",
  "Plan changes are applied only after verified payment confirmation",
];

const faq = [
  { q: "What does the AI actually do?", a: "It reads and explains: purchase requests, vendor evidence and contract text. It summarizes, flags gaps and drafts questions. Calculations such as risk scores, bid rankings and invoice matches are produced by deterministic logic, not by the AI." },
  { q: "Who is ProcurePath built for?", a: "Finance, operations, procurement, IT and legal teams at companies that buy across many vendors and need control without building a large procurement department." },
  { q: "Can the AI approve spend?", a: "No. Approvals are made by your people. The AI prepares the context so they decide faster, and policy rules decide who must approve." },
  { q: "How is our data protected?", a: "Each company's records are separated by row-level security in the database, and AI requests are made from the server, never from the browser." },
  { q: "How do paid plans work?", a: "Plans set monthly request and AI analysis capacity. An upgrade takes effect once the payment provider confirms payment to our servers." },
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

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
          {[["Faster approvals", "Automated routing replaces inbox chasing."], ["Lower leakage", "Invoices are matched before they are paid."], ["Less risk", "Vendors and contracts are reviewed on every record."]].map(([t, d]) => (
            <div key={t}><p className="font-medium">{t}</p><p className="mt-1 text-sm text-muted">{d}</p></div>
          ))}
        </div>
      </section>

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

      <section id="how" className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="max-w-3xl text-3xl font-light tracking-tight md:text-4xl">From request to matched invoice in five controlled steps</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.t} className="card p-5">
                <span className="text-sm text-brand">Step {i + 1}</span>
                <h3 className="mt-1 font-medium">{s.t}</h3>
                <p className="mt-2 text-sm text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="ai" className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-3xl font-light tracking-tight md:text-4xl">What the AI does, specifically</h2>
            <p className="mt-3 text-muted">The AI is the working layer that reads, analyzes and drafts, so your team spends its time on decisions instead of document handling.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {ai.map((a) => (
              <div key={a.t} className="card p-5">
                <h3 className="font-medium">{a.t}</h3>
                <p className="mt-2 text-sm text-muted">{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="max-w-3xl text-3xl font-light tracking-tight md:text-4xl">Built for every team that touches spend</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((r) => (
              <div key={r.t} className="card p-5">
                <h3 className="font-medium">{r.t}</h3>
                <p className="mt-2 text-sm text-muted">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-light tracking-tight md:text-4xl">Intelligence where judgment is needed. Hard rules where money moves.</h2>
            <p className="mt-3 text-muted">AI interprets language. Approval routing, risk scores, bid rankings and invoice matching run on deterministic logic your auditors can verify. Decision-makers get speed without giving up control.</p>
          </div>
          <ul className="space-y-3 text-sm">
            {security.map((t) => (<li key={t} className="card px-4 py-3">{t}</li>))}
          </ul>
        </div>
      </section>

      <section id="faq" className="bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <h2 className="text-3xl font-light tracking-tight md:text-4xl">Questions from decision-makers</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {faq.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="hero-bg text-white">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-light tracking-tight md:text-5xl">Put AI in charge of the paperwork. Keep your team in charge of the decisions.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="rounded-[5px] bg-white px-6 py-3 font-medium text-brand-deep">Create account</Link>
            <Link href="/login" className="btn-ghost px-6 py-3 text-white">Sign in</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
