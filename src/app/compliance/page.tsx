"use client";

import { AppShell } from "@/components/app-shell";
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  FileText, 
  Search,
  Download,
  Filter
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const COMPLIANCE_METRICS = [
  { label: "Overall Score", value: "94%", change: "+2%", status: "success" },
  { label: "Active Controls", value: "142", change: "0", status: "neutral" },
  { label: "Open Issues", value: "12", change: "-3", status: "success" },
  { label: "Next Audit", value: "12 days", change: "Scheduled", status: "warning" },
];

const RECENT_CHECKS = [
  { id: "1", resource: "Azure SQL Database", control: "Data Encryption at Rest", status: "Passed", date: "2 mins ago" },
  { id: "2", resource: "Identity Service", control: "MFA Enforcement", status: "Passed", date: "15 mins ago" },
  { id: "3", resource: "S3 Bucket: artifacts-prod", control: "Public Access Block", status: "Failed", date: "1 hour ago" },
  { id: "4", resource: "Kubernetes Cluster", control: "Resource Limits", status: "Warning", date: "3 hours ago" },
  { id: "5", resource: "Payment Gateway API", control: "TLS 1.2+ Only", status: "Passed", date: "5 hours ago" },
];

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AppShell>
      <div className="flex flex-col h-full bg-[#FAFBFC]">
        {/* Header */}
        <div className="px-8 py-8 border-b border-[#E3E8EF] bg-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="size-5 text-[#635BFF]" />
                <h1 className="text-2xl font-bold text-[#111827]">Compliance & Governance</h1>
              </div>
              <p className="text-sm text-[#475467]">Real-time monitoring of DORA regulatory requirements and internal controls.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-10 border-[#D0D5DD] gap-2">
                <Download className="size-4" />
                Export Evidence
              </Button>
              <Button className="h-10 bg-[#635BFF] hover:bg-[#5249E0] text-white gap-2 shadow-sm font-medium">
                Add New Control
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPLIANCE_METRICS.map((metric) => (
              <div key={metric.label} className="p-4 rounded-xl border border-[#E3E8EF] bg-white shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-[#667085] mb-1">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-[#111827]">{metric.value}</span>
                  <span className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                    metric.status === "success" ? "bg-emerald-50 text-emerald-700" :
                    metric.status === "warning" ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-700"
                  )}>
                    {metric.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
          {/* Main Table Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E3E8EF] shadow-sm overflow-hidden text-[#111827]">
              <div className="px-6 py-4 border-b border-[#E3E8EF] flex items-center justify-between bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Recent Compliance Checks</h3>
                <div className="flex items-center gap-2">
                   <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Filter checks..." 
                        className="pl-8 pr-4 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#635BFF] w-48"
                      />
                   </div>
                   <Button variant="ghost" size="sm" className="h-8 text-gray-500">
                     <Filter className="size-3.5 mr-1" />
                     Filter
                   </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-[#475467] text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3">Resource / System</th>
                      <th className="px-6 py-3">Control Mapping</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Last Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {RECENT_CHECKS.map((check) => (
                      <tr key={check.id} className="hover:bg-[#F9FBFC] transition-colors group">
                        <td className="px-6 py-4 font-medium text-[#111827]">{check.resource}</td>
                        <td className="px-6 py-4 text-[#475467]">{check.control}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                            check.status === "Passed" ? "bg-emerald-50 text-emerald-700" :
                            check.status === "Failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                          )}>
                            {check.status === "Passed" ? <CheckCircle2 className="size-3" /> : 
                             check.status === "Failed" ? <AlertTriangle className="size-3" /> : <Clock className="size-3" />}
                            {check.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-[#667085] text-xs font-medium">{check.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-[#E3E8EF] bg-gray-50/50">
                <button className="text-xs font-semibold text-[#635BFF] hover:text-[#5249E0] flex items-center gap-1 ml-auto">
                  View Full Audit Vault
                  <ArrowUpRight className="size-3" />
                </button>
              </div>
            </div>

            {/* Regulatory Mapping Card */}
            <div className="bg-[#111827] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-white">
                   <div className="size-8 rounded-lg bg-[#635BFF] flex items-center justify-center">
                     <FileText className="size-4" />
                   </div>
                   DORA Articles Mapping
                 </h3>
                 <p className="text-gray-400 text-sm mb-6 max-w-md">Your infrastructure is mapped against 14 DORA articles across all 5 pillars.</p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">ICT Risk Management</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">Articles 5-16</span>
                        <span className="text-xs text-emerald-400 font-bold">100% Match</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Incident Management</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">Articles 17-23</span>
                        <span className="text-xs text-blue-400 font-bold">85% Complete</span>
                      </div>
                    </div>
                 </div>
               </div>
               {/* Background Glow */}
               <div className="absolute -right-20 -bottom-20 size-64 bg-[#635BFF]/20 blur-[100px] rounded-full" />
            </div>
          </div>

          {/* Sidebar / Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E3E8EF] p-6 shadow-sm">
              <h3 className="font-bold text-[#111827] mb-4">Integrity Monitoring</h3>
              <div className="space-y-4">
                {[
                  { label: "Configuration Drift", value: "Locked", color: "emerald" },
                  { label: "Unauthorized Access", value: "Zero (24h)", color: "emerald" },
                  { label: "Pending Approvals", value: "4 Actions", color: "amber" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-[#F9FBFC] border border-[#E3E8EF]">
                    <span className="text-xs font-medium text-[#475467]">{item.label}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md",
                      item.color === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 h-9 rounded-lg border border-[#E3E8EF] text-xs font-semibold text-[#111827] hover:bg-[#F9FBFC] transition-colors">
                Run Manual Scan
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#635BFF] to-[#5249E0] rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
               <div className="relative z-10">
                 <h4 className="font-bold mb-2">Compliance AI Copilot</h4>
                 <p className="text-xs text-white/80 leading-relaxed mb-4">
                   DORA AI has identified 3 improvements for your Third-Party Risk framework.
                 </p>
                 <Button className="w-full bg-white text-[#635BFF] hover:bg-white/90 font-bold text-xs h-9">
                   Review Improvements
                 </Button>
               </div>
               <div className="absolute top-0 right-0 p-4 opacity-20">
                 <Shield className="size-16" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
