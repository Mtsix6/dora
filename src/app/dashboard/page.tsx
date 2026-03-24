import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileClock,
  FileText,
  Share2,
  Shield,
  ShieldCheck,
  TrendingUp,
  Zap,
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
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapContractStatus } from "@/lib/dora";

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

  // ── Pillar coverage from ComplianceCheck model ──
  const complianceChecks = await prisma.complianceCheck.findMany({
    where: { workspaceId },
  });

  const PILLAR_IDS = ["ict_risk", "incident_reporting", "resilience_testing", "third_party_risk", "information_sharing"] as const;
  const PILLAR_LABELS: Record<string, string> = {
    ict_risk: "Risk Mgmt",
    incident_reporting: "Incidents",
    resilience_testing: "Testing",
    third_party_risk: "3rd Party",
    information_sharing: "Info Share",
  };

  const pillarCoverage = PILLAR_IDS.map((pillar) => {
    const checks = complianceChecks.filter((c) => c.pillar === pillar);
    const compliant = checks.filter((c) => c.status === "Compliant").length;
    const total = checks.length;
    return {
      id: pillar,
      label: PILLAR_LABELS[pillar],
      pct: total > 0 ? Math.round((compliant / total) * 100) : 0,
    };
  });

  // ── ICT asset risk heatmap data ──
  const ictAssets = await prisma.ictAsset.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 28,
  });

  // ── Active incidents for heatmap stats ──
  const [openIncidents, criticalIncidents] = await Promise.all([
    prisma.incident.count({ where: { workspaceId, resolvedAt: null } }),
    prisma.incident.count({ where: { workspaceId, severity: "Critical", resolvedAt: null } }),
  ]);

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
      <div className="flex flex-col gap-6 p-8 overflow-y-auto h-full custom-scrollbar">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0A2540] flex items-center gap-2">
              Dashboard
              <Badge variant="outline" className="bg-[#635BFF]/10 text-[#635BFF] hover:bg-[#635BFF]/10 border-transparent text-[10px] h-auto py-0.5">V2 ENTERPRISE</Badge>
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Global Overview of your DORA compliance posture — as of {formatDate(new Date().toISOString())}
            </p>
          </div>
          <div className="flex gap-2">
            <UploadDialog />
            <Link href="/extraction">
              <Button className="h-9 font-medium text-[13px] bg-[#0A2540] hover:bg-[#0A2540]/90 text-white shadow-lg shadow-[#0A2540]/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                <Bot className="size-4 mr-2" />
                New extraction
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Threat Map (Mock) */}
        <div className="w-full relative h-[280px] rounded-2xl border border-[#E3E8EF] bg-[#0A2540] overflow-hidden flex items-center justify-center shadow-2xl shadow-[#635BFF]/10">
           {/* Abstract Map Background */}
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 91, 255, 0.4) 0%, transparent 60%), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
           
           <div className="absolute top-4 left-6">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                 <ShieldCheck className="size-4 text-emerald-400" /> 
                 Global ICT Threat Intelligence
              </h3>
              <p className="text-white/60 text-xs mt-0.5">Real-time monitoring of critical service providers.</p>
           </div>
           
           <div className="absolute top-4 right-6 flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-white/80"><div className="size-2 rounded-full bg-emerald-400 animate-pulse" /> Secure</span>
              <span className="flex items-center gap-1.5 text-xs text-white/80"><div className="size-2 rounded-full bg-amber-400" /> Investigating</span>
              <span className="flex items-center gap-1.5 text-xs text-white/80"><div className="size-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]" /> Incident</span>
           </div>

           {/* Pulse Dots */}
           <div className="absolute top-[30%] left-[20%] size-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse" />
           <div className="absolute top-[45%] left-[50%] size-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse" style={{ animationDelay: '1s' }} />
           <div className="absolute top-[60%] left-[80%] size-3 rounded-full bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse" style={{ animationDelay: '0.5s' }} />
           <div className="absolute top-[25%] left-[65%] size-3 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse" />

           {/* Connection Lines (Abstract SVG) */}
           <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 20% 30% Q 35% 20% 50% 45%" fill="none" stroke="#34D399" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M 50% 45% Q 65% 60% 80% 60%" fill="none" stroke="#FBBF24" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M 50% 45% Q 55% 30% 65% 25%" fill="none" stroke="#EF4444" strokeWidth="1.5" />
           </svg>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="group relative overflow-hidden border-[#E3E8EF] shadow-none bg-white transition-all duration-300 hover:shadow-xl hover:shadow-[#635BFF]/5 hover:-translate-y-1 hover:border-[#635BFF]/30 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-[#635BFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-[12px] font-bold uppercase tracking-widest text-[#0A2540]/60">
                      {kpi.label}
                    </p>
                    <div className={cn("size-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110", kpi.bg)}>
                      <Icon className={cn("size-4", kpi.color)} />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#0A2540] tabular-nums tracking-tight">{kpi.value}</div>
                  <div className={cn("mt-2 flex items-center gap-1.5 text-[12px] font-semibold", kpi.positive ? "text-emerald-600" : "text-amber-600")}>
                    <TrendingUp className="size-3.5" />
                    {kpi.change}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Middle row: compliance + charts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Confidence distribution */}
          <Card className="border-[#E3E8EF] shadow-none bg-white transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">
                AI Confidence Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-4">
              {[
                { label: "High Precision (≥80%)", pct: confDist.high, color: "bg-[#635BFF]" },
                { label: "Manual Review Needed (60–79%)", pct: confDist.medium, color: "bg-amber-400" },
                { label: "Critical Attention (<60%)", pct: confDist.low, color: "bg-red-500" },
              ].map((row) => (
                <div key={row.label} className="group">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] text-[#0A2540] font-semibold">{row.label}</span>
                    <span className="text-[13px] text-muted-foreground tabular-nums font-bold">{row.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F6F9FC] overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110", row.color)}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-2 pt-3 border-t border-[#E3E8EF] flex justify-between items-center">
                <span className="text-[12px] text-muted-foreground font-medium">System Average</span>
                <span className="text-[14px] font-bold text-[#635BFF] bg-[#635BFF]/10 px-2 py-0.5 rounded-md">{stats.avgConfidence}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Radar Widget — data-driven from ComplianceCheck */}
          <Card className="border-[#E3E8EF] shadow-none bg-white transition-all duration-300 hover:shadow-lg relative overflow-hidden">
             <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">
                  Regulatory Coverage Radar
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 flex flex-col items-center justify-center min-h-[220px]">
                 {(() => {
                   const angles = [90, 162, 234, 306, 18]; // 5 axes evenly spaced
                   const R = 48;
                   const radarPoints = pillarCoverage.map((p, i) => {
                     const r = (p.pct / 100) * R;
                     const a = (angles[i] * Math.PI) / 180;
                     return `${50 + r * Math.cos(a)},${50 - r * Math.sin(a)}`;
                   }).join(" ");
                   return (
                     <div className="relative size-40">
                       <svg viewBox="0 0 100 100" className="size-full">
                         {[48, 36, 24, 12].map(r => (
                           <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#E3E8EF" strokeWidth="0.5" />
                         ))}
                         {angles.map((angle, i) => (
                           <line
                             key={angle}
                             x1="50" y1="50"
                             x2={50 + R * Math.cos((angle * Math.PI) / 180)}
                             y2={50 - R * Math.sin((angle * Math.PI) / 180)}
                             stroke="#E3E8EF" strokeWidth="0.5"
                           />
                         ))}
                         <polygon
                           points={radarPoints}
                           fill="rgba(99, 91, 255, 0.2)"
                           stroke="#635BFF"
                           strokeWidth="1.5"
                         />
                         {pillarCoverage.map((p, i) => {
                           const a = (angles[i] * Math.PI) / 180;
                           const lx = 50 + (R + 6) * Math.cos(a);
                           const ly = 50 - (R + 6) * Math.sin(a);
                           return (
                             <text key={p.id} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="3.5" fill="#667085" fontWeight="600">
                               {p.label.slice(0, 4)}
                             </text>
                           );
                         })}
                       </svg>
                     </div>
                   );
                 })()}
                 <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 w-full">
                    {pillarCoverage.map((p) => (
                      <div key={p.id} className="flex items-center gap-1.5">
                        <div className="size-1.5 rounded-full bg-[#635BFF]" />
                        <span className="text-[10px] text-[#475467] font-medium">
                          {p.label}: {p.pct}%
                        </span>
                      </div>
                    ))}
                 </div>
              </CardContent>
          </Card>

          {/* Resource Heatmap Widget — driven by ICT assets */}
          <Card className="border-[#E3E8EF] shadow-none bg-white transition-all duration-300 hover:shadow-lg lg:col-span-1">
             <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">
                  ICT Asset Risk Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                 <div className="grid grid-cols-7 gap-1">
                    {ictAssets.length > 0 ? (
                      ictAssets.map((asset) => {
                        const score = asset.riskScore ?? 0;
                        const color =
                          score >= 70 ? "bg-red-500" :
                          score >= 40 ? "bg-amber-400" :
                          "bg-emerald-500";
                        return (
                          <div
                            key={asset.id}
                            title={`${asset.name}: ${asset.criticality} (${Math.round(score)})`}
                            className={cn(
                              "aspect-square rounded-[2px] transition-all hover:scale-125 hover:z-10 cursor-help",
                              color,
                            )}
                          />
                        );
                      })
                    ) : (
                      Array.from({ length: 28 }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-[2px] bg-gray-200"
                        />
                      ))
                    )}
                 </div>
                 <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                       <span className="text-[#475467] font-medium">ICT Assets Tracked</span>
                       <span className="text-[#635BFF] font-bold">{ictAssets.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                       <span className="text-[#475467] font-medium">Open Incidents</span>
                       <span className={cn("font-bold", criticalIncidents > 0 ? "text-red-500" : openIncidents > 0 ? "text-amber-600" : "text-emerald-600")}>
                         {criticalIncidents > 0 ? `${criticalIncidents} CRITICAL` : openIncidents > 0 ? `${openIncidents} open` : "None"}
                       </span>
                    </div>
                 </div>
              </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Expiring contracts */}
          <Card className="border-[#E3E8EF] shadow-none bg-white transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">
                  Expiring Within 90 Days
                </CardTitle>
                <Badge className="text-[10px] bg-red-50 text-red-600 border-red-100 border font-bold h-auto px-2 py-0.5 rounded-full">
                  {expiringContracts.length} CRITICAL
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-2.5">
              {expiringContracts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-[#E3E8EF] rounded-xl">
                    <ShieldCheck className="size-8 text-emerald-500 mb-2 opacity-50" />
                    <p className="text-[13px] font-semibold text-[#0A2540]">All Contracts Secure</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">No renewals required in the next 90 days.</p>
                </div>
              ) : (
                expiringContracts.slice(0, 3).map((c: any ) => (
                  <Link key={c.id} href={`/extraction?id=${c.id}`}>
                    <div className="flex items-center gap-3.5 rounded-xl border border-[#E3E8EF] p-3 hover:border-red-300 hover:bg-red-50/50 transition-all duration-200 cursor-pointer group">
                      <div
                        className={cn(
                          "size-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                          c.days <= 30 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                        )}
                      >
                        <AlertTriangle className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-[#0A2540] truncate">{c.entity}</p>
                        <p className="text-[12px] text-muted-foreground truncate">{c.name}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={cn("text-[14px] font-black tabular-nums tracking-tight", c.days <= 30 ? "text-red-600" : "text-amber-600")}>
                            {c.days}d
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase opacity-70">Remaining</span>
                      </div>
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
            <Card className="border-[#E3E8EF] shadow-none bg-white h-full transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[13px] font-bold uppercase tracking-widest text-[#0A2540]">
                    Live Extractor Stream
                  </CardTitle>
                  <Link href="/contracts">
                    <Button variant="ghost" size="sm" className="h-7 text-[12px] font-bold text-[#635BFF] hover:bg-[#635BFF]/10 px-3 rounded-lg">
                      View all <ArrowRight className="size-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex flex-col gap-1.5">
                  {recentContracts.map((contract: any) => (
                    <Link key={contract.id} href={`/extraction?id=${contract.id}`}>
                      <div className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 bg-transparent border border-transparent hover:border-[#E3E8EF] hover:bg-[#F6F9FC]/80 transition-all duration-200 group cursor-pointer">
                        <div className="size-8 rounded-lg bg-[#635BFF]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#635BFF] transition-colors">
                          <FileText className="size-4 text-[#635BFF] group-hover:text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#0A2540] truncate">
                            {contract.fileName}
                          </p>
                          <p className="text-[11px] font-medium text-muted-foreground truncate">
                            {(contract.extractedData as any)?.entityName?.value || "AI Processing..."}
                          </p>
                        </div>
                        <StatusBadge status={mapContractStatus(contract.status)} />
                        <ArrowUpRight className="size-4 text-[#635BFF] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity log */}
          <Card className="border-[#E3E8EF] shadow-none bg-white transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-[13px] font-bold uppercase tracking-widest text-[#0A2540] flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Real-Time Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex flex-col gap-3.5 border-l-2 border-[#F6F9FC] ml-3 pl-4 py-2 relative">
                {activity.map((entry: any, i: number) => (
                  <div key={entry.id} className="relative group">
                    <div className="absolute -left-[23px] top-1 size-2.5 rounded-full bg-white border-2 border-[#635BFF] shadow-[0_0_0_4px_white] transition-transform group-hover:scale-150" />
                    <div className="pb-1 min-w-0">
                      <p className="text-[13px] font-bold text-[#0A2540] leading-snug tracking-tight">
                        {entry.action}
                      </p>
                      <p className="text-[12px] text-muted-foreground truncate mt-0.5">{entry.document}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 opacity-70">
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {formatRelativeTime(entry.time)} <span className="mx-1">•</span> {entry.user}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
