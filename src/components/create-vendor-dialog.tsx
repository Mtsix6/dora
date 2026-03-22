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
import { createVendor } from "@/app/actions/dora";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS = [
  "Cloud Infrastructure",
  "Monitoring",
  "Identity",
  "Payment",
  "Communication",
  "Analytics",
] as const;
const CRITICALITY_OPTIONS = ["Critical", "High", "Medium", "Low"] as const;
const STATUS_OPTIONS = ["Compliant", "Review Pending", "Non-Compliant"] as const;

export function CreateVendorDialog({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Cloud Infrastructure");
  const [criticality, setCriticality] = useState("Medium");
  const [status, setStatus] = useState("Compliant");
  const [nextReviewAt, setNextReviewAt] = useState("");

  function reset() {
    setName("");
    setCategory("Cloud Infrastructure");
    setCriticality("Medium");
    setStatus("Compliant");
    setNextReviewAt("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      await createVendor({
        name: name.trim(),
        category,
        criticality,
        status,
        nextReviewAt: nextReviewAt || undefined,
      });
      toast.success("Vendor added successfully");
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add vendor");
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
        Add Vendor
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#0A2540]">Name</label>
            <Input
              placeholder="e.g. AWS, Datadog"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#0A2540]">Category</label>
            <select
              className="flex h-9 w-full rounded-md border border-[#E3E8EF] bg-white px-3 py-1 text-[13px] text-[#0A2540] outline-none focus:ring-2 focus:ring-[#635BFF]/20 transition-all"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#0A2540]">Criticality</label>
            <select
              className="flex h-9 w-full rounded-md border border-[#E3E8EF] bg-white px-3 py-1 text-[13px] text-[#0A2540] outline-none focus:ring-2 focus:ring-[#635BFF]/20 transition-all"
              value={criticality}
              onChange={(e) => setCriticality(e.target.value)}
            >
              {CRITICALITY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#0A2540]">Status</label>
            <select
              className="flex h-9 w-full rounded-md border border-[#E3E8EF] bg-white px-3 py-1 text-[13px] text-[#0A2540] outline-none focus:ring-2 focus:ring-[#635BFF]/20 transition-all"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#0A2540]">Next Review Date</label>
            <Input
              type="date"
              value={nextReviewAt}
              onChange={(e) => setNextReviewAt(e.target.value)}
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
              Add Vendor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
