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
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatRelativeTime } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compliance & Governance" };

export default async function CompliancePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  // Fetch real compliance data from Prisma
  const [checks, incidents, vendors, resilienceTests, policies] =
    await Promise.all([
      prisma.complianceCheck.findMany({
        where: { workspaceId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.incident.count({ where: { workspaceId } }),
      prisma.vendor.count({ where: { workspaceId } }),
      prisma.resilienceTest.count({ where: { workspaceId } }),
      prisma.policyDocument.count({ where: { workspaceId } }),
    ]);

  // Calculate compliance metrics
  const totalChecks = checks.length;
  const compliantCount = checks.filter(
    (c) => c.status === "Compliant",
  ).length;
  const nonCompliantCount = checks.filter(
    (c) => c.status === "Non-Compliant",
  ).length;
  const inProgressCount = checks.filter(
    (c) => c.status === "In Progress",
  ).length;
  const overallScore =
    totalChecks > 0 ? Math.round((compliantCount / totalChecks) * 100) : 0;

  // Find next due date
  const upcomingDue = checks
    .filter((c) => c.dueDate && new Date(c.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  const nextDueDays = upcomingDue[0]?.dueDate
    ? Math.ceil(
        (new Date(upcomingDue[0].dueDate).getTime() - Date.now()) / 86_400_000,
      )
    : null;

  const METRICS = [
    {
      label: "Overall Score",
      value: totalChecks > 0 ? `${overallScore}%` : "—",
      change: compliantCount > 0 ? `${compliantCount} compliant` : "No checks",
      status: overallScore >= 80 ? "success" : overallScore >= 50 ? "warning" : "error",
    },
    {
      label: "Active Controls",
      value: totalChecks.toString(),
      change: `${inProgressCount} in progress`,
      status: "neutral",
    },
    {
      label: "Open Issues",
      value: nonCompliantCount.toString(),
      change: nonCompliantCount > 0 ? "Action required" : "All clear",
      status: nonCompliantCount === 0 ? "success" : "error",
    },
    {
      label: "Next Due",
      value: nextDueDays !== null ? `${nextDueDays}d` : "None",
      change: nextDueDays !== null ? "Scheduled" : "No deadlines",
      status: nextDueDays !== null && nextDueDays <= 14 ? "warning" : "neutral",
    },
  ];

  // Recent checks — last 10 from actual DB
  const recentChecks = checks.slice(0, 10);

  // Pillar coverage
  const pillarCoverage = (() => {
    const pillars = [
      "ict_risk",
      "incident_reporting",
      "resilience_testing",
      "third_party_risk",
      "information_sharing",
    ] as const;
    return pillars.map((pillar) => {
      const pillarChecks = checks.filter((c) => c.pillar === pillar);
      const compliant = pillarChecks.filter(
        (c) => c.status === "Compliant",
      ).length;
      const total = pillarChecks.length;
      return {
        pillar,
        label: pillar
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        percentage: total > 0 ? Math.round((compliant / total) * 100) : 0,
        total,
        compliant,
      };
    });
  })();

  const STATUS_MAP: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    Compliant: { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
    "Non-Compliant": { icon: AlertTriangle, color: "bg-red-50 text-red-700" },
    "In Progress": { icon: Clock, color: "bg-amber-50 text-amber-700" },
    "Partially Compliant": { icon: Clock, color: "bg-blue-50 text-blue-700" },
    "Not Started": { icon: Clock, color: "bg-gray-50 text-gray-700" },
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full bg-[#FAFBFC] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="px-8 py-8 border-b border-[#E3E8EF] bg-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="size-5 text-[#635BFF]" />
                <h1 className="text-2xl font-bold text-[#111827]">
                  Compliance & Governance
                </h1>
              </div>
              <p className="text-sm text-[#475467]">
                Real-time monitoring of DORA regulatory requirements and
                internal controls.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-10 border-[#D0D5DD] gap-2"
              >
                <Download className="size-4" />
                Export Evidence
              </Button>
              <Link href="/compliance">
                <Button className="h-10 bg-[#635BFF] hover:bg-[#5249E0] text-white gap-2 shadow-sm font-medium">
                  Add New Control
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="p-4 rounded-xl border border-[#E3E8EF] bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xs font-medium text-[#667085] mb-1">
                  {metric.label}
                </p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-[#111827]">
                    {metric.value}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      metric.status === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : metric.status === "warning"
                          ? "bg-amber-50 text-amber-700"
                          : metric.status === "error"
                            ? "bg-red-50 text-red-700"
                            : "bg-gray-50 text-gray-700",
                    )}
                  >
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
                <h3 className="font-semibold text-gray-900">
                  Compliance Checks ({totalChecks})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-[#475467] text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3">Requirement</th>
                      <th className="px-6 py-3">Article</th>
                      <th className="px-6 py-3">Pillar</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentChecks.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-[#667085]"
                        >
                          <Shield className="size-8 mx-auto mb-2 opacity-30" />
                          <p className="font-semibold">
                            No compliance checks yet
                          </p>
                          <p className="text-xs mt-1">
                            Create your first compliance check to start tracking
                            DORA requirements.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      recentChecks.map((check) => {
                        const statusInfo = STATUS_MAP[check.status] ||
                          STATUS_MAP["Not Started"];
                        const StatusIcon = statusInfo.icon;
                        return (
                          <tr
                            key={check.id}
                            className="hover:bg-[#F9FBFC] transition-colors group"
                          >
                            <td className="px-6 py-4 font-medium text-[#111827] max-w-[250px] truncate">
                              {check.requirement}
                            </td>
                            <td className="px-6 py-4 text-[#475467] font-mono text-xs">
                              {check.article}
                            </td>
                            <td className="px-6 py-4 text-[#475467] text-xs capitalize">
                              {check.pillar.replace(/_/g, " ")}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                                  statusInfo.color,
                                )}
                              >
                                <StatusIcon className="size-3" />
                                {check.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-[#667085] text-xs font-medium">
                              {check.dueDate
                                ? formatRelativeTime(
                                    check.dueDate.toISOString(),
                                  )
                                : "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {totalChecks > 10 && (
                <div className="px-6 py-4 border-t border-[#E3E8EF] bg-gray-50/50">
                  <Link
                    href="/audit"
                    className="text-xs font-semibold text-[#635BFF] hover:text-[#5249E0] flex items-center gap-1 ml-auto"
                  >
                    View Full Audit Vault
                    <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* DORA Articles Mapping — data-driven */}
            <div className="bg-[#111827] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-white">
                  <div className="size-8 rounded-lg bg-[#635BFF] flex items-center justify-center">
                    <FileText className="size-4" />
                  </div>
                  DORA Articles Mapping
                </h3>
                <p className="text-gray-400 text-sm mb-6 max-w-md">
                  Your compliance checks mapped against all 5 DORA pillars.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {pillarCoverage.slice(0, 4).map((p) => (
                    <div
                      key={p.pillar}
                      className="p-3 bg-white/5 rounded-xl border border-white/10"
                    >
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">
                        {p.label}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">
                          {p.compliant}/{p.total} checks
                        </span>
                        <span
                          className={cn(
                            "text-xs font-bold",
                            p.percentage >= 80
                              ? "text-emerald-400"
                              : p.percentage >= 50
                                ? "text-blue-400"
                                : p.percentage > 0
                                  ? "text-amber-400"
                                  : "text-gray-500",
                          )}
                        >
                          {p.total > 0 ? `${p.percentage}%` : "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 size-64 bg-[#635BFF]/20 blur-[100px] rounded-full" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E3E8EF] p-6 shadow-sm">
              <h3 className="font-bold text-[#111827] mb-4">
                Integrity Monitoring
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Incidents",
                    value: `${incidents} tracked`,
                    color: incidents > 0 ? "amber" : "emerald",
                  },
                  {
                    label: "Vendors",
                    value: `${vendors} monitored`,
                    color: "emerald",
                  },
                  {
                    label: "Resilience Tests",
                    value: `${resilienceTests} recorded`,
                    color: resilienceTests > 0 ? "emerald" : "amber",
                  },
                  {
                    label: "Policies",
                    value: `${policies} documents`,
                    color: policies > 0 ? "emerald" : "amber",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F9FBFC] border border-[#E3E8EF]"
                  >
                    <span className="text-xs font-medium text-[#475467]">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md",
                        item.color === "emerald"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700",
                      )}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar Coverage Bars */}
            <div className="bg-white rounded-2xl border border-[#E3E8EF] p-6 shadow-sm">
              <h3 className="font-bold text-[#111827] mb-4">
                Pillar Coverage
              </h3>
              <div className="space-y-3">
                {pillarCoverage.map((p) => (
                  <div key={p.pillar}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-medium text-[#475467]">
                        {p.label}
                      </span>
                      <span className="text-[11px] font-bold text-[#111827]">
                        {p.total > 0 ? `${p.percentage}%` : "—"}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          p.percentage >= 80
                            ? "bg-emerald-500"
                            : p.percentage >= 50
                              ? "bg-blue-500"
                              : p.percentage > 0
                                ? "bg-amber-400"
                                : "bg-gray-200",
                        )}
                        style={{ width: `${p.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
