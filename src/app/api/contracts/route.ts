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
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { workspaceId: session.user.workspaceId };
  if (status && status !== "all") {
    where.status = status.toUpperCase();
  }

  const contracts = await prisma.contract.findMany({
    where,
    include: { uploadedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ contracts, total: contracts.length });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fileName, fileUrl } = body;

    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required" },
        { status: 400 },
      );
    }

    const contract = await prisma.contract.create({
      data: {
        fileName,
        fileUrl: fileUrl || `/uploads/demo/${fileName}`,
        mimeType: "application/pdf",
        status: "PENDING",
        uploadedById: session.user.id,
        workspaceId: session.user.workspaceId,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: "Document uploaded",
        userId: session.user.id,
        contractId: contract.id,
        workspaceId: session.user.workspaceId,
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
