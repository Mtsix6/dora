"use client";

import { cn } from "@/lib/utils";
import type { ConfidenceScore } from "@/types/extraction";

interface ConfidenceBadgeProps {
  confidence: ConfidenceScore;
  className?: string;
}

const CONFIG = {
  high: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "High",
  },
  medium: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Mid",
  },
  low: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Low",
  },
} as const;

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const cfg = CONFIG[confidence.level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums leading-none",
        cfg.bg,
        cfg.text,
        className
      )}
      title={`AI Confidence: ${confidence.value}% (${cfg.label})`}
    >
      <span className={cn("size-1.5 rounded-full flex-shrink-0", cfg.dot)} />
      {confidence.value}%
    </span>
  );
}
