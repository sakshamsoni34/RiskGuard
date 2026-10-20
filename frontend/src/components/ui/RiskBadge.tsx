import React from "react";
import { RiskLevel } from "@/types/fraud";
import { AlertCircle, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({
  level,
  score,
  showIcon = true,
  className = "",
  size = "md",
}: RiskBadgeProps) {
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
      border: "border-emerald-500/25",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      label: "Low Risk",
      icon: ShieldCheck,
    },
    MEDIUM: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
      text: "text-amber-400",
      dot: "bg-amber-400",
      label: "Medium Risk",
      icon: AlertTriangle,
    },
    HIGH: {
      bg: "bg-rose-500/10",
      border: "border-rose-500/25",
      text: "text-rose-400",
      dot: "bg-rose-400",
      label: "High Risk",
      icon: ShieldAlert,
    },
    CRITICAL: {
      bg: "bg-rose-600/15",
      border: "border-rose-500/40",
      text: "text-rose-300 font-semibold",
      dot: "bg-rose-400",
      label: "Critical",
      icon: AlertCircle,
    },
  };

  const config = configs[level] || configs.LOW;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <span
      data-testid={`risk-badge-${level.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} rounded-full font-medium border ${config.bg} ${config.border} ${config.text} ${className} transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-90" />}
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="font-mono text-[10px] opacity-75 ml-0.5">
          ({Math.round(score)})
        </span>
      )}
    </span>
  );
}
