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

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter((f) => {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 10 MB limit`);
        return false;
      }
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "docx", "txt"].includes(ext ?? "")) {
        toast.error(`${f.name} — only PDF, DOCX, TXT are supported`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [
      ...prev,
      ...valid.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        file: f,
        status: "queued" as const,
      })),
    ]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles]
  );

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleUpload = async () => {
    if (files.length === 0) return;

    let successCount = 0;

    for (const queuedFile of files) {
      if (queuedFile.status !== "queued") continue;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === queuedFile.id ? { ...f, status: "uploading" as const } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append("file", queuedFile.file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed");
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === queuedFile.id ? { ...f, status: "done" as const } : f
          )
        );
        successCount++;
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === queuedFile.id ? { ...f, status: "error" as const } : f
          )
        );
        toast.error(`Failed to upload ${queuedFile.name}`);
      }
    }

    if (successCount > 0) {
      toast.success(
        `${successCount} contract${successCount > 1 ? "s" : ""} uploaded`,
        {
          description:
            "AI extraction has started. You'll be notified when review is ready.",
        }
      );
    }

    setTimeout(() => {
      setFiles([]);
      setOpen(false);
      router.refresh();
    }, 1000);
  };

  const queuedCount = files.filter((f) => f.status === "queued").length;
  const isUploading = files.some((f) => f.status === "uploading");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#E3E8EF] bg-white px-3 h-8 text-[12px] font-medium text-[#0A2540] hover:bg-[#F6F9FC] transition-all duration-200 hover:border-[#635BFF]/30 cursor-pointer"
      >
        <Upload className="size-3.5" />
        Upload PDF
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg border-[#E3E8EF] bg-white p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-[15px] font-bold text-[#0A2540] tracking-tight">
            Upload contracts
          </DialogTitle>
          <p className="text-[13px] text-muted-foreground mt-1">
            Drop PDF, DOCX, or TXT files. Max 10 MB each.
          </p>
        </DialogHeader>

        {/* Dropzone */}
        <div className="px-6">
          <label
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200",
              isDragging
                ? "border-[#635BFF] bg-[#635BFF]/5 scale-[1.01]"
                : "border-[#E3E8EF] hover:border-[#635BFF]/40 hover:bg-[#F6F9FC]"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className={cn(
              "size-10 rounded-xl flex items-center justify-center transition-all duration-200",
              isDragging ? "bg-[#635BFF]/15 scale-110" : "bg-[#635BFF]/10"
            )}>
              <Upload
                className={cn(
                  "size-5 transition-colors duration-200",
                  isDragging ? "text-[#635BFF]" : "text-[#635BFF]/70"
                )}
              />
            </div>
            <div className="text-center">
              <span className="text-[13px] font-semibold text-[#0A2540]">
                Drop files here
              </span>
              <span className="text-[13px] text-muted-foreground">
                {" "}
                or{" "}
                <span className="text-[#635BFF] font-medium">browse</span>
              </span>
            </div>
            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileInput}
            />
          </label>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="px-6 mt-4 max-h-48 overflow-y-auto flex flex-col gap-1.5">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-all duration-200",
                  file.status === "done"
                    ? "border-emerald-200 bg-emerald-50/30"
                    : file.status === "error"
                      ? "border-red-200 bg-red-50/30"
                      : "border-[#E3E8EF]"
                )}
              >
                <FileText className={cn(
                  "size-4 flex-shrink-0 transition-colors",
                  file.status === "done" ? "text-emerald-500" : "text-[#635BFF]"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#0A2540] truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatSize(file.size)}
                  </p>
                </div>
                {file.status === "queued" && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="size-5 rounded flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors duration-150"
                  >
                    <X className="size-3" />
                  </button>
                )}
                {file.status === "uploading" && (
                  <Loader2 className="size-4 text-[#635BFF] animate-spin flex-shrink-0" />
                )}
                {file.status === "done" && (
                  <CheckCircle2 className="size-4 text-emerald-500 flex-shrink-0" />
                )}
                {file.status === "error" && (
                  <AlertCircle className="size-4 text-red-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 mt-4 border-t border-[#E3E8EF] bg-[#F6F9FC]/50">
          <p className="text-[11px] text-muted-foreground">
            {files.length > 0
              ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
              : "No files selected"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[12px] border-[#E3E8EF] hover:bg-white"
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
              className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white btn-lift"
              disabled={queuedCount === 0 || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="size-3.5 mr-1.5" />
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
