/**
 * Mock data for DORA RoI Automator demo
 */

import type { ExtractionDocument } from "@/types/extraction";

export const MOCK_CONTRACTS: ExtractionDocument[] = [
  {
    id: "doc-001",
    filename: "Vendor_SLA_AWS.pdf",
    status: "review",
    uploadedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    fields: {
      entityName: { value: "Amazon Web Services EMEA SARL", confidence: { value: 98, level: "high" }, isEdited: false },
      leiCode: { value: "635400KDMFMRBOIFRR33", confidence: { value: 91, level: "high" }, isEdited: false },
      criticalFunctionTag: { value: "cloud_storage", confidence: { value: 45, level: "medium" }, isEdited: false },
      startDate: { value: "2024-01-01", confidence: { value: 87, level: "high" }, isEdited: false },
      endDate: { value: "2026-12-31", confidence: { value: 32, level: "low" }, isEdited: false },
    },
  },
  {
    id: "doc-002",
    filename: "Microsoft_Azure_MSA.pdf",
    status: "approved",
    uploadedAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    fields: {
      entityName: { value: "Microsoft Ireland Operations Ltd", confidence: { value: 99, level: "high" }, isEdited: false },
      leiCode: { value: "HWUPKR0MPOU8FGXBT394", confidence: { value: 95, level: "high" }, isEdited: false },
      criticalFunctionTag: { value: "cloud_storage", confidence: { value: 88, level: "high" }, isEdited: false },
      startDate: { value: "2023-06-01", confidence: { value: 97, level: "high" }, isEdited: false },
      endDate: { value: "2025-05-31", confidence: { value: 91, level: "high" }, isEdited: false },
    },
  },
  {
    id: "doc-003",
    filename: "Salesforce_DPA_v3.pdf",
    status: "pending",
    uploadedAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    fields: {
      entityName: { value: "Salesforce Ireland Ltd", confidence: { value: 72, level: "medium" }, isEdited: false },
      leiCode: { value: "549300D6I5VNKGPJQE64", confidence: { value: 55, level: "medium" }, isEdited: false },
      criticalFunctionTag: { value: "software_development", confidence: { value: 40, level: "medium" }, isEdited: false },
      startDate: { value: "2024-03-01", confidence: { value: 68, level: "medium" }, isEdited: false },
      endDate: { value: "2027-02-28", confidence: { value: 25, level: "low" }, isEdited: false },
    },
  },
  {
    id: "doc-004",
    filename: "IBM_ICTS_Contract_2024.pdf",
    status: "rejected",
    uploadedAt: new Date(Date.now() - 3 * 24 * 3600_000).toISOString(),
    fields: {
      entityName: { value: "IBM Ireland Product Distribution Ltd", confidence: { value: 85, level: "high" }, isEdited: true },
      leiCode: { value: "VDYMYTQGFL00", confidence: { value: 22, level: "low" }, isEdited: false },
      criticalFunctionTag: { value: "network_connectivity", confidence: { value: 67, level: "medium" }, isEdited: false },
      startDate: { value: "2022-01-15", confidence: { value: 90, level: "high" }, isEdited: false },
      endDate: { value: "2024-01-14", confidence: { value: 88, level: "high" }, isEdited: false },
    },
  },
  {
    id: "doc-005",
    filename: "Oracle_Cloud_Infra_SLA.pdf",
    status: "extracting",
    uploadedAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    fields: {
      entityName: { value: "", confidence: { value: 0, level: "low" }, isEdited: false },
      leiCode: { value: "", confidence: { value: 0, level: "low" }, isEdited: false },
      criticalFunctionTag: { value: "", confidence: { value: 0, level: "low" }, isEdited: false },
      startDate: { value: "", confidence: { value: 0, level: "low" }, isEdited: false },
      endDate: { value: "", confidence: { value: 0, level: "low" }, isEdited: false },
    },
  },
];

export const DASHBOARD_STATS = {
  totalContracts: 47,
  pendingReview: 7,
  approvedThisMonth: 12,
  complianceRate: 89,
  avgConfidence: 76,
  expiringSoon: 3,
};

export const ACTIVITY_LOG = [
  { id: "a1", action: "Document approved", user: "A. Klein", document: "Microsoft_Azure_MSA.pdf", time: new Date(Date.now() - 1 * 3600_000).toISOString() },
  { id: "a2", action: "Field edited", user: "A. Klein", document: "Vendor_SLA_AWS.pdf", time: new Date(Date.now() - 2 * 3600_000).toISOString() },
  { id: "a3", action: "Document uploaded", user: "S. Müller", document: "Oracle_Cloud_Infra_SLA.pdf", time: new Date(Date.now() - 5 * 60_000).toISOString() },
  { id: "a4", action: "Document rejected", user: "A. Klein", document: "IBM_ICTS_Contract_2024.pdf", time: new Date(Date.now() - 3 * 24 * 3600_000).toISOString() },
  { id: "a5", action: "Extraction started", user: "System", document: "Salesforce_DPA_v3.pdf", time: new Date(Date.now() - 10 * 60_000).toISOString() },
];
