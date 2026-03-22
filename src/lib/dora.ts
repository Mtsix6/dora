/**
 * DORA (Digital Operational Resilience Act) domain constants and helpers
 * EU Regulation 2022/2554 — in force from 17 January 2025
 */

export const DORA_PILLARS = [
  {
    id: "ict_risk",
    title: "ICT Risk Management",
    article: "Art. 5–16",
    description: "Frameworks for identifying, protecting, detecting, responding and recovering from ICT risks.",
    color: "blue",
  },
  {
    id: "incident_reporting",
    title: "Incident Reporting",
    article: "Art. 17–23",
    description: "Mandatory reporting of major ICT-related incidents to competent authorities.",
    color: "red",
  },
  {
    id: "resilience_testing",
    title: "Digital Operational Resilience Testing",
    article: "Art. 24–27",
    description: "Regular TLPT (Threat-Led Penetration Testing) and vulnerability assessments.",
    color: "amber",
  },
  {
    id: "third_party_risk",
    title: "Third-Party Risk Management",
    article: "Art. 28–44",
    description: "Management of ICT third-party service provider risk and contractual arrangements.",
    color: "purple",
  },
  {
    id: "information_sharing",
    title: "Information Sharing",
    article: "Art. 45–46",
    description: "Voluntary sharing of cyber threat intelligence among financial entities.",
    color: "green",
  },
] as const;

export type DoraPillarId = (typeof DORA_PILLARS)[number]["id"];

export const DOCUMENT_STATUSES = {
  pending: { label: "Pending", color: "slate" },
  extracting: { label: "Extracting", color: "blue" },
  review: { label: "In Review", color: "amber" },
  approved: { label: "Approved", color: "emerald" },
  rejected: { label: "Rejected", color: "red" },
} as const;

export type DocumentStatus = keyof typeof DOCUMENT_STATUSES;

/** Minimum contractual clauses required under DORA Art. 30 */
export const REQUIRED_CONTRACT_CLAUSES = [
  "Description of ICT services",
  "Data location and processing jurisdictions",
  "Sub-outsourcing provisions",
  "Audit rights and access",
  "Termination rights and exit plans",
  "Service level targets",
  "Incident reporting obligations",
  "Business continuity provisions",
] as const;

/** DORA competent authorities by jurisdiction */
export const COMPETENT_AUTHORITIES: Record<string, string> = {
  IE: "Central Bank of Ireland (CBI)",
  DE: "BaFin",
  FR: "ACPR",
  NL: "DNB / AFM",
  LU: "CSSF",
  IT: "Banca d'Italia / CONSOB",
  ES: "Banco de España / CNMV",
  EU: "European Banking Authority (EBA)",
};

/** Get a risk level label from a numeric score */
export function getRiskLabel(score: number): "Critical" | "High" | "Medium" | "Low" {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

/** Get days until contract expiry */
export function getDaysToExpiry(endDate: string): number | null {
  const end = new Date(endDate);
  if (isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - Date.now()) / 86_400_000);
}

/** Whether a contract is expiring within N days */
export function isExpiringSoon(endDate: string, withinDays = 90): boolean {
  const days = getDaysToExpiry(endDate);
  return days !== null && days >= 0 && days <= withinDays;
}
