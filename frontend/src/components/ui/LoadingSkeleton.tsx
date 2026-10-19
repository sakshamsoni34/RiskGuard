import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-800/60 rounded-md border border-slate-700/20 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="fintech-card p-5 rounded-xl border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-36" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-800/60 gap-4">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
