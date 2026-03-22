/**
 * In-memory data store for DORA RoI Automator.
 *
 * This acts as the single source of truth for the application.
 * In production, swap calls to Prisma/DB. For demo, this provides
 * a fully functional backend without external dependencies.
 */

export interface ContractRecord {
  id: string;
  fileName: string;
  fileUrl: string;
  status: "pending" | "extracting" | "review" | "approved" | "rejected";
  uploadedAt: string;
  updatedAt: string;
  uploadedBy: string;
  extractedData: ExtractedData | null;
}

export interface ExtractedData {
  entityName: FieldData;
  leiCode: FieldData;
  criticalFunctionTag: FieldData;
  startDate: FieldData;
  endDate: FieldData;
}

export interface FieldData {
  value: string;
  confidence: number;
  level: "high" | "medium" | "low";
  isEdited: boolean;
}

export interface ActivityEntry {
  id: string;
  action: string;
  user: string;
  document: string;
  contractId: string;
  time: string;
}

function field(value: string, confidence: number, isEdited = false): FieldData {
  return {
    value,
    confidence,
    level: confidence >= 80 ? "high" : confidence >= 60 ? "medium" : "low",
    isEdited,
  };
}

// ── Seed Data ──────────────────────────────────────────────────────

const SEED_CONTRACTS: ContractRecord[] = [
  {
    id: "doc-001",
    fileName: "Vendor_SLA_AWS.pdf",
    fileUrl: "/uploads/demo/vendor_sla_aws.pdf",
    status: "review",
    uploadedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600_000).toISOString(),
    uploadedBy: "A. Klein",
    extractedData: {
      entityName: field("Amazon Web Services EMEA SARL", 98),
      leiCode: field("635400KDMFMRBOIFRR33", 91),
      criticalFunctionTag: field("cloud_storage", 65),
      startDate: field("2024-01-01", 87),
      endDate: field("2026-12-31", 32),
    },
  },
  {
    id: "doc-002",
    fileName: "Microsoft_Azure_MSA.pdf",
    fileUrl: "/uploads/demo/microsoft_azure_msa.pdf",
    status: "approved",
    uploadedAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
    uploadedBy: "A. Klein",
    extractedData: {
      entityName: field("Microsoft Ireland Operations Ltd", 99),
      leiCode: field("HWUPKR0MPOU8FGXBT394", 95),
      criticalFunctionTag: field("cloud_storage", 88),
      startDate: field("2023-06-01", 97),
      endDate: field("2025-05-31", 91),
    },
  },
  {
    id: "doc-003",
    fileName: "Salesforce_DPA_v3.pdf",
    fileUrl: "/uploads/demo/salesforce_dpa.pdf",
    status: "review",
    uploadedAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60_000).toISOString(),
    uploadedBy: "S. Müller",
    extractedData: {
      entityName: field("Salesforce Ireland Ltd", 72),
      leiCode: field("549300D6I5VNKGPJQE64", 55),
      criticalFunctionTag: field("software_development", 40),
      startDate: field("2024-03-01", 68),
      endDate: field("2027-02-28", 25),
    },
  },
  {
    id: "doc-004",
    fileName: "IBM_ICTS_Contract_2024.pdf",
    fileUrl: "/uploads/demo/ibm_icts.pdf",
    status: "rejected",
    uploadedAt: new Date(Date.now() - 3 * 24 * 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString(),
    uploadedBy: "A. Klein",
    extractedData: {
      entityName: field("IBM Ireland Product Distribution Ltd", 85, true),
      leiCode: field("VDYMYTQGFL00", 22),
      criticalFunctionTag: field("network_connectivity", 67),
      startDate: field("2022-01-15", 90),
      endDate: field("2024-01-14", 88),
    },
  },
  {
    id: "doc-005",
    fileName: "Oracle_Cloud_Infra_SLA.pdf",
    fileUrl: "/uploads/demo/oracle_cloud.pdf",
    status: "extracting",
    uploadedAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60_000).toISOString(),
    uploadedBy: "S. Müller",
    extractedData: null,
  },
  {
    id: "doc-006",
    fileName: "Google_Cloud_SLA.pdf",
    fileUrl: "/uploads/demo/google_cloud.pdf",
    status: "approved",
    uploadedAt: new Date(Date.now() - 5 * 24 * 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 3600_000).toISOString(),
    uploadedBy: "A. Klein",
    extractedData: {
      entityName: field("Google Ireland Ltd", 96),
      leiCode: field("635400ZRQH8STNP72B13", 93),
      criticalFunctionTag: field("cloud_storage", 89),
      startDate: field("2023-09-01", 97),
      endDate: field("2025-06-30", 82),
    },
  },
  {
    id: "doc-007",
    fileName: "Cloudflare_DPA.pdf",
    fileUrl: "/uploads/demo/cloudflare_dpa.pdf",
    status: "review",
    uploadedAt: new Date(Date.now() - 7 * 24 * 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 3600_000).toISOString(),
    uploadedBy: "S. Müller",
    extractedData: {
      entityName: field("Cloudflare Ltd", 88),
      leiCode: field("549300QNTEAT54WBJE72", 71),
      criticalFunctionTag: field("cyber_security", 55),
      startDate: field("2024-02-01", 90),
      endDate: field("2025-01-31", 85),
    },
  },
];

