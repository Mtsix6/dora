"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useExtractionStore } from "@/store/extraction-store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/motion";
import {
  Settings,
  Search,
  Command as CmdIcon,
  PanelLeftOpen,
  PanelLeftClose,
  ChevronRight,
  HelpCircle,
  LayoutGrid,
  Bell,
  RefreshCw,
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
    { label: "Extraction", href: "/extraction" },
  ],
  "/register": [{ label: "Register", href: "/register" }],
  "/review": [{ label: "In Review", href: "/review" }],
  "/settings": [{ label: "Settings", href: "/settings" }],
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
  "/notifications": [{ label: "Notifications", href: "/notifications" }],
  "/reports": [{ label: "Reports & Exports", href: "/reports" }],
  "/integrations": [{ label: "Integrations", href: "/integrations" }],
  "/compliance": [{ label: "Compliance Overview", href: "/compliance" }],
  "/horizon": [{ label: "Horizon Scanning", href: "/horizon" }],
  "/manage": [
    { label: "Enterprise", href: "#" },
    { label: "Manage", href: "/manage" },
  ],
  "/workflows": [
    { label: "Enterprise", href: "#" },
    { label: "Workflows", href: "/workflows" },
  ],
};

const iconBtnClass =
  "h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-[#F6F9FC] icon-btn group";

/* ── Scroll-direction hook wired to the main scroll container ── */
function useNavbarVisibility() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Retry until #main-scroll exists (may not be in DOM on first paint)
    let el = document.getElementById("main-scroll");
    if (!el) {
      const timer = setTimeout(() => {
        el = document.getElementById("main-scroll");
        if (el) attach(el);
      }, 100);
      return () => clearTimeout(timer);
    }
    return attach(el);

    function attach(container: HTMLElement) {
      let lastY = container.scrollTop;
      let accumulated = 0; // downward px accumulated since last direction change

      const onScroll = () => {
        const y = container.scrollTop;
        const delta = y - lastY;
        lastY = y;

        if (delta < 0) {
          // Any upward movement → show immediately, reset counter
          accumulated = 0;
          setHidden(false);
        } else if (delta > 0) {
          // Accumulate downward distance; hide after 40px total past the top zone
          accumulated += delta;
          if (accumulated > 40 && y > 60) {
            setHidden(true);
          }
        }
      };

      container.addEventListener("scroll", onScroll, { passive: true });
      return () => container.removeEventListener("scroll", onScroll);
    }
  }, []);

  return hidden;
}

export function TopNavbar() {
  const { document, isSidebarCollapsed, toggleSidebar, savedAt } =
    useExtractionStore();
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = BREADCRUMB_MAP[pathname] ?? [];
  const isExtractionPage = pathname === "/extraction";
  const hidden = useNavbarVisibility();

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 h-12 z-50 border-b border-[#E3E8EF]/70 bg-white shadow-[0_1px_12px_rgba(10,37,64,0.07)] flex items-center px-4 gap-3"
      animate={{ y: hidden ? -48 : 0 }}
      transition={{ duration: 0.38, ease: EASE_OUT_EXPO }}
    >
      {/* Sidebar toggle */}
      <Tooltip>
        <TooltipTrigger
          className={cn(iconBtnClass, "icon-anim")}
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
      <Link href="/" className="flex items-center gap-2 select-none group">
        <motion.div
          className="size-5 rounded bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-sm shadow-indigo-600/10"
          whileHover={{ scale: 1.15, rotate: 8 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <LayoutGrid className="size-3 text-white" strokeWidth={2.5} />
        </motion.div>
        <span className="text-sm font-semibold text-[#1E293B] tracking-tight">
          DORA<span className="text-indigo-600">·</span>RoI
        </span>
      </Link>

      <div className="h-4 w-px bg-[#E3E8EF]" />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-[13px] text-muted-foreground min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
            className="flex items-center gap-1 min-w-0"
          >
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <span key={i} className="flex items-center gap-1 min-w-0">
                  {i > 0 && <ChevronRight className="size-3 opacity-40 flex-shrink-0" />}
                  {isLast ? (
                    <span className="text-[#0A2540] font-medium truncate">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-foreground transition-colors duration-150 truncate">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              );
            })}
          </motion.div>
        </AnimatePresence>
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
        {/* Multi-player Presence */}
        <div className="hidden md:flex items-center -space-x-2 mr-4 border-r border-[#E3E8EF] pr-4">
          {[
            { name: "Sarah", color: "bg-emerald-500", img: "SJ" },
            { name: "Marcus", color: "bg-blue-500", img: "ML" },
            { name: "Chen", color: "bg-amber-500", img: "WC" },
          ].map((u, i) => (
            <motion.div
              key={u.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.15, zIndex: 10, y: -3 }}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "size-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm cursor-pointer",
                u.color
              )}
              title={`${u.name} is online`}
            >
              {u.img}
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={() => window.dispatchEvent(new Event("open-cmd-k"))}
          className="hidden lg:flex items-center gap-2.5 h-8 px-3 rounded-lg bg-[#F6F9FC] border border-[#E3E8EF] text-muted-foreground hover:bg-white hover:border-[#635BFF]/30 hover:shadow-sm transition-all duration-200 group mr-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.span whileHover={{ scale: 1.2, rotate: -8 }} transition={{ type: "spring", stiffness: 400, damping: 12 }}>
            <Search className="size-3.5 group-hover:text-[#635BFF] transition-colors" />
          </motion.span>
          <span className="text-[12px] font-medium pr-8">Search...</span>
          <div className="flex items-center gap-1 font-mono text-[9px] bg-white border border-[#E3E8EF] px-1 py-0.5 rounded text-muted-foreground shadow-sm">
            <CmdIcon className="size-2.5" />
            <span>K</span>
          </div>
        </motion.button>

        <Tooltip>
          <TooltipTrigger
            className={cn(iconBtnClass, "icon-spin-hover")}
            onClick={() => window.open("https://platform.openai.com/docs", "_blank", "noopener,noreferrer")}
          >
            <HelpCircle className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="bottom">Help</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            onClick={() => router.push("/notifications")}
            className={cn(iconBtnClass, "icon-jiggle relative border-l border-[#E3E8EF] ml-1 pl-2")}
          >
            <Bell className="size-4" />
            <motion.span
              className="absolute top-1 right-1 size-1.5 rounded-full bg-indigo-600"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom">Notifications (3)</TooltipContent>
        </Tooltip>

        {/* Global DORA Status Indicator */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full ml-1 cursor-default"
          whileHover={{ scale: 1.04, backgroundColor: "rgb(209 250 229)" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <motion.div
            className="size-1.5 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[10px] font-bold text-emerald-700 tracking-tight uppercase">DORA Compliant</span>
        </motion.div>

        {/* Avatar */}
        <div className="ml-2 pl-3 border-l border-[#E3E8EF]">
          <UserAvatar />
        </div>
      </div>
    </motion.header>
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
        onClick={() => (window.location.href = "/settings")}
        className="ml-1 size-7 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white text-[11px] font-bold select-none cursor-pointer hover:scale-110 hover:shadow-[0_4px_16px_rgba(79,70,229,0.45)] active:scale-90 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        {initials}
      </TooltipTrigger>
      <TooltipContent side="bottom">{name} · Account settings</TooltipContent>
    </Tooltip>
  );
}
