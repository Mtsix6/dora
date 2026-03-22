import type { Metadata } from "next";
import { FileCheck, ShieldAlert, CalendarClock, TestTubes, Inbox } from "lucide-react";
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
import { CreateTestDialog } from "@/components/create-test-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Resilience Testing" };

function getStatusColor(status: string) {
  switch (status) {
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "In Progress":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Scheduled":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default async function ResiliencePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  const tests: any[] = await prisma.resilienceTest.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  const completedTests = tests.filter((t: any) => t.status === "Completed").length;
  const activeFindings = tests
    .filter((t: any) => t.status !== "Completed")
    .reduce((sum: number, t: any) => sum + (t.findings || 0), 0);
  const scheduledTests = tests.filter((t: any) => t.status === "Scheduled").length;
  const totalTests = tests.length;

  const stats = [
    {
      title: "Completed Tests",
      value: completedTests,
      icon: FileCheck,
      color: "text-[#635BFF]",
      bg: "bg-[#635BFF]/10",
    },
    {
      title: "Active Findings",
      value: activeFindings,
      icon: ShieldAlert,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Scheduled Tests",
      value: scheduledTests,
      icon: CalendarClock,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Tests",
      value: totalTests,
      icon: TestTubes,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0A2540] tracking-tight">
              Resilience Testing
            </h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Digital operational resilience testing (DORA Art. 24-27)
            </p>
          </div>
          <CreateTestDialog />
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
              Recent &amp; Upcoming Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {tests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="size-12 rounded-full bg-[#F6F9FC] flex items-center justify-center mb-3">
                  <Inbox className="size-5 text-muted-foreground" />
                </div>
                <p className="text-[14px] font-semibold text-[#0A2540]">
                  No resilience tests scheduled yet
                </p>
                <p className="text-[12px] text-muted-foreground mt-1 max-w-[240px]">
                  Schedule your first test to start tracking resilience.
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
                      Type
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground">
                      Findings
                    </TableHead>
                    <TableHead className="text-right text-[11px] font-semibold text-muted-foreground">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test: any) => (
                    <TableRow
                      key={test.id}
                      className="hover:bg-[#F6F9FC]/50 transition-colors"
                    >
                      <TableCell className="text-[12px] font-medium text-[#0A2540]">
                        {test.name}
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">
                        {test.type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold h-auto py-0.5",
                            getStatusColor(test.status)
                          )}
                        >
                          {test.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                        {test.findings > 0 ? (
                          <span className="text-amber-600 font-semibold">
                            {test.findings}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right text-[12px] text-muted-foreground tabular-nums">
                        {formatRelativeTime(
                          (
                            test.scheduledAt ?? test.createdAt
                          ).toISOString()
                        )}
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
