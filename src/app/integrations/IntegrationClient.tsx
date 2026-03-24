"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  CheckCircle2, 
  Lock, 
  ExternalLink, 
  Plug,
  Loader2
} from "lucide-react";
import { toggleIntegration } from "@/app/actions/integrations";
import { toast } from "sonner";

const CATEGORIES = ["All", "Communication", "Project Management", "IT Operations", "Security", "Cloud"];

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  icon: React.ReactNode;
}

export function IntegrationClient({ initialIntegrations }: { initialIntegrations: Integration[] }) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = selectedCategory === "All" 
    ? initialIntegrations 
    : initialIntegrations.filter(i => i.category === selectedCategory);

  async function handleToggle(id: string, name: string, currentStatus: string) {
    if (currentStatus === "Enterprise Only") {
      router.push("/pricing");
      return;
    }

    setLoadingId(id);
    startTransition(async () => {
      try {
        await toggleIntegration(id, name);
        toast.success(currentStatus === "Connected" ? "Integration disconnected" : "Integration connected");
      } catch (err) {
        toast.error("Failed to update integration");
      } finally {
        setLoadingId(null);
      }
    });
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFBFC]">
      {/* Header Section */}
      <div className="px-10 py-12 border-b border-[#E3E8EF] bg-white relative overflow-hidden">
        <div className="relative z-10 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] text-xs font-bold mb-6">
            <Zap className="size-3" />
            Powering Enterprise Workflows
          </div>
          <h1 className="text-4xl font-extrabold text-[#111827] mb-4 tracking-tight">Enterprise Integrations</h1>
          <p className="text-lg text-[#475467] max-w-2xl leading-relaxed">
            Connect DORA ROI to your existing tech stack to automate evidence collection, 
            streamline incident reporting, and unify your compliance posture.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border cursor-pointer",
                selectedCategory === cat 
                  ? "bg-[#111827] text-white border-[#111827]" 
                  : "bg-white text-[#475467] border-[#E3E8EF] hover:border-[#635BFF]/50 hover:bg-[#F9FBFC]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 size-[500px] bg-gradient-to-br from-[#635BFF]/5 to-transparent rounded-full blur-[80px]" />
      </div>

      {/* Grid Section */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((integration) => (
              <div 
                key={integration.id}
                className="group bg-white rounded-2xl border border-[#E3E8EF] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="size-14 rounded-2xl bg-[#F9FBFC] border border-[#E3E8EF] flex items-center justify-center group-hover:bg-white transition-colors shadow-inner">
                    {integration.icon}
                  </div>
                  {integration.status === "Connected" ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 uppercase">
                      <CheckCircle2 className="size-3" />
                      Active
                    </span>
                  ) : integration.status === "Enterprise Only" ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#635BFF] px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 uppercase">
                      <Lock className="size-3" />
                      Upgrade
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#667085] px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 uppercase">
                      Available
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-[#111827] mb-2">{integration.name}</h3>
                <p className="text-sm text-[#475467] leading-relaxed mb-6 flex-1">
                  {integration.description}
                </p>

                <div className="pt-6 border-t border-[#F9FBFC] mt-auto">
                  <Button 
                    variant={integration.status === "Connected" ? "outline" : "default"}
                    className={cn(
                      "w-full h-11 font-bold text-xs rounded-xl transition-all",
                      integration.status === "Connected" 
                        ? "border-[#E3E8EF] text-[#111827] hover:bg-gray-50" 
                        : "bg-[#111827] text-white hover:bg-gray-900 shadow-md"
                    )}
                    onClick={() => handleToggle(integration.id, integration.name, integration.status)}
                    disabled={loadingId === integration.id}
                  >
                    {loadingId === integration.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        {integration.status === "Connected" ? "Disconnect" : "Connect Now"}
                        <ExternalLink className="size-3 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 rounded-3xl bg-[#111827] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-[#635BFF] flex items-center justify-center">
                      <Plug className="size-5" />
                    </div>
                    Need a custom integration?
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Our API allows you to build custom connectors for your proprietary systems. 
                    Access our developer portal to get started with API keys and detailed SDK documentation.
                  </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <Button
                    className="flex-1 md:flex-none h-12 px-8 bg-[#635BFF] hover:bg-[#5249E0] text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95"
                    onClick={() => {
                      const quickstart = [
                        "# DORA ROI Developer Quickstart",
                        "",
                        "Base URLs:",
                        "- GET /api/contracts",
                        "- GET /api/audit-log",
                        "- GET /api/notifications",
                        "",
                        "Use an API key generated in Enterprise Management for future connector support.",
                      ].join("\\n");
                      const blob = new Blob([quickstart], { type: "text/markdown;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const anchor = document.createElement("a");
                      anchor.href = url;
                      anchor.download = "dora-roi-developer-quickstart.md";
                      anchor.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Developer Docs
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none h-12 px-8 bg-transparent border-white/20 text-white hover:bg-white/10 font-bold rounded-xl"
                    onClick={() => {
                      window.location.href = "mailto:sales@dora-roi.eu?subject=Custom%20Integration%20Request";
                    }}
                  >
                     Request Feature
                  </Button>
                </div>
             </div>
             <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-96 bg-[#635BFF]/10 blur-[120px] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
