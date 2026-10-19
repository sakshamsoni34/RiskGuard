import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RiskGuard Investigator | Cybercrime Investigation Support Platform",
  description:
    "AI-assisted financial fraud investigation support platform for authorized Cyber Cell officers. Decision support with SHAP explainability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#080d19] text-slate-100 antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
