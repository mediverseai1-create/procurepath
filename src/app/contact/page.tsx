import type { Metadata } from "next";
import { Header, Footer } from "@/components/SiteChrome";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-light tracking-tight">Contact</h1>
        <p className="mt-4 text-muted">
          {email ? <>Email us at <a className="underline" href={`mailto:${email}`}>{email}</a>.</> : "A support address has not been configured yet. Set NEXT_PUBLIC_SUPPORT_EMAIL to show it here."}
        </p>
      </main>
      <Footer />
    </>
  );
}
