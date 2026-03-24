"use client";

import { create } from "zustand";
import type { ExtractionDocument } from "@/types/extraction";

const EMPTY_DOCUMENT: ExtractionDocument = {
  id: "",
  filename: "",
  fileUrl: "",
  mimeType: "",
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

  approveDocument: async () => {
    const { document } = get();
    if (!document.id) return;

    set({ isSaving: true });
    try {
      const res = await fetch(`/api/contracts/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      const updated = await res.json();
      set({
        document: { ...document, status: "approved" },
        savedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  rejectDocument: async () => {
    const { document } = get();
    if (!document.id) return;

    set({ isSaving: true });
    try {
      const res = await fetch(`/api/contracts/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      set({
        document: { ...document, status: "rejected" },
        savedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  saveChanges: async () => {
    const { document } = get();
    if (!document.id) return;

    set({ isSaving: true });
    try {
      // Map store fields to the flat structure the API expects
      const fieldsToSave: Record<string, any> = {};
      Object.entries(document.fields).forEach(([key, field]) => {
        fieldsToSave[key] = field;
      });

      const res = await fetch(`/api/contracts/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: fieldsToSave }),
      });

      if (!res.ok) throw new Error("Failed to save changes");

      set({ isSaving: false, savedAt: new Date().toISOString() });
    } catch (error) {
      console.error(error);
      set({ isSaving: false });
      throw error;
    }
  },
}));
