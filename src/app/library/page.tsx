"use client";

import { BookOpen, Search, FileText, Download, MoreVertical, Plus, Filter } from "lucide-react";
import { ComingSoonPage } from "@/components/coming-soon";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/format";

const documents = [
  { id: "POL-001", title: "Information Security Policy", type: "Policy", status: "Active", lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), version: "v2.4" },
  { id: "PRO-042", title: "Incident Response Plan", type: "Procedure", status: "Active", lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), version: "v1.2" },
  { id: "SOP-118", title: "Vendor Onboarding SOP", type: "Standard", status: "Draft", lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), version: "v3.0-draft" },
  { id: "POL-029", title: "Business Continuity Plan", type: "Plan", status: "Review Required", lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(), version: "v1.0" },
  { id: "PRO-015", title: "Access Control Matrix", type: "Procedure", status: "Active", lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), version: "v4.1" },
  { id: "POL-008", title: "Data Classification Policy", type: "Policy", status: "Active", lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(), version: "v1.5" },
];

function getStatusColor(status: string) {
  switch (status) {
    case "Active": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Draft": return "bg-gray-50 text-gray-700 border-gray-200";
    case "Review Required": return "bg-amber-50 text-amber-700 border-amber-200";
    default: return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

export default function LibraryPage() {
  const handleUpload = () => {
    toast.success("Upload dialog opened", {
      description: "Upload a new policy or procedure document.",
    });
  };

  const handleDownload = (title: string) => {
    toast.success(`Downloading ${title}`, {
      description: "Document download started.",
    });
  };

  const dashboardContent = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h2 className="text-lg font-bold text-[#0A2540] tracking-tight">Policy & Procedure Library</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Central repository for all compliance and governance documentation</p>
        </div>
        <Button onClick={handleUpload} className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white btn-lift">
          <Plus className="size-3.5 mr-1.5" />
          Upload Document
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search policies, procedures, plans..." className="pl-9 h-9 text-[13px] bg-white border-[#E3E8EF] focus-visible:ring-[#635BFF]/20" />
        </div>
        <Button variant="outline" className="h-9 text-[13px] border-[#E3E8EF] bg-white text-[#0A2540]">
          <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
          More Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="border-[#E3E8EF] shadow-none bg-white hover:border-[#635BFF]/30 hover:shadow-md transition-all duration-200 group flex flex-col cursor-pointer">
            <CardContent className="p-4 flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="size-8 rounded-lg bg-[#635BFF]/10 flex items-center justify-center">
                  <FileText className="size-4 text-[#635BFF]" />
                </div>
                <Badge variant="outline" className={cn("text-[10px] font-semibold h-auto py-0.5", getStatusColor(doc.status))}>
                  {doc.status}
                </Badge>
              </div>
              <h3 className="text-[14px] font-bold text-[#0A2540] line-clamp-1 group-hover:text-[#635BFF] transition-colors">{doc.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{doc.type}</span>
                <div className="size-1 rounded-full bg-[#E3E8EF]" />
                <span className="text-[11px] text-muted-foreground font-mono">{doc.id}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 border-t border-[#E3E8EF] flex items-center justify-between bg-[#F6F9FC]/50 group-hover:bg-[#F6F9FC] transition-colors mt-auto">
              <div className="flex flex-col gap-0.5 pt-3">
                 <span className="text-[10px] text-muted-foreground font-semibold">Updated {formatRelativeTime(doc.lastUpdated)}</span>
                 <span className="text-[10px] text-muted-foreground">Version {doc.version}</span>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-[#635BFF] hover:bg-[#635BFF]/10" onClick={(e) => { e.stopPropagation(); handleDownload(doc.title); }}>
                  <Download className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-[#0A2540]" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="size-3.5" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <ComingSoonPage
      title="Regulatory Library"
      description="Searchable library of DORA regulation text, EBA/ESMA/EIOPA guidelines, RTS, and ITS documentation."
      icon={BookOpen}
      requiredTier="PRO"
    >
      {dashboardContent}
    </ComingSoonPage>
  );
}
