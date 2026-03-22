"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/lib/dora";

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  extracting: {
    label: "Extracting…",
    className: "bg-blue-50 text-blue-600 border-blue-200 animate-pulse",
  },
  review: {
    label: "In Review",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

interface StatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-semibold rounded-full px-2 py-0.5 h-auto leading-none",
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </Badge>
  );
}
