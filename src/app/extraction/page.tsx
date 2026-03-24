"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PdfViewerPanel } from "@/components/pdf-viewer-panel";
import { ExtractionFormPanel } from "@/components/extraction-form-panel";
import { useExtractionStore } from "@/store/extraction-store";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { mapContractStatus } from "@/lib/dora";
import type { ConfidenceLevel, DoraExtractionFields } from "@/types/extraction";

function toField(value: unknown, fallback = "") {
  const rawValue =
    typeof value === "object" && value !== null && "value" in value
      ? (value as { value?: unknown }).value
      : value;
  const rawConfidence =
    typeof value === "object" && value !== null && "confidence" in value
      ? (value as { confidence?: unknown }).confidence
      : 0;
  const confidenceValue =
    typeof rawConfidence === "number" ? Math.max(0, Math.min(100, rawConfidence)) : 0;
  const level: ConfidenceLevel =
    confidenceValue >= 80 ? "high" : confidenceValue >= 60 ? "medium" : "low";

  return {
    value: typeof rawValue === "string" ? rawValue : fallback,
    confidence: { value: confidenceValue, level },
    isEdited: false,
  };
}

function normalizeFields(extractedData: unknown): DoraExtractionFields {
  const data = (extractedData ?? {}) as Record<string, unknown>;
  return {
    entityName: toField(data.entityName),
    leiCode: toField(data.leiCode),
    criticalFunctionTag: toField(data.criticalFunctionTag),
    startDate: toField(data.startDate ?? data.contractStartDate),
    endDate: toField(data.endDate ?? data.contractEndDate),
  };
}

function ExtractionContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { setDocument } = useExtractionStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchContract() {
      try {
        setLoading(true);
        const res = await fetch(`/api/contracts/${id}`);
        if (!res.ok) throw new Error("Contract not found");
        const data = await res.json();
        
        // Map Prisma model to ExtractionDocument type
        setDocument({
          id: data.id,
          filename: data.fileName,
          fileUrl: `/api/contracts/${data.id}/file`,
          mimeType: data.mimeType,
          status: mapContractStatus(data.status),
          uploadedAt: data.createdAt,
          fields: normalizeFields(data.extractedData),
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load contract");
        toast.error("Failed to load contract evidence");
      } finally {
        setLoading(false);
      }
    }

    fetchContract();
  }, [id, setDocument]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground bg-[#F6F9FC]">
        <Loader2 className="size-8 animate-spin text-[#635BFF]" />
        <p className="text-sm font-medium">Loading extraction canvas…</p>
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6 bg-[#F6F9FC]">
        <div className="size-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <AlertCircle className="size-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#0A2540]">
            {!id ? "No Document Selected" : "Failed to Load Document"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {!id 
              ? "Please select a document from the Contracts page to begin extraction."
              : "We couldn't retrieve the document details. It might have been deleted or you don't have access."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full divide-x divide-[#E3E8EF]">
      {/* LEFT — PDF Viewer */}
      <section className="flex-1 min-w-0 overflow-hidden">
        <PdfViewerPanel />
      </section>

      {/* RIGHT — Extraction Form */}
      <section className="w-[400px] flex-shrink-0 overflow-hidden xl:w-[440px]">
        <ExtractionFormPanel />
      </section>
    </div>
  );
}

export default function ExtractionPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="size-8 animate-spin text-[#635BFF]" />
        </div>
      }>
        <ExtractionContent />
      </Suspense>
    </AppShell>
  );
}
