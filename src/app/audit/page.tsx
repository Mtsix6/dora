import type { Metadata } from "next";
import { Shield, FileLock, FileText, Inbox } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Audit Vault" };

export default async function AuditVaultPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  const [auditLogs, documents] = await Promise.all([
    prisma.auditLog.findMany({
      where: { workspaceId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.policyDocument.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  const isEmpty = auditLogs.length === 0 && documents.length === 0;

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full custom-scrollbar">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <FileLock className="size-5 text-[#635BFF]" />
            <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">
              Audit Vault
            </h1>
          </div>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Secure, immutable storage for DORA compliance documentation and audit evidence.
          </p>
        </div>

        {isEmpty ? (
          <Card className="border-[#E3E8EF] shadow-none bg-white rounded-2xl">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-14 rounded-2xl bg-[#635BFF]/10 flex items-center justify-center mb-4">
                <Inbox className="size-7 text-[#635BFF]" />
              </div>
              <h3 className="text-[15px] font-bold text-[#0A2540] mb-1">No audit data yet</h3>
              <p className="text-[13px] text-muted-foreground max-w-sm">
                Audit logs and secure documents will appear here as your team interacts with the platform.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Audit Trail */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[#0A2540]">Audit Trail</h2>
                <Badge variant="outline" className="text-[11px] font-semibold border-[#E3E8EF] text-muted-foreground">
                  {auditLogs.length} entries
                </Badge>
              </div>

              {auditLogs.length > 0 ? (
                <Card className="border-[#E3E8EF] shadow-none bg-white rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F6F9FC] border-b border-[#E3E8EF]">
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Timestamp</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">User</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Entity</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Entity ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log: any) => (
                          <tr
                            key={log.id}
                            className="border-b border-[#F6F9FC] hover:bg-[#F6F9FC]/50 transition-colors"
                          >
                            <td className="px-6 py-4 text-[12px] text-muted-foreground whitespace-nowrap">
                              {formatDate(log.createdAt.toISOString())}
                            </td>
                            <td className="px-6 py-4 text-[13px] font-medium text-[#0A2540]">
                              {log.user?.name ?? log.user?.email ?? "System"}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="text-[10px] font-bold py-0 capitalize">
                                {log.action}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-[12px] text-muted-foreground capitalize">
                              {log.entity}
                            </td>
                            <td className="px-6 py-4 text-[11px] text-muted-foreground font-mono">
                              {log.entityId ?? "\u2014"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="border-[#E3E8EF] shadow-none bg-white rounded-2xl p-8 text-center">
                  <p className="text-[13px] text-muted-foreground">No audit log entries recorded yet.</p>
                </Card>
              )}
            </div>

            {/* Secure Documents */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[#0A2540]">Secure Documents</h2>
                <Badge variant="outline" className="text-[11px] font-semibold border-[#E3E8EF] text-muted-foreground">
                  {documents.length} documents
                </Badge>
              </div>

              {documents.length > 0 ? (
                <Card className="border-[#E3E8EF] shadow-none bg-white rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F6F9FC] border-b border-[#E3E8EF]">
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Document Name</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Type</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Version</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Date Added</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc: any) => (
                          <tr
                            key={doc.id}
                            className="border-b border-[#F6F9FC] hover:bg-[#F6F9FC]/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF]">
                                  <FileText className="size-4" />
                                </div>
                                <span className="text-[13px] font-bold text-[#0A2540]">{doc.title}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="text-[10px] font-bold py-0">{doc.type}</Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="text-[10px] font-bold py-0 capitalize">{doc.status}</Badge>
                            </td>
                            <td className="px-6 py-4 text-[12px] text-muted-foreground">{doc.version}</td>
                            <td className="px-6 py-4 text-[12px] text-muted-foreground">
                              {formatDate(doc.updatedAt.toISOString())}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="border-[#E3E8EF] shadow-none bg-white rounded-2xl p-8 text-center">
                  <p className="text-[13px] text-muted-foreground">No secure documents uploaded yet.</p>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
