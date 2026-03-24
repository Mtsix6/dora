import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ALLOWED_EXTENSIONS = [".json", ".jsonl", ".csv", ".txt", ".md"] as const;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No training file provided" }, { status: 400 });
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])) {
    return NextResponse.json(
      { error: `Unsupported training file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
      { status: 415 },
    );
  }

  const uploadDir = path.join(process.cwd(), "uploads", session.user.workspaceId, "training-data");
  await mkdir(uploadDir, { recursive: true });

  const savedName = `${crypto.randomUUID()}${extension}`;
  await writeFile(path.join(uploadDir, savedName), new Uint8Array(await file.arrayBuffer()));

  await prisma.auditLog.create({
    data: {
      workspaceId: session.user.workspaceId,
      userId: session.user.id,
      action: "UPLOAD_TRAINING_DATA",
      entity: "ai_model",
      metadata: {
        originalFileName: file.name,
        storedFileName: savedName,
        size: file.size,
      },
    },
  });

  await prisma.notification.create({
    data: {
      workspaceId: session.user.workspaceId,
      userId: session.user.id,
      title: "Training dataset uploaded",
      message: `${file.name} is available for enterprise AI retraining.`,
      type: "success",
      category: "system",
      actionUrl: "/manage",
    },
  });

  return NextResponse.json({ success: true, fileName: file.name });
}
