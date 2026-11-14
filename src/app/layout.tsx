import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "ProcurePath: intake-to-pay procurement", template: "%s | ProcurePath" },
  description:
    "ProcurePath is the AI-native procurement platform that analyzes requests, vendors and contracts, automates approvals and matches invoices before payment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
