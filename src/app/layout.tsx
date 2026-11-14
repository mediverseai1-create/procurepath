import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "ProcurePath: intake-to-pay procurement", template: "%s | ProcurePath" },
  description:
    "ProcurePath gives growing companies one place to take purchase requests from intake through approval, sourcing, contracts, purchase orders and invoice matching.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
