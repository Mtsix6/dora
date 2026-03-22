import type { Metadata } from "next";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileClock,
  FileText,
  Inbox,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Compliance Analytics" };

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  const [total, pending, extracted, approved, rejected, failed, processing] = await Promise.all([
    prisma.contract.count({ where: { workspaceId } }),
    prisma.contract.count({ where: { workspaceId, status: "PENDING" } }),
    prisma.contract.count({ where: { workspaceId, status: "EXTRACTED" } }),
    prisma.contract.count({ where: { workspaceId, status: "APPROVED" } }),
    prisma.contract.count({ where: { workspaceId, status: "REJECTED" } }),
    prisma.contract.count({ where: { workspaceId, status: "FAILED" } }),
    prisma.contract.count({ where: { workspaceId, status: "PROCESSING" } }),
  ]);

  // Confidence analysis
  const allContracts = await prisma.contract.findMany({
    where: { workspaceId, extractedData: { not: undefined } },
    select: { extractedData: true },
  });

  let highCount = 0, mediumCount = 0, lowCount = 0, totalConf = 0, totalFields = 0;
  for (const c of allContracts) {
    const data = c.extractedData as Record<string, any>;
    if (!data) continue;
    for (const field of Object.values(data)) {
      if (typeof field?.confidence === "number") {
        totalConf += field.confidence;
        totalFields++;
        if (field.confidence >= 80) highCount++;
        else if (field.confidence >= 60) mediumCount++;
        else lowCount++;
      }
    }
  }
  const avgConfidence = totalFields > 0 ? Math.round(totalConf / totalFields) : 0;
  const allFieldsCount = highCount + mediumCount + lowCount;

  const confDist = allFieldsCount > 0
    ? {
        high: Math.round((highCount / allFieldsCount) * 100),
        medium: Math.round((mediumCount / allFieldsCount) * 100),
        low: Math.round((lowCount / allFieldsCount) * 100),
      }
    : { high: 0, medium: 0, low: 0 };

  const complianceRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

  const statusBreakdown = [
    { label: "Pending", count: pending, color: "bg-slate-400", icon: Clock },
    { label: "Processing", count: processing, color: "bg-blue-500", icon: FileText },
    { label: "Extracted", count: extracted, color: "bg-amber-500", icon: FileCheck2 },
    { label: "Approved", count: approved, color: "bg-emerald-500", icon: CheckCircle2 },
    { label: "Rejected", count: rejected, color: "bg-red-500", icon: XCircle },
    { label: "Failed", count: failed, color: "bg-red-300", icon: XCircle },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
        <div>
          <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">Compliance Analytics</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Trend reports, confidence distribution, and compliance posture across your register.
          </p>
        </div>

        {total === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="mx-auto size-14 rounded-2xl bg-[#F6F9FC] border border-[#E3E8EF] flex items-center justify-center mb-4">
                <Inbox className="size-6 text-muted-foreground/40" />
              </div>
              <p className="text-[14px] font-semibold text-[#0A2540]">No data yet</p>
              <p className="text-[12px] text-muted-foreground mt-1">
                Upload contracts to see analytics and compliance metrics.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Top KPIs */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: "Total Contracts", value: total, icon: FileText, color: "text-[#635BFF]", bg: "bg-[#635BFF]/8" },
                { label: "Compliance Rate", value: `${complianceRate}%`, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Avg. Confidence", value: `${avgConfidence}%`, icon: TrendingUp, color: avgConfidence >= 80 ? "text-emerald-600" : "text-amber-600", bg: avgConfidence >= 80 ? "bg-emerald-50" : "bg-amber-50" },
                { label: "Rejection Rate", value: `${rejectionRate}%`, icon: XCircle, color: rejectionRate > 20 ? "text-red-600" : "text-muted-foreground", bg: rejectionRate > 20 ? "bg-red-50" : "bg-[#F6F9FC]" },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <Card key={kpi.label} className="border-[#E3E8EF] shadow-none bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                        <div className={cn("size-7 rounded-md flex items-center justify-center", kpi.bg)}>
                          <Icon className={cn("size-3.5", kpi.color)} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-[#0A2540] tabular-nums">{kpi.value}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Status breakdown */}
              <Card className="border-[#E3E8EF] shadow-none bg-white">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Contract Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 flex flex-col gap-3">
                  {statusBreakdown.map((row) => {
                    const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
                    const Icon = row.icon;
                    return (
                      <div key={row.label}>
                        <div className="flex justify-between mb-1 items-center">
                          <div className="flex items-center gap-1.5">
                            <Icon className="size-3 text-muted-foreground" />
                            <span className="text-[12px] text-[#0A2540] font-medium">{row.label}</span>
                          </div>
                          <span className="text-[12px] text-muted-foreground tabular-nums font-semibold">
                            {row.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#F6F9FC] overflow-hidden">
                          <div className={cn("h-full rounded-full", row.color)} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Confidence distribution */}
              <Card className="border-[#E3E8EF] shadow-none bg-white">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Confidence Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 flex flex-col gap-3">
                  {[
                    { label: "High (≥80%)", pct: confDist.high, count: highCount, color: "bg-emerald-500" },
                    { label: "Medium (60–79%)", pct: confDist.medium, count: mediumCount, color: "bg-amber-500" },
                    { label: "Low (<60%)", pct: confDist.low, count: lowCount, color: "bg-red-500" },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[12px] text-[#0A2540] font-medium">{row.label}</span>
                        <span className="text-[12px] text-muted-foreground tabular-nums font-semibold">
                          {row.count} fields ({row.pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#F6F9FC] overflow-hidden">
                        <div className={cn("h-full rounded-full", row.color)} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                  <Separator className="bg-[#F6F9FC] my-1" />
                  <p className="text-[11px] text-muted-foreground">
                    {allFieldsCount} total fields analyzed across {allContracts.length} contracts.
                    Average confidence: <span className="font-bold text-[#0A2540]">{avgConfidence}%</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
