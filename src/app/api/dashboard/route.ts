import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = session.user.workspaceId;

  // Aggregate stats from Prisma
  const [totalContracts, pendingReview, approved, allContracts] = await Promise.all([
    prisma.contract.count({ where: { workspaceId } }),
    prisma.contract.count({ where: { workspaceId, status: "EXTRACTED" } }),
    prisma.contract.count({
      where: {
        workspaceId,
        status: "EXTRACTED",
        extractedData: { not: undefined },
      },
    }),
    prisma.contract.findMany({
      where: { workspaceId },
      include: { uploadedBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Recent contracts (top 5)
  const recentContracts = allContracts.slice(0, 5);

  // Activity log
  const activity = await prisma.activity.findMany({
    where: { workspaceId },
    include: {
      user: { select: { name: true } },
      contract: { select: { fileName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Compliance rate
  const complianceRate = totalContracts > 0
    ? Math.round((approved / totalContracts) * 100)
    : 0;

  // Calculate avgConfidence from extractedData JSON
  const contractsWithData = allContracts.filter((c: any) => c.extractedData);
  let avgConfidence = 0;
  let highCount = 0, mediumCount = 0, lowCount = 0;
  
  if (contractsWithData.length > 0) {
    let totalConf = 0;
    let totalFields = 0;
    for (const c of contractsWithData) {
      const data = c.extractedData as Record<string, { confidence?: number }>;
      for (const field of Object.values(data)) {
        if (typeof field?.confidence === "number") {
          totalConf += field.confidence;
          totalFields++;
          if (field.confidence >= 80) highCount++;
          else if (field.confidence >= 60) mediumCount++;
          else lowCount++;
        }
      }
    }
    avgConfidence = totalFields > 0 ? Math.round(totalConf / totalFields) : 0;
  }

  const allFieldsCount = highCount + mediumCount + lowCount;
  const confidenceDistribution = allFieldsCount > 0
    ? {
        high: Math.round((highCount / allFieldsCount) * 100),
        medium: Math.round((mediumCount / allFieldsCount) * 100),
        low: Math.round((lowCount / allFieldsCount) * 100),
      }
    : { high: 0, medium: 0, low: 0 };

  // Expiring contracts (within 90 days)
  const now = Date.now();
  const expiringContracts = contractsWithData
    .filter((c) => {
      const data = c.extractedData as Record<string, { value?: string }>;
      const endDate = data?.endDate?.value;
      if (!endDate) return false;
      const daysLeft = Math.ceil((new Date(endDate).getTime() - now) / 86_400_000);
      return daysLeft >= 0 && daysLeft <= 90;
    })
    .map((c) => {
      const data = c.extractedData as Record<string, { value?: string }>;
      return {
        id: c.id,
        name: c.fileName,
        entity: data?.entityName?.value ?? "Unknown",
        days: Math.ceil(
          (new Date(data.endDate!.value!).getTime() - now) / 86_400_000,
        ),
      };
    })
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  return NextResponse.json({
    stats: {
      totalContracts,
      pendingReview,
      approvedThisMonth: approved,
      complianceRate,
      avgConfidence,
      expiringSoon: expiringContracts.length,
    },
    recentContracts,
    activity: activity.map((a: any) => ({
      id: a.id,
      action: a.action,
      user: a.user.name || "System",
      document: a.contract?.fileName || "",
      contractId: a.contractId,
      time: a.createdAt.toISOString(),
    })),
    expiringContracts,
    confidenceDistribution,
  });
}
