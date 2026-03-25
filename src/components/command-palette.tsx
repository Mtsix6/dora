"use client";

import * as React from "react";
import { Command } from "cmdk";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  ShieldAlert, 
  PieChart, 
  FileText, 
  Search, 
  Command as CmdIcon,
  Sparkles,
  Zap,
  BookOpen,
  Shield,
  Crown,
  Globe
} from "lucide-react";
import "./command-palette.css"; // We will create this

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    const customOpen = () => setOpen(true);
    
    document.addEventListener("keydown", down);
    window.addEventListener("open-cmd-k", customOpen);
    
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-cmd-k", customOpen);
    };
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <Command.Dialog 
      open={open} 
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="cmd-dialog"
    >
      <div className="cmd-overlay" aria-hidden="true" onClick={() => setOpen(false)} />
      
      <div className="cmd-content">
        <DialogTitle className="sr-only">Global Command Menu</DialogTitle>
        <div className="flex items-center px-4 pb-3 border-b border-[#E3E8EF]/50">
          <Search className="mr-3 h-5 w-5 text-muted-foreground" />
          <Command.Input 
            autoFocus
            placeholder="Search commands, policies, incidents..." 
            className="flex-1 h-12 bg-transparent outline-none placeholder:text-muted-foreground text-[15px] font-medium text-[#0A2540]"
          />
          <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground bg-[#F6F9FC] px-2 py-1 rounded-md border border-[#E3E8EF]">
            <CmdIcon className="size-3" />
            <span>K</span>
          </div>
        </div>

        <Command.List className="cmd-list custom-scrollbar">
          <Command.Empty className="py-12 text-center text-sm text-muted-foreground font-medium">
            No results found.
          </Command.Empty>

          <Command.Group heading="DORA AI Copilot" className="cmd-group">
             <Command.Item
                onSelect={() => runCommand(() => {})}
                className="cmd-item"
              >
                <div className="bg-gradient-to-tr from-[#635BFF] to-[#0A2540] p-1.5 rounded-md shadow-sm">
                   <Sparkles className="size-4 text-white" />
                </div>
                <span className="text-[#635BFF] font-semibold tracking-tight">Ask DORA Copilot about regulation...</span>
             </Command.Item>
          </Command.Group>

          <Command.Group heading="Dashboards" className="cmd-group">
            <Command.Item onSelect={() => runCommand(() => router.push("/dashboard"))} className="cmd-item">
              <div className="size-7 rounded-md bg-[#F6F9FC] flex flex-shrink-0 items-center justify-center border border-[#E3E8EF]">
                 <PieChart className="size-3.5 text-[#0A2540]" />
              </div>
              <span className="text-[#0A2540]">Overview Dashboard</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => router.push("/incidents"))} className="cmd-item">
              <div className="size-7 rounded-md bg-amber-50 flex flex-shrink-0 items-center justify-center border border-amber-100">
                 <ShieldAlert className="size-3.5 text-amber-600" />
              </div>
              <span className="text-[#0A2540]">Incident Reporting</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => router.push("/ict-risk"))} className="cmd-item">
              <div className="size-7 rounded-md bg-blue-50 flex flex-shrink-0 items-center justify-center border border-blue-100">
                 <Zap className="size-3.5 text-blue-600" />
              </div>
              <span className="text-[#0A2540]">ICT Risk</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => router.push("/third-party-risk"))} className="cmd-item">
              <div className="size-7 rounded-md bg-stone-50 flex flex-shrink-0 items-center justify-center border border-stone-200">
                 <Building2 className="size-3.5 text-stone-600" />
              </div>
              <span className="text-[#0A2540]">Third-Party Risk</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => router.push("/library"))} className="cmd-item">
              <div className="size-7 rounded-md bg-emerald-50 flex flex-shrink-0 items-center justify-center border border-emerald-100">
                 <BookOpen className="size-3.5 text-emerald-600" />
              </div>
              <span className="text-[#0A2540]">Policy Library</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => router.push("/resilience"))} className="cmd-item">
              <div className="size-7 rounded-md bg-purple-50 flex flex-shrink-0 items-center justify-center border border-purple-100">
                 <Shield className="size-3.5 text-purple-600" />
              </div>
              <span className="text-[#0A2540]">Resilience Testing</span>
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => router.push("/horizon"))} className="cmd-item">
              <div className="size-7 rounded-md bg-blue-50 flex flex-shrink-0 items-center justify-center border border-blue-100">
                 <Globe className="size-3.5 text-blue-600" />
              </div>
              <span className="text-[#0A2540]">Horizon Scanning</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Enterprise" className="cmd-group">
            <Command.Item onSelect={() => runCommand(() => router.push("/manage"))} className="cmd-item">
              <div className="size-7 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 flex flex-shrink-0 items-center justify-center shadow-sm">
                 <Crown className="size-3.5 text-white" />
              </div>
              <span className="text-[#0A2540] font-medium">Enterprise Management</span>
            </Command.Item>
          </Command.Group>

        </Command.List>
      </div>
    </Command.Dialog>
  );
}