const SEED_ACTIVITY: ActivityEntry[] = [
  { id: "a1", action: "Document approved", user: "A. Klein", document: "Microsoft_Azure_MSA.pdf", contractId: "doc-002", time: new Date(Date.now() - 1 * 3600_000).toISOString() },
  { id: "a2", action: "Field edited", user: "A. Klein", document: "Vendor_SLA_AWS.pdf", contractId: "doc-001", time: new Date(Date.now() - 2 * 3600_000).toISOString() },
  { id: "a3", action: "Document uploaded", user: "S. Müller", document: "Oracle_Cloud_Infra_SLA.pdf", contractId: "doc-005", time: new Date(Date.now() - 5 * 60_000).toISOString() },
  { id: "a4", action: "Document rejected", user: "A. Klein", document: "IBM_ICTS_Contract_2024.pdf", contractId: "doc-004", time: new Date(Date.now() - 3 * 24 * 3600_000).toISOString() },
  { id: "a5", action: "Extraction started", user: "System", document: "Salesforce_DPA_v3.pdf", contractId: "doc-003", time: new Date(Date.now() - 10 * 60_000).toISOString() },
];

// ── In-Memory Store ─────────────────────────────────────────────────

class DataStore {
  private contracts: Map<string, ContractRecord>;
  private activity: ActivityEntry[];

  constructor() {
    this.contracts = new Map(SEED_CONTRACTS.map((c) => [c.id, { ...c }]));
    this.activity = [...SEED_ACTIVITY];
  }

  // ── Contracts ──

  getAllContracts(): ContractRecord[] {
    return Array.from(this.contracts.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  getContract(id: string): ContractRecord | undefined {
    return this.contracts.get(id);
  }

  getContractsByStatus(status: ContractRecord["status"]): ContractRecord[] {
    return this.getAllContracts().filter((c) => c.status === status);
  }

  createContract(data: Omit<ContractRecord, "id" | "updatedAt">): ContractRecord {
    const id = `doc-${String(this.contracts.size + 1).padStart(3, "0")}`;
    const contract: ContractRecord = {
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.contracts.set(id, contract);
    this.addActivity({
      action: "Document uploaded",
      user: data.uploadedBy,
      document: data.fileName,
      contractId: id,
    });
    return contract;
  }

  updateContract(id: string, updates: Partial<ContractRecord>): ContractRecord | undefined {
    const existing = this.contracts.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.contracts.set(id, updated);
    return updated;
  }

  approveContract(id: string, user: string): ContractRecord | undefined {
    const contract = this.updateContract(id, { status: "approved" });
    if (contract) {
      this.addActivity({
        action: "Document approved",
        user,
        document: contract.fileName,
        contractId: id,
      });
    }
    return contract;
  }

  rejectContract(id: string, user: string): ContractRecord | undefined {
    const contract = this.updateContract(id, { status: "rejected" });
    if (contract) {
      this.addActivity({
        action: "Document rejected",
        user,
        document: contract.fileName,
        contractId: id,
      });
    }
    return contract;
  }

  simulateExtraction(id: string): ContractRecord | undefined {
    const contract = this.contracts.get(id);
    if (!contract) return undefined;

    const extracted: ExtractedData = {
      entityName: field(`Extracted Entity — ${contract.fileName.replace(".pdf", "")}`, 75 + Math.floor(Math.random() * 25)),
      leiCode: field("549300EXAMPLE00LEI00", 60 + Math.floor(Math.random() * 30)),
      criticalFunctionTag: field("ict_service", 50 + Math.floor(Math.random() * 40)),
      startDate: field("2024-01-01", 80 + Math.floor(Math.random() * 20)),
      endDate: field("2026-12-31", 60 + Math.floor(Math.random() * 30)),
    };

    return this.updateContract(id, {
      status: "review",
      extractedData: extracted,
    });
  }

  // ── Activity Log ──

  getActivity(limit = 10): ActivityEntry[] {
    return this.activity
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit);
  }

  addActivity(data: Omit<ActivityEntry, "id" | "time">): ActivityEntry {
    const entry: ActivityEntry = {
      ...data,
      id: `a${Date.now()}`,
      time: new Date().toISOString(),
    };
    this.activity.unshift(entry);
    return entry;
  }

  // ── Dashboard Stats ──

  getStats() {
    const all = this.getAllContracts();
    const pendingReview = all.filter((c) => c.status === "review").length;
    const approved = all.filter((c) => c.status === "approved").length;

    // Calculate avg confidence from all contracts with extracted data
    const withData = all.filter((c) => c.extractedData);
    let avgConfidence = 0;
    if (withData.length > 0) {
      const totalConf = withData.reduce((sum, c) => {
        const fields = Object.values(c.extractedData!);
        const avg = fields.reduce((s, f) => s + f.confidence, 0) / fields.length;
        return sum + avg;
      }, 0);
      avgConfidence = Math.round(totalConf / withData.length);
    }

    // Expiring soon (within 90 days)
    const now = Date.now();
    const expiringSoon = withData.filter((c) => {
      const endDate = c.extractedData?.endDate.value;
      if (!endDate) return false;
      const end = new Date(endDate).getTime();
      const daysLeft = Math.ceil((end - now) / 86_400_000);
      return daysLeft >= 0 && daysLeft <= 90;
    }).length;

    return {
      totalContracts: all.length,
      pendingReview,
      approvedThisMonth: approved,
      complianceRate: all.length > 0 ? Math.round((approved / all.length) * 100) : 0,
      avgConfidence,
      expiringSoon,
    };
  }
}

// Singleton
const globalForStore = globalThis as unknown as { dataStore: DataStore };
export const dataStore = globalForStore.dataStore ?? new DataStore();
if (process.env.NODE_ENV !== "production") {
  globalForStore.dataStore = dataStore;
}
