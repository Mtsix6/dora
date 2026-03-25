"use client";

import { TopNavbar } from "@/components/top-navbar";
import { LeftSidebar } from "@/components/left-sidebar";
import { PageTransition } from "@/lib/motion";
import { CommandPalette } from "@/components/command-palette";
import { DoraAICopilot } from "@/components/dora-ai-copilot";
import { LiveNotifications } from "@/components/live-notifications";
import { ScrollToTop } from "@/components/scroll-to-top";

interface AppShellProps {
  children: React.ReactNode;
  /** Pass true on the extraction page where the main canvas handles its own layout */
  noPad?: boolean;
}

export function AppShell({ children, noPad = false }: AppShellProps) {
  return (
    <div className="flex flex-col h-full bg-[#F6F9FC]">
      <LiveNotifications />
      <CommandPalette />
      <DoraAICopilot />
      <TopNavbar />
      {/* Spacer that reserves the h-12 slot the fixed navbar occupies */}
      <div className="h-12 flex-shrink-0" />
      {/* overflow-hidden only on the content row so window never scrolls */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <LeftSidebar />
        <main
          id="main-scroll"
          className="flex-1 min-w-0 overflow-y-auto"
        >
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <ScrollToTop />
    </div>
  );
}
