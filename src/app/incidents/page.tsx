import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { ComingSoonPage } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Incident Reporting" };

export default function IncidentsPage() {
  return (
    <ComingSoonPage
      title="Incident Reporting"
      description="Major ICT-related incident classification and mandatory reporting to competent authorities."
      icon={AlertTriangle}
      article="DORA Art. 17–23"
    />
  );
}
