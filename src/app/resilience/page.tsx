"use client";

import { Shield } from "lucide-react";
import { ComingSoonPage } from "@/components/coming-soon";

export default function ResiliencePage() {
  return (
    <ComingSoonPage
      title="Resilience Testing"
      description="Digital operational resilience testing (TLPT) scheduling and results management."
      icon={Shield}
      article="DORA Art. 24-27"
    />
  );
}
