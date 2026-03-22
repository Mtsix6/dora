import type { Metadata } from "next";
import {
  Clock,
  FileCheck2,
  FileText,
  Inbox,
  Pencil,
  ThumbsDown,
  ThumbsUp,
  Upload,
  User,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Audit Log" };

const ACTION_ICONS: Record<string, React.ElementType> = {
  "Document approved": ThumbsUp,
  "Document rejected": ThumbsDown,
  "Fields updated": Pencil,
  "Document uploaded": Upload,
  "Extraction started": FileCheck2,
};

const ACTION_COLORS: Record<string, string> = {
  "Document approved": "bg-emerald-50 text-emerald-600",
  "Document rejected": "bg-red-50 text-red-600",
  "Fields updated": "bg-blue-50 text-blue-600",
  "Document uploaded": "bg-[#635BFF]/8 text-[#635BFF]",
  "Extraction started": "bg-amber-50 text-amber-600",
};

export default async function AuditPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  const activities = await prisma.activity.findMany({
    where: { workspaceId },
    include: {
      user: { select: { name: true, email: true } },
      contract: { select: { fileName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">Audit Log</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Immutable, timestamped log of every action for regulatory evidence.
            </p>
          </div>
          <Badge variant="outline" className="text-[11px] font-semibold border-[#E3E8EF] text-muted-foreground">
            {activities.length} entries
          </Badge>
        </div>

        {activities.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="mx-auto size-14 rounded-2xl bg-[#F6F9FC] border border-[#E3E8EF] flex items-center justify-center mb-4">
                <Inbox className="size-6 text-muted-foreground/40" />
              </div>
              <p className="text-[14px] font-semibold text-[#0A2540]">No activity yet</p>
              <p className="text-[12px] text-muted-foreground mt-1">
                Actions on contracts and documents will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {activities.map((entry: any) => {
              const Icon = ACTION_ICONS[entry.action] || FileText;
              const colorClass = ACTION_COLORS[entry.action] || "bg-[#F6F9FC] text-muted-foreground";
              const userName = entry.user?.name || entry.user?.email || "System";

              return (
                <Card key={entry.id} className="border-[#E3E8EF] shadow-none bg-white">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={cn("size-8 rounded-lg flex items-center justify-center flex-shrink-0", colorClass)}>
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#0A2540]">{entry.action}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {entry.contract?.fileName || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <User className="size-3" />
                        <span className="hidden sm:inline">{userName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{formatRelativeTime(entry.createdAt.toISOString())}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
