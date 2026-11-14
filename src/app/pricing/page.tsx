import Link from "next/link";
import type { Metadata } from "next";
import { Header, Footer } from "@/components/SiteChrome";
import { PLANS } from "@/lib/logic";

export const metadata: Metadata = { title: "Pricing" };

const features: Record<string, string[]> = {
  free: ["Intake and approvals", "Vendor directory and risk scoring", "Basic AI assistance"],
  growth: ["Everything in Starter", "Sourcing, contracts, orders and invoice matching", "Higher AI allowance"],
  scale: ["Everything in Growth", "Highest request and AI volume", "Priority support"],
};

export default function Pricing() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-light tracking-tight md:text-5xl">Simple plans that grow with your spend</h1>
        <p className="mt-3 max-w-xl text-muted">Start free. Upgrade when your team needs more requests and AI assistance each month.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((k) => {
            const p = PLANS[k];
            return (
              <div key={k} className="card flex flex-col p-6">
                <h2 className="text-lg font-medium">{p.label}</h2>
                <p className="mt-2 text-3xl font-light">{p.price}</p>
                <p className="mt-2 text-sm text-muted">{p.blurb}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  <li>{p.requests.toLocaleString()} requests / month</li>
                  <li>{p.ai.toLocaleString()} AI actions / month</li>
                  {features[k].map((f) => <li key={f}>{f}</li>)}
                </ul>
                <Link href="/signup" className="btn-primary mt-6">{k === "free" ? "Start free" : `Start free, upgrade to ${p.label}`}</Link>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-muted">Paid plans are activated from the Billing page once payment is confirmed.</p>
      </main>
      <Footer />
    </>
  );
}
