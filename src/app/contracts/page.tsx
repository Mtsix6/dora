import type { Metadata } from "next";
import Link from "next/link";
import { type ContractStatus, type Prisma } from "@prisma/client";
import { ArrowUpRight, FileText, Search, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { mapContractStatus } from "@/lib/dora";
import type { ConfidenceLevel } from "@/types/extraction";
import { UploadDialog } from "@/components/upload-dialog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contracts" };

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "extracted", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

function getAvgConfidence(extractedData: Record<string, unknown> | null) {
  if (!extractedData) return null;
  const data = extractedData as Record<string, { confidence?: number }>;
  const values = Object.values(data)
    .map((field) => field?.confidence)
    .filter((value): value is number => typeof value === "number");
  if (values.length === 0) return null;
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const level: ConfidenceLevel = avg >= 80 ? "high" : avg >= 60 ? "medium" : "low";
  return { value: avg, level };
}

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;
  const { q = "", status = "all" } = await searchParams;
  const normalizedStatus = status.toLowerCase();
  const normalizedQuery = q.trim();

  const where: Prisma.ContractWhereInput = {
    workspaceId,
  };

  if (normalizedStatus !== "all") {
    where.status = normalizedStatus.toUpperCase() as ContractStatus;
  }

  if (normalizedQuery) {
    where.OR = [
      { fileName: { contains: normalizedQuery, mode: "insensitive" } },
      { extractedData: { path: ["entityName", "value"], string_contains: normalizedQuery } },
      { extractedData: { path: ["leiCode", "value"], string_contains: normalizedQuery } },
    ];
  }

  const contracts = await prisma.contract.findMany({
    where,
    include: { uploadedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell>
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#0A2540]">Contracts</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {contracts.length} ICT third-party contractual arrangement{contracts.length !== 1 ? "s" : ""} in the current view
            </p>
          </div>
          <div className="flex gap-2">
            <UploadDialog />
            <UploadDialog
              triggerLabel="New extraction"
              openLatestOnSuccess
              triggerClassName="bg-[#635BFF] text-white border-[#635BFF] hover:bg-[#4F46E5] hover:border-[#4F46E5]"
            />
          </div>
        </div>

        <Card className="border-[#E3E8EF] bg-white shadow-none">
          <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
            <form method="GET" className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={normalizedQuery}
                placeholder="Search by entity name, filename or LEI..."
                className="h-8 border-[#E3E8EF] bg-[#F6F9FC] pl-8 text-[12px] focus-visible:border-[#635BFF] focus-visible:ring-[#635BFF]/30"
              />
              <input type="hidden" name="status" value={normalizedStatus} />
            </form>
            <div className="flex flex-wrap gap-2">
              {STATUS_TABS.map((tab) => (
                <Link
                  key={tab.value}
                  href={`/contracts?status=${tab.value}${normalizedQuery ? `&q=${encodeURIComponent(normalizedQuery)}` : ""}`}
                >
                  <Button
                    variant={normalizedStatus === tab.value ? "default" : "outline"}
                    size="sm"
                    className={
                      normalizedStatus === tab.value
                        ? "h-8 bg-[#635BFF] text-[12px] text-white hover:bg-[#4F46E5]"
                        : "h-8 border-[#E3E8EF] text-[12px]"
                    }
                  >
                    {tab.label}
                  </Button>
                </Link>
              ))}
            </div>
            <Badge variant="outline" className="h-8 border-[#E3E8EF] px-3 text-[11px] text-muted-foreground">
              <SlidersHorizontal className="mr-1.5 size-3.5" />
              {normalizedStatus === "all" ? "All statuses" : normalizedStatus}
            </Badge>
          </CardContent>
        </Card>

        <Card className="flex-1 border-[#E3E8EF] bg-white shadow-none">
          {contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#635BFF]/10">
                <FileText className="size-6 text-[#635BFF]" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#0A2540]">No matching contracts</h3>
              <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
                Adjust the search or status filter, or upload a new contract to start extraction.
              </p>
              <div className="mt-4">
                <UploadDialog />
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#E3E8EF] hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Document
                  </TableHead>
                  <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Entity Name
                  </TableHead>
                  <TableHead className="hidden h-9 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                    End Date
                  </TableHead>
                  <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Confidence
                  </TableHead>
                  <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="hidden h-9 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                    Uploaded
                  </TableHead>
                  <TableHead className="w-10 h-9" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => {
                  const extracted = contract.extractedData as Record<string, { value?: string; confidence?: number }> | null;
                  const entityName = extracted?.entityName?.value || "";
                  const endDate = extracted?.endDate?.value || extracted?.contractEndDate?.value || "";
                  const avgConf = getAvgConfidence(contract.extractedData as Record<string, unknown> | null);
                  const uiStatus = mapContractStatus(contract.status);

                  return (
                    <TableRow key={contract.id} className="group cursor-pointer border-[#E3E8EF]">
                      <TableCell className="pl-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-md bg-[#635BFF]/8">
                            <FileText className="size-3.5 text-[#635BFF]" />
                          </div>
                          <span className="max-w-[140px] truncate text-[12px] font-semibold text-[#0A2540]">
                            {contract.fileName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="block max-w-[160px] truncate text-[12px] text-[#0A2540]">
                          {entityName || (
                            <span className="italic text-muted-foreground">
                              {contract.status === "PROCESSING" ? "Extracting..." : "-"}
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="hidden py-2.5 md:table-cell">
                        <span className="text-[12px] text-[#0A2540]">
                          {endDate ? formatDate(endDate) : "-"}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        {avgConf ? (
                          <ConfidenceBadge confidence={avgConf} />
                        ) : (
                          <span className="text-[11px] text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <StatusBadge status={uiStatus} />
                      </TableCell>
                      <TableCell className="hidden py-2.5 sm:table-cell">
                        <span className="text-[11px] text-muted-foreground">
                          {formatRelativeTime(contract.createdAt.toISOString())}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 pr-3">
                        <Link href={`/extraction?id=${contract.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <ArrowUpRight className="size-3.5 text-muted-foreground" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>

        {contracts.length > 0 && (
          <div className="flex items-center justify-between text-[12px] text-muted-foreground">
            <span>Showing {contracts.length} contract{contracts.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}
