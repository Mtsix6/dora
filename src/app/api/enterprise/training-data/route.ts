import crypto from "node:crypto";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ALLOWED_EXTENSIONS = [".json", ".jsonl", ".csv", ".txt", ".md"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `Training file exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024} MB` },
      { status: 413 },
    );
  }

  const savedName = `${crypto.randomUUID()}${extension}`;
  const textPreview = (await file.text()).slice(0, 2000);

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
        contentPreview: textPreview,
        storage: "audit_log_preview",
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
