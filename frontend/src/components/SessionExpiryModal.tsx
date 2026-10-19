"use client";

import React, { useState, useEffect } from "react";
import { Clock, ShieldAlert, LogOut, RefreshCw } from "lucide-react";
import { logoutAction } from "@/app/login/actions";

export function SessionExpiryModal() {
  const [showModal, setShowModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  // In production, listens for idle timeout or JWT expiry
  useEffect(() => {
    const timer = setTimeout(() => {
      // Prompt modal 2 minutes before inactivity threshold
      // disabled by default during initial login session
    }, 1000 * 60 * 28);

    return () => clearTimeout(timer);
  }, []);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="fintech-card max-w-sm w-full p-6 rounded-2xl border border-rose-500/40 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">Session Inactivity Lockout</h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Officer terminal will automatically lock in {secondsRemaining} seconds to prevent unauthorized physical terminal access.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setShowModal(false)}
            className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>EXTEND SHIFT</span>
          </button>
          <form action={logoutAction} className="flex-1">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOCK NOW</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
