"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ExportEvidenceButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      // Create a compliance evidence report
      const createRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "DORA Compliance Evidence Export",
          type: "compliance_summary",
          format: "CSV",
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create report");
      }

      const report = await createRes.json();

      // Download the generated CSV
      const downloadRes = await fetch(`/api/reports/${report.id}/download`);
      if (!downloadRes.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await downloadRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        downloadRes.headers
          .get("Content-Disposition")
          ?.match(/filename="(.+)"/)?.[1] ?? "compliance-evidence.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("Evidence exported", {
        description: "Compliance evidence CSV downloaded successfully.",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to export evidence",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="h-10 border-[#D0D5DD] gap-2"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {loading ? "Exporting..." : "Export Evidence"}
    </Button>
  );
}
