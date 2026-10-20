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
      avatarBg: "bg-[#18181c] text-zinc-200 border-[#2b2b30]",
      initials: "VS",
    },
    {
      badge: "CC-9104",
      pass: "investigator123",
      role: "INVESTIGATOR",
      name: "Sub-Insp. Priya Patel",
      title: "Risk Analyst",
      avatarBg: "bg-[#18181c] text-zinc-200 border-[#2b2b30]",
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
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center p-3 sm:p-4 select-none bg-[#000000]">
      {/* Centered Stationary Rotating Neural Network Globe */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <NeuralGlobe size={720} nodeCount={135} />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col justify-center space-y-3">
        {/* Brand & Introduction */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-[10px] font-medium backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Global Neural Mesh</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">135 Nodes Online</span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-zinc-100" />
            <span>RiskGuard Operations</span>
          </h1>
          <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-tight">
            Real-time transaction risk triage & fraud investigation
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0e0e11] rounded-2xl border border-[#26262b] p-4 sm:p-5 shadow-2xl shadow-black space-y-3">
          {state?.error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[11px] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Officer / Analyst ID
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2" />
                <input
                  type="text"
                  name="badge_number"
                  required
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="e.g. CC-8421"
                  className="w-full bg-[#121215] border border-[#242429] rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-zinc-300">
                  Password
                </label>
                <span className="text-[10px] text-zinc-400 hover:text-zinc-300 cursor-pointer transition-colors">
                  Need assistance?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2" />
                <input
                  type="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#121215] border border-[#242429] rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Assigned Unit & Role
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2" />
                <select
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#121215] border border-[#242429] rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600 transition-all appearance-none cursor-pointer"
                >
                  <option value="INVESTIGATOR">Investigator (Cyber Fraud Triage)</option>
                  <option value="SUPERVISOR">Supervisor / ACP (Review & Oversight)</option>
                  <option value="ADMIN">System Administrator (Full Access)</option>
                  <option value="READONLY">Analyst Liaison (Read Only)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-zinc-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3 h-3 rounded bg-zinc-800 border-zinc-700 text-zinc-100 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Keep session active for 8 hrs</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
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
          <div className="pt-2.5 border-t border-[#222226] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
              <span>Quick Demo Profiles</span>
              <span className="text-[10px] text-zinc-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-zinc-400" />
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
                        ? "bg-[#1c1c21] border-zinc-500 ring-1 ring-zinc-500/40"
                        : "bg-[#121215] hover:bg-[#18181c] border-[#222226] hover:border-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md border flex items-center justify-center text-[9px] font-bold shrink-0 ${acc.avatarBg}`}
                    >
                      {acc.initials}
                    </div>
                    <div className="truncate flex-1 leading-tight">
                      <div className="font-medium text-zinc-200 text-[11px] truncate">
                        {acc.name}
                      </div>
                      <div className="text-[9px] text-zinc-400 truncate">
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
        <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1">
          <Shield className="w-3 h-3 text-zinc-500" />
          <span>Encrypted Session • RiskGuard v2.4 • Authorized Access Only</span>
        </p>
      </div>
    </div>
  );
}
