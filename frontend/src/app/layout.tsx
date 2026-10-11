import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RiskGuard | Real-Time Fraud Detection & Risk Scoring",
  description:
    "Production-grade financial fraud detection engine powered by XGBoost, Anomaly Detection, and SHAP Explainability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#090d16] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
