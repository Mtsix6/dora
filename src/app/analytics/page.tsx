"use client";

import { BarChart3 } from "lucide-react";
import { ComingSoonPage } from "@/components/coming-soon";

export default function AnalyticsPage() {
  return (
    <ComingSoonPage
      title="Compliance Analytics"
      description="Trend reports, confidence score distribution, extraction velocity, and benchmarking across your register."
      icon={BarChart3}
    />
  );
}
