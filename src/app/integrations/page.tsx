"use client";

import { AppShell } from "@/components/app-shell";
import { 
  Plug, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Zap,
  Globe,
  Lock,
  MessageSquare,
  BarChart3,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Communication", "Project Management", "IT Operations", "Security", "Cloud"];

const INTEGRATIONS = [
  { 
    id: "slack", 
    name: "Slack", 
    description: "Receive real-time compliance alerts and incident notifications via Slack channels.", 
    category: "Communication", 
    status: "Connected", 
    icon: <MessageSquare className="size-6 text-[#4A154B]" /> 
  },
  { 
    id: "msteams", 
    name: "Microsoft Teams", 
    description: "Integrate DORA alerts directly into your organization's Teams workspace.", 
    category: "Communication", 
    status: "Available", 
    icon: <Globe className="size-6 text-[#6264A7]" /> 
  },
  { 
    id: "jira", 
    name: "Jira Software", 
    description: "Automatically create and track compliance remediation tasks as Jira issues.", 
    category: "Project Management", 
    status: "Connected", 
    icon: <BarChart3 className="size-6 text-[#0052CC]" /> 
  },
  { 
    id: "servicenow", 
    name: "ServiceNow", 
    description: "Sync DORA incidents with ServiceNow ITSM for enterprise-scale handling.", 
    category: "IT Operations", 
    status: "Enterprise Only", 
    icon: <Plug className="size-6 text-[#81B5A1]" /> 
  },
  { 
    id: "github", 
    name: "GitHub", 
    description: "Scan repositories for compliance in code and infrastructure-as-code files.", 
    category: "Security", 
    status: "Available", 
    icon: <Globe className="size-6 text-[#181717]" /> 
  },
  { 
    id: "aws", 
    name: "Amazon Web Services", 
    description: "Auto-discovery of ICT assets and real-time security configuration monitoring.", 
    category: "Cloud", 
    status: "Connected", 
    icon: <Globe className="size-6 text-[#FF9900]" /> 
  },
  { 
    id: "azure", 
    name: "Microsoft Azure", 
    description: "Direct integration with Azure Policy and Security Center for unified compliance.", 
    category: "Cloud", 
    status: "Available", 
    icon: <Globe className="size-6 text-[#0089D6]" /> 
  },
];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = selectedCategory === "All" 
    ? INTEGRATIONS 
    : INTEGRATIONS.filter(i => i.category === selectedCategory);

  return (
    <AppShell>
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
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border",
                  selectedCategory === cat 
                    ? "bg-[#111827] text-white border-[#111827]" 
                    : "bg-white text-[#475467] border-[#E3E8EF] hover:border-[#635BFF]/50 hover:bg-[#F9FBFC]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Abstract background shape */}
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
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                        <CheckCircle2 className="size-3" />
                        ACTIVE
                      </span>
                    ) : integration.status === "Enterprise Only" ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#635BFF] px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                        <Lock className="size-3" />
                        UPGRADE
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
                    >
                      {integration.status === "Connected" ? "Manage Integration" : "Connect Now"}
                      <ExternalLink className="size-3 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Integration CTA */}
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
                    <Button className="flex-1 md:flex-none h-12 px-8 bg-[#635BFF] hover:bg-[#5249E0] text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">
                      Developer Docs
                    </Button>
                    <Button variant="outline" className="flex-1 md:flex-none h-12 px-8 bg-transparent border-white/20 text-white hover:bg-white/10 font-bold rounded-xl">
                       Request Feature
                    </Button>
                  </div>
               </div>
               {/* Background effect */}
               <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-96 bg-[#635BFF]/10 blur-[120px] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
