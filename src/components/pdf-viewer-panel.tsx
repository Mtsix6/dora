"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Maximize2,
  Minimize2,
  Search,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useExtractionStore } from "@/store/extraction-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const toolbarBtnClass =
  "h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-[#0A2540] hover:bg-[#F6F9FC] transition-colors disabled:opacity-40 disabled:pointer-events-none";

export function PdfViewerPanel() {
  const { document: extractionDoc } = useExtractionStore();
  const hasDocument = !!extractionDoc.id;

  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));
  const handleZoomReset = () => setZoom(100);

  const handleDownload = () => {
    if (!hasDocument) return;
    toast.success("Download started", { description: `${extractionDoc.filename}` });
  };

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.().catch(() =>
        toast.error("Fullscreen not supported in this browser")
      );
    } else {
      globalThis.document.exitFullscreen?.();
    }
    setIsFullscreen((f) => !f);
  };

  const handleSearchOpen = () => {
    setShowSearch(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleSearchClose = () => {
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    toast.info(`Searching for "${searchQuery}"`);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        handleSearchOpen();
      }
      if (e.key === "Escape") handleSearchClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "=") { e.preventDefault(); handleZoomIn(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") { e.preventDefault(); handleZoomOut(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") { e.preventDefault(); handleZoomReset(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchQuery]);

  // Empty state
  if (!hasDocument) {
    return (
      <div ref={containerRef} className="flex flex-col h-full bg-[#F6F9FC] border-r border-[#E3E8EF]">
        <div className="flex-shrink-0 h-10 flex items-center gap-2 px-3 border-b border-[#E3E8EF] bg-white">
          <FileText className="size-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-[12px] text-muted-foreground">No document selected</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-xs">
            <div className="mx-auto size-14 rounded-2xl bg-[#635BFF]/5 border border-[#635BFF]/10 flex items-center justify-center mb-4">
              <Upload className="size-6 text-[#635BFF]/50" />
            </div>
            <p className="text-[14px] font-semibold text-[#0A2540]">No document loaded</p>
            <p className="text-[12px] text-muted-foreground mt-1">
              Upload a contract from the Contracts page to view and extract it here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#F6F9FC] border-r border-[#E3E8EF]">
      {/* PDF toolbar */}
      <div className="flex-shrink-0 h-10 flex items-center gap-2 px-3 border-b border-[#E3E8EF] bg-white">
        <FileText className="size-3.5 text-[#635BFF] flex-shrink-0" />
        <span className="text-[12px] font-medium text-[#0A2540] truncate flex-1">
          {extractionDoc.filename}
        </span>

        {/* Inline search bar */}
        {showSearch && (
          <form onSubmit={handleSearch} className="flex items-center gap-1 flex-shrink-0">
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search document…"
              className="h-6 w-40 text-[11px] border-[#E3E8EF] bg-[#F6F9FC] focus-visible:ring-[#635BFF]/30 focus-visible:border-[#635BFF]"
            />
            <button type="submit" className={toolbarBtnClass}><Search className="size-3" /></button>
            <button type="button" className={toolbarBtnClass} onClick={handleSearchClose}><X className="size-3" /></button>
          </form>
        )}

        {/* Toolbar icons */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {!showSearch && (
            <>
              <Tooltip>
                <TooltipTrigger className={toolbarBtnClass} onClick={handleSearchOpen}>
                  <Search className="size-3" />
                </TooltipTrigger>
                <TooltipContent side="bottom">Search (Ctrl+F)</TooltipContent>
              </Tooltip>
              <div className="h-3 w-px bg-[#E3E8EF] mx-1" />
            </>
          )}

          <Tooltip>
            <TooltipTrigger
              className={cn(toolbarBtnClass, zoom <= 50 && "opacity-40 pointer-events-none")}
              onClick={handleZoomOut}
              aria-disabled={zoom <= 50}
            >
              <ZoomOut className="size-3" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Zoom out</TooltipContent>
          </Tooltip>

          <button
            className="text-[11px] tabular-nums font-medium text-muted-foreground w-9 text-center select-none hover:text-[#0A2540] transition-colors cursor-pointer"
            onClick={handleZoomReset}
            title="Reset zoom"
          >
            {zoom}%
          </button>

          <Tooltip>
            <TooltipTrigger
              className={cn(toolbarBtnClass, zoom >= 200 && "opacity-40 pointer-events-none")}
              onClick={handleZoomIn}
              aria-disabled={zoom >= 200}
            >
              <ZoomIn className="size-3" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Zoom in</TooltipContent>
          </Tooltip>

          <div className="h-3 w-px bg-[#E3E8EF] mx-1" />

          <Tooltip>
            <TooltipTrigger className={toolbarBtnClass} onClick={handleDownload}>
              <Download className="size-3" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Download PDF</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className={toolbarBtnClass} onClick={handleToggleFullscreen}>
              {isFullscreen ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* PDF content area — will render actual PDF when file URL is available */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center py-6 px-4">
        <div className="text-center max-w-xs">
          <FileText className="size-10 text-[#635BFF]/30 mx-auto mb-3" />
          <p className="text-[13px] font-medium text-[#0A2540]">{extractionDoc.filename}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            PDF preview will be available once processing completes.
          </p>
        </div>
      </div>
    </div>
  );
}
