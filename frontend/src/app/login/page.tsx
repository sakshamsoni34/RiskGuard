"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  KeyRound,
  Lock,
  BadgeCheck,
  User,
  ArrowRight,
  AlertTriangle,
  Fingerprint,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [badgeId, setBadgeId] = useState("CC-8421");
  const [password, setPassword] = useState("••••••••••••");
  const [role, setRole] = useState("INVESTIGATOR");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  const setDemoOfficer = (badge: string, officerRole: string) => {
    setBadgeId(badge);
    setRole(officerRole);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-40px)]">
      <div className="w-full max-w-md space-y-6">
        {/* Emblem & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-2 shadow-xl shadow-indigo-950">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">RiskGuard Investigator</h1>
          <p className="text-xs font-mono text-slate-400">
            CYBER CRIME COMMAND PORTAL • CELL AUTH GATEWAY
          </p>
        </div>

        {/* Warning Banner */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">AUTHORIZED LAW ENFORCEMENT ACCESS ONLY</p>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Public signup is disabled. Unauthorized attempts are cryptographically logged per IT Act
              Sec 43/66.
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="fintech-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center justify-between">
                <span>OFFICER BADGE ID</span>
                <span className="text-[10px] text-indigo-400">GOVT ISSUED</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="e.g. CC-8421"
                  className="w-full bg-[#070b14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center justify-between">
                <span>SECURITY CLEARANCE TOKEN</span>
                <span className="text-[10px] text-slate-500">AES-256</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">UNIT CLEARANCE LEVEL</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="INVESTIGATOR">Investigator (Cyber Fraud Unit)</option>
                <option value="SUPERVISOR">Supervisor / ACP (Review & Escalation)</option>
                <option value="ADMIN">System Administrator (Audit & Config)</option>
                <option value="READONLY">Analyst / Read-Only Liaison</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AUTHENTICATING SECURE SESSION...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>INITIALIZE INVESTIGATION CONSOLE</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </>
              )}
            </button>
          </form>

          {/* Demo Quick-Login Helper */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-[10px] font-mono uppercase text-slate-400 text-center font-semibold">
              Demo Credentials (Evaluation Mode)
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setDemoOfficer("CC-8421", "INVESTIGATOR")}
                className="p-2 rounded bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-left transition-colors"
              >
                <div className="text-indigo-300 font-semibold">Insp. Sharma</div>
                <div className="text-[9px] text-slate-400">Lead Investigator</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoOfficer("CC-9104", "INVESTIGATOR")}
                className="p-2 rounded bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-left transition-colors"
              >
                <div className="text-cyan-300 font-semibold">Sub-Insp. Patel</div>
                <div className="text-[9px] text-slate-400">Financial Analyst</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoOfficer("SUP-010", "SUPERVISOR")}
                className="p-2 rounded bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-left transition-colors"
              >
                <div className="text-amber-300 font-semibold">ACP Rajesh Nair</div>
                <div className="text-[9px] text-slate-400">Supervisor / Oversight</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoOfficer("ADM-001", "ADMIN")}
                className="p-2 rounded bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-left transition-colors"
              >
                <div className="text-emerald-300 font-semibold">Admin Desai</div>
                <div className="text-[9px] text-slate-400">Security Admin</div>
              </button>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Footer */}
        <p className="text-[10px] font-mono text-center text-slate-400">
          RiskGuard Investigator v2.4 • Ministry / Cyber Cell Internal Deployment
        </p>
      </div>
    </div>
  );
}
