"use client";

import { Clock } from "lucide-react";
import { ComingSoonPage } from "@/components/coming-soon";

export default function AuditPage() {
  return (
    <ComingSoonPage
      title="Audit Log"
      description="Immutable, timestamped log of every action on contracts, fields, and register entries for regulatory evidence."
      icon={Clock}
    />
  );
}
