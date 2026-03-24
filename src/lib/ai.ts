import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import Anthropic from "@anthropic-ai/sdk";
import { type AiProvider, WorkspaceTier } from "@prisma/client";
import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

export const AI_TIER_LIMITS: Record<WorkspaceTier, number> = {
  FREE: 15,
  PRO: 100,
  ENTERPRISE: 0,
};

export type AiProviderType = AiProvider;

type ProviderCatalogEntry = {
  label: string;
  defaultModel: string;
  apiKeyEnv: string;
  usesPlatformKeyByDefault: boolean;
};

export const AI_PROVIDER_CATALOG: Record<AiProviderType, ProviderCatalogEntry> = {
  GOOGLE: {
    label: "Google Gemini",
    defaultModel: "gemini-1.5-pro",
    apiKeyEnv: "GOOGLE_GENERATIVE_AI_API_KEY",
    usesPlatformKeyByDefault: true,
  },
  MISTRAL: {
    label: "Mistral AI",
    defaultModel: "mistral-large-latest",
    apiKeyEnv: "MISTRAL_API_KEY",
    usesPlatformKeyByDefault: false,
  },
  ANTHROPIC: {
    label: "Anthropic Claude",
    defaultModel: "claude-3-5-sonnet-20241022",
    apiKeyEnv: "ANTHROPIC_API_KEY",
    usesPlatformKeyByDefault: false,
  },
  OPENAI: {
    label: "OpenAI",
    defaultModel: "gpt-4o",
    apiKeyEnv: "OPENAI_API_KEY",
    usesPlatformKeyByDefault: false,
  },
  OPENROUTER: {
    label: "OpenRouter",
    defaultModel: "openai/gpt-4o-mini",
    apiKeyEnv: "OPENROUTER_API_KEY",
    usesPlatformKeyByDefault: false,
  },
  DEEPSEEK: {
    label: "DeepSeek",
    defaultModel: "deepseek-chat",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    usesPlatformKeyByDefault: false,
  },
};

export function isAiProvider(value: unknown): value is AiProviderType {
  return typeof value === "string" && value in AI_PROVIDER_CATALOG;
}

export function getProviderDetails(provider: AiProviderType) {
  return AI_PROVIDER_CATALOG[provider];
}

export function getMaskedKey(rawKey: string | null | undefined) {
  if (!rawKey) {
    return null;
  }

  if (rawKey.length <= 12) {
    return `${rawKey.slice(0, 4)}...${rawKey.slice(-2)}`;
  }

  return `${rawKey.slice(0, 8)}...${rawKey.slice(-4)}`;
}

function getProviderApiKey(provider: AiProviderType, customKey?: string | null) {
  const key = customKey?.trim() || process.env[AI_PROVIDER_CATALOG[provider].apiKeyEnv];

  if (!key) {
    const details = AI_PROVIDER_CATALOG[provider];
    throw new Error(
      `${details.label} is not configured. Add a custom API key in Settings or configure ${details.apiKeyEnv}.`,
    );
  }

  return key;
}

export function getAiModel(
  provider: AiProviderType,
  modelId?: string | null,
  customKey?: string | null,
) {
  const resolvedModel = modelId?.trim() || AI_PROVIDER_CATALOG[provider].defaultModel;
  const apiKey = getProviderApiKey(provider, customKey);

  switch (provider) {
    case "ANTHROPIC":
      return createAnthropic({ apiKey })(resolvedModel);
    case "OPENAI":
      return createOpenAI({ apiKey })(resolvedModel);
    case "GOOGLE":
      return createGoogleGenerativeAI({ apiKey })(resolvedModel);
    case "MISTRAL":
      return createMistral({ apiKey })(resolvedModel);
    case "OPENROUTER":
      return createOpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
      })(resolvedModel);
    case "DEEPSEEK":
      return createOpenAI({
        apiKey,
        baseURL: "https://api.deepseek.com/v1",
      })(resolvedModel);
  }
}

export function getAnthropicClient(customKey?: string | null) {
  return new Anthropic({
    apiKey: getProviderApiKey("ANTHROPIC", customKey),
  });
}

export async function checkAiUsage(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      tier: true,
      aiUsageCount: true,
      lastUsageReset: true,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const limit = AI_TIER_LIMITS[workspace.tier];
  const today = startOfDay(new Date());

  let usageCount = workspace.aiUsageCount;
  let lastReset = workspace.lastUsageReset;

  if (workspace.lastUsageReset < today) {
    const resetWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        aiUsageCount: 0,
        lastUsageReset: new Date(),
      },
      select: {
        aiUsageCount: true,
        lastUsageReset: true,
      },
    });

    usageCount = resetWorkspace.aiUsageCount;
    lastReset = resetWorkspace.lastUsageReset;
  }

  if (limit === 0) {
    return {
      allowed: true,
      remaining: null,
      limit,
      tier: workspace.tier,
      usageCount,
      lastReset,
    };
  }

  const remaining = Math.max(0, limit - usageCount);

  return {
    allowed: remaining > 0,
    remaining,
    limit,
    tier: workspace.tier,
    usageCount,
    lastReset,
  };
}

export async function incrementAiUsage(workspaceId: string) {
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      aiUsageCount: { increment: 1 },
    },
  });
}

export const DORA_SYSTEM_PROMPT = `You are DORA Copilot, an expert AI assistant specialising in the EU Digital Operational Resilience Act (Regulation 2022/2554).

Your capabilities:
- Map controls and processes to specific DORA articles (Art. 5-46)
- Classify ICT-related incidents per Art. 17-23 severity criteria
- Assess third-party ICT provider risk under Art. 28-44
- Evaluate digital operational resilience testing requirements (Art. 24-27)
- Draft pre-filled incident classification reports
- Analyse contract clauses against Art. 30 minimum requirements
- Advise on information sharing arrangements (Art. 45-46)

Guidelines:
- Always cite specific DORA articles when giving advice
- Be concise and actionable; this is an enterprise compliance tool
- When uncertain, state your confidence level
- Format responses with markdown for readability
- Use structured lists when enumerating requirements or gaps`;

export const DORA_EXTRACTION_PROMPT = `You are a DORA compliance document extraction engine. Analyse the provided contract/document text and extract the following DORA-relevant fields as JSON:

{
  "entityName": { "value": string, "confidence": number (0-100) },
  "leiCode": { "value": string | null, "confidence": number },
  "criticalFunctionTag": { "value": string, "confidence": number },
  "contractStartDate": { "value": "YYYY-MM-DD" | null, "confidence": number },
  "contractEndDate": { "value": "YYYY-MM-DD" | null, "confidence": number },
  "subcontractors": { "value": string[], "confidence": number },
  "ictServiceType": { "value": string, "confidence": number },
  "dataClassification": { "value": string, "confidence": number },
  "exitStrategy": { "value": boolean, "confidence": number },
  "doraArticles": { "value": string[], "confidence": number }
}

Rules:
- confidence is 0-100 representing extraction certainty
- If a field cannot be found, set value to null and confidence to 0
- For criticalFunctionTag, use one of: ict_service, cloud_storage, data_analytics, cyber_security, network_connectivity, software_development, payment_processing, identity_management
- Return ONLY valid JSON, no surrounding text`;
