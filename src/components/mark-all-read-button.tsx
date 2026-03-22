"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationsRead } from "@/app/actions/dora";

interface MarkAllReadButtonProps {
  unreadIds: string[];
}

export function MarkAllReadButton({ unreadIds }: MarkAllReadButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (unreadIds.length === 0) return;
    setLoading(true);
    try {
      await markNotificationsRead(unreadIds);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={unreadIds.length === 0 || loading}
      className="text-[12px] border-[#E3E8EF] text-[#0A2540] hover:bg-[#F6F9FC]"
    >
      <Check className="size-3.5 mr-1.5" />
      Mark all read
    </Button>
  );
}
