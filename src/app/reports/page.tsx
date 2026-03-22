"use client";

import { AppShell } from "@/components/app-shell";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  ArrowRight, 
  Plus, 
  Clock, 
  FileDown,
  PieChart,
  Activity,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const REPORT_TEMPLATES = [
  { id: "dora-compliance", name: "DORA Compliance Summary", description: "Comprehensive audit of all 5 DORA pillars for regulatory submission.", icon: <ShieldCheck className="size-5 text-[#635BFF]" />, category: "Regulatory" },
  { id: "risk-assessment", name: "ICT Risk Landscape", description: "Detailed mapping of assets, threats, and current mitigation status.", icon: <Activity className="size-5 text-amber-500" />, category: "Risk" },
  { id: "incident-report", name: "Quarterly Incident Analytics", description: "Breakdown of incident frequency, severity, and resolution times.", icon: <TrendingUp className="size-5 text-emerald-500" />, category: "Operations" },
];

const RECENT_REPORTS = [
  { id: "REP-001", name: "Annual Resilience Test Results", type: "PDF", date: "Oct 24, 2026", size: "2.4 MB", status: "Ready" },
  { id: "REP-002", name: "Third-Party Vendor Audit: Q3", type: "XLSX", date: "Oct 20, 2026", size: "1.1 MB", status: "Ready" },
  { id: "REP-003", name: "Infrastructure Mapping v2", type: "PDF", date: "Oct 15, 2026", size: "8.9 MB", status: "Archived" },
  { id: "REP-004", name: "Board Compliance Overview", type: "PPTX", date: "Oct 10, 2026", size: "12.5 MB", status: "Ready" },
];

export default function ReportsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <AppShell>
      <div className="flex flex-col h-full bg-[#FAFBFC]">
        {/* Top Header */}
        <div className="px-8 py-10 border-b border-[#E3E8EF] bg-white">
          <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="size-5 text-[#635BFF]" />
                <h1 className="text-2xl font-bold text-[#111827]">Reporting Center</h1>
              </div>
              <p className="text-sm text-[#475467]">Generate, schedule, and export investor-ready compliance reports.</p>
            </div>
            <Button className="bg-[#635BFF] hover:bg-[#5249E0] text-white shadow-lg h-11 px-6 font-bold rounded-xl gap-2">
              <Plus className="size-4" />
              Custom Report
            </Button>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {REPORT_TEMPLATES.map((template) => (
              <div key={template.id} className="group p-6 rounded-2xl border border-[#E3E8EF] bg-white hover:border-[#635BFF]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer">
                <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-[#635BFF]/5 transition-colors">
                  {template.icon}
                </div>
                <h3 className="font-bold text-[#111827] mb-2">{template.name}</h3>
                <p className="text-xs text-[#475467] leading-relaxed mb-6 flex-1">{template.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                  <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">{template.category}</span>
                  <button className="text-[#635BFF] hover:text-[#5249E0] transition-colors">
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-[#E3E8EF] shadow-sm overflow-hidden">
               <div className="px-6 py-5 border-b border-[#E3E8EF] flex items-center justify-between bg-gray-50/30">
                  <h2 className="text-lg font-bold text-[#111827]">Report Vault</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search vaults..." 
                        className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#635BFF] w-64"
                      />
                    </div>
                    <Button variant="outline" className="rounded-xl border-gray-200">
                      <FileDown className="size-4 mr-2" />
                      Export
                    </Button>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F9FBFC] text-[11px] font-bold text-[#667085] uppercase tracking-widest ">
                    <tr>
                      <th className="px-6 py-4">Report Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Generated Date</th>
                      <th className="px-6 py-4">Size</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {RECENT_REPORTS.map((report) => (
                      <tr key={report.id} className="group hover:bg-[#F9FBFC] transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#635BFF]/10 group-hover:text-[#635BFF] transition-colors">
                              <FileText className="size-4" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-[#111827]">{report.name}</p>
                               <p className="text-[10px] text-[#667085] font-medium">{report.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                             {report.type}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#475467] font-medium">{report.date}</td>
                        <td className="px-6 py-5 text-sm text-[#667085] font-medium">{report.size}</td>
                        <td className="px-6 py-5">
                           <span className={cn(
                             "text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-inset",
                             report.status === "Ready" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-gray-50 text-gray-600 ring-gray-500/10"
                           )}>
                             {report.status}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 rounded-lg hover:bg-white hover:shadow-md transition-all text-gray-400 hover:text-[#111827]">
                            <Download className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
               
               <div className="px-6 py-4 border-t border-[#E3E8EF] flex items-center justify-between text-[#667085]">
                  <p className="text-xs font-medium italic opacity-80">Showing last 4 generated reports</p>
                  <button className="text-xs font-bold text-[#635BFF] hover:underline">View archive</button>
               </div>
            </div>

            {/* Automation Banner */}
            <div className="bg-gradient-to-r from-[#111827] to-[#1F2937] p-8 rounded-3xl relative overflow-hidden shadow-2xl border border-white/5">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-xl">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                       <Clock className="size-5 text-blue-400" />
                       Automated Scheduling
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Configure automated report delivery for your board, auditors, or regulators. 
                      Set monthly intervals for DORA compliance summaries and never miss a deadline.
                    </p>
                  </div>
                  <Button className="w-full md:w-auto bg-white text-[#111827] hover:bg-gray-100 font-bold px-10 h-12 rounded-xl">
                    Configure Schedule
                  </Button>
                </div>
                {/* Visual accents */}
                <div className="absolute top-0 right-0 h-full w-48 bg-gradient-to-l from-[#635BFF]/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
