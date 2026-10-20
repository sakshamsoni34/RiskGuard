"use client";

import React, { useState } from "react";
import { Cpu, Download, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface BulkActionBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onBatchScore: () => Promise<void>;
  onExportSelected: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedIds,
  onClearSelection,
  onBatchScore,
  onExportSelected,
}) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (selectedIds.length === 0) return null;

  const handleScore = async () => {
    setLoading(true);
    setMsg(null);
    try {
      await onBatchScore();
      setMsg(`Successfully re-evaluated ${selectedIds.length} records via ML microservice`);
      setTimeout(() => setMsg(null), 4000);
    } catch (err: any) {
      setMsg("Batch re-scoring failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4">
      <div className="p-3.5 rounded-2xl bg-[#0e0e11] border border-[#27272a] shadow-2xl shadow-black backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Count & Status */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-zinc-100">
            {selectedIds.length} transaction{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          {msg && (
            <span className="text-[11px] text-zinc-300 ml-2 border-l border-[#27272a] pl-2">
              {msg}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleScore}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181c] hover:bg-[#222227] border border-[#2b2b30] text-zinc-200 font-semibold transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
            <span>Batch Re-score (ML 2.0)</span>
          </button>

          <button
            onClick={onExportSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181c] hover:bg-[#222227] border border-[#2b2b30] text-zinc-300 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onClearSelection}
            title="Clear Selection"
            className="p-1.5 rounded-xl border border-[#27272a] text-zinc-400 hover:text-white hover:bg-[#18181c] transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
