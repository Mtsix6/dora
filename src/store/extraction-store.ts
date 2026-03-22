"use client";

import { create } from "zustand";
import type { ExtractionDocument } from "@/types/extraction";

const MOCK_DOCUMENT: ExtractionDocument = {
  id: "doc-001",
  filename: "Vendor_SLA_AWS.pdf",
  status: "review",
  uploadedAt: new Date().toISOString(),
  fields: {
    entityName: {
      value: "Amazon Web Services EMEA SARL",
      confidence: { value: 98, level: "high" },
      isEdited: false,
    },
    leiCode: {
      value: "635400KDMFMRBOIFRR33",
      confidence: { value: 91, level: "high" },
      isEdited: false,
    },
    criticalFunctionTag: {
      value: "cloud_storage",
      confidence: { value: 45, level: "medium" },
      isEdited: false,
    },
    startDate: {
      value: "2024-01-01",
      confidence: { value: 87, level: "high" },
      isEdited: false,
    },
    endDate: {
      value: "2026-12-31",
      confidence: { value: 32, level: "low" },
      isEdited: false,
    },
  },
};

interface ExtractionState {
  document: ExtractionDocument;
  isSidebarCollapsed: boolean;
  isSaving: boolean;
  savedAt: string | null;
  updateField: <K extends keyof ExtractionDocument["fields"]>(
    field: K,
    value: string
  ) => void;
  toggleSidebar: () => void;
  approveDocument: () => void;
  rejectDocument: () => void;
  saveChanges: () => Promise<void>;
}

export const useExtractionStore = create<ExtractionState>()((set, get) => ({
  document: MOCK_DOCUMENT,
  isSidebarCollapsed: false,
  isSaving: false,
  savedAt: null,

  updateField: (field, value) => {
    set((state) => ({
      document: {
        ...state.document,
        fields: {
          ...state.document.fields,
          [field]: {
            ...state.document.fields[field],
            value,
            isEdited: value !== MOCK_DOCUMENT.fields[field].value,
          },
        },
      },
    }));
  },

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  approveDocument: () =>
    set((state) => ({
      document: { ...state.document, status: "approved" },
    })),

  rejectDocument: () =>
    set((state) => ({
      document: { ...state.document, status: "rejected" },
    })),

  saveChanges: async () => {
    set({ isSaving: true });
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    set({ isSaving: false, savedAt: new Date().toISOString() });
  },
}));
