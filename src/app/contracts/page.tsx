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
import { MOCK_CONTRACTS } from "@/lib/mock-data";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { CRITICAL_FUNCTION_OPTIONS } from "@/types/extraction";
import { StatusBadge } from "@/components/status-badge";
import { ConfidenceBadge } from "@/components/confidence-badge";

export const metadata: Metadata = { title: "Contracts" };

function getAvgConfidence(fields: (typeof MOCK_CONTRACTS)[0]["fields"]) {
  const vals = Object.values(fields).map((f) => f.confidence.value);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const level = avg >= 80 ? "high" : avg >= 60 ? "medium" : "low";
  return { value: Math.round(avg), level } as const;
}

function getCriticalFunctionLabel(value: string) {
  return CRITICAL_FUNCTION_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

// We extend mock data with more rows for the table view
const ALL_CONTRACTS = [
  ...MOCK_CONTRACTS,
  {
    id: "doc-006",
    filename: "Google_Cloud_SLA.pdf",
    status: "approved" as const,
    uploadedAt: new Date(Date.now() - 5 * 24 * 3600_000).toISOString(),
    fields: {
      entityName: { value: "Google Ireland Ltd", confidence: { value: 96, level: "high" as const }, isEdited: false },
      leiCode: { value: "635400ZRQH8STNP72B13", confidence: { value: 93, level: "high" as const }, isEdited: false },
      criticalFunctionTag: { value: "cloud_storage", confidence: { value: 89, level: "high" as const }, isEdited: false },
      startDate: { value: "2023-09-01", confidence: { value: 97, level: "high" as const }, isEdited: false },
      endDate: { value: "2025-06-30", confidence: { value: 82, level: "high" as const }, isEdited: false },
    },
  },
  {
    id: "doc-007",
    filename: "Cloudflare_DPA.pdf",
    status: "review" as const,
    uploadedAt: new Date(Date.now() - 7 * 24 * 3600_000).toISOString(),
    fields: {
      entityName: { value: "Cloudflare Ltd", confidence: { value: 88, level: "high" as const }, isEdited: false },
      leiCode: { value: "549300QNTEAT54WBJE72", confidence: { value: 71, level: "medium" as const }, isEdited: false },
      criticalFunctionTag: { value: "cyber_security", confidence: { value: 55, level: "medium" as const }, isEdited: false },
      startDate: { value: "2024-02-01", confidence: { value: 90, level: "high" as const }, isEdited: false },
      endDate: { value: "2025-01-31", confidence: { value: 85, level: "high" as const }, isEdited: false },
    },
  },
];

export default function ContractsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-4 p-6 overflow-y-auto h-full">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">Contracts</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {ALL_CONTRACTS.length} ICT third-party contractual arrangements · DORA Art. 28 Register
            </p>
          </div>
          <div className="flex gap-2">
            <UploadDialog />
            <Link href="/extraction">
              <Button size="sm" className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white">
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
                placeholder="Search by entity name, filename or LEI…"
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
          <Table>
            <TableHeader>
              <TableRow className="border-[#E3E8EF] hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9 pl-4">
                  Document
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9">
                  Entity Name
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9 hidden lg:table-cell">
                  Function Tag
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
              {ALL_CONTRACTS.map((contract) => {
                const avgConf = getAvgConfidence(contract.fields);
                return (
                  <TableRow
                    key={contract.id}
                    className="border-[#E3E8EF] hover:bg-[#F6F9FC] cursor-pointer group transition-colors"
                  >
                    <TableCell className="pl-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-md bg-[#635BFF]/8 flex items-center justify-center flex-shrink-0">
                          <FileText className="size-3.5 text-[#635BFF]" />
                        </div>
                        <span className="text-[12px] font-semibold text-[#0A2540] truncate max-w-[140px]">
                          {contract.filename}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className="text-[12px] text-[#0A2540] truncate max-w-[160px] block">
                        {contract.fields.entityName.value || (
                          <span className="text-muted-foreground italic">Extracting…</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 hidden lg:table-cell">
                      {contract.fields.criticalFunctionTag.value ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-[#E3E8EF] text-muted-foreground font-medium h-auto px-1.5 py-0.5 rounded-md"
                        >
                          {getCriticalFunctionLabel(contract.fields.criticalFunctionTag.value)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 hidden md:table-cell">
                      <span className="text-[12px] text-[#0A2540]">
                        {formatDate(contract.fields.endDate.value) || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      {contract.status !== "extracting" ? (
                        <ConfidenceBadge confidence={avgConf} />
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <StatusBadge status={contract.status} />
                    </TableCell>
                    <TableCell className="py-2.5 hidden sm:table-cell">
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelativeTime(contract.uploadedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 pr-3">
                      <Link href="/extraction">
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
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between text-[12px] text-muted-foreground">
          <span>Showing {ALL_CONTRACTS.length} of 47 contracts</span>
          <div className="flex gap-1">
            {[1, 2, 3, "…", 7].map((p, i) => (
              <Button
                key={i}
                variant={p === 1 ? "default" : "ghost"}
                size="sm"
                className={`h-7 w-7 p-0 text-[12px] ${p === 1 ? "bg-[#635BFF] text-white hover:bg-[#4F46E5]" : "text-muted-foreground"}`}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
