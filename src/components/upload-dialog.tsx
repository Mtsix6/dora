"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface QueuedFile {
  id: string;
  name: string;
  size: number;
  file: File;
  status: "queued" | "uploading" | "done" | "error";
}

interface UploadDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
  openLatestOnSuccess?: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadDialog({
  triggerLabel = "Upload File",
  triggerClassName,
  openLatestOnSuccess = false,
}: UploadDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10 MB limit`);
        return false;
      }

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "doc", "docx", "txt", "md"].includes(ext ?? "")) {
        toast.error(`${file.name} - only PDF, DOC, DOCX, TXT, and MD are supported`);
        return false;
      }

      return true;
    });

    setFiles((prev) => [
      ...prev,
      ...valid.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        file,
        status: "queued" as const,
      })),
    ]);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer.files.length) {
        addFiles(event.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) {
        addFiles(event.target.files);
      }
      event.target.value = "";
    },
    [addFiles],
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      return;
    }

    let successCount = 0;
    let latestUploadedId: string | null = null;

    for (const queuedFile of files) {
      if (queuedFile.status !== "queued") continue;

      setFiles((prev) =>
        prev.map((file) =>
          file.id === queuedFile.id ? { ...file, status: "uploading" as const } : file,
        ),
      );

      try {
        const formData = new FormData();
        formData.append("file", queuedFile.file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json().catch(() => ({} as { error?: string; id?: string }));
        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        latestUploadedId = data.id ?? latestUploadedId;
        setFiles((prev) =>
          prev.map((file) =>
            file.id === queuedFile.id ? { ...file, status: "done" as const } : file,
          ),
        );
        successCount++;
      } catch (error) {
        setFiles((prev) =>
          prev.map((file) =>
            file.id === queuedFile.id ? { ...file, status: "error" as const } : file,
          ),
        );
        toast.error(
          error instanceof Error ? error.message : `Failed to upload ${queuedFile.name}`,
        );
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? "s" : ""} uploaded`, {
        description: "AI extraction has started for the uploaded evidence.",
      });
    }

    setTimeout(() => {
      setFiles([]);
      setOpen(false);
      if (openLatestOnSuccess && latestUploadedId) {
        router.push(`/extraction?id=${latestUploadedId}`);
      } else {
        router.refresh();
      }
    }, 800);
  };

  const queuedCount = files.filter((file) => file.status === "queued").length;
  const isUploading = files.some((file) => file.status === "uploading");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#E3E8EF] bg-white px-3 text-[12px] font-medium text-[#0A2540] transition-all duration-200 hover:border-[#635BFF]/30 hover:bg-[#F6F9FC]",
          triggerClassName,
        )}
      >
        <Upload className="size-3.5" />
        {triggerLabel}
      </DialogTrigger>

      <DialogContent className="gap-0 border-[#E3E8EF] bg-white p-0 sm:max-w-lg">
        <DialogHeader className="px-6 pb-4 pt-6">
          <DialogTitle className="text-[15px] font-bold tracking-tight text-[#0A2540]">
            Upload evidence
          </DialogTitle>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Drop PDF, DOC, DOCX, TXT, or Markdown files. Max 10 MB each.
          </p>
        </DialogHeader>

        <div className="px-6">
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all duration-200",
              isDragging
                ? "scale-[1.01] border-[#635BFF] bg-[#635BFF]/5"
                : "border-[#E3E8EF] hover:border-[#635BFF]/40 hover:bg-[#F6F9FC]",
            )}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-xl transition-all duration-200",
                isDragging ? "scale-110 bg-[#635BFF]/15" : "bg-[#635BFF]/10",
              )}
            >
              <Upload
                className={cn(
                  "size-5 transition-colors duration-200",
                  isDragging ? "text-[#635BFF]" : "text-[#635BFF]/70",
                )}
              />
            </div>
            <div className="text-center">
              <span className="text-[13px] font-semibold text-[#0A2540]">Drop files here</span>
              <span className="text-[13px] text-muted-foreground">
                {" "}
                or <span className="font-medium text-[#635BFF]">browse</span>
              </span>
            </div>
            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={handleFileInput}
            />
          </label>
        </div>

        <div className="mt-3 px-6">
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <button
              type="button"
              className="rounded-full border border-[#E3E8EF] px-2.5 py-1 hover:border-[#635BFF]/30 hover:bg-[#F6F9FC]"
              onClick={() => inputRef.current?.click()}
            >
              Browse files
            </button>
            <span className="rounded-full border border-[#E3E8EF] px-2.5 py-1">PDF contracts</span>
            <span className="rounded-full border border-[#E3E8EF] px-2.5 py-1">Word annexes</span>
            <span className="rounded-full border border-[#E3E8EF] px-2.5 py-1">Text notes</span>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4 flex max-h-48 flex-col gap-1.5 overflow-y-auto px-6">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-all duration-200",
                  file.status === "done"
                    ? "border-emerald-200 bg-emerald-50/30"
                    : file.status === "error"
                      ? "border-red-200 bg-red-50/30"
                      : "border-[#E3E8EF]",
                )}
              >
                <FileText
                  className={cn(
                    "size-4 flex-shrink-0 transition-colors",
                    file.status === "done" ? "text-emerald-500" : "text-[#635BFF]",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-[#0A2540]">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">{formatSize(file.size)}</p>
                </div>
                {file.status === "queued" && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors duration-150 hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="size-3" />
                  </button>
                )}
                {file.status === "uploading" && (
                  <Loader2 className="size-4 animate-spin text-[#635BFF] flex-shrink-0" />
                )}
                {file.status === "done" && (
                  <CheckCircle2 className="size-4 flex-shrink-0 text-emerald-500" />
                )}
                {file.status === "error" && (
                  <AlertCircle className="size-4 flex-shrink-0 text-red-500" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[#E3E8EF] bg-[#F6F9FC]/50 px-6 py-4">
          <p className="text-[11px] text-muted-foreground">
            {files.length > 0
              ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
              : "No files selected"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-[#E3E8EF] text-[12px] hover:bg-white"
              onClick={() => {
                setFiles([]);
                setOpen(false);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="btn-lift h-8 bg-[#635BFF] text-[12px] text-white hover:bg-[#4F46E5]"
              disabled={queuedCount === 0 || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 size-3.5" />
                  Upload & extract
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
