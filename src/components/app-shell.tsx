"use client";

import { TopNavbar } from "@/components/top-navbar";
import { LeftSidebar } from "@/components/left-sidebar";
import { PageTransition } from "@/lib/motion";
import { CommandPalette } from "@/components/command-palette";
import { DoraAICopilot } from "@/components/dora-ai-copilot";
import { LiveNotifications } from "@/components/live-notifications";

interface AppShellProps {
  children: React.ReactNode;
  /** Pass true on the extraction page where the main canvas handles its own layout */
  noPad?: boolean;
}

export function AppShell({ children, noPad = false }: AppShellProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-white relative">
      <div aria-hidden="true" className="perspective-grid-overlay" />
      <div className="relative z-10 flex flex-col h-full overflow-hidden">
        <LiveNotifications />
        <CommandPalette />
        <DoraAICopilot />
        <TopNavbar />
        <div className="flex flex-1 min-h-0">
          <LeftSidebar />
          <main className="flex-1 min-w-0 overflow-hidden relative">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}
