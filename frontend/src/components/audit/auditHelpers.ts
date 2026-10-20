export interface FormattedAction {
  title: string;
  category: "override" | "case" | "model" | "report" | "security" | "system";
  badgeLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconType: "override" | "case" | "status" | "note" | "link" | "model" | "report" | "security" | "system";
}

export function formatAuditAction(action: string): FormattedAction {
  const norm = (action || "").toUpperCase();

  if (norm.includes("OVERRIDE")) {
    return {
      title: "Manual Risk Score Override",
      category: "override",
      badgeLabel: "Analyst Decision",
      badgeBg: "bg-amber-500/10",
      badgeText: "text-amber-300",
      badgeBorder: "border-amber-500/20",
      iconType: "override",
    };
  }

  if (norm.includes("OPEN_CASE") || norm.includes("CASE_REGISTERED")) {
    return {
      title: "Investigation Case Opened",
      category: "case",
      badgeLabel: "New Case",
      badgeBg: "bg-[#18181c]",
      badgeText: "text-zinc-200",
      badgeBorder: "border-[#2b2b30]",
      iconType: "case",
    };
  }

  if (norm.includes("STATUS") || norm.includes("TRANSITION")) {
    return {
      title: "Case Status Updated",
      category: "case",
      badgeLabel: "Status Change",
      badgeBg: "bg-[#18181c]",
      badgeText: "text-zinc-200",
      badgeBorder: "border-[#2b2b30]",
      iconType: "status",
    };
  }

  if (norm.includes("NOTE")) {
    return {
      title: "Investigation Note Added",
      category: "case",
      badgeLabel: "Case Note",
      badgeBg: "bg-[#18181c]",
      badgeText: "text-zinc-200",
      badgeBorder: "border-[#2b2b30]",
      iconType: "note",
    };
  }

  if (norm.includes("LINK")) {
    return {
      title: "Transactions Linked to Case",
      category: "case",
      badgeLabel: "Evidence Linked",
      badgeBg: "bg-[#18181c]",
      badgeText: "text-zinc-200",
      badgeBorder: "border-[#2b2b30]",
      iconType: "link",
    };
  }

  if (norm.includes("FEEDBACK")) {
    return {
      title: "Model Feedback Submitted",
      category: "model",
      badgeLabel: "AI Calibration",
      badgeBg: "bg-[#18181c]",
      badgeText: "text-zinc-200",
      badgeBorder: "border-[#2b2b30]",
      iconType: "model",
    };
  }

  if (norm.includes("REPORT")) {
    return {
      title: "Investigation Report Generated & Sealed",
      category: "report",
      badgeLabel: "Report Sealed",
      badgeBg: "bg-[#18181c]",
      badgeText: "text-zinc-200",
      badgeBorder: "border-[#2b2b30]",
      iconType: "report",
    };
  }

  if (norm.includes("SESSION") || norm.includes("LOGIN") || norm.includes("AUTH") || norm.includes("LOGOUT")) {
    return {
      title: norm.includes("LOGOUT") ? "Officer Signed Out" : "Officer Authenticated",
      category: "security",
      badgeLabel: "Security Event",
      badgeBg: "bg-emerald-500/10",
      badgeText: "text-emerald-300",
      badgeBorder: "border-emerald-500/20",
      iconType: "security",
    };
  }

  if (norm.includes("INTEGRITY") || norm.includes("CHAIN")) {
    return {
      title: "Automated Integrity Check",
      category: "system",
      badgeLabel: "Integrity Verified",
      badgeBg: "bg-emerald-500/10",
      badgeText: "text-emerald-300",
      badgeBorder: "border-emerald-500/20",
      iconType: "system",
    };
  }

  if (norm.includes("BATCH_RESCORED")) {
    return {
      title: "Transactions Batch Rescored",
      category: "system",
      badgeLabel: "Batch Operation",
      badgeBg: "bg-slate-500/10",
      badgeText: "text-slate-300",
      badgeBorder: "border-slate-500/20",
      iconType: "system",
    };
  }

  // Fallback human title
  const cleanTitle = action
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return {
    title: cleanTitle,
    category: "system",
    badgeLabel: "System Log",
    badgeBg: "bg-slate-500/10",
    badgeText: "text-slate-300",
    badgeBorder: "border-slate-500/20",
    iconType: "system",
  };
}

export function formatEntityLabel(type: string): string {
  switch (type?.toUpperCase()) {
    case "TRANSACTION":
      return "Transaction";
    case "CASE":
      return "Case File";
    case "MODEL":
      return "AI Model";
    case "REPORT":
      return "Report";
    case "USER_SESSION":
      return "Session";
    default:
      return type || "Entity";
  }
}

export function formatAuditDate(dateStr: string): { relative: string; full: string } {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { relative: dateStr, full: dateStr };

    const full = d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    let relative = "";
    if (diffMs < 0) {
      relative = "Just now";
    } else if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      relative = `${diffMins}m ago`;
    } else if (diffHours < 24) {
      relative = `${diffHours}h ago`;
    } else if (diffDays === 1) {
      relative = "Yesterday";
    } else if (diffDays < 7) {
      relative = `${diffDays}d ago`;
    } else {
      relative = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    return { relative, full };
  } catch {
    return { relative: dateStr, full: dateStr };
  }
}
