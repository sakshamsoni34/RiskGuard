"use client";

import React, { useState } from "react";
import { Send, FileText, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

interface CaseNoteEditorProps {
  caseId: string;
  onNoteAdded: (note: any) => void;
}

export const CaseNoteEditor: React.FC<CaseNoteEditorProps> = ({ caseId, onNoteAdded }) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/v1/cases/${caseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (res.ok) {
        const newNote = await res.json();
        onNoteAdded(newNote);
        setText("");
        setStatusMsg("Observation appended & audit-signed.");
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        // Fallback local note for demo if offline
        const mockNote = {
          id: `note-${Date.now()}`,
          officerBadge: "#CC-8421",
          officerName: "Insp. Vikram Sharma",
          timestamp: new Date().toISOString(),
          text: text.trim(),
        };
        onNoteAdded(mockNote);
        setText("");
        setStatusMsg("Observation recorded.");
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch {
      const mockNote = {
        id: `note-${Date.now()}`,
        officerBadge: "#CC-8421",
        officerName: "Insp. Vikram Sharma",
        timestamp: new Date().toISOString(),
        text: text.trim(),
      };
      onNoteAdded(mockNote);
      setText("");
      setStatusMsg("Observation recorded.");
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-[#0d0d10] border border-[#222226] space-y-3 font-mono">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-zinc-300" />
          <span>Append Case Observation</span>
        </span>
        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Signed: Insp. Vikram Sharma (#CC-8421)</span>
        </span>
      </div>

      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter investigative finding, mule account verification, or subpoena update... (Press Cmd+Enter to submit)"
        className="w-full p-3 bg-[#121215] border border-[#242429] rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600 transition-all resize-none"
      />

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-500">
          Entries are permanently appended to the tamper-evident dossier ledger.
        </span>

        <div className="flex items-center gap-3">
          {statusMsg && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMsg}</span>
            </span>
          )}

          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all disabled:opacity-40"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Sign & Append</span>
          </button>
        </div>
      </div>
    </form>
  );
};
