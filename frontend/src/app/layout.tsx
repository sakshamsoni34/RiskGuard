import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RiskGuard — Fraud & Risk Intelligence Operations",
  description:
    "Real-time financial transaction monitoring, ML risk scoring, and fraud investigation workspace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-[#0b0f19] text-slate-100 antialiased selection:bg-indigo-500/25 selection:text-indigo-200`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
