"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Globe,
  X,
} from "lucide-react";
import "./command-palette.css";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onCustom = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("open-cmd-k", onCustom);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("open-cmd-k", onCustom);
    };
  }, []);

  const run = React.useCallback((fn: () => unknown) => {
    setOpen(false);
    fn();
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────── */}
          <motion.div
            key="cmd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[998] bg-[#0A2540]/25 backdrop-blur-[6px]"
            onClick={() => setOpen(false)}
          />

          {/* ── Palette — top-center, VS Code / Spotlight style ── */}
          <motion.div
            key="cmd-panel"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[999] left-1/2 -translate-x-1/2"
            style={{ top: "clamp(56px, 8vh, 88px)" }}
          >
            <Command
              className="w-[min(680px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-white/60 shadow-[0_32px_80px_-8px_rgba(10,37,64,0.28),0_0_0_1px_rgba(10,37,64,0.06)]"
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(28px) saturate(180%)",
                WebkitBackdropFilter: "blur(28px) saturate(180%)",
              }}
              loop
            >
              {/* Search input row */}
              <div className="flex items-center gap-3 px-4 h-[56px] border-b border-[#E3E8EF]/60">
                <Search className="size-4 text-[#635BFF] flex-shrink-0" />
                <Command.Input
                  autoFocus
                  placeholder="Search commands, policies, incidents..."
                  className="flex-1 bg-transparent outline-none placeholder:text-slate-400 text-[15px] font-medium text-[#0A2540]"
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                    <CmdIcon className="size-2.5" />
                    <span>K</span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="size-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Results list */}
              <Command.List className="cmd-list max-h-[min(60vh,480px)] overflow-y-auto p-2">
                <Command.Empty className="py-10 text-center text-sm text-slate-400 font-medium">
                  No results found.
                </Command.Empty>

                <Command.Group heading="DORA AI Copilot" className="cmd-group">
                  <Command.Item onSelect={() => run(() => {})} className="cmd-item">
                    <div className="bg-gradient-to-tr from-[#635BFF] to-[#0A2540] p-1.5 rounded-md shadow-sm flex-shrink-0">
                      <Sparkles className="size-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[#635BFF] font-semibold tracking-tight text-[14px]">Ask DORA Copilot about regulation...</p>
                      <p className="text-[12px] text-slate-400 mt-0.5">AI-powered compliance guidance</p>
                    </div>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Navigation" className="cmd-group">
                  {[
                    { icon: PieChart, label: "Overview Dashboard", sub: "All DORA pillars at a glance", href: "/dashboard", color: "bg-[#F6F9FC] border-[#E3E8EF]", iconColor: "text-[#0A2540]" },
                    { icon: ShieldAlert, label: "Incident Reporting", sub: "Track and manage incidents", href: "/incidents", color: "bg-amber-50 border-amber-100", iconColor: "text-amber-600" },
                    { icon: Zap, label: "ICT Risk Management", sub: "Asset risk scoring", href: "/ict-risk", color: "bg-blue-50 border-blue-100", iconColor: "text-blue-600" },
                    { icon: Building2, label: "Third-Party Risk", sub: "Vendor & supplier oversight", href: "/third-party-risk", color: "bg-stone-50 border-stone-200", iconColor: "text-stone-600" },
                    { icon: BookOpen, label: "Policy Library", sub: "Regulatory documents", href: "/library", color: "bg-emerald-50 border-emerald-100", iconColor: "text-emerald-600" },
                    { icon: Shield, label: "Resilience Testing", sub: "TLPT and DR scenarios", href: "/resilience", color: "bg-purple-50 border-purple-100", iconColor: "text-purple-600" },
                    { icon: Globe, label: "Horizon Scanning", sub: "Upcoming regulatory changes", href: "/horizon", color: "bg-blue-50 border-blue-100", iconColor: "text-blue-600" },
                  ].map(({ icon: Icon, label, sub, href, color, iconColor }) => (
                    <Command.Item key={href} onSelect={() => run(() => router.push(href))} className="cmd-item">
                      <div className={`size-7 rounded-md flex flex-shrink-0 items-center justify-center border ${color}`}>
                        <Icon className={`size-3.5 ${iconColor}`} />
                      </div>
                      <div>
                        <p className="text-[#0A2540] text-[13px] font-medium">{label}</p>
                        <p className="text-[11px] text-slate-400">{sub}</p>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Enterprise" className="cmd-group">
                  <Command.Item onSelect={() => run(() => router.push("/manage"))} className="cmd-item">
                    <div className="size-7 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex flex-shrink-0 items-center justify-center shadow-sm">
                      <Crown className="size-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[#0A2540] text-[13px] font-medium">Enterprise Management</p>
                      <p className="text-[11px] text-slate-400">Teams, billing, and workspace</p>
                    </div>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              {/* Footer hint */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[#E3E8EF]/60 bg-slate-50/60">
                {[
                  { keys: ["↑", "↓"], label: "navigate" },
                  { keys: ["↵"], label: "open" },
                  { keys: ["Esc"], label: "close" },
                ].map(({ keys, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    {keys.map((k) => (
                      <kbd key={k} className="font-mono text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 shadow-sm">{k}</kbd>
                    ))}
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
