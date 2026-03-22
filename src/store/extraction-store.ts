"use client";

import { create } from "zustand";
import type { ExtractionDocument } from "@/types/extraction";

const EMPTY_DOCUMENT: ExtractionDocument = {
  id: "",
  filename: "",
  status: "pending",
  uploadedAt: "",
  fields: {
    entityName: {
      value: "",
      confidence: { value: 0, level: "low" },
      isEdited: false,
    },
    leiCode: {
      value: "",
      confidence: { value: 0, level: "low" },
      isEdited: false,
    },
    criticalFunctionTag: {
      value: "",
      confidence: { value: 0, level: "low" },
      isEdited: false,
    },
    startDate: {
      value: "",
      confidence: { value: 0, level: "low" },
      isEdited: false,
    },
    endDate: {
      value: "",
      confidence: { value: 0, level: "low" },
      isEdited: false,
    },
  },
};

interface ExtractionState {
  document: ExtractionDocument;
  isSidebarCollapsed: boolean;
  isSaving: boolean;
  savedAt: string | null;
  setDocument: (doc: ExtractionDocument) => void;
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
  document: EMPTY_DOCUMENT,
  isSidebarCollapsed: false,
  isSaving: false,
  savedAt: null,

  setDocument: (doc) => set({ document: doc }),

  updateField: (field, value) => {
    set((state) => ({
      document: {
        ...state.document,
        fields: {
          ...state.document.fields,
          [field]: {
            ...state.document.fields[field],
            value,
            isEdited: true,
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
    await new Promise((resolve) => setTimeout(resolve, 800));
    set({ isSaving: false, savedAt: new Date().toISOString() });
  },
}));
