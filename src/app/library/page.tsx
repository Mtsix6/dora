import type { Metadata } from "next";
import { FileText, Inbox } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { CreatePolicyDialog } from "@/components/create-policy-dialog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Regulatory Library" };

function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Draft":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "Review Required":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  const documents = await prisma.policyDocument.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
  });

  const totalCount = documents.length;
  const activeCount = documents.filter((d: any) => d.status === "Active").length;
  const draftCount = documents.filter((d: any) => d.status === "Draft").length;
  const reviewCount = documents.filter(
    (d: any) => d.status === "Review Required"
  ).length;

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0A2540] tracking-tight">
              Regulatory Library
            </h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Central repository for all compliance and governance documentation
            </p>
          </div>
          <CreatePolicyDialog />
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Documents", value: totalCount, color: "text-[#635BFF]" },
            { label: "Active", value: activeCount, color: "text-emerald-600" },
            { label: "Draft", value: draftCount, color: "text-gray-600" },
            { label: "Review Required", value: reviewCount, color: "text-amber-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[#E3E8EF] bg-white p-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className={cn("text-2xl font-bold mt-1", stat.color)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Document grid or empty state */}
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-[#E3E8EF] rounded-xl shadow-sm">
            <div className="size-12 rounded-full bg-[#F6F9FC] flex items-center justify-center mb-3">
              <Inbox className="size-5 text-muted-foreground" />
            </div>
            <p className="text-[14px] font-semibold text-[#0A2540]">
              No documents uploaded yet
            </p>
            <p className="text-[12px] text-muted-foreground mt-1 max-w-[280px]">
              Upload your first compliance or governance policy to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc: any) => (
              <Card
                key={doc.id}
                className="border-[#E3E8EF] shadow-none bg-white hover:border-[#635BFF]/30 hover:shadow-md transition-all duration-200 group flex flex-col cursor-pointer"
              >
                <CardContent className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="size-8 rounded-lg bg-[#635BFF]/10 flex items-center justify-center">
                      <FileText className="size-4 text-[#635BFF]" />
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold h-auto py-0.5",
                        getStatusColor(doc.status)
                      )}
                    >
                      {doc.status}
                    </Badge>
                  </div>
                  <h3 className="text-[14px] font-bold text-[#0A2540] line-clamp-1 group-hover:text-[#635BFF] transition-colors">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                      {doc.type}
                    </span>
                    <div className="size-1 rounded-full bg-[#E3E8EF]" />
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {doc.id}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 border-t border-[#E3E8EF] flex items-center justify-between bg-[#F6F9FC]/50 group-hover:bg-[#F6F9FC] transition-colors mt-auto">
                  <div className="flex flex-col gap-0.5 pt-3">
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Updated {formatRelativeTime(doc.updatedAt.toISOString())}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Version {doc.version}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
