"use client";

import { AlertTriangle, Clock, Activity, ShieldAlert, Plus, ArrowRight, FileText } from "lucide-react";
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
  { title: "Open Incidents", value: "3", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { title: "Critical Severity", value: "1", icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50" },
  { title: "Avg. Resolution Time", value: "4.2h", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Total This Month", value: "12", icon: Activity, color: "text-[#635BFF]", bg: "bg-[#635BFF]/10" },
];

const incidents = [
  { id: "INC-2026-042", title: "Core Banking API Latency", severity: "Critical", status: "Investigating", reportedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), owner: "Network Team" },
  { id: "INC-2026-041", title: "Payment Gateway Timeout", severity: "High", status: "Mitigated", reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), owner: "Cloud Ops" },
  { id: "INC-2026-040", title: "Third-party Data Feed Delay", severity: "Medium", status: "Resolved", reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), owner: "Data Eng" },
  { id: "INC-2026-039", title: "Authentication Service Degraded", severity: "High", status: "Resolved", reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), owner: "Identity Team" },
];

function getSeverityColor(severity: string) {
  switch (severity) {
    case "Critical": return "bg-red-50 text-red-700 border-red-200";
    case "High": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Medium": return "bg-blue-50 text-blue-700 border-blue-200";
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Investigating": return "bg-purple-50 text-purple-700 border-purple-200";
    case "Mitigated": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Resolved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function IncidentsPage() {
  const handleReportIncident = () => {
    toast.success("Incident Report Dialog opened", {
      description: "In a real environment, this would open a form to classify and report an ICT incident.",
    });
  };

  const dashboardContent = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h2 className="text-lg font-bold text-[#0A2540] tracking-tight">Active Overview</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Monitor and classify major ICT-related incidents</p>
        </div>
        <Button onClick={handleReportIncident} className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white btn-lift">
          <Plus className="size-3.5 mr-1.5" />
          Report Incident
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
          <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Incidents</CardTitle>
          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-[#635BFF] px-2" onClick={() => toast.info("View all incidents")}>
            View all <ArrowRight className="size-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#F6F9FC]">
              <TableRow>
                <TableHead className="w-[120px] text-[11px] font-semibold text-muted-foreground">ID</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground">Title</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground">Severity</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground">Owner</TableHead>
                <TableHead className="text-right text-[11px] font-semibold text-muted-foreground">Reported</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id} className="hover:bg-[#F6F9FC]/50 transition-colors">
                  <TableCell className="font-semibold text-[12px] text-[#0A2540]">
                    <div className="flex items-center gap-2">
                       <FileText className="size-3.5 text-muted-foreground" />
                       {incident.id}
                    </div>
                  </TableCell>
                  <TableCell className="text-[12px] font-medium text-[#0A2540]">{incident.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold h-auto py-0.5", getSeverityColor(incident.severity))}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold h-auto py-0.5", getStatusColor(incident.status))}>
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[12px] text-muted-foreground">{incident.owner}</TableCell>
                  <TableCell className="text-right text-[12px] text-muted-foreground tabular-nums">{formatRelativeTime(incident.reportedAt)}</TableCell>
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
      title="Incident Reporting"
      description="Major ICT-related incident classification and mandatory reporting to competent authorities."
      icon={AlertTriangle}
      article="DORA Art. 17-23"
      requiredTier="PRO"
    >
      {dashboardContent}
    </ComingSoonPage>
  );
}
