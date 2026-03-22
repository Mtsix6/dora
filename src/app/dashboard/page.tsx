import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileClock,
  FileText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatRelativeTime, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { UploadDialog } from "@/components/upload-dialog";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    redirect("/login");
  }

  const workspaceId = session.user.workspaceId;

  // Aggregate stats from Prisma
  const [totalContracts, pendingReview, approvedThisMonth, allContracts] = await Promise.all([
    prisma.contract.count({ where: { workspaceId } }),
    prisma.contract.count({ where: { workspaceId, status: "EXTRACTED" } }),
    prisma.contract.count({
      where: {
        workspaceId,
        status: "EXTRACTED",
        extractedData: { not: undefined },
      },
    }),
    prisma.contract.findMany({
      where: { workspaceId },
      include: { uploadedBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Recent contracts (top 5)
  const recentContracts = allContracts.slice(0, 5);

  // Activity log
  const activities = await prisma.activity.findMany({
    where: { workspaceId },
    include: {
      user: { select: { name: true } },
      contract: { select: { fileName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const activity = activities.map((a: any) => ({
    id: a.id,
    action: a.action,
    user: a.user.name || "System",
    document: a.contract?.fileName || "",
    contractId: a.contractId,
    time: a.createdAt.toISOString(),
  }));

  // Compliance rate
  const complianceRate = totalContracts > 0
    ? Math.round((approvedThisMonth / totalContracts) * 100)
    : 0;

  // Calculate avgConfidence from extractedData JSON
  const contractsWithData = allContracts.filter((c: any) => c.extractedData);
  let avgConfidence = 0;
  let highCount = 0, mediumCount = 0, lowCount = 0;
  
  if (contractsWithData.length > 0) {
    let totalConf = 0;
    let totalFields = 0;
    for (const c of contractsWithData) {
      const data = c.extractedData as Record<string, { confidence?: number }>;
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
    avgConfidence = totalFields > 0 ? Math.round(totalConf / totalFields) : 0;
  }

  const allFieldsCount = highCount + mediumCount + lowCount;
  const confDist = allFieldsCount > 0
    ? {
        high: Math.round((highCount / allFieldsCount) * 100),
        medium: Math.round((mediumCount / allFieldsCount) * 100),
        low: Math.round((lowCount / allFieldsCount) * 100),
      }
    : { high: 0, medium: 0, low: 0 };

  // Expiring contracts (within 90 days)
  const now = Date.now();
  const expiringContracts = contractsWithData
    .filter((c: any) => {
      const data = c.extractedData as Record<string, { value?: string }>;
      const endDate = data?.endDate?.value;
      if (!endDate) return false;
      const daysLeft = Math.ceil((new Date(endDate).getTime() - now) / 86_400_000);
      return daysLeft >= 0 && daysLeft <= 90;
    })
    .map((c: any) => {
      const data = c.extractedData as Record<string, { value?: string }>;
      return {
        id: c.id,
        name: c.fileName,
        entity: data?.entityName?.value ?? "Unknown",
        days: Math.ceil(
          (new Date(data.endDate!.value!).getTime() - now) / 86_400_000,
        ),
      };
    })
    .sort((a: any, b: any) => a.days - b.days)
    .slice(0, 5);

  const stats = {
    totalContracts,
    pendingReview,
    approvedThisMonth,
    complianceRate,
    avgConfidence,
  };

  const KPI_CARDS = [
    {
      label: "Total Contracts",
      value: stats.totalContracts,
      icon: FileText,
      change: `${stats.pendingReview} in review`,
      positive: true,
      color: "text-[#635BFF]",
      bg: "bg-[#635BFF]/8",
    },
    {
      label: "Pending Review",
      value: stats.pendingReview,
      icon: FileClock,
      change: stats.pendingReview > 0 ? `${stats.pendingReview} need attention` : "All clear",
      positive: stats.pendingReview === 0,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Approved",
      value: stats.approvedThisMonth,
      icon: FileCheck2,
      change: `${stats.complianceRate}% compliance rate`,
      positive: true,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Avg. Confidence",
      value: `${stats.avgConfidence}%`,
      icon: ShieldCheck,
      change: stats.avgConfidence >= 80 ? "Above threshold" : "Needs improvement",
      positive: stats.avgConfidence >= 80,
      color: "text-[#635BFF]",
      bg: "bg-[#635BFF]/8",
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">Dashboard</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Overview of your DORA compliance posture — as of {formatDate(new Date().toISOString())}
            </p>
          </div>
          <div className="flex gap-2">
            <UploadDialog />
            <Link href="/extraction">
              <Button className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white btn-lift">
                <Bot className="size-3.5 mr-1.5" />
                New extraction
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {KPI_CARDS.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="border-[#E3E8EF] shadow-none bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {kpi.label}
                    </p>
                    <div className={cn("size-7 rounded-md flex items-center justify-center", kpi.bg)}>
                      <Icon className={cn("size-3.5", kpi.color)} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#0A2540] tabular-nums">{kpi.value}</div>
                  <div className={cn("mt-1 flex items-center gap-1 text-[11px] font-medium", kpi.positive ? "text-emerald-600" : "text-amber-600")}>
                    <TrendingUp className="size-3" />
                    {kpi.change}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Middle row: compliance + expiry */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Confidence distribution */}
          <Card className="border-[#E3E8EF] shadow-none bg-white">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                AI Confidence Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 flex flex-col gap-3">
              {[
                { label: "High (≥80%)", pct: confDist.high, color: "bg-emerald-500" },
                { label: "Medium (60–79%)", pct: confDist.medium, color: "bg-amber-500" },
                { label: "Low (<60%)", pct: confDist.low, color: "bg-red-500" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-[#0A2540] font-medium">{row.label}</span>
                    <span className="text-[12px] text-muted-foreground tabular-nums font-semibold">{row.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F6F9FC] overflow-hidden">
                    <div
                      className={cn("h-full rounded-full progress-fill", row.color)}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
              <Separator className="bg-[#F6F9FC] my-1" />
              <p className="text-[11px] text-muted-foreground">
                Average confidence across {stats.totalContracts} contracts:{" "}
                <span className="font-bold text-[#0A2540]">{stats.avgConfidence}%</span>
              </p>
            </CardContent>
          </Card>

          {/* Expiring contracts */}
          <Card className="border-[#E3E8EF] shadow-none bg-white">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Expiring Within 90 Days
                </CardTitle>
                <Badge className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 border font-semibold h-auto px-1.5 py-0.5 rounded-full">
                  {expiringContracts.length} contracts
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 flex flex-col gap-2">
              {expiringContracts.length === 0 ? (
                <p className="text-[12px] text-muted-foreground text-center py-4">
                  No contracts expiring within 90 days
                </p>
              ) : (
                expiringContracts.slice(0, 3).map((c: any ) => (
                  <Link key={c.id} href={`/extraction?id=${c.id}`}>
                    <div className="flex items-center gap-3 rounded-lg border border-[#E3E8EF] p-2.5 hover:border-amber-300/50 hover:bg-amber-50/30 transition-all duration-200 cursor-pointer">
                      <div
                        className={cn(
                          "size-7 rounded-md flex items-center justify-center flex-shrink-0",
                          c.days <= 30 ? "bg-red-50" : "bg-amber-50"
                        )}
                      >
                        <AlertTriangle
                          className={cn("size-3.5", c.days <= 30 ? "text-red-500" : "text-amber-500")}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#0A2540] truncate">{c.entity}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{c.name}</p>
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-bold tabular-nums flex-shrink-0",
                          c.days <= 30 ? "text-red-600" : "text-amber-600"
                        )}
                      >
                        {c.days}d
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom row: recent contracts + activity */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Recent extractions */}
          <div className="md:col-span-2">
            <Card className="border-[#E3E8EF] shadow-none bg-white h-full">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Recent Extractions
                  </CardTitle>
                  <Link href="/contracts">
                    <Button variant="ghost" size="sm" className="h-6 text-[11px] text-[#635BFF] px-2">
                      View all <ArrowRight className="size-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-col gap-1">
                  {recentContracts.map((contract: any) => (
                    <Link key={contract.id} href={`/extraction?id=${contract.id}`}>
                      <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#F6F9FC] transition-all duration-200 group cursor-pointer">
                        <div className="size-7 rounded-md bg-[#635BFF]/8 flex items-center justify-center flex-shrink-0">
                          <FileText className="size-3.5 text-[#635BFF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-[#0A2540] truncate">
                            {contract.fileName}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {(contract.extractedData as any)?.entityName?.value || "Extracting…"}
                          </p>
                        </div>
                        <StatusBadge status={contract.status as any} />
                        <span className="text-[11px] text-muted-foreground flex-shrink-0 hidden sm:inline">
                          {formatRelativeTime(contract.createdAt.toISOString())}
                        </span>
                        <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity log */}
          <Card className="border-[#E3E8EF] shadow-none bg-white">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-col gap-3">
                {activity.map((entry: any, i: number) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-5 rounded-full bg-[#635BFF]/10 flex items-center justify-center flex-shrink-0">
                        <div className="size-1.5 rounded-full bg-[#635BFF]" />
                      </div>
                      {i < activity.length - 1 && (
                        <div className="flex-1 w-px bg-[#E3E8EF] my-1" />
                      )}
                    </div>
                    <div className="pb-2 min-w-0">
                      <p className="text-[12px] font-semibold text-[#0A2540] leading-snug">
                        {entry.action}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{entry.document}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="size-2.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelativeTime(entry.time)} · {entry.user}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DORA readiness banner */}
        <Card className="border-[#635BFF]/20 bg-gradient-to-r from-[#635BFF]/5 to-[#635BFF]/0 shadow-none transition-all duration-300 hover:shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-9 rounded-xl bg-[#635BFF]/15 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="size-5 text-[#635BFF]" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#0A2540]">
                DORA Register is {stats.complianceRate}% complete
              </p>
              <p className="text-[12px] text-muted-foreground">
                {stats.pendingReview} contracts still require manual review before your register is submission-ready.
              </p>
            </div>
            <Link href="/contracts">
              <Button size="sm" className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white flex-shrink-0 btn-lift">
                Complete register <ArrowRight className="size-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
