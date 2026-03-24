"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Download,
  FileDown,
  ShieldCheck,
  Activity,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Template card (generates a report on click) ──────────────────

const REPORT_TEMPLATES = [
  {
    id: "compliance_summary",
    name: "DORA Compliance Summary",
    description:
      "Comprehensive audit of all 5 DORA pillars for regulatory submission.",
    icon: <ShieldCheck className="size-5 text-[#635BFF]" />,
    category: "Regulatory",
    format: "CSV",
  },
  {
    id: "risk_assessment",
    name: "ICT Risk Landscape",
    description:
      "Detailed mapping of assets, threats, and current mitigation status.",
    icon: <Activity className="size-5 text-amber-500" />,
    category: "Risk",
    format: "CSV",
  },
  {
    id: "incident_report",
    name: "Quarterly Incident Analytics",
    description:
      "Breakdown of incident frequency, severity, and resolution times.",
    icon: <TrendingUp className="size-5 text-emerald-500" />,
    category: "Operations",
    format: "CSV",
  },
] as const;

export function TemplateCards() {
  const router = useRouter();
  const [generating, setGenerating] = useState<string | null>(null);

  async function handleGenerate(template: (typeof REPORT_TEMPLATES)[number]) {
    setGenerating(template.id);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: template.name,
          type: template.id,
          format: template.format,
        }),
      });
      if (!res.ok) throw new Error("Failed to create report");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {REPORT_TEMPLATES.map((template) => (
        <button
          key={template.id}
          disabled={generating === template.id}
          onClick={() => handleGenerate(template)}
          className="group p-6 rounded-2xl border border-[#E3E8EF] bg-white hover:border-[#635BFF]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer text-left disabled:opacity-60"
        >
          <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-[#635BFF]/5 transition-colors">
            {generating === template.id ? (
              <Loader2 className="size-5 text-[#635BFF] animate-spin" />
            ) : (
              template.icon
            )}
          </div>
          <h3 className="font-bold text-[#111827] mb-2">{template.name}</h3>
          <p className="text-xs text-[#475467] leading-relaxed mb-6 flex-1">
            {template.description}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
              {template.category}
            </span>
            <span className="text-[#635BFF] hover:text-[#5249E0] transition-colors">
              <ArrowRight className="size-4" />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Search + Export toolbar ──────────────────────────────────────

export function ReportVaultToolbar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearch(value: string) {
    setQuery(value);
    startTransition(() => {
      const params = new URLSearchParams();
      if (value) params.set("q", value);
      router.replace(`/reports${params.toString() ? `?${params}` : ""}`);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search vaults..."
          className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#635BFF] w-64"
        />
      </div>
      <Button variant="outline" className="rounded-xl border-gray-200">
        <FileDown className="size-4 mr-2" />
        Export
      </Button>
    </div>
  );
}

// ── Download button per report row ──────────────────────────────

export function DownloadButton({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/download`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?(.+?)"?$/);
      const filename = match?.[1] ?? `report-${reportId}.csv`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="p-2 rounded-lg hover:bg-white hover:shadow-md transition-all text-gray-400 hover:text-[#111827] disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
    </button>
  );
}
