import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatRelativeTime } from "@/lib/format";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  Clock,
  Activity,
  ShieldAlert,
  FileText,
  Inbox,
} from "lucide-react";
import { CreateIncidentDialog } from "@/components/create-incident-dialog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Incident Reporting" };

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

export default async function IncidentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  const incidents = await prisma.incident.findMany({
    where: { workspaceId },
    include: { reportedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // KPI calculations
  const openCount = incidents.filter((i) => i.status !== "Resolved").length;
  const criticalCount = incidents.filter((i) => i.severity === "Critical").length;

  const resolvedIncidents = incidents.filter(
    (i) => i.status === "Resolved" && i.resolvedAt,
  );
  let avgResolution = "-";
  if (resolvedIncidents.length > 0) {
    const totalMs = resolvedIncidents.reduce((acc, i) => {
      return acc + (i.resolvedAt!.getTime() - i.createdAt.getTime());
    }, 0);
    const avgMs = totalMs / resolvedIncidents.length;
    const avgHours = avgMs / (1000 * 60 * 60);
    avgResolution =
      avgHours >= 24
        ? `${(avgHours / 24).toFixed(1)}d`
        : `${avgHours.toFixed(1)}h`;
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalThisMonth = incidents.filter(
    (i) => i.createdAt >= startOfMonth,
  ).length;

  const stats = [
    {
      title: "Open Incidents",
      value: openCount.toString(),
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Critical Severity",
      value: criticalCount.toString(),
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Avg. Resolution Time",
      value: avgResolution,
      icon: Clock,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total This Month",
      value: totalThisMonth.toString(),
      icon: Activity,
      color: "text-[#635BFF]",
      bg: "bg-[#635BFF]/10",
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <h2 className="text-lg font-bold text-[#0A2540] tracking-tight">
              Incident Reporting
            </h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Major ICT-related incident classification and mandatory reporting
              (DORA Art. 17-23)
            </p>
          </div>
          <CreateIncidentDialog />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="border-[#E3E8EF] shadow-none bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {stat.title}
                    </p>
                    <div
                      className={cn(
                        "size-7 rounded-md flex items-center justify-center",
                        stat.bg,
                      )}
                    >
                      <Icon className={cn("size-3.5", stat.color)} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#0A2540] tabular-nums">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Table */}
        <Card className="border-[#E3E8EF] shadow-none bg-white">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Incidents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {incidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="size-12 rounded-full bg-[#F6F9FC] flex items-center justify-center mb-3">
                  <Inbox className="size-5 text-muted-foreground" />
                </div>
                <p className="text-[14px] font-semibold text-[#0A2540]">
                  No incidents found
                </p>
                <p className="text-[12px] text-muted-foreground mt-1 max-w-[200px]">
                  You haven&apos;t reported any ICT incidents yet.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-[#F6F9FC]">
                  <TableRow>
                    <TableHead className="w-[120px] text-[11px] font-semibold text-muted-foreground">
                      ID
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      Title
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      Severity
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      Reporter
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-semibold text-muted-foreground">
                      Reported
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => (
                    <TableRow
                      key={incident.id}
                      className="hover:bg-[#F6F9FC]/50 transition-colors"
                    >
                      <TableCell className="font-semibold text-[12px] text-[#0A2540]">
                        <div className="flex items-center gap-2">
                          <FileText className="size-3.5 text-muted-foreground" />
                          <span className="truncate max-w-[80px]">
                            {incident.id.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[12px] font-medium text-[#0A2540]">
                        {incident.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold h-auto py-0.5",
                            getSeverityColor(incident.severity),
                          )}
                        >
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold h-auto py-0.5",
                            getStatusColor(incident.status),
                          )}
                        >
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">
                        {incident.reportedBy?.name ?? "Unknown"}
                      </TableCell>
                      <TableCell className="text-right text-[12px] text-muted-foreground tabular-nums">
                        {formatRelativeTime(incident.createdAt.toISOString())}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
