import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadDialog } from "@/components/upload-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { mapContractStatus } from "@/lib/dora";
import type { ConfidenceLevel } from "@/types/extraction";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Contracts" };

function getAvgConfidence(extractedData: Record<string, unknown> | null) {
  if (!extractedData) return null;
  const data = extractedData as Record<string, { confidence?: number }>;
  const values = Object.values(data)
    .map((f) => f?.confidence)
    .filter((v): v is number => typeof v === "number");
  if (values.length === 0) return null;
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const level: ConfidenceLevel = avg >= 80 ? "high" : avg >= 60 ? "medium" : "low";
  return { value: avg, level };
}

export default async function ContractsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  const contracts = await prisma.contract.findMany({
    where: { workspaceId },
    include: { uploadedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-4 p-6 overflow-y-auto h-full">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">Contracts</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {contracts.length} ICT third-party contractual arrangement{contracts.length !== 1 ? "s" : ""} · DORA Art. 28 Register
            </p>
          </div>
          <div className="flex gap-2">
            <UploadDialog />
            <Link href="/extraction">
              <Button size="sm" className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white btn-lift">
                <Plus className="size-3.5 mr-1.5" />
                New extraction
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <Card className="border-[#E3E8EF] shadow-none bg-white">
          <CardContent className="p-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by entity name, filename or LEI..."
                className="pl-8 h-8 text-[12px] border-[#E3E8EF] bg-[#F6F9FC] focus-visible:ring-[#635BFF]/30 focus-visible:border-[#635BFF]"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 text-[12px] border-[#E3E8EF] flex-shrink-0">
              <Filter className="size-3.5 mr-1.5" />
              Filters
            </Button>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="h-8 bg-[#F6F9FC] border border-[#E3E8EF] p-0.5 rounded-lg">
            {[
              { value: "all", label: "All" },
              { value: "review", label: "In Review" },
              { value: "approved", label: "Approved" },
              { value: "pending", label: "Pending" },
              { value: "rejected", label: "Rejected" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="h-7 text-[12px] px-3 data-[state=active]:bg-white data-[state=active]:text-[#0A2540] data-[state=active]:shadow-sm rounded-md"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Table */}
        <Card className="border-[#E3E8EF] shadow-none bg-white flex-1">
          {contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-12 rounded-xl bg-[#635BFF]/10 flex items-center justify-center mb-4">
                <FileText className="size-6 text-[#635BFF]" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#0A2540]">No contracts yet</h3>
              <p className="text-[13px] text-muted-foreground mt-1 max-w-xs">
                Upload your first ICT contract to get started with DORA compliance automation.
              </p>
              <div className="mt-4">
                <UploadDialog />
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#E3E8EF] hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9 pl-4">
                    Document
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9">
                    Entity Name
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9 hidden md:table-cell">
                    End Date
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9">
                    Confidence
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9 hidden sm:table-cell">
                    Uploaded
                  </TableHead>
                  <TableHead className="w-10 h-9" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => {
                  const extracted = contract.extractedData as Record<string, { value?: string; confidence?: number }> | null;
                  const entityName = extracted?.entityName?.value || "";
                  const endDate = extracted?.endDate?.value || "";
                  const avgConf = getAvgConfidence(contract.extractedData as Record<string, unknown> | null);
                  const uiStatus = mapContractStatus(contract.status);

                  return (
                    <TableRow
                      key={contract.id}
                      className="border-[#E3E8EF] cursor-pointer group row-hover"
                    >
                      <TableCell className="pl-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-md bg-[#635BFF]/8 flex items-center justify-center flex-shrink-0">
                            <FileText className="size-3.5 text-[#635BFF]" />
                          </div>
                          <span className="text-[12px] font-semibold text-[#0A2540] truncate max-w-[140px]">
                            {contract.fileName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-[12px] text-[#0A2540] truncate max-w-[160px] block">
                          {entityName || (
                            <span className="text-muted-foreground italic">
                              {contract.status === "PROCESSING" ? "Extracting..." : "—"}
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 hidden md:table-cell">
                        <span className="text-[12px] text-[#0A2540]">
                          {endDate ? formatDate(endDate) : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        {avgConf ? (
                          <ConfidenceBadge confidence={avgConf} />
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <StatusBadge status={uiStatus} />
                      </TableCell>
                      <TableCell className="py-2.5 hidden sm:table-cell">
                        <span className="text-[11px] text-muted-foreground">
                          {formatRelativeTime(contract.createdAt.toISOString())}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 pr-3">
                        <Link href={`/extraction?id=${contract.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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

        {/* Pagination */}
        {contracts.length > 0 && (
          <div className="flex items-center justify-between text-[12px] text-muted-foreground">
            <span>Showing {contracts.length} contract{contracts.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
}
