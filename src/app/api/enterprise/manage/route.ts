import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const manageActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("save_saml"),
    entityId: z.string().trim().min(1),
    ssoUrl: z.string().trim().url(),
  }),
  z.object({
    action: z.literal("generate_api_key"),
    name: z.string().trim().min(1).max(100).optional(),
  }),
  z.object({
    action: z.literal("add_webhook"),
    url: z.string().trim().url(),
  }),
  z.object({
    action: z.literal("retrain_model"),
  }),
]);

async function getAuthorizedSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }) };
  }

  return { session };
}

export async function GET() {
  const auth = await getAuthorizedSession();
  if (auth.error) return auth.error;
  const { session } = auth;

  const [samlIntegration, apiKeys, webhooks, modelIntegration, trainingLogs] = await Promise.all([
    prisma.integration.findFirst({
      where: {
        workspaceId: session!.user.workspaceId,
        provider: "saml_sso",
      },
    }),
    prisma.apiKey.findMany({
      where: { workspaceId: session!.user.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.webhookEndpoint.findMany({
      where: { workspaceId: session!.user.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.integration.findFirst({
      where: {
        workspaceId: session!.user.workspaceId,
        provider: "ai_model_ops",
      },
    }),
    prisma.auditLog.findMany({
      where: {
        workspaceId: session!.user.workspaceId,
        entity: "ai_model",
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return NextResponse.json({
    saml: {
      entityId: ((samlIntegration?.config as { entityId?: string } | null)?.entityId ?? ""),
      ssoUrl: ((samlIntegration?.config as { ssoUrl?: string } | null)?.ssoUrl ?? ""),
      active: samlIntegration?.status === "Active",
    },
    currentModel:
      ((modelIntegration?.config as { currentModel?: string } | null)?.currentModel ??
        "dora-roi-enterprise-v4-finetuned"),
    apiKeys: apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      prefix: key.keyPrefix,
      createdAt: key.createdAt,
    })),
    webhooks: webhooks.map((webhook) => ({
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      status: webhook.status,
      createdAt: webhook.createdAt,
    })),
    trainingHistory: trainingLogs.map((log) => ({
      id: log.id,
      action: log.action,
      createdAt: log.createdAt,
      metadata: log.metadata,
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedSession();
  if (auth.error) return auth.error;
  const { session } = auth;

  const parsed = manageActionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid enterprise action payload" }, { status: 400 });
  }

  const workspaceId = session!.user.workspaceId;
  const userId = session!.user.id;

  if (parsed.data.action === "save_saml") {
    await prisma.integration.upsert({
      where: {
        id: (
          await prisma.integration.findFirst({
            where: { workspaceId, provider: "saml_sso" },
            select: { id: true },
          })
        )?.id ?? "missing",
      },
      update: {
        name: "SAML SSO",
        status: "Active",
        config: {
          entityId: parsed.data.entityId,
          ssoUrl: parsed.data.ssoUrl,
        },
        lastSyncAt: new Date(),
      },
      create: {
        workspaceId,
        provider: "saml_sso",
        name: "SAML SSO",
        status: "Active",
        config: {
          entityId: parsed.data.entityId,
          ssoUrl: parsed.data.ssoUrl,
        },
        lastSyncAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId,
        userId,
        action: "SAVE_SAML_CONFIG",
        entity: "integration",
        metadata: {
          entityId: parsed.data.entityId,
          ssoUrl: parsed.data.ssoUrl,
        },
      },
    });

    return NextResponse.json({ success: true });
  }

  if (parsed.data.action === "generate_api_key") {
    const rawKey = `dora_live_${crypto.randomBytes(18).toString("hex")}`;
    const keyPrefix = rawKey.slice(0, 12);
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const name = parsed.data.name || `Generated ${new Date().toLocaleDateString("en-GB")}`;

    const apiKey = await prisma.apiKey.create({
      data: {
        workspaceId,
        name,
        keyPrefix,
        keyHash,
        permissions: ["contracts:read", "contracts:write", "audit:read"],
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId,
        userId,
        action: "GENERATE_API_KEY",
        entity: "api_key",
        entityId: apiKey.id,
        metadata: { name, keyPrefix },
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        prefix: apiKey.keyPrefix,
        createdAt: apiKey.createdAt,
      },
      rawKey,
    });
  }

  if (parsed.data.action === "add_webhook") {
    const webhook = await prisma.webhookEndpoint.create({
      data: {
        workspaceId,
        url: parsed.data.url,
        events: ["contract.extracted"],
        secret: crypto.randomBytes(20).toString("hex"),
        status: "Active",
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId,
        userId,
        action: "ADD_WEBHOOK",
        entity: "webhook",
        entityId: webhook.id,
        metadata: { url: webhook.url, events: webhook.events },
      },
    });

    return NextResponse.json({
      success: true,
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        status: webhook.status,
        createdAt: webhook.createdAt,
      },
    });
  }

  await prisma.integration.upsert({
    where: {
      id: (
        await prisma.integration.findFirst({
          where: { workspaceId, provider: "ai_model_ops" },
          select: { id: true },
        })
      )?.id ?? "missing",
    },
    update: {
      name: "Enterprise AI Model",
      status: "Active",
      config: {
        currentModel: "dora-roi-enterprise-v4-finetuned",
        lastTrainingAt: new Date().toISOString(),
      },
      lastSyncAt: new Date(),
    },
    create: {
      workspaceId,
      provider: "ai_model_ops",
      name: "Enterprise AI Model",
      status: "Active",
      config: {
        currentModel: "dora-roi-enterprise-v4-finetuned",
        lastTrainingAt: new Date().toISOString(),
      },
      lastSyncAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      workspaceId,
      userId,
      action: "RETRAIN_MODEL",
      entity: "ai_model",
      metadata: {
        model: "dora-roi-enterprise-v4-finetuned",
      },
    },
  });

  await prisma.notification.create({
    data: {
      workspaceId,
      userId,
      title: "Model retraining started",
      message: "Enterprise extraction retraining has been queued.",
      type: "info",
      category: "system",
      actionUrl: "/manage",
    },
  });

  return NextResponse.json({ success: true });
}
