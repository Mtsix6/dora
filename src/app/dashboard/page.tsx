import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  Gauge,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadDialog } from "@/components/upload-dialog";
import { StatusBadge } from "@/components/status-badge";
import { authOptions } from "@/lib/auth";
import { mapContractStatus } from "@/lib/dora";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

const PILLARS = [
  { id: "ict_risk", label: "ICT Risk" },
  { id: "incident_reporting", label: "Incident" },
  { id: "resilience_testing", label: "Testing" },
  { id: "third_party_risk", label: "3rd Party" },
  { id: "information_sharing", label: "Sharing" },
] as const;

const LEVELS = ["Low", "Moderate", "High", "Critical"] as const;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;
  const workspaceName = session.user.workspaceName || "Workspace";

  const [workspace, contracts, activities, complianceChecks, ictAssets, incidents, notifications] =
    await Promise.all([
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { tier: true, updatedAt: true },
      }),
      prisma.contract.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } }),
      prisma.activity.findMany({
        where: { workspaceId },
        include: { user: { select: { name: true } }, contract: { select: { fileName: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.complianceCheck.findMany({ where: { workspaceId } }),
      prisma.ictAsset.findMany({ where: { workspaceId }, orderBy: { riskScore: "desc" }, take: 24 }),
      prisma.incident.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.notification.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 4 }),
    ]);

  const totalContracts = contracts.length;
  const extractedContracts = contracts.filter((contract) => contract.extractedData).length;
  const approvedContracts = contracts.filter((contract) => contract.status === "APPROVED").length;
  const reviewQueue = contracts.filter((contract) => contract.status === "EXTRACTED").length;
  const openIncidents = incidents.filter((incident) => incident.resolvedAt === null).length;
  const criticalIncidents = incidents.filter(
    (incident) =>
      incident.resolvedAt === null &&
      typeof incident.severity === "string" &&
      incident.severity.toLowerCase() === "critical",
  ).length;
  const complianceScore = complianceChecks.length
    ? Math.round((complianceChecks.filter((check) => check.status === "Compliant").length / complianceChecks.length) * 100)
    : 0;
  const extractionCoverage = totalContracts ? Math.round((extractedContracts / totalContracts) * 100) : 0;

  let totalConfidence = 0;
  let totalConfidenceFields = 0;
  for (const contract of contracts) {
    const data = contract.extractedData as Record<string, { confidence?: number }> | null;
    if (!data) continue;
    for (const field of Object.values(data)) {
      if (typeof field?.confidence === "number") {
        totalConfidence += field.confidence;
        totalConfidenceFields += 1;
      }
    }
  }
  const avgConfidence = totalConfidenceFields ? Math.round(totalConfidence / totalConfidenceFields) : 0;

  const metrics: {
    label: string;
    value: string;
    note: string;
    delta: string;
    icon: React.ElementType;
    tone: "green" | "violet" | "amber" | "slate" | "rose";
    spark: number[];
  }[] = [
    { label: "Compliance Score", value: `${complianceScore}%`, note: `${complianceChecks.length} controls tracked`, delta: `${complianceChecks.filter((check) => check.status === "Compliant").length} compliant`, icon: ShieldCheck, tone: "green", spark: [50, 55, 58, 65, 70, complianceScore || 40] },
    { label: "Contracts Indexed", value: `${totalContracts}`, note: `${extractedContracts} extracted`, delta: `${reviewQueue} in review`, icon: FileCheck2, tone: "violet", spark: [12, 15, 18, 22, 26, Math.max(totalContracts, 1)] },
    { label: "Active Risks", value: `${openIncidents}`, note: criticalIncidents > 0 ? `${criticalIncidents} critical` : "No critical incidents", delta: `${ictAssets.length} assets monitored`, icon: ShieldAlert, tone: "amber", spark: [8, 8, 7, 6, 6, Math.max(openIncidents, 1)] },
    { label: "Audit Coverage", value: `${extractionCoverage}%`, note: `${approvedContracts} approved`, delta: `${extractedContracts} evidence-backed`, icon: Gauge, tone: "slate", spark: [18, 26, 34, 45, 57, extractionCoverage || 12] },
    { label: "AI Confidence", value: `${avgConfidence}%`, note: totalConfidenceFields ? `${totalConfidenceFields} fields scored` : "No extracted fields yet", delta: avgConfidence >= 80 ? "Above review threshold" : "Needs analyst review", icon: Bot, tone: "rose", spark: [38, 44, 52, 58, 64, avgConfidence || 18] },
  ] as const;

  const pillars = PILLARS.map((pillar) => {
    const checks = complianceChecks.filter((check) => check.pillar === pillar.id);
    const compliant = checks.filter((check) => check.status === "Compliant").length;
    return { ...pillar, pct: checks.length ? Math.round((compliant / checks.length) * 100) : 0 };
  });

  const riskMap: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
  const heatmap = LEVELS.map((impactLevel, impactIndex) =>
    LEVELS.map((likelihoodLevel, likelihoodIndex) => {
      const count = ictAssets.filter((asset) => {
        const score = Math.round(asset.riskScore ?? 0);
        const likelihood = score <= 25 ? 0 : score <= 50 ? 1 : score <= 75 ? 2 : 3;
        const impact =
          typeof asset.criticality === "string"
            ? (riskMap[asset.criticality.toLowerCase()] ?? 0)
            : 0;
        return impact === impactIndex && likelihood === likelihoodIndex;
      }).length;
      return { impactLevel, likelihoodLevel, count };
    }),
  );
  const heatMax = Math.max(1, ...heatmap.flat().map((cell) => cell.count));

  const feed: {
    id: string;
    title: string;
    summary: string;
    createdAt: string;
    type: string;
    href: string;
  }[] = notifications.length
    ? notifications.map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.message,
        createdAt: item.createdAt.toISOString(),
        type: item.type,
        href: item.actionUrl || "/notifications",
      }))
    : activities.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.action,
        summary: `${item.user.name || "System"} updated ${item.contract?.fileName || "the workspace"}`,
        createdAt: item.createdAt.toISOString(),
        type: "info",
        href: "/contracts",
      }));

  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-[#F5F7FB] custom-scrollbar">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-5 lg:px-6">
          <section className="rounded-[26px] border border-[#D9E1EC] bg-white px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#60708A]">
                <span className="rounded-full bg-[#EEF2FF] px-3 py-1 font-semibold text-[#5B5BD6]">{workspaceName}</span>
                <ChevronRight className="size-3.5" />
                <span>Compliance</span>
                <ChevronRight className="size-3.5" />
                <span className="font-semibold text-[#182033]">DORA-ROI Dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#60708A]">
                <span>Last updated: {formatRelativeTime((workspace?.updatedAt || new Date()).toISOString())}</span>
                <Button variant="ghost" size="sm" className="h-8 rounded-xl px-3 text-[#5B5BD6]"><RefreshCw className="mr-2 size-3.5" />Refresh</Button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-[32px] font-black tracking-[-0.03em] text-[#182033]">DORA Compliance ROI Dashboard</h1>
                  <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-50">
                    <span className="mr-2 inline-block size-2 rounded-full bg-emerald-500" />Compliant
                  </Badge>
                </div>
                <p className="mt-1 text-[14px] text-[#6C7892]">Digital Operational Resilience Act · {workspace?.tier || "ENTERPRISE"} intelligence · {formatDate(new Date().toISOString())}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <UploadDialog triggerLabel="Upload Documents" triggerClassName="h-11 rounded-xl border border-[#D5DDF0] bg-white px-4 text-[13px] font-semibold text-[#182033] shadow-none hover:bg-[#F8FAFF]" />
                <UploadDialog triggerLabel="New Assessment" openLatestOnSuccess triggerClassName="h-11 rounded-xl bg-[#5B5BD6] px-4 text-[13px] font-semibold text-white shadow-[0_14px_28px_rgba(91,91,214,0.28)] hover:bg-[#4D4DC9]" />
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-5">
            {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.12fr_1fr]">
            <Card className="rounded-[24px] border border-[#D9E1EC] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[24px] font-bold tracking-[-0.02em] text-[#182033]">Compliance Radar</CardTitle>
                    <p className="mt-1 text-[14px] text-[#6C7892]">DORA pillar coverage across your current controls</p>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <span className="flex items-center gap-1.5 text-[#5B5BD6]"><span className="inline-block size-2 rounded-full bg-[#5B5BD6]" />Current</span>
                    <span className="flex items-center gap-1.5 text-[#93A0B7]"><span className="inline-block size-2 rounded-full bg-[#CBD5E1]" />Target</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="min-h-[330px] rounded-[20px] bg-[#F7F9FE] p-4">
                  <RadarChart data={pillars} />
                </div>
                <div className="grid content-start gap-3">
                  {pillars.map((pillar) => (
                    <div key={pillar.id} className="rounded-[18px] border border-[#E4EAF3] bg-[#FBFCFF] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-[#334155]">{pillar.label}</span>
                        <span className="text-[15px] font-bold text-[#182033]">{pillar.pct}%</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-[#E9EEFA]">
                        <div className="h-full rounded-full bg-[#5B5BD6]" style={{ width: `${pillar.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border border-[#D9E1EC] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-[24px] font-bold tracking-[-0.02em] text-[#182033]">AI Regulatory Feed</CardTitle>
                    <p className="mt-1 text-[14px] text-[#6C7892]">Recent notifications and operational intelligence</p>
                  </div>
                  <Badge className="rounded-full border border-[#D9D9FE] bg-[#F2F1FF] px-3 py-1 text-[12px] font-semibold text-[#5B5BD6] hover:bg-[#F2F1FF]">
                    <Sparkles className="mr-1.5 size-3" />
                    AI Powered
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                {feed.map((item) => (
                  <Link key={item.id} href={item.href} className="rounded-[18px] border border-[#E4EAF3] bg-[#FBFCFF] px-4 py-4 transition-colors hover:bg-white">
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl", toneBox(item.type))}>
                        {item.type === "error" ? <AlertTriangle className="size-4" /> : item.type === "success" ? <CheckCircle2 className="size-4" /> : <Bot className="size-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[15px] font-bold text-[#182033]">{item.title}</p>
                          <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]", toneBadge(item.type))}>{item.type}</Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[14px] leading-6 text-[#5E6A86]">{item.summary}</p>
                        <div className="mt-3 flex items-center gap-3 text-[12px] text-[#6C7892]">
                          <span>{formatRelativeTime(item.createdAt)}</span>
                          <span className="text-[#5B5BD6]">Open</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.02fr_1fr_1fr]">
            <Card className="rounded-[24px] border border-[#D9E1EC] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[24px] font-bold tracking-[-0.02em] text-[#182033]">ICT Risk Heatmap</CardTitle>
                    <p className="mt-1 text-[14px] text-[#6C7892]">Likelihood × impact from your ICT asset inventory</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-2">
                  <div className="grid grid-cols-[64px_repeat(4,minmax(0,1fr))] gap-2 text-center text-[11px] font-semibold text-[#6C7892]">
                    <div />
                    {LEVELS.map((level) => <div key={level}>{level}</div>)}
                  </div>
                  {heatmap.map((row, rowIndex) => (
                    <div key={LEVELS[rowIndex]} className="grid grid-cols-[64px_repeat(4,minmax(0,1fr))] gap-2">
                      <div className="flex items-center text-[11px] font-semibold text-[#6C7892]">{LEVELS[rowIndex]}</div>
                      {row.map((cell) => (
                        <div key={`${cell.impactLevel}-${cell.likelihoodLevel}`} className={cn("flex h-11 items-center justify-center rounded-xl text-[13px] font-bold", heatTone(cell.count, heatMax))}>
                          {cell.count}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {ictAssets.slice(0, 4).map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between rounded-[16px] bg-[#F8FAFF] px-4 py-3">
                      <div>
                        <p className="text-[14px] font-semibold text-[#182033]">{asset.name}</p>
                        <p className="text-[12px] text-[#6C7892]">{asset.criticality} criticality</p>
                      </div>
                      <span className="text-[15px] font-bold text-rose-600">{Math.round(asset.riskScore ?? 0)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border border-[#D9E1EC] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-[24px] font-bold tracking-[-0.02em] text-[#182033]">Audit Timeline</CardTitle>
                <p className="text-[14px] text-[#6C7892]">Recent analyst and workflow activity</p>
              </CardHeader>
              <CardContent>
                <div className="relative ml-3 space-y-4 border-l border-[#D8E0EE] pl-5">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className={cn("relative rounded-[18px] border px-4 py-4", index === 0 ? "border-rose-100 bg-rose-50/60" : index === 1 ? "border-[#DDE4FF] bg-[#F6F7FF]" : "border-[#E4EAF3] bg-[#FBFCFF]")}>
                      <span className={cn("absolute -left-[31px] top-5 inline-block size-3 rounded-full border-[3px] border-white", index === 0 ? "bg-rose-500" : index === 1 ? "bg-[#5B5BD6]" : "bg-amber-500")} />
                      <p className="text-[16px] font-bold text-[#182033]">{activity.action}</p>
                      <p className="mt-1 text-[14px] leading-6 text-[#5E6A86]">{activity.contract?.fileName || "Workspace event"}</p>
                      <div className="mt-3 flex items-center gap-3 text-[12px] text-[#6C7892]">
                        <span>{formatRelativeTime(activity.createdAt.toISOString())}</span>
                        <span>{activity.user.name || "System"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border border-[#D9E1EC] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-[24px] font-bold tracking-[-0.02em] text-[#182033]">Workflow Status</CardTitle>
                <p className="text-[14px] text-[#6C7892]">Operational pipelines using current data</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {([
                  { title: "Contract Extraction", subtitle: `${extractedContracts} of ${totalContracts} contracts enriched`, value: extractionCoverage, tone: "violet" },
                  { title: "Manual Review Queue", subtitle: reviewQueue === 0 ? "No contracts waiting" : "Ready for analyst validation", value: Math.min(100, Math.max(12, reviewQueue * 12)), tone: "amber" },
                  { title: "Incident Response", subtitle: criticalIncidents > 0 ? `${criticalIncidents} critical incidents open` : "No critical incidents", value: criticalIncidents > 0 ? 86 : openIncidents > 0 ? 58 : 18, tone: criticalIncidents > 0 ? "rose" : "emerald" },
                ] as { title: string; subtitle: string; value: number; tone: "violet" | "amber" | "rose" | "emerald" }[]).map((item) => (
                  <div key={item.title} className="rounded-[18px] border border-[#E4EAF3] bg-[#FBFCFF] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-bold text-[#182033]">{item.title}</p>
                        <p className="mt-1 text-[13px] text-[#6C7892]">{item.subtitle}</p>
                      </div>
                      <Badge className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]", workflowBadge(item.tone))}>{item.value}%</Badge>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-[#E9EEFA]">
                      <div className={cn("h-full rounded-full", workflowBar(item.tone))} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
                <div className="rounded-[18px] border border-dashed border-[#D9E1EC] bg-white px-4 py-4">
                  <p className="text-[15px] font-bold text-[#182033]">Recent Contracts</p>
                  <div className="mt-4 space-y-2">
                    {contracts.slice(0, 4).map((contract) => (
                      <Link key={contract.id} href={`/extraction?id=${contract.id}`} className="flex items-center justify-between rounded-xl bg-[#F7F9FE] px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-[#182033]">{contract.fileName}</p>
                          <p className="text-[12px] text-[#6C7892]">{formatRelativeTime(contract.createdAt.toISOString())}</p>
                        </div>
                        <StatusBadge status={mapContractStatus(contract.status)} />
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <Card className="rounded-[24px] border border-[#D9E1EC] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-[24px] font-bold tracking-[-0.02em] text-[#182033]">Live Extraction Stream</CardTitle>
                <p className="text-[14px] text-[#6C7892]">Recent contracts moving through the dashboard pipeline</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {contracts.slice(0, 4).map((contract) => (
                  <Link key={contract.id} href={`/extraction?id=${contract.id}`} className="flex items-center gap-3 rounded-[18px] border border-[#E4EAF3] bg-[#FBFCFF] px-4 py-4 transition-colors hover:bg-white">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#5B5BD6]"><FileCheck2 className="size-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-[#182033]">{contract.fileName}</p>
                      <p className="truncate text-[13px] text-[#6C7892]">
                        {(contract.extractedData as { entityName?: { value?: string } } | null)?.entityName?.value || "Awaiting extraction details"}
                      </p>
                    </div>
                    <StatusBadge status={mapContractStatus(contract.status)} />
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border border-[#D9E1EC] bg-[linear-gradient(180deg,#5B5BD6_0%,#4B45C7_100%)] text-white shadow-[0_18px_45px_rgba(91,91,214,0.34)]">
              <CardContent className="flex h-full flex-col justify-between gap-5 p-6">
                <div>
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-white/14"><Bot className="size-5" /></div>
                  <h2 className="mt-5 text-[22px] font-black tracking-[-0.03em]">AI Copilot</h2>
                  <p className="mt-2 text-[14px] leading-6 text-white/82">Ask about DORA controls, extraction confidence, incidents, and audit posture from your workspace.</p>
                </div>
                <div className="space-y-2 text-[13px] text-white/82">
                  <div className="flex items-center gap-2"><Clock3 className="size-4" />Live workspace context</div>
                  <div className="flex items-center gap-2"><RefreshCw className="size-4" />Evidence-aware assistant</div>
                </div>
                <Link href="/settings">
                  <Button className="h-11 w-full rounded-xl bg-white text-[#4B45C7] hover:bg-white/95">Open AI settings</Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({
  label,
  value,
  note,
  delta,
  tone,
  icon: Icon,
  spark,
}: {
  label: string;
  value: string;
  note: string;
  delta: string;
  tone: "green" | "violet" | "amber" | "slate" | "rose";
  icon: React.ElementType;
  spark: readonly number[];
}) {
  const palette = {
    green: { box: "bg-emerald-50 text-emerald-600", text: "text-emerald-600", stroke: "#22C55E" },
    violet: { box: "bg-[#EEF2FF] text-[#5B5BD6]", text: "text-[#5B5BD6]", stroke: "#5B5BD6" },
    amber: { box: "bg-amber-50 text-amber-600", text: "text-amber-600", stroke: "#F59E0B" },
    slate: { box: "bg-slate-100 text-slate-600", text: "text-slate-600", stroke: "#64748B" },
    rose: { box: "bg-rose-50 text-rose-600", text: "text-rose-600", stroke: "#F43F5E" },
  }[tone];
  const max = Math.max(...spark, 1);
  const min = Math.min(...spark, 0);
  const range = max - min || 1;
  const points = spark.map((point, index) => {
    const x = (index / (spark.length - 1 || 1)) * 100;
    const y = 100 - ((point - min) / range) * 78 - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <Card className="rounded-[22px] border border-[#D9E1EC] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-[#60708A]">{label}</p>
            <p className="mt-2 text-[40px] font-black tracking-[-0.05em] text-[#182033]">{value}</p>
            <p className="mt-1 text-[13px] text-[#6C7892]">{note}</p>
          </div>
          <div className={cn("flex size-11 items-center justify-center rounded-2xl", palette.box)}>
            <Icon className="size-4.5" />
          </div>
        </div>
        <svg viewBox="0 0 100 100" className="mt-4 h-14 w-full">
          <polyline fill={palette.stroke} fillOpacity="0.12" stroke="none" points={`0,100 ${points} 100,100`} />
          <polyline fill="none" stroke={palette.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
        </svg>
        <p className={cn("mt-3 text-[13px] font-semibold", palette.text)}>{delta}</p>
      </CardContent>
    </Card>
  );
}

function RadarChart({ data }: { data: { id: string; label: string; pct: number }[] }) {
  const center = 170;
  const radius = 118;
  const total = data.length;
  const polygon = data.map((item, index) => {
    const angle = (-Math.PI / 2) + (index / total) * Math.PI * 2;
    const r = (item.pct / 100) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(" ");
  const target = data.map((_, index) => {
    const angle = (-Math.PI / 2) + (index / total) * Math.PI * 2;
    return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 340 340" className="h-full w-full">
      {[1, 0.8, 0.6, 0.4, 0.2].map((ratio) => (
        <polygon
          key={ratio}
          points={data.map((_, index) => {
            const angle = (-Math.PI / 2) + (index / total) * Math.PI * 2;
            const r = radius * ratio;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(" ")}
          fill="none"
          stroke="#DCE3F1"
          strokeWidth="1"
        />
      ))}
      {data.map((item, index) => {
        const angle = (-Math.PI / 2) + (index / total) * Math.PI * 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        const lx = center + (radius + 22) * Math.cos(angle);
        const ly = center + (radius + 22) * Math.sin(angle);
        return (
          <g key={item.id}>
            <line x1={center} y1={center} x2={x} y2={y} stroke="#E4EAF4" strokeWidth="1" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#6C7892" fontSize="12" fontWeight="600">
              {item.label}
            </text>
          </g>
        );
      })}
      <polygon points={target} fill="none" stroke="#C9D3E6" strokeDasharray="5 5" strokeWidth="2" />
      <polygon points={polygon} fill="rgba(91,91,214,0.14)" stroke="#5B5BD6" strokeWidth="3" />
      {data.map((item, index) => {
        const angle = (-Math.PI / 2) + (index / total) * Math.PI * 2;
        const r = (item.pct / 100) * radius;
        return <circle key={item.id} cx={center + r * Math.cos(angle)} cy={center + r * Math.sin(angle)} r="4.5" fill="#5B5BD6" />;
      })}
    </svg>
  );
}

function toneBox(type: string) {
  if (type === "error") return "bg-rose-50 text-rose-600";
  if (type === "success") return "bg-emerald-50 text-emerald-600";
  if (type === "warning") return "bg-amber-50 text-amber-600";
  return "bg-[#EEF2FF] text-[#5B5BD6]";
}

function toneBadge(type: string) {
  if (type === "error") return "bg-rose-100 text-rose-700 hover:bg-rose-100";
  if (type === "success") return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  if (type === "warning") return "bg-amber-100 text-amber-700 hover:bg-amber-100";
  return "bg-[#ECEBFF] text-[#5B5BD6] hover:bg-[#ECEBFF]";
}

function heatTone(count: number, max: number) {
  if (count === 0) return "bg-slate-100 text-slate-400";
  if (count / max >= 0.75) return "bg-rose-500 text-white";
  if (count / max >= 0.5) return "bg-amber-500 text-white";
  if (count / max >= 0.25) return "bg-[#5B5BD6] text-white";
  return "bg-emerald-100 text-emerald-700";
}

function workflowBadge(tone: "violet" | "amber" | "rose" | "emerald") {
  return {
    violet: "bg-[#ECEBFF] text-[#5B5BD6] hover:bg-[#ECEBFF]",
    amber: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    rose: "bg-rose-100 text-rose-700 hover:bg-rose-100",
    emerald: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  }[tone];
}

function workflowBar(tone: "violet" | "amber" | "rose" | "emerald") {
  return {
    violet: "bg-[#5B5BD6]",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    emerald: "bg-emerald-500",
  }[tone];
}
