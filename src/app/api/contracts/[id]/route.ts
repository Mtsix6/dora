import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const contract = await prisma.contract.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
    include: { uploadedBy: { select: { name: true, email: true } } },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  return NextResponse.json(contract);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, fields } = body;

  // Verify contract belongs to workspace
  const existing = await prisma.contract.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (action === "approve") {
    const contract = await prisma.contract.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        workspaceId: session.user.workspaceId,
        title: "Contract Approved",
        message: `The contract "${existing.fileName}" has been approved and added to the register.`,
        type: "success",
        category: "contract",
        actionUrl: `/extraction?id=${id}`,
      },
    });

    // Detailed Audit Log
    await prisma.auditLog.create({
      data: {
        action: "APPROVE",
        entity: "contract",
        entityId: id,
        userId: session.user.id,
        workspaceId: session.user.workspaceId,
        metadata: { fileName: existing.fileName },
      },
    });

    await prisma.activity.create({
      data: {
        action: "Document approved",
        userId: session.user.id,
        contractId: id,
        workspaceId: session.user.workspaceId,
      },
    });

    return NextResponse.json(contract);
  }

  if (action === "reject") {
    const contract = await prisma.contract.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        workspaceId: session.user.workspaceId,
        title: "Contract Rejected",
        message: `The contract "${existing.fileName}" was rejected during review.`,
        type: "error",
        category: "contract",
        actionUrl: `/extraction?id=${id}`,
      },
    });

    // Detailed Audit Log
    await prisma.auditLog.create({
      data: {
        action: "REJECT",
        entity: "contract",
        entityId: id,
        userId: session.user.id,
        workspaceId: session.user.workspaceId,
        metadata: { fileName: existing.fileName },
      },
    });

    await prisma.activity.create({
      data: {
        action: "Document rejected",
        userId: session.user.id,
        contractId: id,
        workspaceId: session.user.workspaceId,
      },
    });

    return NextResponse.json(contract);
  }

  // Update extracted fields
  if (fields) {
    const currentData = (existing.extractedData as Record<string, unknown>) ?? {};
    const updatedData = { ...currentData, ...fields };

    const contract = await prisma.contract.update({
      where: { id },
      data: { extractedData: updatedData },
    });

    // Audit Log for field updates
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_FIELDS",
        entity: "contract",
        entityId: id,
        userId: session.user.id,
        workspaceId: session.user.workspaceId,
        metadata: { fileName: existing.fileName, fieldsUpdated: Object.keys(fields) },
      },
    });

    await prisma.activity.create({
      data: {
        action: "Fields updated",
        userId: session.user.id,
        contractId: id,
        workspaceId: session.user.workspaceId,
      },
    });

    return NextResponse.json(contract);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
