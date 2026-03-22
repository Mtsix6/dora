import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { inngest } from "@/inngest/client";
import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import crypto from "node:crypto";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    // ── Auth guard (session-based) ──
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.workspaceId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const workspaceId = session.user.workspaceId;

    // ── Parse multipart form data ──
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided. Use form field 'file'." },
        { status: 400 },
      );
    }

    // ── Validate MIME type ──
    if (
      !ALLOWED_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
        },
        { status: 415 },
      );
    }

    // ── Validate file size ──
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024} MB` },
        { status: 413 },
      );
    }

    // ── Persist file to disk (swap for S3/R2 in production) ──
    const fileId = crypto.randomUUID();
    const ext = path.extname(file.name) || ".pdf";
    const safeFileName = `${fileId}${ext}`;
    const uploadDir = path.join(process.cwd(), "uploads", workspaceId);

    await mkdir(uploadDir, { recursive: true });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const filePath = path.join(uploadDir, safeFileName);
    await writeFile(filePath, bytes);

    const fileUrl = `/uploads/${workspaceId}/${safeFileName}`;

    // ── Create Contract record ──
    const contract = await prisma.contract.create({
      data: {
        fileName: file.name,
        fileUrl,
        mimeType: file.type,
        status: "PENDING",
        uploadedById: userId,
        workspaceId,
      },
    });

    // ── Log activity ──
    await prisma.activity.create({
      data: {
        action: "Document uploaded",
        userId,
        contractId: contract.id,
        workspaceId,
      },
    });

    // ── Trigger Inngest background job ──
    await inngest.send({
      name: "dora.contract.uploaded",
      data: {
        contractId: contract.id,
        workspaceId,
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
