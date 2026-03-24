"use client";

import {
  Download,
  ExternalLink,
  FileText,
  Maximize2,
  Minimize2,
  Search,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useExtractionStore } from "@/store/extraction-store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const toolbarBtnClass =
  "h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-[#0A2540] hover:bg-[#F6F9FC] transition-colors disabled:opacity-40 disabled:pointer-events-none";

export function PdfViewerPanel() {
  const { document: extractionDoc } = useExtractionStore();
  const hasDocument = Boolean(extractionDoc.id);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPdf = extractionDoc.mimeType === "application/pdf";
  const isText = extractionDoc.mimeType === "text/plain";
  const canPreviewInline = isPdf || isText;
  const viewerStyle = useMemo(
    () => ({ transform: `scale(${zoom / 100})`, transformOrigin: "top center" as const }),
    [zoom],
  );

  useEffect(() => {
    if (!isText || !extractionDoc.fileUrl) {
      setTextPreview(null);
      return;
    }

    fetch(extractionDoc.fileUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load text preview");
        }
        return response.text();
      })
      .then((text) => setTextPreview(text))
      .catch(() => {
        setTextPreview(null);
      });
  }, [extractionDoc.fileUrl, isText]);

  const handleZoomIn = () => setZoom((value) => Math.min(value + 10, 200));
  const handleZoomOut = () => setZoom((value) => Math.max(value - 10, 50));
  const handleZoomReset = () => setZoom(100);

  const handleDownload = () => {
    if (!hasDocument || !extractionDoc.fileUrl) {
      return;
    }

    globalThis.open(extractionDoc.fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenExternal = () => {
    if (!hasDocument || !extractionDoc.fileUrl) {
      return;
    }

    globalThis.open(extractionDoc.fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.().catch(() =>
        toast.error("Fullscreen not supported in this browser"),
      );
    } else {
      globalThis.document.exitFullscreen?.();
    }
    setIsFullscreen((value) => !value);
  };

  const handleSearchOpen = () => {
    if (!isText) {
      toast.info("Inline search is available for text files only.");
      return;
    }
    setShowSearch(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const handleSearchClose = () => {
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }

    if (!isText || !textPreview) {
      toast.info("Search preview is only available for text uploads.");
      return;
    }

    const containsText = textPreview.toLowerCase().includes(searchQuery.toLowerCase());
    toast[containsText ? "success" : "error"](
      containsText ? `Found "${searchQuery}" in the document.` : `No match for "${searchQuery}".`,
    );
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "f") {
        event.preventDefault();
        handleSearchOpen();
      }
      if (event.key === "Escape") handleSearchClose();
      if ((event.ctrlKey || event.metaKey) && event.key === "=") {
        event.preventDefault();
        handleZoomIn();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "-") {
        event.preventDefault();
        handleZoomOut();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "0") {
        event.preventDefault();
        handleZoomReset();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isText]);

  if (!hasDocument) {
    return (
      <div ref={containerRef} className="flex h-full flex-col border-r border-[#E3E8EF] bg-[#F6F9FC]">
        <div className="flex h-10 flex-shrink-0 items-center gap-2 border-b border-[#E3E8EF] bg-white px-3">
          <FileText className="size-3.5 flex-shrink-0 text-muted-foreground" />
          <span className="text-[12px] text-muted-foreground">No document selected</span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-xs text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-[#635BFF]/10 bg-[#635BFF]/5">
              <Upload className="size-6 text-[#635BFF]/50" />
            </div>
            <p className="text-[14px] font-semibold text-[#0A2540]">No document loaded</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Upload a contract from the Contracts page to view and extract it here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full flex-col border-r border-[#E3E8EF] bg-[#F6F9FC]">
      <div className="flex h-10 flex-shrink-0 items-center gap-2 border-b border-[#E3E8EF] bg-white px-3">
        <FileText className="size-3.5 flex-shrink-0 text-[#635BFF]" />
        <span className="flex-1 truncate text-[12px] font-medium text-[#0A2540]">
          {extractionDoc.filename}
        </span>

        {showSearch && (
          <form onSubmit={handleSearch} className="flex flex-shrink-0 items-center gap-1">
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search text..."
              className="h-6 w-40 border-[#E3E8EF] bg-[#F6F9FC] text-[11px] focus-visible:border-[#635BFF] focus-visible:ring-[#635BFF]/30"
            />
            <button type="submit" className={toolbarBtnClass}>
              <Search className="size-3" />
            </button>
            <button type="button" className={toolbarBtnClass} onClick={handleSearchClose}>
              <X className="size-3" />
            </button>
          </form>
        )}

        <div className="flex flex-shrink-0 items-center gap-0.5">
          {!showSearch && (
            <>
              <Tooltip>
                <TooltipTrigger
                  className={cn(toolbarBtnClass, !isText && "opacity-40 pointer-events-none")}
                  onClick={handleSearchOpen}
                >
                  <Search className="size-3" />
                </TooltipTrigger>
                <TooltipContent side="bottom">Search text file</TooltipContent>
              </Tooltip>
              <div className="mx-1 h-3 w-px bg-[#E3E8EF]" />
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
            className="w-9 cursor-pointer select-none text-center text-[11px] font-medium tabular-nums text-muted-foreground transition-colors hover:text-[#0A2540]"
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

          <div className="mx-1 h-3 w-px bg-[#E3E8EF]" />

          <Tooltip>
            <TooltipTrigger className={toolbarBtnClass} onClick={handleDownload}>
              <Download className="size-3" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Open or download</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className={toolbarBtnClass} onClick={handleOpenExternal}>
              <ExternalLink className="size-3" />
            </TooltipTrigger>
            <TooltipContent side="bottom">Open in new tab</TooltipContent>
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

      <div className="flex flex-1 overflow-auto p-4">
        {!canPreviewInline && (
          <div className="m-auto max-w-sm text-center">
            <FileText className="mx-auto mb-3 size-10 text-[#635BFF]/30" />
            <p className="text-[13px] font-medium text-[#0A2540]">{extractionDoc.filename}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              This format cannot be previewed inline yet. Use open or download to inspect it.
            </p>
          </div>
        )}

        {isPdf && extractionDoc.fileUrl && (
          <div className="min-h-full w-full origin-top overflow-auto" style={viewerStyle}>
            <iframe
              src={extractionDoc.fileUrl}
              title={extractionDoc.filename}
              className="h-[calc(100vh-190px)] w-full rounded-xl border border-[#E3E8EF] bg-white"
            />
          </div>
        )}

        {isText && (
          <div className="min-h-full w-full origin-top overflow-auto" style={viewerStyle}>
            <pre className="min-h-[calc(100vh-190px)] whitespace-pre-wrap rounded-xl border border-[#E3E8EF] bg-white p-4 text-[12px] leading-6 text-[#0A2540]">
              {textPreview || "Loading text preview..."}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
