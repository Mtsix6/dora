"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Maximize2,
  Minimize2,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const MOCK_HIGHLIGHTS = [
  { id: 1, top: "18%", height: "3.2%", label: "Entity Name", color: "border-[#635BFF]/60 bg-[#635BFF]/5", dotColor: "bg-[#635BFF]" },
  { id: 2, top: "26%", height: "2.6%", label: "LEI Code", color: "border-emerald-400/60 bg-emerald-400/5", dotColor: "bg-emerald-500" },
  { id: 3, top: "44%", height: "4.8%", label: "Critical Function", color: "border-amber-400/60 bg-amber-400/5", dotColor: "bg-amber-500" },
  { id: 4, top: "62%", height: "2.4%", label: "Start Date", color: "border-emerald-400/60 bg-emerald-400/5", dotColor: "bg-emerald-500" },
  { id: 5, top: "68%", height: "2.4%", label: "End Date", color: "border-red-400/60 bg-red-400/5", dotColor: "bg-red-500" },
];

const TOTAL_PAGES = 4;

const toolbarBtnClass =
  "h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-[#0A2540] hover:bg-[#F6F9FC] transition-colors disabled:opacity-40 disabled:pointer-events-none";

export function PdfViewerPanel() {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));
  const handleZoomReset = () => setZoom(100);

  const handleDownload = () => {
    toast.success("Download started", { description: "Vendor_SLA_AWS.pdf — 2.4 MB" });
  };

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.().catch(() =>
        toast.error("Fullscreen not supported in this browser")
      );
    } else {
      document.exitFullscreen?.();
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
    toast.info(`Searching for "${searchQuery}"`, {
      description: "3 matches found in Vendor_SLA_AWS.pdf",
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        handleSearchOpen();
      }
      if (e.key === "Escape") handleSearchClose();
      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === "ArrowRight") setPage((p) => Math.min(p + 1, TOTAL_PAGES));
        if (e.key === "ArrowLeft") setPage((p) => Math.max(p - 1, 1));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "=") { e.preventDefault(); handleZoomIn(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") { e.preventDefault(); handleZoomOut(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") { e.preventDefault(); handleZoomReset(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchQuery]);

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#F6F9FC] border-r border-[#E3E8EF]">
      {/* PDF toolbar */}
      <div className="flex-shrink-0 h-10 flex items-center gap-2 px-3 border-b border-[#E3E8EF] bg-white">
        <FileText className="size-3.5 text-[#635BFF] flex-shrink-0" />
        <span className="text-[12px] font-medium text-[#0A2540] truncate flex-1">
          Vendor_SLA_AWS.pdf
        </span>
        <span className="text-[11px] text-muted-foreground flex-shrink-0">· {TOTAL_PAGES} pages</span>

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
            <TooltipContent side="bottom">Zoom out (Ctrl+-)</TooltipContent>
          </Tooltip>

          <button
            className="text-[11px] tabular-nums font-medium text-muted-foreground w-9 text-center select-none hover:text-[#0A2540] transition-colors cursor-pointer"
            onClick={handleZoomReset}
            title="Reset zoom (Ctrl+0)"
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
            <TooltipContent side="bottom">Zoom in (Ctrl+=)</TooltipContent>
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

      {/* AI field legend */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-1.5 border-b border-[#E3E8EF] bg-white overflow-x-auto">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0">
          AI Fields
        </span>
        {MOCK_HIGHLIGHTS.map((h) => (
          <button
            key={h.id}
            onClick={() => setActiveHighlight(activeHighlight === h.id ? null : h.id)}
            className={cn(
              "flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 border transition-all flex-shrink-0",
              activeHighlight === h.id
                ? "border-[#635BFF] text-[#635BFF] bg-[#635BFF]/5"
                : "border-transparent text-muted-foreground hover:border-[#E3E8EF] hover:bg-[#F6F9FC]"
            )}
          >
            <span className={cn("size-1.5 rounded-full", h.dotColor)} />
            {h.label}
          </button>
        ))}
        {activeHighlight !== null && (
          <button
            onClick={() => setActiveHighlight(null)}
            className="ml-auto text-[10px] text-[#635BFF] font-medium hover:underline flex-shrink-0"
          >
            Show all
          </button>
        )}
      </div>

      {/* PDF canvas */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center py-6 px-4 gap-4">
        <div
          className="relative bg-white rounded shadow-[0_2px_8px_rgba(10,37,64,0.12)] border border-[#E3E8EF] w-full max-w-[520px] origin-top transition-transform duration-150"
          style={{ aspectRatio: "1 / 1.414", transform: `scale(${zoom / 100})` }}
        >
          {/* Simulated document body */}
          <div className="absolute inset-0 p-8 flex flex-col gap-2 overflow-hidden select-none pointer-events-none">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="h-3 w-48 bg-[#0A2540] rounded-sm mb-1.5" />
                <div className="h-2 w-32 bg-[#E3E8EF] rounded-sm" />
              </div>
              <div className="size-10 rounded border border-[#E3E8EF] flex items-center justify-center">
                <div className="size-5 rounded-sm bg-[#F6F9FC] border border-[#E3E8EF]" />
              </div>
            </div>
            <div className="h-px bg-[#E3E8EF] my-1" />
            {[...Array(22)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-sm",
                  i % 7 === 0 ? "h-2.5 w-3/4 bg-[#0A2540]/20 mb-0.5" : "h-1.5 bg-[#E3E8EF]",
                  i % 5 === 3 && "w-4/5",
                  i % 11 === 8 && "w-2/3"
                )}
              />
            ))}
          </div>

          {/* AI highlight overlays */}
          {MOCK_HIGHLIGHTS.map((h) => {
            const isVisible = activeHighlight === null || activeHighlight === h.id;
            return (
              <button
                key={h.id}
                className={cn(
                  "absolute left-6 right-6 rounded border-l-2 cursor-pointer transition-all duration-200",
                  h.color,
                  !isVisible && "opacity-15"
                )}
                style={{ top: h.top, height: h.height }}
                onClick={() => setActiveHighlight(activeHighlight === h.id ? null : h.id)}
              >
                <span
                  className={cn(
                    "absolute -left-px -top-4 text-[9px] font-semibold px-1 py-0.5 rounded-t leading-none whitespace-nowrap text-white",
                    h.dotColor
                  )}
                >
                  {h.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2 py-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-[#0A2540]"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="flex items-center gap-1">
            {[...Array(TOTAL_PAGES)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={cn(
                  "size-6 rounded text-[11px] font-medium transition-colors",
                  page === i + 1
                    ? "bg-[#635BFF] text-white"
                    : "text-muted-foreground hover:bg-[#F6F9FC] hover:text-[#0A2540]"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-[#0A2540]"
            onClick={() => setPage((p) => Math.min(p + 1, TOTAL_PAGES))}
            disabled={page >= TOTAL_PAGES}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
