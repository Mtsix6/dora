"use client";

import { Button } from "@/components/ui/button";
import { Settings2, Plus } from "lucide-react";
import { toast } from "sonner";

interface IntegrationConnectButtonProps {
  provider: string;
  label: string;
  variant: "default" | "outline";
}

export function IntegrationConnectButton({
  provider,
  label,
  variant,
}: IntegrationConnectButtonProps) {
  return (
    <Button
      variant={variant === "default" ? "default" : "outline"}
      size="sm"
      className={
        variant === "default"
          ? "w-full h-8 text-[12px] font-bold bg-[#635BFF] hover:bg-[#635BFF]/90 text-white shadow-lg shadow-[#635BFF]/20"
          : "w-full h-8 text-[12px] font-bold border-[#E3E8EF] text-[#0A2540] hover:bg-[#F6F9FC]"
      }
      onClick={() => {
        toast.info("Integration setup coming soon", {
          description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} integration will be available in a future update.`,
        });
      }}
    >
      {variant === "default" ? (
        <Plus className="size-3.5 mr-1.5" />
      ) : (
        <Settings2 className="size-3.5 mr-1.5" />
      )}
      {label}
    </Button>
  );
}
