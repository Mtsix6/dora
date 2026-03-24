"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RefreshButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 rounded-xl px-3 text-[#5B5BD6]"
      onClick={() => router.refresh()}
    >
      <RefreshCw className="mr-2 size-3.5" />
      Refresh
    </Button>
  );
}
