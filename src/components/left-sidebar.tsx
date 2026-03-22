"use client";

import { cn } from "@/lib/utils";
import { useExtractionStore } from "@/store/extraction-store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  Clock,
  FileCheck2,
  FileClock,
  Files,
  GitBranch,
  Home,
  Shield,
  Zap,
} from "lucide-react";

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
      { icon: Home, label: "Dashboard", href: "/dashboard" },
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
    ],
  },
  {
    title: "Compliance",
    items: [
      {
        icon: Files,
        label: "Contracts",
        badge: 47,
        subItems: [
          { label: "All Contracts", href: "/contracts" },
          { label: "Vendors", href: "/contracts" },
          { label: "Third-Party ICT", href: "/contracts" },
        ],
      },
      { icon: FileCheck2, label: "Extractions", href: "/extraction", badge: 3 },
      { icon: FileClock, label: "In Review", href: "/review", badge: 7 },
      { icon: GitBranch, label: "Register", href: "/register" },
    ],
  },
  {
    title: "DORA Pillars",
    items: [
      { icon: Zap, label: "ICT Risk Mgmt", href: "/ict-risk" },
      { icon: AlertTriangle, label: "Incident Reporting", href: "/incidents", badge: 2 },
      { icon: Shield, label: "Resilience Testing", href: "/resilience" },
      { icon: Building2, label: "Third-Party Risk", href: "/third-party-risk" },
    ],
  },
  {
    title: "Resources",
    items: [
      { icon: BookOpen, label: "Regulatory Library", href: "/library" },
      { icon: Clock, label: "Audit Log", href: "/audit" },
    ],
  },
];

export function LeftSidebar() {
  const { isSidebarCollapsed } = useExtractionStore();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex-shrink-0 flex flex-col border-r border-[#E3E8EF] bg-white overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isSidebarCollapsed ? "w-0 opacity-0 pointer-events-none -translate-x-2" : "w-56 opacity-100 translate-x-0"
      )}
      aria-hidden={isSidebarCollapsed}
    >
      <div className="flex flex-col gap-0.5 p-2 pt-3 overflow-y-auto flex-1 min-w-56">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className={cn(si > 0 && "mt-3")}>
            {section.title && (
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
                {section.title}
              </p>
            )}
            {section.items.map((item) => (
              <NavEntry key={item.label} item={item} pathname={pathname} />
            ))}
          </div>
        ))}
      </div>

      {/* Bottom org section */}
      <div className="border-t border-[#E3E8EF] p-2">
        <button className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[#F6F9FC] transition-colors group">
          <div className="size-5 rounded bg-[#0A2540] flex items-center justify-center flex-shrink-0">
            <Building2 className="size-3 text-white" />
          </div>
          <span className="text-[12px] font-medium text-[#0A2540] truncate flex-1 text-left">
            Acme Bank plc
          </span>
          <ChevronDown className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </aside>
  );
}

function NavEntry({ item, pathname }: { item: NavItem; pathname: string }) {
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
          "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] nav-item group",
          isActive
            ? "bg-[#635BFF]/8 text-[#635BFF] font-medium"
            : "text-[#374151] hover:bg-[#F6F9FC] hover:text-[#0A2540]"
        )}
      >
        <Icon
          className={cn(
            "size-3.5 flex-shrink-0",
            isActive ? "text-[#635BFF]" : "text-muted-foreground group-hover:text-[#0A2540]"
          )}
        />
        <span className="flex-1 text-left truncate">{item.label}</span>
        {item.badge !== undefined && (
          <span
            className={cn(
              "text-[10px] font-semibold tabular-nums rounded-full px-1.5 py-0.5 leading-none",
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
          "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] nav-item group",
          isActive
            ? "bg-[#635BFF]/8 text-[#635BFF] font-medium"
            : "text-[#374151] hover:bg-[#F6F9FC] hover:text-[#0A2540]"
        )}
      >
        <Icon
          className={cn(
            "size-3.5 flex-shrink-0",
            isActive ? "text-[#635BFF]" : "text-muted-foreground group-hover:text-[#0A2540]"
          )}
        />
        <span className="flex-1 text-left truncate">{item.label}</span>
        {item.badge !== undefined && (
          <span className="text-[10px] font-semibold tabular-nums rounded-full bg-[#F6F9FC] border border-[#E3E8EF] px-1.5 py-0.5 leading-none text-muted-foreground">
            {item.badge}
          </span>
        )}
        <ChevronDown
          className={cn(
            "size-3 text-muted-foreground transition-transform duration-150",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {item.subItems && (
        <div className="collapse-section" data-open={isOpen}>
          <div>
            <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-[#E3E8EF] pl-2">
              {item.subItems.map((sub) => {
                const subActive = pathname === sub.href;
                return (
                  <Link
                    key={sub.label}
                    href={sub.href}
                    className={cn(
                      "w-full text-left px-2 py-1 text-[12px] rounded-md transition-all duration-150",
                      subActive
                        ? "text-[#635BFF] font-medium bg-[#635BFF]/5"
                        : "text-muted-foreground hover:text-[#0A2540] hover:bg-[#F6F9FC] hover:translate-x-0.5"
                    )}
                  >
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
