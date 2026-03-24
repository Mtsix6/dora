"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ReviewActions({ contractId, fileName }: { contractId: string; fileName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleAction(action: "approve" | "reject") {
    setLoading(action);
    try {
      const res = await fetch(`/api/contracts/${contractId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }

      toast.success(
        action === "approve"
          ? `"${fileName}" approved and added to the register.`
          : `"${fileName}" has been rejected.`
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update contract");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={loading !== null}
        onClick={() => handleAction("approve")}
        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        title="Approve"
      >
        {loading === "approve" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="size-3.5" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={loading !== null}
        onClick={() => handleAction("reject")}
        className="text-red-500 hover:text-red-600 hover:bg-red-50"
        title="Reject"
      >
        {loading === "reject" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <XCircle className="size-3.5" />
        )}
      </Button>
    </div>
  );
}
