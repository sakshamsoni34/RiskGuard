"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col bg-[#080d19] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Persistent synthetic data banner across all views */}
      <DemoBanner />

      {isLoginPage ? (
        <main className="flex-1 flex flex-col">{children}</main>
      ) : (
        <div className="flex-1 flex w-full">
          {/* Officer Navigation Sidebar */}
          <Sidebar />

          {/* Core Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
              {children}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
