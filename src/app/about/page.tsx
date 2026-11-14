import type { Metadata } from "next";
import { Header, Footer } from "@/components/SiteChrome";

export const metadata: Metadata = { title: "Company" };

export default function About() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-light tracking-tight md:text-5xl">Procurement is where margin is won or lost</h1>
        <div className="mt-6 space-y-4 text-muted">
          <p>Most companies lose money between the request and the payment: approvals stall in inboxes, vendors are onboarded without scrutiny, and invoices are paid before anyone confirms the order was received.</p>
          <p>ProcurePath is built to close that gap. Our AI analyzes requests, vendors and contracts, and automated controls route approvals and match invoices before cash leaves the business. The goal is simple: faster decisions, lower spend leakage and less supplier risk, without adding procurement headcount.</p>
          <p>We build for finance, operations and IT leaders who are accountable for every dollar a company commits.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
