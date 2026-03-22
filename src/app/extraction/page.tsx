import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PdfViewerPanel } from "@/components/pdf-viewer-panel";
import { ExtractionFormPanel } from "@/components/extraction-form-panel";

export const metadata: Metadata = { title: "Extraction" };

export default function ExtractionPage() {
  return (
    <AppShell>
      {/* Split-pane canvas */}
      <div className="flex h-full divide-x divide-[#E3E8EF]">
        {/* LEFT — PDF Viewer */}
        <section className="flex-1 min-w-0 overflow-hidden">
          <PdfViewerPanel />
        </section>

        {/* RIGHT — Extraction Form */}
        <section className="w-[400px] flex-shrink-0 overflow-hidden xl:w-[440px]">
          <ExtractionFormPanel />
        </section>
      </div>
    </AppShell>
  );
}
