import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const logs = await prisma.auditLog.findMany({
    where: { workspaceId: session.user.workspaceId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
    take: 100,
  });

  // CSV export
  if (format === "csv") {
    const headers = ["ID", "Date", "User", "Email", "Action", "Entity", "Entity ID", "IP Address", "User Agent", "Metadata"];
    const rows = logs.map((log) => [
      escapeCsvField(log.id),
      escapeCsvField(log.createdAt.toISOString()),
      escapeCsvField(log.user?.name ?? "System"),
      escapeCsvField(log.user?.email ?? ""),
      escapeCsvField(log.action),
      escapeCsvField(log.entity),
      escapeCsvField(log.entityId ?? ""),
      escapeCsvField(log.ipAddress ?? ""),
      escapeCsvField(log.userAgent ?? ""),
      escapeCsvField(log.metadata ? JSON.stringify(log.metadata) : ""),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="audit-log-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  // Default JSON response
  return NextResponse.json(logs);
}
