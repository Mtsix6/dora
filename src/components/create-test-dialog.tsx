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
import { createResilienceTest } from "@/app/actions/dora";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS = [
  "Penetration Test",
  "TLPT",
  "Vulnerability Scan",
  "Red Team",
  "Tabletop Exercise",
] as const;

export function CreateTestDialog({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("Penetration Test");
  const [scheduledAt, setScheduledAt] = useState("");
  const [scope, setScope] = useState("");

  function reset() {
    setName("");
    setType("Penetration Test");
    setScheduledAt("");
    setScope("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      await createResilienceTest({
        name: name.trim(),
        type,
        scheduledAt: scheduledAt || undefined,
        scope: scope.trim() || undefined,
      });
      toast.success("Test scheduled successfully");
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule test");
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
        Schedule Test
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Resilience Test</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#0A2540]">Name</label>
            <Input
              placeholder="e.g. Q1 2026 Penetration Test"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#0A2540]">Type</label>
            <select
              className="flex h-9 w-full rounded-md border border-[#E3E8EF] bg-white px-3 py-1 text-[13px] text-[#0A2540] outline-none focus:ring-2 focus:ring-[#635BFF]/20 transition-all"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#0A2540]">Scheduled Date</label>
            <Input
              type="date"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#0A2540]">Scope</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-[#E3E8EF] bg-white px-3 py-2 text-[13px] text-[#0A2540] outline-none focus:ring-2 focus:ring-[#635BFF]/20 transition-all resize-none"
              placeholder="Describe the test scope..."
              value={scope}
              onChange={(e) => setScope(e.target.value)}
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
              Schedule Test
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
