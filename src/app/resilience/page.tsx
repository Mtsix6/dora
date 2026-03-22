"use client";

import { useEffect, useState } from "react";
import { Shield, PlayCircle, FileCheck, CheckCircle2, History, ArrowRight, ShieldAlert, Plus, Loader2, Inbox } from "lucide-react";
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
import { getDoraData } from "@/app/actions/dora";

const mockStats = [
  { title: "Completed Tests", value: "24", icon: FileCheck, color: "text-[#635BFF]", bg: "bg-[#635BFF]/10" },
  { title: "Active Findings", value: "8", icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50" },
  { title: "Critical Issues", value: "0", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Next Scheduled", value: "14 Days", icon: History, color: "text-blue-600", bg: "bg-blue-50" },
];

const mockTests = [
  { id: "TST-089", name: "Q3 Penetration Test", type: "Penetration Test", status: "Scheduled", date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), findings: 0 },
  { id: "TST-088", name: "Annual TLPT Assessment", type: "TLPT", status: "In Progress", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), findings: 3 },
  { id: "TST-087", name: "Network Vulnerability Scan", type: "Vulnerability Scan", status: "Completed", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), findings: 12 },
  { id: "TST-086", name: "Physical Security Bypass", type: "Red Team", status: "Completed", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(), findings: 2 },
];

function getStatusColor(status: string) {
  switch (status) {
    case "Completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "In Progress": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Scheduled": return "bg-blue-50 text-blue-700 border-blue-200";
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function ResiliencePage() {
  const [data, setData] = useState<any[]>([]);
  const [isTest, setIsTest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoraData().then((res) => {
      setIsTest(res.isTestAccount);
      setData(res.data?.tests || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleScheduleTest = () => {
    toast.success("Test Scheduler opened", {
      description: "Schedule a new penetration test or vulnerability scan.",
    });
  };

  const displayTests = isTest ? mockTests : data.map(d => ({
    id: d.id,
    name: d.name,
    type: d.type,
    status: d.status,
    findings: d.findings || 0,
    date: d.scheduledAt || d.createdAt,
  }));

  const activeObj = data.reduce((acc, d) => acc + (d.findings || 0), 0);

  const displayStats = isTest ? mockStats : [
    { title: "Completed Tests", value: data.filter(d => d.status === "Completed").length.toString(), icon: FileCheck, color: "text-[#635BFF]", bg: "bg-[#635BFF]/10" },
    { title: "Active Findings", value: activeObj.toString(), icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Critical Issues", value: "0", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Next Scheduled", value: data.length > 0 ? "Check Calendar" : "-", icon: History, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  const dashboardContent = loading ? (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="size-6 text-[#635BFF] animate-spin" />
    </div>
  ) : (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h2 className="text-lg font-bold text-[#0A2540] tracking-tight">Testing Schedule & Results</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage Threat-Led Penetration Testing (TLPT) and vulnerability assessments</p>
        </div>
        <Button onClick={handleScheduleTest} className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white btn-lift">
          <Plus className="size-3.5 mr-1.5" />
          Schedule Test
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, i) => {
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
          <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Recent & Upcoming Tests</CardTitle>
          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-[#635BFF] px-2" onClick={() => toast.info("View testing history")}>
            Full history <ArrowRight className="size-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {displayTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="size-12 rounded-full bg-[#F6F9FC] flex items-center justify-center mb-3">
                <Inbox className="size-5 text-muted-foreground" />
              </div>
              <p className="text-[14px] font-semibold text-[#0A2540]">No tests scheduled</p>
              <p className="text-[12px] text-muted-foreground mt-1 max-w-[200px]">You haven't scheduled any resilience tests.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#F6F9FC]">
                <TableRow>
                  <TableHead className="w-[140px] text-[11px] font-semibold text-muted-foreground">Test ID</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Name</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Type</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Findings</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTests.map((test) => (
                  <TableRow key={test.id} className="hover:bg-[#F6F9FC]/50 transition-colors">
                    <TableCell className="font-semibold text-[12px] text-[#0A2540]">
                      <div className="flex items-center gap-2">
                         <PlayCircle className="size-3.5 text-muted-foreground" />
                         <span className="truncate max-w-[80px]">{test.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[12px] font-medium text-[#0A2540]">{test.name}</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">{test.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px] font-semibold h-auto py-0.5", getStatusColor(test.status))}>
                        {test.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                      {test.findings > 0 ? (
                        <span className="text-amber-600 font-semibold">{test.findings} issues</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right text-[12px] text-muted-foreground tabular-nums">{formatRelativeTime(test.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ComingSoonPage
      title="Resilience Testing"
      description="Digital operational resilience testing (TLPT) scheduling and results management."
      icon={Shield}
      article="DORA Art. 24-27"
      requiredTier="PRO"
    >
      {dashboardContent}
    </ComingSoonPage>
  );
}
