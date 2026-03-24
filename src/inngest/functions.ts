import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { getAnthropicClient, DORA_EXTRACTION_PROMPT } from "@/lib/ai";
import { readFile } from "fs/promises";
import { join } from "path";

function toStoredBytes(value: Uint8Array | Record<string, number>) {
  if (value instanceof Uint8Array) {
    return value;
  }

  return Uint8Array.from(Object.values(value));
}

/**
 * Listens for "dora.contract.uploaded", fetches the contract,
 * runs Claude-based DORA field extraction, and persists results.
 * Falls back to a simulated extraction if no AI key is configured.
 */
export const extractContractData = inngest.createFunction(
  {
    id: "extract-contract-data",
    name: "Extract DORA Contract Data",
    retries: 3,
    triggers: [{ event: "dora.contract.uploaded" }],
  },
  async ({ event, step }) => {
    const { contractId, workspaceId, fileUrl } = event.data as {
      contractId: string;
      workspaceId: string;
      fileUrl: string;
    };

    // ── Step 1: Fetch the contract & mark as processing ──
    const contract = await step.run("fetch-contract", async () => {
      const record = await prisma.contract.findUniqueOrThrow({
        where: { id: contractId },
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileData: true,
          mimeType: true,
          uploadedById: true,
        },
      });

      await prisma.contract.update({
        where: { id: contractId },
        data: { status: "PROCESSING" },
      });

      return record;
    });

    // ── Step 2: Read file content ──
    const fileContent = await step.run("read-file", async () => {
      if (contract.fileData) {
        if (contract.mimeType.startsWith("text/")) {
          return Buffer.from(toStoredBytes(contract.fileData)).toString("utf-8").slice(0, 30000);
        }

        return `Contract file: ${contract.fileName}\nMIME type: ${contract.mimeType}`;
      }

      try {
        const filePath = join(process.cwd(), "uploads", workspaceId, fileUrl.split("/").pop()!);
        const buffer = await readFile(filePath);
        // For PDF files we'd need a PDF parser; for now extract text from txt/docx
        return buffer.toString("utf-8").slice(0, 30000); // limit to 30k chars
      } catch {
        return `Contract file: ${contract.fileName}`;
      }
    });

    // ── Step 3: LLM extraction with Claude (or fallback) ──
    const extractedData = await step.run("llm-extraction", async () => {
      // Check for workspace-level API key
      const integration = await prisma.integration.findFirst({
        where: { workspaceId, provider: "anthropic", status: "Active" },
      });
      const apiKey = (integration?.config as { apiKey?: string })?.apiKey ?? null;

      try {
        const client = getAnthropicClient(apiKey);

        const response = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: DORA_EXTRACTION_PROMPT,
          messages: [
            {
              role: "user",
              content: `Extract DORA-relevant fields from this contract:\n\n${fileContent}`,
            },
          ],
        });

        const text =
          response.content[0].type === "text" ? response.content[0].text : "";

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error("No JSON found in AI response");
      } catch (err) {
        // Fallback to simulated extraction if AI is unavailable
        console.warn(
          `AI extraction failed for ${contract.fileName}, using fallback:`,
          err,
        );
        return {
          entityName: { value: "Unknown Entity", confidence: 30 },
          leiCode: { value: null, confidence: 0 },
          criticalFunctionTag: { value: "ict_service", confidence: 40 },
          contractStartDate: { value: null, confidence: 0 },
          contractEndDate: { value: null, confidence: 0 },
          subcontractors: { value: [], confidence: 0 },
          ictServiceType: { value: "Unknown", confidence: 20 },
          dataClassification: { value: "Unknown", confidence: 20 },
          exitStrategy: { value: false, confidence: 10 },
          doraArticles: { value: [], confidence: 0 },
          _extractionMethod: "fallback",
          _fallbackReason:
            err instanceof Error ? err.message : "AI unavailable",
        };
      }
    });

    // ── Step 4: Persist extracted data ──
    await step.run("persist-extraction", async () => {
      await prisma.contract.update({
        where: { id: contractId },
        data: {
          status: "EXTRACTED",
          extractedData,
        },
      });

      // Create activity record
      await prisma.activity.create({
        data: {
          action: "AI extraction completed",
          userId: contract.uploadedById,
          contractId,
          workspaceId,
        },
      });

      // Create notification for the uploader
      await prisma.notification.create({
        data: {
          workspaceId,
          userId: contract.uploadedById,
          title: "Extraction Complete",
          message: `AI finished extracting DORA fields from "${contract.fileName}"`,
          type: "success",
          category: "contract",
          actionUrl: `/extraction?id=${contractId}`,
        },
      });
    });

    return { contractId, status: "EXTRACTED" };
  },
);
