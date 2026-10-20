"use client";

import React, { useState, useActionState } from "react";
import { loginAction } from "./actions";
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Shield,
  Briefcase,
} from "lucide-react";
import { NeuralGlobe } from "@/components/ui/NeuralGlobe";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [badgeId, setBadgeId] = useState("CC-8421");
  const [password, setPassword] = useState("investigator123");
  const [role, setRole] = useState("INVESTIGATOR");
  const [rememberMe, setRememberMe] = useState(true);

  const demoAccounts = [
    {
      badge: "CC-8421",
      pass: "investigator123",
      role: "INVESTIGATOR",
      name: "Insp. Vikram Sharma",
      title: "Lead Investigator",
      avatarBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
      initials: "VS",
    },
    {
      badge: "CC-9104",
      pass: "investigator123",
      role: "INVESTIGATOR",
      name: "Sub-Insp. Priya Patel",
      title: "Risk Analyst",
      avatarBg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      initials: "PP",
    },
    {
      badge: "SUP-010",
      pass: "supervisor123",
      role: "SUPERVISOR",
      name: "ACP Rajesh Nair",
      title: "Supervisor",
      avatarBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      initials: "RN",
    },
    {
      badge: "ADM-001",
      pass: "admin123",
      role: "ADMIN",
      name: "Maya Desai",
      title: "Sys Admin",
      avatarBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      initials: "MD",
    },
  ];

  const handleSelectDemo = (acc: typeof demoAccounts[0]) => {
    setBadgeId(acc.badge);
    setPassword(acc.pass);
    setRole(acc.role);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center p-3 sm:p-4 select-none">
      {/* Centered Stationary Rotating Neural Network Globe */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <NeuralGlobe size={720} nodeCount={135} />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col justify-center space-y-3">
        {/* Brand & Introduction */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-medium backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>Global Neural Mesh</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">135 Nodes Online</span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>RiskGuard Operations</span>
          </h1>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-tight">
            Real-time transaction risk triage & fraud investigation
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#111827]/85 backdrop-blur-xl rounded-2xl border border-slate-800/90 p-4 sm:p-5 shadow-2xl shadow-black/50 space-y-3">
          {state?.error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[11px] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Officer / Analyst ID
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
                <input
                  type="text"
                  name="badge_number"
                  required
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="e.g. CC-8421"
                  className="w-full bg-[#0a0e17] border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-slate-400 hover:text-slate-300 cursor-pointer transition-colors">
                  Need assistance?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
                <input
                  type="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0e17] border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Assigned Unit & Role
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
                <select
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="INVESTIGATOR">Investigator (Cyber Fraud Triage)</option>
                  <option value="SUPERVISOR">Supervisor / ACP (Review & Oversight)</option>
                  <option value="ADMIN">System Administrator (Full Access)</option>
                  <option value="READONLY">Analyst Liaison (Read Only)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3 h-3 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Keep session active for 8 hrs</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-950/50 hover:shadow-indigo-900/40 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to RiskGuard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Evaluation Profiles */}
          <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Quick Demo Profiles</span>
              <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                1-Click Autofill
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {demoAccounts.map((acc) => {
                const isSelected = badgeId === acc.badge;
                return (
                  <button
                    key={acc.badge}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    className={`p-1.5 rounded-lg border text-left transition-all flex items-center gap-2 ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/30"
                        : "bg-slate-900/40 hover:bg-slate-800/50 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md border flex items-center justify-center text-[9px] font-bold shrink-0 ${acc.avatarBg}`}
                    >
                      {acc.initials}
                    </div>
                    <div className="truncate flex-1 leading-tight">
                      <div className="font-medium text-slate-200 text-[11px] truncate">
                        {acc.name}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {acc.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
          <Shield className="w-3 h-3 text-slate-400" />
          <span>Encrypted Session • RiskGuard v2.4 • Authorized Access Only</span>
        </p>
      </div>
    </div>
  );
}
