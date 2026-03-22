import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileClock,
  FileText,
  Inbox,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { formatRelativeTime } from "@/lib/format";
import { mapContractStatus } from "@/lib/dora";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "In Review" };

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  // Get contracts in EXTRACTED status (ready for review)
  const contracts = await prisma.contract.findMany({
    where: { workspaceId, status: "EXTRACTED" },
    include: { uploadedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">In Review</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Documents awaiting compliance officer review, prioritised by confidence score and urgency.
            </p>
          </div>
          <Badge variant="outline" className="text-[11px] font-semibold border-amber-200 text-amber-700 bg-amber-50">
            {contracts.length} pending
          </Badge>
        </div>

        {contracts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="mx-auto size-14 rounded-2xl bg-[#F6F9FC] border border-[#E3E8EF] flex items-center justify-center mb-4">
                <Inbox className="size-6 text-muted-foreground/40" />
              </div>
              <p className="text-[14px] font-semibold text-[#0A2540]">No documents in review</p>
              <p className="text-[12px] text-muted-foreground mt-1">
                Upload and extract contracts to see them here for review.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contracts.map((contract: any) => {
              const data = (contract.extractedData as Record<string, any>) ?? {};
              const entityName = data?.entityName?.value || "Unknown entity";
              const avgConf = (() => {
                const vals = Object.values(data)
                  .filter((f: any) => typeof f?.confidence === "number")
                  .map((f: any) => f.confidence as number);
                return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
              })();

              return (
                <Link key={contract.id} href={`/extraction?id=${contract.id}`}>
                  <Card className="border-[#E3E8EF] shadow-none bg-white hover:border-[#635BFF]/30 hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="size-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <FileClock className="size-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#0A2540] truncate">{contract.fileName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {entityName} · Uploaded by {contract.uploadedBy?.name || contract.uploadedBy?.email || "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={cn(
                          "text-[11px] font-bold tabular-nums",
                          avgConf >= 80 ? "text-emerald-600" : avgConf >= 60 ? "text-amber-600" : "text-red-600"
                        )}>
                          <ShieldCheck className="size-3 inline mr-0.5" />
                          {avgConf}%
                        </div>
                        <StatusBadge status={mapContractStatus(contract.status)} />
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          {formatRelativeTime(contract.createdAt.toISOString())}
                        </span>
                        <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
