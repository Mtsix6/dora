"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createIncident } from "@/app/actions/dora";
import { cn } from "@/lib/utils";

const SEVERITY_OPTIONS = ["Critical", "High", "Medium", "Low"] as const;

export function CreateIncidentDialog({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [description, setDescription] = useState("");

  function reset() {
    setTitle("");
    setSeverity("Medium");
    setDescription("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      await createIncident({ title: title.trim(), severity, description: description.trim() || undefined });
      toast.success("Incident reported successfully");
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to report incident");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          "inline-flex items-center gap-2 rounded-lg bg-[#635BFF] px-4 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-[#5851ea] transition-colors cursor-pointer",
          className
        )}
      >
        <Plus className="h-4 w-4" />
        Report Incident
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Incident</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#0A2540]">Title</label>
            <Input
              placeholder="e.g. Database outage in production"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#0A2540]">Severity</label>
            <select
              className="flex h-9 w-full rounded-md border border-[#E3E8EF] bg-white px-3 py-1 text-[13px] text-[#0A2540] outline-none focus:ring-2 focus:ring-[#635BFF]/20 transition-all"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#0A2540]">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-[#E3E8EF] bg-white px-3 py-2 text-[13px] text-[#0A2540] outline-none focus:ring-2 focus:ring-[#635BFF]/20 transition-all resize-none"
              placeholder="Describe the incident..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="text-[13px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#635BFF] hover:bg-[#5851ea] text-white text-[13px]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Report Incident
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
