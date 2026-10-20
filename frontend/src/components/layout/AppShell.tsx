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
    <div
      className={`${
        isLoginPage ? "h-screen overflow-hidden" : "min-h-screen"
      } flex flex-col bg-[#000000] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white`}
    >
      {isLoginPage ? (
        <main className="h-full w-full overflow-hidden flex flex-col">{children}</main>
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
