"use client";

import { cn } from "@/lib/utils";
import { useExtractionStore } from "@/store/extraction-store";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronUp,
  Clock,
  Crown,
  CreditCard,
  FileCheck2,
  FileClock,
  Files,
  GitBranch,
  Home,
  Settings,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/motion";

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  badge?: string | number;
  subItems?: NavSubItem[];
}

const NAV_SECTIONS: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { icon: Home,    label: "Dashboard", href: "/dashboard" },
      { icon: BarChart3, label: "Analytics",  href: "/analytics" },
    ],
  },
  {
    title: "Compliance",
    items: [
      {
        icon: Files,
        label: "Contracts",
        subItems: [
          { label: "All Contracts",   href: "/contracts" },
          { label: "Vendors",         href: "/contracts" },
          { label: "Third-Party ICT", href: "/contracts" },
        ],
      },
      { icon: FileCheck2, label: "Extractions", href: "/extraction" },
      { icon: FileClock,  label: "In Review",   href: "/review" },
      { icon: GitBranch,  label: "Register",    href: "/register" },
    ],
  },
  {
    title: "DORA Pillars",
    items: [
      { icon: Zap,           label: "ICT Risk Mgmt",      href: "/ict-risk" },
      { icon: AlertTriangle, label: "Incident Reporting", href: "/incidents" },
      { icon: Shield,        label: "Resilience Testing", href: "/resilience" },
      { icon: Building2,     label: "Third-Party Risk",   href: "/third-party-risk" },
    ],
  },
  {
    title: "Enterprise",
    items: [
      { icon: Crown, label: "Manage", href: "/manage" },
    ],
  },
  {
    title: "Resources",
    items: [
      { icon: BookOpen, label: "Regulatory Library", href: "/library" },
      { icon: Clock,    label: "Audit Log",          href: "/audit" },
    ],
  },
];

export function LeftSidebar() {
  const { isSidebarCollapsed } = useExtractionStore();
  const { data: session } = useSession();
  const pathname = usePathname();
  const workspaceName = session?.user?.workspaceName || "My Workspace";

  return (
    <motion.aside
      animate={{
        width: isSidebarCollapsed ? 0 : 224,
        opacity: isSidebarCollapsed ? 0 : 1,
        x: isSidebarCollapsed ? -8 : 0,
      }}
      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
      className="flex-shrink-0 flex flex-col border-r border-[#E3E8EF] bg-white overflow-hidden"
      aria-hidden={isSidebarCollapsed}
      style={{ pointerEvents: isSidebarCollapsed ? "none" : "auto" }}
    >
      <div className="flex flex-col gap-0.5 p-2 pt-3 overflow-y-auto flex-1 min-w-56">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className={cn(si > 0 && "mt-3")}>
            {section.title && (
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
                {section.title}
              </p>
            )}
            {section.items.map((item, ii) => (
              <NavEntry key={item.label} item={item} pathname={pathname} index={ii} />
            ))}
          </div>
        ))}
      </div>

      {/* Bottom org section with drop-up */}
      <WorkspaceDropUp workspaceName={workspaceName} />
    </motion.aside>
  );
}

