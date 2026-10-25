"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#000000] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white">
      {isLoginPage ? (
        <main className="h-full w-full overflow-y-auto flex flex-col">{children}</main>
      ) : (
        <div className="flex-1 flex w-full h-full overflow-hidden">
          {/* Officer Navigation Sidebar: Stays permanently fixed on the left */}
          <Sidebar />

          {/* Core Content Area: Only this right pane scrolls */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
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
