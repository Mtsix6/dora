import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const activities = await prisma.activity.findMany({
    where: { workspaceId: session.user.workspaceId },
    include: {
      user: { select: { name: true } },
      contract: { select: { fileName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 50),
  });

  const activity = activities.map((a) => ({
    id: a.id,
    action: a.action,
    user: a.user.name || "System",
    document: a.contract?.fileName || "",
    contractId: a.contractId,
    time: a.createdAt.toISOString(),
  }));

  return NextResponse.json({ activity });
}