function NavEntry({
  item,
  pathname,
  index,
}: {
  item: NavItem;
  pathname: string;
  index: number;
}) {
  const Icon = item.icon;
  const isActive = item.href
    ? pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
    : item.subItems?.some((s) => pathname === s.href);
  const [isOpen, setIsOpen] = useState(isActive && !!item.subItems);

  if (item.href && !item.subItems) {
    return (
      <Link
        href={item.href}
        className={cn(
          "relative w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] group",
          "transition-colors duration-[120ms] ease-out",
          isActive
            ? "text-[#635BFF] font-medium"
            : "text-[#374151] hover:text-[#0A2540]"
        )}
      >
        {/* Sliding active background */}
        {isActive && (
          <motion.span
            layoutId="nav-active-bg"
            className="absolute inset-0 rounded-md bg-[#635BFF]/8"
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
          />
        )}

        {/* Hover background (only when not active) */}
        {!isActive && (
          <span className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 bg-[#F6F9FC] transition-opacity duration-[120ms]" />
        )}

        <Icon
          className={cn(
            "relative size-3.5 flex-shrink-0 transition-colors duration-[120ms]",
            isActive ? "text-[#635BFF]" : "text-muted-foreground group-hover:text-[#0A2540]"
          )}
        />
        <span className="relative flex-1 text-left truncate">{item.label}</span>
        {item.badge !== undefined && (
          <span
            className={cn(
              "relative text-[10px] font-semibold tabular-nums rounded-full px-1.5 py-0.5 leading-none transition-colors duration-[120ms]",
              isActive
                ? "bg-[#635BFF]/15 text-[#635BFF]"
                : "bg-[#F6F9FC] border border-[#E3E8EF] text-muted-foreground"
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "relative w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] group",
          "transition-colors duration-[120ms] ease-out",
          isActive
            ? "text-[#635BFF] font-medium"
            : "text-[#374151] hover:text-[#0A2540]"
        )}
      >
        {isActive && (
          <motion.span
            layoutId="nav-active-bg"
            className="absolute inset-0 rounded-md bg-[#635BFF]/8"
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
          />
        )}
        {!isActive && (
          <span className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 bg-[#F6F9FC] transition-opacity duration-[120ms]" />
        )}

        <Icon
          className={cn(
            "relative size-3.5 flex-shrink-0 transition-colors duration-[120ms]",
            isActive ? "text-[#635BFF]" : "text-muted-foreground group-hover:text-[#0A2540]"
          )}
        />
        <span className="relative flex-1 text-left truncate">{item.label}</span>
        {item.badge !== undefined && (
          <span className="relative text-[10px] font-semibold tabular-nums rounded-full bg-[#F6F9FC] border border-[#E3E8EF] px-1.5 py-0.5 leading-none text-muted-foreground">
            {item.badge}
          </span>
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
          className="relative"
        >
          <ChevronDown className="size-3 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && item.subItems && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: EASE_OUT_EXPO }}
            style={{ overflow: "hidden" }}
          >
            <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-[#E3E8EF] pl-2 pb-1">
              {item.subItems.map((sub, i) => {
                const subActive = pathname === sub.href;
                return (
                  <motion.div
                    key={sub.label}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_EXPO, delay: i * 0.04 }}
                  >
                    <Link
                      href={sub.href}
                      className={cn(
                        "block w-full text-left px-2 py-1 text-[12px] rounded-md transition-all duration-[120ms]",
                        subActive
                          ? "text-[#635BFF] font-medium bg-[#635BFF]/5"
                          : "text-muted-foreground hover:text-[#0A2540] hover:bg-[#F6F9FC] hover:translate-x-0.5"
                      )}
                    >
                      {sub.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WorkspaceDropUp({ workspaceName }: { workspaceName: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const items = [
    { icon: Settings, label: "Workspace Settings", href: "/settings/workspace" },
    { icon: Users, label: "Team Members", href: "/settings/workspace" },
    { icon: CreditCard, label: "Billing & Plans", href: "/pricing" },
  ];

  return (
    <div ref={ref} className="relative border-t border-[#E3E8EF] p-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[#F6F9FC] transition-all duration-150 group active:scale-[0.98]"
      >
        <div className="size-5 rounded bg-[#0A2540] flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
          <Building2 className="size-3 text-white" />
        </div>
        <span className="text-[12px] font-medium text-[#0A2540] truncate flex-1 text-left">
          {workspaceName}
        </span>
        <ChevronUp className={cn(
          "size-3 text-muted-foreground transition-all duration-200",
          open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
            className="absolute bottom-full left-2 right-2 mb-2 rounded-xl border border-[#E3E8EF] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.1)] overflow-hidden z-50"
          >
            {/* Workspace header */}
            <div className="px-3.5 py-2.5 border-b border-[#E3E8EF]">
              <p className="text-[12px] font-semibold text-[#0A2540] truncate">{workspaceName}</p>
              <p className="text-[10px] text-muted-foreground">Manage your workspace</p>
            </div>

            <div className="py-1">
              {items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[12px] text-[#374151] hover:bg-[#F6F9FC] hover:text-[#0A2540] transition-colors duration-150"
                >
                  <item.icon className="size-3.5 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
