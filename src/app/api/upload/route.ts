import crypto from "node:crypto";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest/client";

export const dynamic = "force-dynamic";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".md"] as const;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "",
] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided. Use the 'file' field." }, { status: 400 });
    }

    const extension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])) {
      return NextResponse.json(
        { error: `Unsupported file extension: ${extension || "unknown"}. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 415 },
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || "unknown"}. Allowed document formats only.` },
        { status: 415 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024} MB` },
        { status: 413 },
      );
    }

    const safeFileName = `${crypto.randomUUID()}${extension || ".bin"}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const fileUrl = `/api/contracts/pending/${safeFileName}`;

    const contract = await prisma.contract.create({
      data: {
        fileName: file.name,
        fileUrl,
        fileData: Buffer.from(bytes),
        mimeType: file.type || "application/octet-stream",
        status: "PENDING",
        uploadedById: session.user.id,
        workspaceId: session.user.workspaceId,
      },
    });

    await prisma.activity.create({
      data: {
        action: "Document uploaded",
        userId: session.user.id,
        contractId: contract.id,
        workspaceId: session.user.workspaceId,
      },
    });

    await inngest.send({
      name: "dora.contract.uploaded",
      data: {
        contractId: contract.id,
        workspaceId: session.user.workspaceId,
        fileUrl,
      },
    });

    return NextResponse.json(
      {
        id: contract.id,
        fileName: contract.fileName,
        status: contract.status,
        fileUrl: contract.fileUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/upload] Unhandled error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
