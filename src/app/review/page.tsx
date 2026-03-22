"use client";

import { FileClock } from "lucide-react";
import { ComingSoonPage } from "@/components/coming-soon";

export default function ReviewPage() {
  return (
    <ComingSoonPage
      title="In Review"
      description="Documents awaiting compliance officer review, prioritised by confidence score and urgency."
      icon={FileClock}
    />
  );
}
