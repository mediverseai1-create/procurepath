import Link from "next/link";
import type { Metadata } from "next";
import { Header, Footer } from "@/components/SiteChrome";
import { PLANS } from "@/lib/logic";

export const metadata: Metadata = { title: "Pricing" };

const features: Record<string, string[]> = {
  free: ["AI-assisted intake and automated approvals", "Vendor risk scoring", "Core AI analysis"],
  growth: ["Everything in Starter", "Sourcing, contracts, purchase orders and invoice matching", "Expanded AI analysis volume"],
  scale: ["Everything in Growth", "Highest request and AI analysis volume", "Priority support"],
};

export default function Pricing() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-light tracking-tight md:text-5xl">Pricing that scales with the spend you control</h1>
        <p className="mt-3 max-w-xl text-muted">Choose the capacity your procurement team needs. Every plan includes the full AI engine and row-level data isolation.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((k) => {
            const p = PLANS[k];
            return (
              <div key={k} className="card flex flex-col p-6">
                <h2 className="text-lg font-medium">{p.label}</h2>
                <p className="mt-2 text-3xl font-light">{p.price}</p>
                <p className="mt-2 text-sm text-muted">{p.blurb}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  <li>{p.requests.toLocaleString()} requests per month</li>
                  <li>{p.ai.toLocaleString()} AI analyses per month</li>
                  {features[k].map((f) => <li key={f}>{f}</li>)}
                </ul>
                <Link href="/signup" className="btn-primary mt-6">Sign up</Link>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-muted">Paid plans are activated from Billing once the payment is confirmed.</p>
      </main>
      <Footer />
    </>
  );
}
