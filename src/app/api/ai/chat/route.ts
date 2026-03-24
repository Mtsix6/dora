import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnthropicClient, DORA_SYSTEM_PROMPT } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { messages, context } = (await request.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      context?: string;
    };

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Look up workspace-level Anthropic API key from integrations
    const integration = await prisma.integration.findFirst({
      where: {
        workspaceId: session.user.workspaceId,
        provider: "anthropic",
        status: "Active",
      },
    });

    const apiKey = (integration?.config as { apiKey?: string })?.apiKey ?? null;

    const client = getAnthropicClient(apiKey);

    // Build system prompt with optional page context
    let systemPrompt = DORA_SYSTEM_PROMPT;
    if (context) {
      systemPrompt += `\n\nCurrent page context: ${context}`;
    }

    // Stream the response
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Convert to a ReadableStream for the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`),
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Stream error" })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    // Log the AI interaction for audit
    await prisma.auditLog.create({
      data: {
        workspaceId: session.user.workspaceId,
        userId: session.user.id,
        action: "ai_copilot_query",
        entity: "ai",
        metadata: { messageCount: messages.length },
      },
    }).catch(() => {});

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI service unavailable";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
