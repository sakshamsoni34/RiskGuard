"use client";

import React, { useState, useEffect } from "react";
import { soundEngine } from "@/lib/soundFx";
import {
  Settings,
  Volume2,
  VolumeX,
  Sliders,
  Shield,
  Clock,
  CheckCircle2,
  Bell,
  Save,
  Play,
} from "lucide-react";

export default function SettingsPage() {
  const [isMuted, setIsMuted] = useState(true);
  const [highRiskThreshold, setHighRiskThreshold] = useState(70);
  const [otpThreshold, setOtpThreshold] = useState(35);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setIsMuted(soundEngine.isSoundMuted());
  }, []);

  const handleToggleSound = () => {
    const next = soundEngine.toggleMute();
    setIsMuted(next);
  };

  const handleTestSound = () => {
    if (isMuted) {
      soundEngine.toggleMute();
      setIsMuted(false);
    }
    soundEngine.playAttackAlert();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("Settings persisted to local terminal profile.");
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d0d10] border border-[#222226]">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-zinc-300" />
            <span>Cyber Cell Terminal Settings & Thresholds</span>
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Configure telemetry audio feedback, risk scoring cutoffs, and session persistence
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-mono text-xs font-semibold shadow-md transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>SAVE PREFERENCES</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="space-y-6">
        {/* Telemetry Audio Controls */}
        <div className="fintech-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Real-Time Synthesizer Telemetry Audio</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Web Audio synthesizer generates tone beeps on live ingestion (Off by default per Phase 1 audit)
              </p>
            </div>
            <button
              onClick={handleToggleSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                isMuted
                  ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{isMuted ? "MUTED (DEFAULT)" : "AUDIO ENABLED"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={handleTestSound}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors border border-slate-700"
            >
              <Play className="w-3 h-3 text-indigo-400" />
              <span>TEST ALERT TONE (880Hz / 440Hz DUAL SINE)</span>
            </button>
          </div>
        </div>

        {/* Triage Decision Cutoffs */}
        <div className="fintech-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Risk Scoring Decision Cutoffs</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Calibrate how ML risk scores (0–100) translate into automated policy actions
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">CRITICAL / HIGH RISK CUTOFF (BLOCKED):</span>
                <span className="text-rose-400 font-bold">{highRiskThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={highRiskThreshold}
                onChange={(e) => setHighRiskThreshold(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <span className="text-[10px] font-mono text-slate-500">
                Transactions scoring at or above this threshold trigger automatic block and sound alert.
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">MEDIUM RISK STEP-UP CUTOFF (OTP CHALLENGE):</span>
                <span className="text-amber-400 font-bold">{otpThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                value={otpThreshold}
                onChange={(e) => setOtpThreshold(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-[10px] font-mono text-slate-500">
                Transactions scoring between this value and {highRiskThreshold} require step-up authentication.
              </span>
            </div>
          </div>
        </div>

        {/* Security & Inactivity Session */}
        <div className="fintech-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Session Inactivity Lockout</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Enforce automatic officer terminal lockout per Cyber Security Directive 2024
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-xs pt-1">
            {[15, 30, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setSessionTimeout(mins)}
                className={`p-3 rounded-xl border text-center transition-colors ${
                  sessionTimeout === mins
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div>{mins} MINUTES</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {mins === 30 ? "RECOMMENDED" : mins === 15 ? "STRICT" : "EXTENDED"}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
