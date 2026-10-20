"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertOctagon, CheckCircle2, ChevronDown, ChevronUp, Copy, Check, Lock, FileCheck2 } from "lucide-react";

interface TamperAlertBannerProps {
  verificationResult: {
    status: string;
    total_records_verified: number;
    last_block_hash: string;
    merkle_valid: boolean;
  } | null;
}

export const TamperAlertBanner: React.FC<TamperAlertBannerProps> = ({ verificationResult }) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!verificationResult) return null;

  const isValid = verificationResult.merkle_valid;

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isValid) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/20 via-[#0d0d10] to-[#08080a] border border-emerald-500/25 shadow-lg overflow-hidden transition-all">
        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Audit Trail Integrity: Verified & Intact
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Tamper-Free
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#18181c] text-zinc-300 border border-[#27272a]">
                  IT Act §65B Compliant
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-3xl">
                All <strong>{verificationResult.total_records_verified} events</strong> are cryptographically sealed. Every investigator override, case transition, and system action is permanently preserved with zero tampering.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141418] hover:bg-[#1a1a20] text-zinc-300 hover:text-white text-xs font-medium border border-[#27272a] transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showTechnicalDetails ? "Hide Technical Details" : "Cryptographic Proof"}</span>
              {showTechnicalDetails ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Technical Proof for Legal / Auditors */}
        {showTechnicalDetails && (
          <div className="px-5 pb-5 pt-2 border-t border-[#1e1e22] bg-[#070709] text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#0f0f13] border border-[#222226]">
                <span className="text-[11px] text-zinc-400 block font-medium">Security Standard</span>
                <span className="text-zinc-200 font-medium mt-0.5 block flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  Indian Evidence Act §65B
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0f0f13] border border-[#222226]">
                <span className="text-[11px] text-zinc-400 block font-medium">Hashing Algorithm</span>
                <span className="text-zinc-200 font-mono mt-0.5 block">SHA-256 HMAC (Merkle Linked)</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0f0f13] border border-[#222226]">
                <span className="text-[11px] text-zinc-400 block font-medium">Verified Records</span>
                <span className="text-emerald-400 font-semibold mt-0.5 block">
                  {verificationResult.total_records_verified} of {verificationResult.total_records_verified} blocks valid
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0f0f13] border border-[#222226] flex items-center justify-between">
                <div className="overflow-hidden pr-2">
                  <span className="text-[11px] text-zinc-400 block font-medium">Latest Block Seal</span>
                  <span className="text-zinc-300 font-mono text-[11px] truncate block mt-0.5">
                    {verificationResult.last_block_hash.slice(0, 16)}...
                  </span>
                </div>
                <button
                  onClick={() => copyHash(verificationResult.last_block_hash)}
                  className="p-1.5 rounded-lg bg-[#18181c] hover:bg-[#222226] text-zinc-300 hover:text-white transition-colors"
                  title="Copy full SHA-256 hash"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/40 border border-rose-500/60 text-xs shadow-xl flex items-start gap-3.5">
      <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-rose-100">
            Security Alert: Audit Chain Inconsistency Detected
          </h3>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-900/80 border border-rose-500/40 text-rose-200">
            Chain Discrepancy
          </span>
        </div>
        <p className="mt-1 text-xs text-rose-300 leading-relaxed">
          The cryptographic verification detected an altered hash block that does not match prior sequential signatures. 
          All modifications have been flagged for senior forensic and compliance review.
        </p>
      </div>
    </div>
  );
};
