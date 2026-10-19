"use client";

import React from "react";
import { ShieldCheck, AlertOctagon, CheckCircle2 } from "lucide-react";

interface TamperAlertBannerProps {
  verificationResult: {
    status: string;
    total_records_verified: number;
    last_block_hash: string;
    merkle_valid: boolean;
  } | null;
}

export const TamperAlertBanner: React.FC<TamperAlertBannerProps> = ({ verificationResult }) => {
  if (!verificationResult) return null;

  const isValid = verificationResult.merkle_valid;

  if (isValid) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-xl backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-100 flex items-center gap-2">
              <span>LEDGER INTEGRITY VERIFIED (IT ACT SEC 65B ADMISSIBLE)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/40 text-emerald-200">
                0 Tampering Detected
              </span>
            </div>
            <p className="mt-1 text-slate-400 text-[11px] leading-relaxed">
              Recalculated cryptographic SHA-256 chain across all <strong>{verificationResult.total_records_verified} blocks</strong>. Every previous hash matches current block headers.
            </p>
          </div>
        </div>

        <div className="text-right text-[10px] text-slate-500 self-end sm:self-center font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <span className="block text-slate-400">LAST VERIFIED BLOCK HASH:</span>
          <span className="text-emerald-400 break-all">{verificationResult.last_block_hash.slice(0, 24)}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/70 text-rose-200 text-xs font-mono shadow-2xl backdrop-blur-sm flex items-start gap-3 animate-pulse">
      <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-400">
        <AlertOctagon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-bold text-white flex items-center gap-2">
          <span>CRITICAL SECURITY ALERT: LEDGER TAMPERING DETECTED</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-900 border border-rose-500 text-rose-200">
            CHAIN BROKEN
          </span>
        </div>
        <p className="mt-1 text-rose-300 text-[11px] leading-relaxed">
          The cryptographic SHA-256 Merkle chain has been altered outside authorized audit logging procedures. Forensic review required immediately.
        </p>
      </div>
    </div>
  );
};
