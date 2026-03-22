import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ictAsset = await prisma.ictAsset.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  });

  if (!ictAsset) {
    return NextResponse.json({ error: "ICT asset not found" }, { status: 404 });
  }

  return NextResponse.json(ictAsset);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.ictAsset.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  });

  if (!existing) {
    return NextResponse.json({ error: "ICT asset not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { name, category, criticality, riskScore } = body;

    const ictAsset = await prisma.ictAsset.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(criticality !== undefined && { criticality }),
        ...(riskScore !== undefined && { riskScore }),
      },
    });

    return NextResponse.json(ictAsset);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.ictAsset.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  });

  if (!existing) {
    return NextResponse.json({ error: "ICT asset not found" }, { status: 404 });
  }

  await prisma.ictAsset.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
