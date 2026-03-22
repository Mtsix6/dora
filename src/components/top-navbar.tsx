"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useExtractionStore } from "@/store/extraction-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronRight,
  HelpCircle,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const BREADCRUMB_MAP: Record<string, { label: string; href: string }[]> = {
  "/dashboard": [{ label: "Dashboard", href: "/dashboard" }],
  "/analytics": [{ label: "Analytics", href: "/analytics" }],
  "/contracts": [
    { label: "Contracts", href: "/contracts" },
    { label: "All Contracts", href: "/contracts" },
  ],
  "/extraction": [
    { label: "Contracts", href: "/contracts" },
    { label: "Vendors", href: "/contracts" },
    { label: "Vendor_SLA_AWS.pdf", href: "/extraction" },
  ],
  "/register": [{ label: "Register", href: "/register" }],
  "/review": [{ label: "In Review", href: "/review" }],
  "/ict-risk": [
    { label: "DORA Pillars", href: "#" },
    { label: "ICT Risk Management", href: "/ict-risk" },
  ],
  "/incidents": [
    { label: "DORA Pillars", href: "#" },
    { label: "Incident Reporting", href: "/incidents" },
  ],
  "/resilience": [
    { label: "DORA Pillars", href: "#" },
    { label: "Resilience Testing", href: "/resilience" },
  ],
  "/third-party-risk": [
    { label: "DORA Pillars", href: "#" },
    { label: "Third-Party Risk", href: "/third-party-risk" },
  ],
  "/library": [{ label: "Regulatory Library", href: "/library" }],
  "/audit": [{ label: "Audit Log", href: "/audit" }],
};

const iconBtnClass =
  "h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-[#F6F9FC] transition-all duration-200 hover:scale-105 active:scale-95";

export function TopNavbar() {
  const { document, isSidebarCollapsed, toggleSidebar, savedAt } =
    useExtractionStore();
  const pathname = usePathname();
  const breadcrumbs = BREADCRUMB_MAP[pathname] ?? [];
  const isExtractionPage = pathname === "/extraction";

  return (
    <header className="h-12 flex-shrink-0 border-b border-[#E3E8EF] bg-white/95 backdrop-blur-sm flex items-center px-4 gap-3 z-20">
      {/* Sidebar toggle */}
      <Tooltip>
        <TooltipTrigger
          className={iconBtnClass}
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        </TooltipContent>
      </Tooltip>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 select-none">
        <div className="size-5 rounded bg-[#635BFF] flex items-center justify-center">
          <LayoutGrid className="size-3 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold text-[#0A2540] tracking-tight">
          DORA<span className="text-[#635BFF]">·</span>RoI
        </span>
      </Link>

      <div className="h-4 w-px bg-[#E3E8EF]" />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-[13px] text-muted-foreground min-w-0">
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="size-3 opacity-40 flex-shrink-0" />}
              {isLast ? (
                <span className="text-[#0A2540] font-medium truncate">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground transition-colors truncate">
                  {crumb.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {isExtractionPage && (
        <StatusBadge status={document.status} className="ml-1 flex-shrink-0" />
      )}

      <div className="flex-1" />

      {savedAt && isExtractionPage && (
        <span className="text-[11px] text-emerald-600 font-medium hidden sm:inline flex-shrink-0">
          Saved{" "}
          {new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}

      {/* Right icons */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            className={iconBtnClass}
            onClick={() =>
              toast.info("Help & documentation", {
                description: "DORA RoI Automator documentation available at docs.dora-roi.eu",
                action: { label: "Open docs", onClick: () => {} },
              })
            }
          >
            <HelpCircle className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom">Help</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={cn(iconBtnClass, "relative")}
            onClick={() =>
              toast("Notifications", {
                description:
                  "2 contracts require urgent review. 3 contracts expiring within 30 days.",
              })
            }
          >
            <Bell className="size-4" />
            <span className="absolute top-1 right-1 size-1.5 rounded-full bg-[#635BFF]" />
          </TooltipTrigger>
          <TooltipContent side="bottom">Notifications (3)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={iconBtnClass}
            onClick={() => toast.info("Settings", { description: "Settings panel coming soon." })}
          >
            <Settings className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom">Settings</TooltipContent>
        </Tooltip>

        {/* Avatar */}
        <UserAvatar />
      </div>
    </header>
  );
}

function UserAvatar() {
  const { data: session } = useSession();
  const name = session?.user?.name || session?.user?.email || "User";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Tooltip>
      <TooltipTrigger
        className="ml-1 size-7 rounded-full bg-gradient-to-br from-[#635BFF] to-[#4F46E5] flex items-center justify-center text-white text-[11px] font-bold select-none cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() =>
          signOut({ callbackUrl: "/login" })
        }
      >
        {initials}
      </TooltipTrigger>
      <TooltipContent side="bottom">{name} · Click to sign out</TooltipContent>
    </Tooltip>
  );
}
