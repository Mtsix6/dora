import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";
import {
  BarChart3,
  FileText,
  Plus,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  TemplateCards,
  ReportVaultToolbar,
  DownloadButton,
} from "./_components/report-actions";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    redirect("/login");
  }

  const { q } = await searchParams;

  const reports = await prisma.report.findMany({
    where: {
      workspaceId: session.user.workspaceId,
      ...(q
        ? { title: { contains: q, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { generatedBy: { select: { name: true } } },
  });

  function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <AppShell>
      <div className="flex flex-col h-full bg-[#FAFBFC]">
        {/* Top Header */}
        <div className="px-8 py-10 border-b border-[#E3E8EF] bg-white">
          <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="size-5 text-[#635BFF]" />
                <h1 className="text-2xl font-bold text-[#111827]">
                  Reporting Center
                </h1>
              </div>
              <p className="text-sm text-[#475467]">
                Generate, schedule, and export investor-ready compliance
                reports.
              </p>
            </div>
            <Button className="bg-[#635BFF] hover:bg-[#5249E0] text-white shadow-lg h-11 px-6 font-bold rounded-xl gap-2">
              <Plus className="size-4" />
              Custom Report
            </Button>
          </div>

          {/* Template cards (client component) */}
          <TemplateCards />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-[#E3E8EF] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E3E8EF] flex items-center justify-between bg-gray-50/30">
                <h2 className="text-lg font-bold text-[#111827]">
                  Report Vault
                </h2>
                {/* Search + Export (client component) */}
                <ReportVaultToolbar />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F9FBFC] text-[11px] font-bold text-[#667085] uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Report Name</th>
                      <th className="px-6 py-4">Format</th>
                      <th className="px-6 py-4">Generated Date</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reports.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-sm text-[#667085]"
                        >
                          No reports yet. Click a template above to generate
                          your first report.
                        </td>
                      </tr>
                    )}
                    {reports.map((report) => (
                      <tr
                        key={report.id}
                        className="group hover:bg-[#F9FBFC] transition-colors"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#635BFF]/10 group-hover:text-[#635BFF] transition-colors">
                              <FileText className="size-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#111827]">
                                {report.title}
                              </p>
                              <p className="text-[10px] text-[#667085] font-medium">
                                {report.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                            {report.format}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#475467] font-medium">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="px-6 py-5 text-sm text-[#667085] font-medium">
                          {report.type.replace(/_/g, " ")}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-inset",
                              report.status === "Ready"
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                                : report.status === "Failed"
                                  ? "bg-red-50 text-red-700 ring-red-600/20"
                                  : "bg-gray-50 text-gray-600 ring-gray-500/10"
                            )}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <DownloadButton reportId={report.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-[#E3E8EF] flex items-center justify-between text-[#667085]">
                <p className="text-xs font-medium italic opacity-80">
                  Showing {reports.length} generated{" "}
                  {reports.length === 1 ? "report" : "reports"}
                </p>
                <button className="text-xs font-bold text-[#635BFF] hover:underline">
                  View archive
                </button>
              </div>
            </div>

            {/* Automation Banner */}
            <div className="bg-gradient-to-r from-[#111827] to-[#1F2937] p-8 rounded-3xl relative overflow-hidden shadow-2xl border border-white/5">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Clock className="size-5 text-blue-400" />
                    Automated Scheduling
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Configure automated report delivery for your board,
                    auditors, or regulators. Set monthly intervals for DORA
                    compliance summaries and never miss a deadline.
                  </p>
                </div>
                <Button className="w-full md:w-auto bg-white text-[#111827] hover:bg-gray-100 font-bold px-10 h-12 rounded-xl">
                  Configure Schedule
                </Button>
              </div>
              {/* Visual accents */}
              <div className="absolute top-0 right-0 h-full w-48 bg-gradient-to-l from-[#635BFF]/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
