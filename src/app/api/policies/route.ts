import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const policies = await prisma.policyDocument.findMany({
    where: { workspaceId: session.user.workspaceId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(policies);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, type, status, version, fileUrl } = body;

    const policy = await prisma.policyDocument.create({
      data: {
        title,
        type,
        status,
        version,
        fileUrl,
        workspaceId: session.user.workspaceId,
      },
    });

    return NextResponse.json(policy, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
