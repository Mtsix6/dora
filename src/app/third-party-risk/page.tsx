"use client";

import { Building2, ShieldAlert, FileCheck2, Users, AlertTriangle, ArrowRight, Plus } from "lucide-react";
import { ComingSoonPage } from "@/components/coming-soon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/format";

const stats = [
  { title: "Total Vendors", value: "48", icon: Building2, color: "text-[#635BFF]", bg: "bg-[#635BFF]/10" },
  { title: "Critical ICT Providers", value: "12", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { title: "Compliant Contracts", value: "85%", icon: FileCheck2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Subcontractors", value: "156", icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
];

const vendors = [
  { id: "VND-AWS", name: "Amazon Web Services", category: "Cloud Infrastructure", criticality: "Critical", status: "Compliant", nextReview: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString() },
  { id: "VND-MSFT", name: "Microsoft Azure", category: "Cloud Infrastructure", criticality: "Critical", status: "Review Pending", nextReview: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString() },
  { id: "VND-DDOG", name: "Datadog", category: "Monitoring", criticality: "High", status: "Compliant", nextReview: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString() },
  { id: "VND-OKTA", name: "Okta", category: "Identity", criticality: "Critical", status: "Non-Compliant", nextReview: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
];

function getCriticalityColor(criticality: string) {
  switch (criticality) {
    case "Critical": return "bg-red-50 text-red-700 border-red-200";
    case "High": return "bg-amber-50 text-amber-700 border-amber-200";
    default: return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Compliant": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Review Pending": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Non-Compliant": return "bg-red-50 text-red-700 border-red-200";
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function ThirdPartyRiskPage() {
  const handleAddVendor = () => {
    toast.success("Add Vendor Dialog opened", {
      description: "Onboard a new third-party ICT service provider.",
    });
  };

  const dashboardContent = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h2 className="text-lg font-bold text-[#0A2540] tracking-tight">Vendor Management</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Monitor and manage risk exposure from ICT third-party providers</p>
        </div>
        <Button onClick={handleAddVendor} className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white btn-lift">
          <Plus className="size-3.5 mr-1.5" />
          Add Vendor
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-[#E3E8EF] shadow-none bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.title}</p>
                  <div className={cn("size-7 rounded-md flex items-center justify-center", stat.bg)}>
                    <Icon className={cn("size-3.5", stat.color)} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#0A2540] tabular-nums">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-[#E3E8EF] shadow-none bg-white">
        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Information Register (Art. 28)</CardTitle>
          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-[#635BFF] px-2" onClick={() => toast.info("View full register")}>
            Full register <ArrowRight className="size-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#F6F9FC]">
              <TableRow>
                <TableHead className="w-[180px] text-[11px] font-semibold text-muted-foreground">Provider</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground">Category</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground">Criticality</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground">DORA Status</TableHead>
                <TableHead className="text-right text-[11px] font-semibold text-muted-foreground">Next Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-[#F6F9FC]/50 transition-colors">
                  <TableCell className="font-semibold text-[12px] text-[#0A2540]">
                    <div className="flex flex-col">
                       <span>{vendor.name}</span>
                       <span className="font-normal text-[11px] text-muted-foreground">{vendor.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[12px] text-[#0A2540] font-medium">{vendor.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold h-auto py-0.5", getCriticalityColor(vendor.criticality))}>
                      {vendor.criticality}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold h-auto py-0.5", getStatusColor(vendor.status))}>
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-[12px] text-muted-foreground tabular-nums">
                     {new Date(vendor.nextReview).getTime() < Date.now() ? (
                        <span className="text-red-600 font-semibold">Overdue ({formatRelativeTime(vendor.nextReview)})</span>
                     ) : (
                        formatRelativeTime(vendor.nextReview)
                     )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ComingSoonPage
      title="Third-Party Risk Management"
      description="Monitor and manage risk exposure from ICT third-party service providers."
      icon={Building2}
      article="DORA Art. 28-44"
      requiredTier="PRO"
    >
      {dashboardContent}
    </ComingSoonPage>
  );
}
