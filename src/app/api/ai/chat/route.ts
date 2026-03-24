import { streamText, type ModelMessage } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  checkAiUsage,
  DORA_SYSTEM_PROMPT,
  getAiModel,
  getProviderDetails,
  incrementAiUsage,
  isAiProvider,
} from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const chatPayloadSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().trim().min(1).max(10000),
    }),
  ).min(1),
  context: z.string().trim().max(1000).optional(),
  modelId: z.string().trim().max(120).optional(),
  provider: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = chatPayloadSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: "Invalid chat payload" }, { status: 400 });
    }

    const usage = await checkAiUsage(session.user.workspaceId);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "Usage limit exceeded",
          message: `You have reached your daily AI limit for the ${usage.tier} tier.`,
        },
        { status: 429 },
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: session.user.workspaceId },
      select: {
        aiProvider: true,
        aiModel: true,
        customAiKey: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const requestedProvider = payload.data.provider?.toUpperCase();
    if (requestedProvider && !isAiProvider(requestedProvider)) {
      return NextResponse.json({ error: "Unsupported AI provider" }, { status: 400 });
    }

    const provider = requestedProvider && isAiProvider(requestedProvider)
      ? requestedProvider
      : workspace.aiProvider;
    const modelId = payload.data.modelId?.trim() || workspace.aiModel;
    const model = getAiModel(provider, modelId, workspace.customAiKey);

    const messages: ModelMessage[] = payload.data.messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const system = payload.data.context
      ? `${DORA_SYSTEM_PROMPT}\n\nCurrent page context: ${payload.data.context}`
      : DORA_SYSTEM_PROMPT;

    const result = streamText({
      model,
      system,
      messages,
      onFinish: async () => {
        await incrementAiUsage(session.user.workspaceId);

        await prisma.auditLog.create({
          data: {
            workspaceId: session.user.workspaceId,
            userId: session.user.id,
            action: "ai_copilot_query",
            entity: "ai",
            metadata: {
              provider,
              providerLabel: getProviderDetails(provider).label,
              modelId: modelId ?? getProviderDetails(provider).defaultModel,
              messageCount: messages.length,
            },
          },
        }).catch(() => {});
      },
    });

    return result.toUIMessageStreamResponse({
      headers: {
        "X-AI-Provider": provider,
        "X-AI-Usage-Remaining": usage.remaining === null ? "unlimited" : String(usage.remaining),
      },
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    const message = error instanceof Error ? error.message : "AI service unavailable";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
