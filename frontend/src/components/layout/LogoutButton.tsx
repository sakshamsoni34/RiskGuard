"use client";

import React, { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  variant?: "ghost" | "solid" | "compact" | "dropdown";
  className?: string;
  showText?: boolean;
}

export function LogoutButton({
  variant = "solid",
  className = "",
  showText = true,
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoggingOut(true);

    try {
      // Clear cookies via backend API route
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // Ignore network errors on logout
    }

    // Also manually expire client-side cookies for instant effect
    document.cookie = "riskguard_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "officer_badge=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "officer_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Immediate hard redirect to /login to ensure clean state
    window.location.href = "/login";
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        title="Sign Out of RiskGuard"
        className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 ${className}`}
        aria-label="Log out"
      >
        {isLoggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
      </button>
    );
  }

  if (variant === "dropdown") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50 ${className}`}
      >
        {isLoggingOut ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <LogOut className="w-3.5 h-3.5" />
        )}
        <span>{isLoggingOut ? "Signing out..." : "Log Out"}</span>
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50 ${className}`}
      >
        {isLoggingOut ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
        ) : (
          <LogOut className="w-3.5 h-3.5" />
        )}
        {showText && <span>{isLoggingOut ? "Signing out..." : "Log Out"}</span>}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 hover:border-rose-500/40 text-xs font-medium transition-all shadow-sm disabled:opacity-50 ${className}`}
    >
      {isLoggingOut ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
      ) : (
        <LogOut className="w-3.5 h-3.5 text-rose-400" />
      )}
      {showText && <span>{isLoggingOut ? "Signing out..." : "Log Out"}</span>}
    </button>
  );
}
