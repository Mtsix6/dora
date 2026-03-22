import { inngest } from "./client";
import { prisma } from "@/lib/prisma";

/**
 * Listens for "dora.contract.uploaded", fetches the contract,
 * simulates LLM-based DORA field extraction, and persists results.
 */
export const extractContractData = inngest.createFunction(
  {
    id: "extract-contract-data",
    name: "Extract DORA Contract Data",
    retries: 3,
    triggers: [{ event: "dora.contract.uploaded" }],
  },
  async ({ event, step }) => {
    const { contractId } = event.data as {
      contractId: string;
      workspaceId: string;
      fileUrl: string;
    };

    // ── Step 1: Fetch the contract & mark as processing ──
    const contract = await step.run("fetch-contract", async () => {
      const record = await prisma.contract.findUniqueOrThrow({
        where: { id: contractId },
      });

      await prisma.contract.update({
        where: { id: contractId },
        data: { status: "PROCESSING" },
      });

      return record;
    });

    // ── Step 2: Simulate LLM extraction ──
    const extractedData = await step.run("llm-extraction", async () => {
      // In production, replace with a real call to an LLM API, e.g.:
      //   const response = await anthropic.messages.create({ ... })
      //
      // Simulated DORA-relevant fields:
      return {
        entityName: "Acme Cloud Services Ltd.",
        leiCode: "529900T8BM49AURSDO55",
        criticalFunctionTag: "Cloud Infrastructure",
        contractStartDate: "2024-01-15",
        contractEndDate: "2026-01-14",
        subcontractors: ["AWS EU-West-1", "Cloudflare Inc."],
        ictServiceType: "Cloud computing services",
        dataClassification: "Confidential",
        exitStrategy: true,
        confidenceScores: {
          entityName: 0.95,
          leiCode: 0.88,
          criticalFunctionTag: 0.72,
          contractStartDate: 0.97,
          contractEndDate: 0.97,
          subcontractors: 0.65,
          ictServiceType: 0.91,
          dataClassification: 0.78,
          exitStrategy: 0.84,
        },
        rawText: `Simulated extraction for "${contract.fileName}"`,
      };
    });

    // ── Step 3: Persist extracted data ──
    await step.run("persist-extraction", async () => {
      await prisma.contract.update({
        where: { id: contractId },
        data: {
          status: "EXTRACTED",
          extractedData,
        },
      });
    });

    return { contractId, status: "EXTRACTED" };
  },
);
