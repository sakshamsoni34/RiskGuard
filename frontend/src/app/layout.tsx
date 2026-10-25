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
    <html lang="en" className="dark h-full">
      <body
        className={`${inter.className} h-full overflow-hidden bg-[#000000] text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
