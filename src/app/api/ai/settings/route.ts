import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET — retrieve current AI provider config (masked key) */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await prisma.integration.findFirst({
    where: {
      workspaceId: session.user.workspaceId,
      provider: "anthropic",
    },
  });

  if (!integration) {
    return NextResponse.json({
      configured: false,
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
      hasEnvKey: !!process.env.ANTHROPIC_API_KEY,
    });
  }

  const config = integration.config as { apiKey?: string } | null;
  const rawKey = config?.apiKey || "";

  return NextResponse.json({
    configured: true,
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    status: integration.status,
    maskedKey: rawKey ? `${rawKey.slice(0, 10)}...${rawKey.slice(-4)}` : null,
    hasEnvKey: !!process.env.ANTHROPIC_API_KEY,
    updatedAt: integration.updatedAt,
  });
}

/** POST — save or update AI provider API key */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { apiKey } = (await request.json()) as { apiKey: string };

  if (!apiKey || !apiKey.startsWith("sk-")) {
    return NextResponse.json(
      { error: "Invalid API key format. Must start with sk-" },
      { status: 400 },
    );
  }

  // Validate the key by making a small request
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10,
      messages: [{ role: "user", content: "test" }],
    });
  } catch {
    return NextResponse.json(
      { error: "API key validation failed. Please check your key." },
      { status: 400 },
    );
  }

  // Upsert the integration record
  const existing = await prisma.integration.findFirst({
    where: {
      workspaceId: session.user.workspaceId,
      provider: "anthropic",
    },
  });

  if (existing) {
    await prisma.integration.update({
      where: { id: existing.id },
      data: {
        config: { apiKey },
        status: "Active",
      },
    });
  } else {
    await prisma.integration.create({
      data: {
        workspaceId: session.user.workspaceId,
        name: "Anthropic Claude",
        provider: "anthropic",
        status: "Active",
        config: { apiKey },
      },
    });
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      workspaceId: session.user.workspaceId,
      userId: session.user.id,
      action: "ai_provider_configured",
      entity: "integration",
      metadata: { provider: "anthropic" },
    },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}

/** DELETE — remove AI provider API key */
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  await prisma.integration.updateMany({
    where: {
      workspaceId: session.user.workspaceId,
      provider: "anthropic",
    },
    data: {
      status: "Inactive",
      config: {},
    },
  });

  return NextResponse.json({ success: true });
}
