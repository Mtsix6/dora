"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateReportButtonProps {
  reportType: string;
  reportTitle: string;
}

export function GenerateReportButton({
  reportType,
  reportTitle,
}: GenerateReportButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: reportTitle,
          type: reportType,
          format: "PDF",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to generate report");
      }

      toast.success(`${reportTitle} generated successfully`);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate report",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={loading}
      className="text-[12px] border-[#E3E8EF] text-[#0A2540] hover:bg-[#F6F9FC] w-full"
    >
      {loading ? (
        <>
          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
          Generating...
        </>
      ) : (
        "Generate"
      )}
    </Button>
  );
}
