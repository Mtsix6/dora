"use client";

import { useRouter } from "next/navigation";
import { Settings2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleIntegration } from "@/app/actions/integrations";
import { toast } from "sonner";

interface IntegrationConnectButtonProps {
  provider: string;
  label: string;
  variant: "default" | "outline";
  name?: string;
  enterpriseOnly?: boolean;
}

export function IntegrationConnectButton({
  provider,
  label,
  variant,
  name,
  enterpriseOnly = false,
}: IntegrationConnectButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant={variant === "default" ? "default" : "outline"}
      size="sm"
      className={
        variant === "default"
          ? "h-8 w-full bg-[#635BFF] text-[12px] font-bold text-white shadow-lg shadow-[#635BFF]/20 hover:bg-[#635BFF]/90"
          : "h-8 w-full border-[#E3E8EF] text-[12px] font-bold text-[#0A2540] hover:bg-[#F6F9FC]"
      }
      onClick={async () => {
        if (enterpriseOnly) {
          router.push("/pricing");
          return;
        }

        try {
          await toggleIntegration(provider, name ?? label);
          toast.success(`${label} updated`);
          router.refresh();
        } catch {
          toast.error(`Failed to update ${label}`);
        }
      }}
    >
      {variant === "default" ? (
        <Plus className="mr-1.5 size-3.5" />
      ) : (
        <Settings2 className="mr-1.5 size-3.5" />
      )}
      {label}
    </Button>
  );
}
