import { readFile } from "node:fs/promises";
import path from "node:path";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toStoredBytes(value: Uint8Array | Record<string, number>) {
  if (value instanceof Uint8Array) {
    return value;
  }

  return Uint8Array.from(Object.values(value));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const contract = await prisma.contract.findFirst({
    where: {
      id,
      workspaceId: session.user.workspaceId,
    },
    select: {
      fileName: true,
      fileUrl: true,
      fileData: true,
      mimeType: true,
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (contract.fileData) {
    return new Response(Buffer.from(toStoredBytes(contract.fileData)), {
      status: 200,
      headers: {
        "Content-Type": contract.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(contract.fileName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const fileName = path.basename(contract.fileUrl);
  const filePath = path.join(process.cwd(), "uploads", session.user.workspaceId, fileName);

  try {
    const fileBuffer = await readFile(filePath);
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contract.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(contract.fileName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[GET /api/contracts/[id]/file] Unable to read file:", error);
    return NextResponse.json({ error: "Stored file not found" }, { status: 404 });
  }
}
