import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  FileText,
  GitBranch,
  Hash,
  Inbox,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import { mapContractStatus } from "@/lib/dora";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ICT Third-Party Register" };

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  // Only approved contracts go into the register
  const contracts = await prisma.contract.findMany({
    where: { workspaceId, status: "APPROVED" },
    include: { uploadedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">
                ICT Third-Party Register
              </h1>
            </div>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              DORA Art. 28(3) · Register of all contractual arrangements with ICT third-party service providers.
            </p>
          </div>
          <Badge variant="outline" className="text-[11px] font-semibold border-emerald-200 text-emerald-700 bg-emerald-50">
            {contracts.length} registered
          </Badge>
        </div>

        {contracts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="mx-auto size-14 rounded-2xl bg-[#F6F9FC] border border-[#E3E8EF] flex items-center justify-center mb-4">
                <Inbox className="size-6 text-muted-foreground/40" />
              </div>
              <p className="text-[14px] font-semibold text-[#0A2540]">Register is empty</p>
              <p className="text-[12px] text-muted-foreground mt-1">
                Approved contracts will appear here as register entries. Upload and approve contracts to populate your DORA register.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E3E8EF]">
                  {["Entity Name", "LEI Code", "Function", "Start Date", "End Date", "Status"].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract: any) => {
                  const data = (contract.extractedData as Record<string, any>) ?? {};
                  return (
                    <tr key={contract.id} className="border-b border-[#E3E8EF]/60 hover:bg-[#F6F9FC] transition-colors">
                      <td className="px-3 py-2.5">
                        <Link href={`/extraction?id=${contract.id}`} className="group flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-[#0A2540] group-hover:text-[#635BFF] transition-colors">
                            {data?.entityName?.value || contract.fileName}
                          </span>
                          <ArrowUpRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] font-mono text-muted-foreground tracking-wider">
                        {data?.leiCode?.value || "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="text-[10px] font-medium border-[#E3E8EF]">
                          {data?.criticalFunctionTag?.value?.replace(/_/g, " ") || "—"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-muted-foreground">
                        {data?.startDate?.value || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-muted-foreground">
                        {data?.endDate?.value || "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={mapContractStatus(contract.status)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
