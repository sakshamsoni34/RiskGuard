import React from "react";
import { RiskLevel } from "@/types/fraud";
import { AlertCircle, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showIcon?: boolean;
  className?: string;
}

export function RiskBadge({ level, score, showIcon = true, className = "" }: RiskBadgeProps) {
  const configs: Record<
    RiskLevel,
    {
      bg: string;
      border: string;
      text: string;
      dot: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
    }
  > = {
    LOW: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      label: "LOW RISK",
      icon: ShieldCheck,
    },
    MEDIUM: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      dot: "bg-amber-400",
      label: "MEDIUM RISK",
      icon: AlertTriangle,
    },
    HIGH: {
      bg: "bg-rose-500/15",
      border: "border-rose-500/40",
      text: "text-rose-400",
      dot: "bg-rose-400",
      label: "HIGH RISK",
      icon: ShieldAlert,
    },
    CRITICAL: {
      bg: "bg-red-950/60",
      border: "border-red-500/70",
      text: "text-red-300 font-bold",
      dot: "bg-red-500 animate-ping",
      label: "CRITICAL",
      icon: AlertCircle,
    },
  };

  const config = configs[level] || configs.LOW;
  const Icon = config.icon;

  return (
    <span
      data-testid={`risk-badge-${level.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${config.bg} ${config.border} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-80 font-mono text-[10px] ml-0.5">({Math.round(score)})</span>
      )}
    </span>
  );
}
