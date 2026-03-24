import { NextRequest, NextResponse } from "next/server";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  AI_PROVIDER_CATALOG,
  AI_TIER_LIMITS,
  getMaskedKey,
  isAiProvider,
} from "@/lib/ai";

export const dynamic = "force-dynamic";

const updateAiSettingsSchema = z.object({
  provider: z.string(),
  modelId: z.string().trim().max(120).optional().or(z.literal("")),
  apiKey: z.string().trim().max(500).optional().or(z.literal("")),
});

function ensureWorkspaceAdmin(session: Session | null) {
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: session.user.workspaceId },
    select: {
      tier: true,
      aiProvider: true,
      aiModel: true,
      customAiKey: true,
      aiUsageCount: true,
      lastUsageReset: true,
    },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const limit = AI_TIER_LIMITS[workspace.tier];

  return NextResponse.json({
    tier: workspace.tier,
    provider: workspace.aiProvider,
    providerLabel: AI_PROVIDER_CATALOG[workspace.aiProvider].label,
    modelId: workspace.aiModel,
    usage: {
      count: workspace.aiUsageCount,
      limit: limit === 0 ? "Unlimited" : limit,
      remaining: limit === 0 ? "Unlimited" : Math.max(0, limit - workspace.aiUsageCount),
      lastReset: workspace.lastUsageReset,
    },
    hasCustomKey: Boolean(workspace.customAiKey),
    maskedKey: getMaskedKey(workspace.customAiKey),
    canManage: session.user.role === "OWNER" || session.user.role === "ADMIN",
    providers: Object.entries(AI_PROVIDER_CATALOG).map(([value, details]) => ({
      value,
      label: details.label,
      defaultModel: details.defaultModel,
      usesPlatformKeyByDefault: details.usesPlatformKeyByDefault,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const permissionError = ensureWorkspaceAdmin(session);
  if (permissionError) {
    return permissionError;
  }

  const parsed = updateAiSettingsSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid AI settings payload" }, { status: 400 });
  }

  const providerValue = parsed.data.provider.toUpperCase();
  if (!isAiProvider(providerValue)) {
    return NextResponse.json({ error: "Unsupported AI provider" }, { status: 400 });
  }

  const modelId = parsed.data.modelId?.trim() || null;
  const apiKey = parsed.data.apiKey?.trim() || null;

  await prisma.workspace.update({
    where: { id: session!.user.workspaceId },
    data: {
      aiProvider: providerValue,
      aiModel: modelId,
      customAiKey: apiKey,
    },
  });

  await prisma.auditLog.create({
    data: {
      workspaceId: session!.user.workspaceId,
      userId: session!.user.id,
      action: "ai_settings_updated",
      entity: "workspace",
      metadata: {
        provider: providerValue,
        modelId,
        hasCustomKey: Boolean(apiKey),
      },
    },
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    provider: providerValue,
    modelId,
    hasCustomKey: Boolean(apiKey),
  });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const permissionError = ensureWorkspaceAdmin(session);
  if (permissionError) {
    return permissionError;
  }

  await prisma.workspace.update({
    where: { id: session!.user.workspaceId },
    data: {
      aiProvider: "GOOGLE",
      aiModel: null,
      customAiKey: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      workspaceId: session!.user.workspaceId,
      userId: session!.user.id,
      action: "ai_settings_reset",
      entity: "workspace",
      metadata: {
        provider: "GOOGLE",
      },
    },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
