import type { Metadata } from "next";
import { Building2, AlertTriangle, FileCheck2, CalendarClock, Inbox } from "lucide-react";
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
import { CreateVendorDialog } from "@/components/create-vendor-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Third-Party Risk Management" };

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

function getStatusColor(status: string) {
  switch (status) {
    case "Compliant":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Review Pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Non-Compliant":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default async function ThirdPartyRiskPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  const vendors = await prisma.vendor.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const totalVendors = vendors.length;
  const criticalProviders = vendors.filter(
    (v: any) => v.criticality === "Critical"
  ).length;
  const compliantCount = vendors.filter(
    (v: any) => v.status === "Compliant"
  ).length;
  const compliantPct =
    totalVendors > 0 ? Math.round((compliantCount / totalVendors) * 100) : 0;
  const overdueReviews = vendors.filter(
    (v: any) => v.nextReviewAt && v.nextReviewAt < now
  ).length;

  const stats = [
    {
      title: "Total Vendors",
      value: totalVendors,
      icon: Building2,
      color: "text-[#635BFF]",
      bg: "bg-[#635BFF]/10",
    },
    {
      title: "Critical Providers",
      value: criticalProviders,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Compliant",
      value: totalVendors > 0 ? `${compliantPct}%` : "-",
      icon: FileCheck2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Overdue Reviews",
      value: overdueReviews,
      icon: CalendarClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0A2540] tracking-tight">
              Third-Party Risk Management
            </h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              ICT third-party service provider oversight (DORA Art. 28-44)
            </p>
          </div>
          <CreateVendorDialog />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="border-[#E3E8EF] shadow-none bg-white"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {stat.title}
                    </p>
                    <div
                      className={cn(
                        "size-7 rounded-md flex items-center justify-center",
                        stat.bg
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

        {/* Data table */}
        <Card className="border-[#E3E8EF] shadow-none bg-white">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              Information Register (Art. 28)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {vendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="size-12 rounded-full bg-[#F6F9FC] flex items-center justify-center mb-3">
                  <Inbox className="size-5 text-muted-foreground" />
                </div>
                <p className="text-[14px] font-semibold text-[#0A2540]">
                  No vendors registered
                </p>
                <p className="text-[12px] text-muted-foreground mt-1 max-w-[240px]">
                  Add your first ICT third-party provider to begin tracking.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-[#F6F9FC]">
                  <TableRow>
                    <TableHead className="w-[180px] text-[11px] font-semibold text-muted-foreground">
                      Provider Name
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      Criticality
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      DORA Status
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-semibold text-muted-foreground">
                      Next Review
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor: any) => {
                    const isOverdue =
                      vendor.nextReviewAt && vendor.nextReviewAt < now;
                    return (
                      <TableRow
                        key={vendor.id}
                        className="hover:bg-[#F6F9FC]/50 transition-colors"
                      >
                        <TableCell className="font-semibold text-[12px] text-[#0A2540]">
                          <div className="flex flex-col">
                            <span>{vendor.name}</span>
                            <span className="font-normal text-[11px] text-muted-foreground">
                              {vendor.id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[12px] text-[#0A2540] font-medium">
                          {vendor.category}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold h-auto py-0.5",
                              getCriticalityColor(vendor.criticality)
                            )}
                          >
                            {vendor.criticality}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold h-auto py-0.5",
                              getStatusColor(vendor.status)
                            )}
                          >
                            {vendor.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-[12px] text-muted-foreground tabular-nums">
                          {vendor.nextReviewAt ? (
                            isOverdue ? (
                              <span className="text-red-600 font-semibold">
                                Overdue
                              </span>
                            ) : (
                              formatRelativeTime(
                                vendor.nextReviewAt.toISOString()
                              )
                            )
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
