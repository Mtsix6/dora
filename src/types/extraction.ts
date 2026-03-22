export type ConfidenceLevel = "high" | "medium" | "low";

export interface ConfidenceScore {
  value: number; // 0–100
  level: ConfidenceLevel;
}

export interface ExtractedField<T = string> {
  value: T;
  confidence: ConfidenceScore;
  isEdited: boolean;
}

export interface DoraExtractionFields {
  entityName: ExtractedField;
  leiCode: ExtractedField;
  criticalFunctionTag: ExtractedField;
  startDate: ExtractedField;
  endDate: ExtractedField;
}

export interface ExtractionDocument {
  id: string;
  filename: string;
  status: "pending" | "extracting" | "review" | "approved" | "rejected";
  uploadedAt: string;
  fields: DoraExtractionFields;
}

export const CRITICAL_FUNCTION_OPTIONS = [
  { value: "ict_service", label: "ICT Service" },
  { value: "cloud_storage", label: "Cloud Storage" },
  { value: "data_analytics", label: "Data Analytics" },
  { value: "cyber_security", label: "Cyber Security" },
  { value: "network_connectivity", label: "Network Connectivity" },
  { value: "software_development", label: "Software Development" },
  { value: "payment_processing", label: "Payment Processing" },
  { value: "identity_management", label: "Identity Management" },
] as const;
