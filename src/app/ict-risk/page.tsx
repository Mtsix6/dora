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
  Server,
  AlertCircle,
  TrendingDown,
  Shield,
  Laptop,
  Inbox,
} from "lucide-react";
import { CreateAssetDialog } from "@/components/create-asset-dialog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "ICT Risk Management" };

function getCriticalityColor(criticality: string) {
  switch (criticality) {
    case "Critical":
      return "bg-red-50 text-red-700 border-red-200";
    case "High":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

function getRiskScoreColor(score: number) {
  if (score >= 80) return "text-red-600 bg-red-50 border-red-200";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-emerald-600 bg-emerald-50 border-emerald-200";
}

export default async function IctRiskPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  const assets = await prisma.ictAsset.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  // KPI calculations
  const criticalCount = assets.filter(
    (a) => a.criticality === "Critical",
  ).length;
  const highRiskCount = assets.filter(
    (a) => a.riskScore !== null && a.riskScore >= 60,
  ).length;
  const assetsWithScore = assets.filter((a) => a.riskScore !== null);
  const avgRiskScore =
    assetsWithScore.length > 0
      ? Math.round(
          assetsWithScore.reduce((acc, a) => acc + (a.riskScore ?? 0), 0) /
            assetsWithScore.length,
        )
      : 0;
  const totalAssets = assets.length;

  const stats = [
    {
      title: "Critical Assets",
      value: criticalCount.toString(),
      icon: Server,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "High Risk",
      value: highRiskCount.toString(),
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Avg Risk Score",
      value: avgRiskScore.toString(),
      icon: TrendingDown,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Total Assets",
      value: totalAssets.toString(),
      icon: Shield,
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
              ICT Risk Management
            </h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Risk identification, protection, detection, response and recovery
              (DORA Art. 5-16)
            </p>
          </div>
          <CreateAssetDialog />
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
              ICT Asset Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="size-12 rounded-full bg-[#F6F9FC] flex items-center justify-center mb-3">
                  <Inbox className="size-5 text-muted-foreground" />
                </div>
                <p className="text-[14px] font-semibold text-[#0A2540]">
                  No ICT Assets found
                </p>
                <p className="text-[12px] text-muted-foreground mt-1 max-w-[200px]">
                  You haven&apos;t added any critical assets to your inventory.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-[#F6F9FC]">
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      Criticality
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      Risk Score
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-semibold text-muted-foreground">
                      Last Assessed
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow
                      key={asset.id}
                      className="hover:bg-[#F6F9FC]/50 transition-colors"
                    >
                      <TableCell className="text-[12px] font-medium text-[#0A2540]">
                        <div className="flex items-center gap-2">
                          <Laptop className="size-3.5 text-muted-foreground" />
                          {asset.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">
                        {asset.category}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold h-auto py-0.5",
                            getCriticalityColor(asset.criticality),
                          )}
                        >
                          {asset.criticality}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold h-auto py-0.5",
                            getRiskScoreColor(asset.riskScore ?? 0),
                          )}
                        >
                          {asset.riskScore ?? 0}/100
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[12px] text-muted-foreground tabular-nums">
                        {asset.lastAssessedAt
                          ? formatRelativeTime(
                              asset.lastAssessedAt.toISOString(),
                            )
                          : "Never"}
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
