"use client";

import { Zap } from "lucide-react";
import { ComingSoonPage } from "@/components/coming-soon";

export default function IctRiskPage() {
  return (
    <ComingSoonPage
      title="ICT Risk Management"
      description="Risk identification, protection, detection, response, and recovery framework management."
      icon={Zap}
      article="DORA Art. 5-16"
    />
  );
}
