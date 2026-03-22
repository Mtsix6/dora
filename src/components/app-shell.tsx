"use client";

import { TopNavbar } from "@/components/top-navbar";
import { LeftSidebar } from "@/components/left-sidebar";

interface AppShellProps {
  children: React.ReactNode;
  /** Pass true on the extraction page where the main canvas handles its own layout */
  noPad?: boolean;
}

export function AppShell({ children, noPad = false }: AppShellProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F6F9FC]">
      <TopNavbar />
      <div className="flex flex-1 min-h-0">
        <LeftSidebar />
        <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
