"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileText,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  Lock,
  LogOut,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  User,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DORA_PILLARS } from "@/lib/dora";
import { cn } from "@/lib/utils";
import { EASE_OUT_EXPO } from "@/lib/motion";

/* ── Animation Variants ────────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.1 },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};

/* ── Section Wrapper with InView Trigger ───────────────────────────── */

function AnimatedSection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
    >
      {children}
    </motion.section>
  );
}

/* ── Infinite Scroll Logo Bar ──────────────────────────────────────── */

const LOGOS = [
  "Deutsche Bank", "BNP Paribas", "ING Group", "Santander", "Crédit Agricole",
  "UniCredit", "Barclays", "Société Générale", "KBC Group", "Rabobank",
  "Nordea", "Commerzbank", "ABN AMRO", "Danske Bank", "Intesa Sanpaolo",
];

function InfiniteLogoScroll() {
  return (
    <div className="relative overflow-hidden py-6">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F6F9FC] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F6F9FC] to-transparent z-10" />

      <div className="flex animate-scroll">
        {[...LOGOS, ...LOGOS].map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="flex-shrink-0 mx-8 flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity duration-300"
          >
            <div className="size-6 rounded bg-[#0A2540]/8 flex items-center justify-center">
              <Globe className="size-3 text-[#0A2540]/50" />
            </div>
            <span className="text-[13px] font-semibold text-[#0A2540]/60 whitespace-nowrap tracking-tight">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stats Counter ─────────────────────────────────────────────────── */

const STATS = [
  { value: "98%", label: "Extraction accuracy", icon: TrendingUp },
  { value: "<3min", label: "Per contract", icon: Zap },
  { value: "5x", label: "Faster than manual", icon: BarChart3 },
  { value: "100%", label: "Audit trail coverage", icon: ShieldCheck },
];

/* ── Main Landing Page ─────────────────────────────────────────────── */

export default function LandingPage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  return (
    <div className="min-h-full bg-white overflow-x-hidden">
      {/* ── Navbar ───────────────────────────────────────────────── */}
      <motion.nav
        className="sticky top-0 z-50 px-4 pt-5 md:px-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 rounded-[22px] border border-white/80 bg-white/92 px-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2 select-none group">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B5BD6] to-[#7E7BFF] shadow-[0_12px_24px_rgba(91,91,214,0.28)] transition-transform duration-200 group-hover:scale-110">
              <LayoutGrid className="size-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-black text-[#111827] tracking-tight">
              DORA<span className="text-indigo-600">·</span>RoI
            </span>
          </Link>

          <div className="ml-4 hidden items-center gap-1 lg:flex">
            {[
              { label: "Solutions", href: "#features" },
              { label: "Features", href: "#how-it-works" },
              { label: "Company", href: "#pillars" },
              { label: "Pricing", href: "/pricing" },
              { label: "Help Center", href: "#faq" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-3 py-2 text-[13px] text-[#4B5565] transition-colors duration-200 hover:bg-[#F5F7FB] hover:text-[#111827]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <ProfileDropdown session={session} />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="h-10 rounded-xl border-[#D6DCE8] bg-white px-4 text-[13px] font-semibold text-[#111827]">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="h-10 rounded-xl bg-[#111111] px-4 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-black"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#eef0ff_0%,#ffffff_45%,#ffffff_100%)]">
        {/* Advanced Background: Subtle Light Glows */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,91,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(99,91,255,0.08)_1px,transparent_1px)] bg-[size:56px_56px] opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-white z-0" />
          <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               opacity: [0.3, 0.5, 0.3],
               x: [0, 50, 0],
               y: [0, -30, 0]
             }}
             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
             className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-100/40 to-transparent blur-[120px]" 
          />
          <motion.div 
             animate={{ 
               scale: [1, 1.3, 1],
               opacity: [0.2, 0.4, 0.2],
               x: [0, -40, 0],
               y: [0, 60, 0]
             }}
             transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
             className="absolute -bottom-[10%] -right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-50/30 to-transparent blur-[100px]" 
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100 mix-blend-overlay" />
        </div>

        <motion.section
          className="relative z-10 mx-auto max-w-6xl px-6 pb-8 pt-12 text-center"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          >
            <Badge
              variant="outline"
              className="mb-8 rounded-full border-[#E5E7F1] bg-white px-4 py-2 text-[12px] font-semibold text-[#364152] shadow-sm hover:bg-white"
            >
              <Sparkles className="mr-2 size-3.5 text-indigo-500" />
              AI-native DORA workflow orchestration just launched
            </Badge>
          </motion.div>

          <motion.h1
            className="mx-auto mb-8 max-w-5xl text-[54px] font-black leading-[0.96] tracking-[-0.06em] text-slate-900 md:text-[92px]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.1 }}
          >
            Turn DORA Compliance
            <br />
            Into Operational Clarity
          </motion.h1>

          <motion.p
            className="mx-auto mb-12 max-w-3xl text-[18px] font-medium leading-8 text-slate-500 md:text-[20px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT_EXPO }}
          >
            A premium enterprise platform that transforms contracts, third-party risk, incidents, resilience monitoring,
            and audit-ready registers into one clear AI-powered DORA workflow.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: EASE_OUT_EXPO }}
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <Button className="h-12 w-full rounded-xl bg-[#5B5BD6] px-7 text-[14px] font-semibold text-white shadow-[0_16px_36px_rgba(91,91,214,0.28)] hover:bg-[#4C4CCA]">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="h-12 w-full rounded-xl border-slate-200 bg-white px-7 text-[14px] font-semibold text-slate-800 shadow-sm"
              >
                Open Platform
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            className="mt-12 flex items-center justify-center gap-8 opacity-60 hover:opacity-100 transition-all duration-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.8 }}
          >
             <div className="text-slate-400 text-xs font-bold tracking-widest uppercase">Trusted By</div>
             <div className="h-px w-12 bg-slate-200" />
             <div className="flex gap-6 text-[11px] font-black text-slate-800 tracking-tighter italic">
                <span>GOLDMAN SACHS</span>
                <span>BARCLAYS</span>
                <span>HSBC</span>
             </div>
          </motion.div>
        </motion.section>

        {/* Floating AI Orb Visual */}
        <div className="absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10">
           <div className="size-full rounded-full border border-white/5 animate-[pulse_8s_infinite]" />
           <div className="absolute inset-20 rounded-full border border-white/10 animate-[pulse_6s_infinite_reverse]" />
           <div className="absolute inset-40 rounded-full border border-white/20 animate-[pulse_4s_infinite]" />
        </div>
      </div>

        {/* ── Product Preview (Mock Screenshot) ──────────────────── */}
        <motion.div
          className="relative mx-auto -mt-2 max-w-6xl px-6 pb-20"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_35px_80px_rgba(15,23,42,0.14)]">
            {/* Fake browser chrome */}
            <div className="flex h-12 items-center gap-2 border-b border-[#E8ECF4] bg-[#FAFBFE] px-4">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-[#E3E8EF]" />
                <div className="size-3 rounded-full bg-[#E3E8EF]" />
                <div className="size-3 rounded-full bg-[#E3E8EF]" />
              </div>
              <div className="flex-1 mx-4">
                <div className="mx-auto flex h-7 max-w-md items-center rounded-full border border-[#E5E7EF] bg-white px-3">
                  <Lock className="size-3 text-emerald-500 mr-1.5" />
                  <span className="text-[11px] text-muted-foreground">app.doraroi.com/dashboard</span>
                </div>
              </div>
            </div>

            {/* Mock app content */}
            <div className="flex h-[340px] md:h-[520px]">
              {/* Sidebar mock */}
              <div className="hidden w-56 border-r border-[#E8ECF4] bg-[#FCFCFF] p-4 md:block">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-[#5B5BD6] text-white">
                    <LayoutGrid className="size-4" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#111827]">FinCorp EU</p>
                    <p className="text-[11px] text-[#8A94A6]">Enterprise workspace</p>
                  </div>
                </div>
                {["ROI Dashboard", "Contracts", "Regulatory Feed", "Audit Timeline", "Third-Party Risk"].map((item, i) => (
                  <div
                    key={item}
                    className={cn(
                      "mb-1 flex h-10 items-center rounded-xl px-3 text-[12px] font-medium",
                      i === 0 ? "bg-[#EEF1FF] text-[#5B5BD6]" : "text-[#556070]"
                    )}
                  >
                    <div className={cn("mr-3 size-2.5 rounded-sm", i === 0 ? "bg-[#5B5BD6]" : "bg-[#D8DEEA]")} />
                    <span>{item}</span>
                  </div>
                ))}
                <div className="mt-8 rounded-2xl bg-[linear-gradient(180deg,#5B5BD6_0%,#4B45C7_100%)] p-4 text-white">
                  <p className="text-[12px] font-bold">AI Copilot</p>
                  <p className="mt-1 text-[11px] leading-5 text-white/80">Ask about controls, risks, and audit posture.</p>
                </div>
              </div>

              {/* PDF Viewer mock */}
              <div className="flex-1 bg-[#F8FAFF] p-5 md:p-6">
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[22px] border border-[#E5E9F4] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[22px] font-bold text-[#111827]">DORA Compliance ROI Dashboard</p>
                        <p className="mt-1 text-[13px] text-[#7C879A]">Executive view across contracts, controls, and incidents</p>
                      </div>
                      <Badge className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50">Live</Badge>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        { label: "Compliance", value: "87%", tone: "bg-emerald-50 text-emerald-600" },
                        { label: "Contracts", value: "242", tone: "bg-[#EEF1FF] text-[#5B5BD6]" },
                        { label: "Open Risks", value: "23", tone: "bg-amber-50 text-amber-600" },
                      ].map((card) => (
                        <div key={card.label} className="rounded-2xl border border-[#E8ECF4] bg-[#FBFCFF] p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-[12px] font-semibold text-[#7C879A]">{card.label}</p>
                            <div className={cn("rounded-xl px-2 py-1 text-[10px] font-bold", card.tone)}>Live</div>
                          </div>
                          <p className="mt-4 text-[28px] font-black tracking-[-0.05em] text-[#111827]">{card.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 rounded-[20px] bg-[linear-gradient(180deg,#F7F8FF_0%,#FFFFFF_100%)] p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-semibold text-[#182033]">Regulatory Coverage Radar</p>
                        <p className="text-[12px] text-[#5B5BD6]">Q4 2024</p>
                      </div>
                      <div className="mt-4 flex items-center justify-center">
                        <div className="relative h-48 w-48 rounded-full border border-dashed border-[#C8D1E7]">
                          <div className="absolute inset-6 rounded-full border border-dashed border-[#D7DEEF]" />
                          <div className="absolute inset-12 rounded-full border border-dashed border-[#E5EAF5]" />
                          <div className="absolute left-1/2 top-3 h-[calc(100%-24px)] w-px -translate-x-1/2 bg-[#E4EAF4]" />
                          <div className="absolute left-3 top-1/2 h-px w-[calc(100%-24px)] -translate-y-1/2 bg-[#E4EAF4]" />
                          <div className="absolute inset-[22%] rounded-[34%] bg-[#5B5BD6]/14 outline outline-2 outline-[#5B5BD6]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[22px] border border-[#E5E9F4] bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-[15px] font-bold text-[#182033]">AI Regulatory Feed</p>
                        <Badge className="rounded-full bg-[#EEF1FF] px-2.5 py-1 text-[10px] font-semibold text-[#5B5BD6] hover:bg-[#EEF1FF]">AI Powered</Badge>
                      </div>
                      <div className="mt-4 space-y-3">
                        {[
                          "New third-party contract obligations detected under Art. 28.",
                          "Incident reporting workflow needs two missing control attestations.",
                          "Audit-ready register updated after latest contract approval.",
                        ].map((item, index) => (
                          <div key={item} className="rounded-2xl border border-[#E8ECF4] bg-[#FBFCFF] p-4">
                            <div className="flex items-center gap-2">
                              <div className={cn("size-8 rounded-xl", index === 0 ? "bg-rose-50" : index === 1 ? "bg-amber-50" : "bg-[#EEF1FF]")} />
                              <p className="text-[13px] font-semibold text-[#182033]">Priority update</p>
                            </div>
                            <p className="mt-3 text-[13px] leading-6 text-[#617086]">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-[#E5E9F4] bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-[#EEF1FF]">
                          <Bot className="size-4 text-[#5B5BD6]" />
                        </div>
                        <p className="text-[15px] font-bold text-[#182033]">AI Extraction Review</p>
                      </div>
                      {[
                        { label: "Entity Name", value: "Amazon Web Services EMEA", conf: "98%", color: "text-emerald-600" },
                        { label: "LEI Code", value: "635400KDMFMR...", conf: "72%", color: "text-amber-600" },
                        { label: "Critical Function", value: "Cloud Storage", conf: "85%", color: "text-emerald-600" },
                      ].map((f) => (
                        <div key={f.label} className="mb-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-[#0A2540]">{f.label}</span>
                            <span className={cn("text-[9px] font-bold", f.color)}>{f.conf}</span>
                          </div>
                          <div className="rounded-xl border border-[#E5E9F4] bg-[#F8FAFF] px-3 py-2 text-[12px] text-[#556070]">
                            {f.value}
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 flex gap-2">
                        <div className="flex-1 rounded-xl bg-emerald-600 py-2 text-center text-[12px] font-semibold text-white">Approve</div>
                        <div className="flex-1 rounded-xl border border-[#D6DCE8] bg-white py-2 text-center text-[12px] font-semibold text-[#111827]">Review</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating glow behind the screenshot */}
          <div className="absolute inset-0 -z-10 blur-[100px] opacity-50">
            <div className="absolute inset-x-20 bottom-0 h-1/2 rounded-full bg-gradient-to-t from-indigo-100 to-transparent" />
          </div>
        </motion.div>

      {/* ── Infinite Logo Scroll ─────────────────────────────────── */}
      <div className="border-y border-[#E3E8EF] bg-[#F6F9FC]">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <p className="text-[10px] text-center text-muted-foreground/60 uppercase tracking-widest font-semibold mb-3">
            Built for EU-regulated financial institutions
          </p>
        </div>
        <InfiniteLogoScroll />
      </div>

      {/* ── Stats Bar ────────────────────────────────────────────── */}
      <AnimatedSection className="max-w-5xl mx-auto px-6 py-16 scroll-mt-16">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          variants={fadeUp}
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="text-center"
                variants={fadeUp}
                custom={i}
              >
                <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3 shadow-sm shadow-indigo-600/5 transition-transform hover:scale-110 duration-300">
                  <Icon className="size-5 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-[#1E293B] tracking-tight">{stat.value}</div>
                <div className="text-[12px] text-muted-foreground mt-1 font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatedSection>

      {/* ── Features Grid ────────────────────────────────────────── */}
      <AnimatedSection id="features" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-16">
        <motion.div className="text-center mb-14" variants={fadeUp}>
          <Badge
            variant="outline"
            className="mb-4 border-indigo-100 text-indigo-600 bg-indigo-50/50 backdrop-blur-sm font-semibold text-[11px] px-3 py-1 rounded-full"
          >
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] tracking-tight">
            Everything you need for DORA Art. 28
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-[15px]">
            From raw PDF contracts to a fully populated ICT third-party register — automated.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                className="rounded-xl border border-[#E3E8EF] bg-white p-6 group transition-all duration-300 hover:border-[#635BFF]/30 hover:shadow-lg hover:shadow-[#635BFF]/[0.04] hover:-translate-y-1"
                variants={fadeUp}
                custom={i}
              >
                <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-300">
                  <Icon className="size-5 text-indigo-600" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#1E293B] mb-2">{f.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </AnimatedSection>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <AnimatedSection id="how-it-works" className="bg-[#F6F9FC] py-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div className="text-center mb-14" variants={fadeUp}>
            <Badge
              variant="outline"
              className="mb-4 border-[#635BFF]/20 text-[#635BFF] bg-[#635BFF]/5 font-semibold text-[11px] px-3 py-1 rounded-full"
            >
              How it works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] tracking-tight">
              From PDF to register in 3 steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="relative"
                  variants={fadeUp}
                  custom={i}
                >
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-[calc(50%+32px)] right-0 -mr-4">
                      <div className="h-px bg-gradient-to-r from-[#635BFF]/30 to-transparent" />
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-5">
                      <div className="size-12 rounded-2xl bg-[#635BFF] flex items-center justify-center text-white shadow-lg shadow-[#635BFF]/20">
                        <Icon className="size-5" />
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-white border-2 border-[#635BFF] flex items-center justify-center">
                        <span className="text-[9px] font-bold text-[#635BFF]">{i + 1}</span>
                      </div>
                    </div>
                    <h3 className="text-[15px] font-semibold text-[#0A2540] mb-2">{step.title}</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* ── DORA Pillars ─────────────────────────────────────────── */}
      <AnimatedSection id="pillars" className="bg-[#0A2540] py-20 scroll-mt-16 relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#635BFF]/[0.06] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#635BFF]/[0.04] blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <motion.div className="text-center mb-14" variants={fadeUp}>
            <Badge className="mb-4 bg-[#635BFF]/20 text-[#635BFF] border border-[#635BFF]/30 font-semibold text-[11px] px-3 py-1 rounded-full">
              DORA Framework
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Full pillar coverage
            </h2>
            <p className="mt-3 text-[#8899aa] max-w-xl mx-auto text-[15px]">
              Every workflow maps to the five pillars of the Digital Operational Resilience Act.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-4">
            {DORA_PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.id}
                className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5 hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 group"
                variants={fadeUp}
                custom={i}
              >
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">
                  {pillar.article}
                </div>
                <h3 className="text-[13px] font-semibold text-white mb-2 leading-snug group-hover:text-indigo-400 transition-colors duration-300">
                  {pillar.title}
                </h3>
                <p className="text-[11px] text-[#8899aa] leading-relaxed">
                  {pillar.description}
                </p>
                {i === 3 && (
                  <Badge className="mt-3 text-[10px] bg-indigo-500/20 text-indigo-400 border-indigo-500/30 border">
                    Core module
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── Social Proof / Testimonial ───────────────────────────── */}
      <AnimatedSection className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          className="rounded-2xl border border-[#E3E8EF] bg-gradient-to-br from-white to-[#F6F9FC] p-8 md:p-12 relative overflow-hidden"
          variants={scaleIn}
        >
          <div className="absolute -top-20 -right-20 size-40 rounded-full bg-[#635BFF]/[0.05] blur-[60px]" />

          <div className="flex flex-col md:flex-row gap-8 items-center relative">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="size-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-[16px] md:text-[18px] text-[#0A2540] font-medium leading-relaxed mb-4">
                &ldquo;We processed 200+ vendor contracts through DORA RoI in our first week.
                The AI extraction cut our Article 28 register preparation from estimated 3 months
                to 2 weeks.&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-[#0A2540] flex items-center justify-center text-white text-[12px] font-bold">
                  MK
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#0A2540]">Maria Kessler</div>
                  <div className="text-[12px] text-muted-foreground">Head of ICT Compliance, Tier-2 EU Bank</div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 hidden md:flex flex-col gap-4">
              {[
                { label: "Contracts processed", value: "243" },
                { label: "Time saved", value: "10 weeks" },
                { label: "Avg. confidence", value: "94%" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-[#E3E8EF] bg-white p-4 min-w-[160px]">
                  <div className="text-[22px] font-bold text-[#0A2540] tabular-nums">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatedSection>

      {/* ── Security & Compliance ────────────────────────────────── */}
      <AnimatedSection className="border-y border-[#E3E8EF] bg-[#F6F9FC] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div className="text-center mb-10" variants={fadeUp}>
            <h2 className="text-2xl font-bold text-[#0A2540] tracking-tight">
              Enterprise-grade security
            </h2>
            <p className="text-muted-foreground mt-2 text-[14px]">
              Bank-grade encryption, EU data residency, and full regulatory audit trail.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, label: "SOC 2 Type II", desc: "Audited controls" },
              { icon: Lock, label: "AES-256", desc: "Encryption at rest" },
              { icon: Globe, label: "EU Residency", desc: "Frankfurt data centers" },
              { icon: Users, label: "SSO / SAML", desc: "Enterprise auth" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  className="rounded-xl border border-[#E3E8EF] bg-white p-5 text-center hover:border-[#635BFF]/20 transition-all duration-300 hover:-translate-y-0.5"
                  variants={fadeUp}
                  custom={i}
                >
                  <div className="size-10 rounded-xl bg-[#635BFF]/8 flex items-center justify-center mx-auto mb-3">
                    <Icon className="size-5 text-[#635BFF]" />
                  </div>
                  <div className="text-[13px] font-semibold text-[#0A2540]">{item.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <AnimatedSection className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#635BFF]/[0.04] blur-[100px]" />
        </div>

        <motion.div className="max-w-2xl mx-auto px-6 text-center relative" variants={scaleIn}>
          <div className="size-14 rounded-2xl bg-[#635BFF]/10 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="size-7 text-[#635BFF]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2540] tracking-tight mb-4">
            Ready to automate your DORA compliance?
          </h2>
          <p className="text-muted-foreground mb-8 text-[15px]">
            Start automating your Article 28 register today.
            No implementation project required — go live in under an hour.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button className="h-12 px-8 bg-[#635BFF] hover:bg-[#4F46E5] text-white font-semibold text-[14px] transition-all duration-300 hover:shadow-xl hover:shadow-[#635BFF]/25 hover:-translate-y-0.5">
                Start free trial
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-12 px-8 border-[#E3E8EF] font-semibold text-[14px] transition-all duration-300 hover:border-[#635BFF]/30"
            >
              Book a demo
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </AnimatedSection>

      {/* ── Trusted By Section ──────────────────────────────────── */}
      <AnimatedSection className="py-20 border-y border-[#E3E8EF] bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.p
            className="text-center text-[12px] uppercase tracking-[0.2em] text-muted-foreground/50 font-semibold mb-10"
            variants={fadeUp}
          >
            Trusted by leading financial institutions
          </motion.p>
          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6"
            variants={fadeUp}
            custom={1}
          >
            {["Deutsche Bank", "ING Group", "BNP Paribas", "Societe Generale", "ABN AMRO", "KBC Group"].map((name, i) => (
              <motion.span
                key={name}
                className="text-[16px] md:text-[18px] font-semibold text-[#0A2540]/20 tracking-tight select-none hover:text-[#0A2540]/40 transition-colors duration-300"
                variants={fadeIn}
                custom={i}
              >
                {name}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ── How It Works (Detailed) ────────────────────────────── */}
      <AnimatedSection className="py-24 bg-[#F6F9FC]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div className="text-center mb-16" variants={fadeUp}>
            <Badge
              variant="outline"
              className="mb-4 border-[#635BFF]/20 text-[#635BFF] bg-[#635BFF]/5 font-semibold text-[11px] px-3 py-1 rounded-full"
            >
              Simple process
            </Badge>
            <h2 className="text-4xl font-bold text-[#0A2540] tracking-tight">
              Three steps to full compliance
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-[15px]">
              Our streamlined workflow takes you from raw contracts to audit-ready registers.
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Dotted connector line */}
            <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0 border-t-2 border-dashed border-[#635BFF]/20 z-0" />

            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              {[
                {
                  step: 1,
                  title: "Upload Contracts",
                  description: "Drop your ICT service agreements. Our AI reads every clause.",
                  icon: Upload,
                },
                {
                  step: 2,
                  title: "AI Extracts & Validates",
                  description: "DORA Art. 30 requirements are automatically verified with confidence scoring.",
                  icon: Bot,
                },
                {
                  step: 3,
                  title: "Stay Compliant",
                  description: "Real-time monitoring, alerts, and reports keep you audit-ready.",
                  icon: ShieldCheck,
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    className="flex flex-col items-center text-center"
                    variants={fadeUp}
                    custom={i}
                  >
                    <div className="relative mb-6">
                      <div className="size-[104px] rounded-2xl bg-white border border-[#E3E8EF] shadow-lg shadow-[#0A2540]/[0.04] flex items-center justify-center">
                        <Icon className="size-8 text-[#635BFF]" />
                      </div>
                      <div className="absolute -top-3 -left-3 size-8 rounded-full bg-[#635BFF] text-white text-[13px] font-bold flex items-center justify-center shadow-md shadow-[#635BFF]/30">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-[17px] font-bold text-[#0A2540] mb-2">{item.title}</h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed max-w-[280px]">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── DORA Pillars (Detailed Cards) ──────────────────────── */}
      <AnimatedSection className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div className="text-center mb-16" variants={fadeUp}>
            <Badge
              variant="outline"
              className="mb-4 border-[#635BFF]/20 text-[#635BFF] bg-[#635BFF]/5 font-semibold text-[11px] px-3 py-1 rounded-full"
            >
              Regulation coverage
            </Badge>
            <h2 className="text-4xl font-bold text-[#0A2540] tracking-tight">
              The five pillars of DORA
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-[15px]">
              Complete coverage across every pillar of the Digital Operational Resilience Act.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-5">
            {[
              {
                icon: Shield,
                title: "ICT Risk Management",
                article: "Articles 5-16",
                description: "Establish and maintain a comprehensive ICT risk management framework with continuous monitoring.",
              },
              {
                icon: FileText,
                title: "Incident Reporting",
                article: "Articles 17-23",
                description: "Classify, report, and track major ICT-related incidents to competent authorities within regulatory timelines.",
              },
              {
                icon: CheckCircle2,
                title: "Resilience Testing",
                article: "Articles 24-27",
                description: "Conduct regular digital operational resilience testing including threat-led penetration testing (TLPT).",
              },
              {
                icon: Users,
                title: "Third-Party Risk",
                article: "Articles 28-44",
                description: "Manage and monitor ICT third-party service provider risks with contractual arrangement registers.",
              },
              {
                icon: Globe,
                title: "Information Sharing",
                article: "Article 45",
                description: "Share cyber threat intelligence and vulnerability information across trusted financial entity networks.",
              },
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  className="rounded-xl border border-[#E3E8EF] bg-white p-6 group transition-all duration-300 hover:border-[#635BFF]/30 hover:shadow-xl hover:shadow-[#635BFF]/[0.06] hover:-translate-y-1.5"
                  variants={fadeUp}
                  custom={i}
                >
                  <div className="size-11 rounded-xl bg-[#635BFF]/8 flex items-center justify-center mb-4 group-hover:bg-[#635BFF]/15 group-hover:scale-110 transition-all duration-300">
                    <Icon className="size-5 text-[#635BFF]" />
                  </div>
                  <div className="text-[10px] font-bold text-[#635BFF] uppercase tracking-widest mb-2">
                    {pillar.article}
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#0A2540] mb-2 group-hover:text-[#635BFF] transition-colors duration-300">
                    {pillar.title}
                  </h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* ── Stats Section (Enterprise Metrics) ─────────────────── */}
      <AnimatedSection className="py-20 border-y border-[#E3E8EF] bg-[#F6F9FC]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={fadeUp}
          >
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "50K+", label: "Contracts Analyzed" },
              { value: "200+", label: "Financial Entities" },
              { value: "SOC2", label: "Type II Certified" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                variants={fadeUp}
                custom={i}
              >
                <div className="text-4xl md:text-5xl font-bold text-[#0A2540] tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-[13px] text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ── CTA Section (Dark) ─────────────────────────────────── */}
      <AnimatedSection className="py-24 bg-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#635BFF]/[0.08] blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#635BFF]/[0.05] blur-[100px]" />
        </div>

        <motion.div className="max-w-2xl mx-auto px-6 text-center relative" variants={scaleIn}>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to automate DORA compliance?
          </h2>
          <p className="text-[#8899aa] mb-10 text-[16px] leading-relaxed">
            Start your 14-day free trial. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button className="h-12 px-8 bg-[#635BFF] hover:bg-[#4F46E5] text-white font-semibold text-[14px] transition-all duration-300 hover:shadow-xl hover:shadow-[#635BFF]/30 hover:-translate-y-0.5">
                Start Free Trial
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-12 px-8 border-white/20 text-white font-semibold text-[14px] bg-transparent hover:bg-white/10 hover:border-white/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              Book a Demo
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      </AnimatedSection>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-[#E3E8EF] bg-white py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3 select-none">
                <div className="size-6 rounded-md bg-[#635BFF] flex items-center justify-center">
                  <LayoutGrid className="size-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold text-[#0A2540] tracking-tight">
                  DORA<span className="text-[#635BFF]">·</span>RoI
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                AI-powered DORA compliance automation for EU financial entities.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "Changelog"],
              },
              {
                title: "Compliance",
                links: ["DORA Overview", "Art. 28 Guide", "Pillar Coverage", "Regulatory Library"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[12px] font-semibold text-[#0A2540] uppercase tracking-wider mb-3">
                  {col.title}
                </h4>
                <div className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <button
                      key={link}
                      className="text-[12px] text-muted-foreground hover:text-[#0A2540] transition-colors duration-200 text-left"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E3E8EF] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-muted-foreground">
              © 2026 DORA RoI Ltd · All rights reserved · EU Regulation 2022/2554
            </p>
            <div className="flex gap-4">
              {["Privacy", "Terms", "Security", "Status"].map((item) => (
                <button key={item} className="text-[12px] text-muted-foreground hover:text-[#0A2540] transition-colors duration-200">
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Constants ───────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Bot,
    title: "AI-Powered Extraction",
    description: "Our AI engine reads your vendor contracts and extracts all DORA-required fields with per-field confidence scoring.",
  },
  {
    icon: FileCheck2,
    title: "Split-View Review",
    description: "Side-by-side PDF viewer and editable form let your compliance team validate AI extractions in seconds.",
  },
  {
    icon: Shield,
    title: "Third-Party Register",
    description: "Auto-populates your Art. 28 ICT third-party register with every approved contract, ready for supervisory reporting.",
  },
  {
    icon: Zap,
    title: "LEI Validation",
    description: "Real-time validation of Legal Entity Identifiers against the GLEIF database to ensure data quality.",
  },
  {
    icon: ShieldCheck,
    title: "Audit Trail",
    description: "Every edit, approval and rejection is timestamped and logged for regulatory audit purposes.",
  },
  {
    icon: Sparkles,
    title: "Expiry Alerts",
    description: "Proactive alerts for contracts approaching expiry, renewal deadlines and DORA re-assessment windows.",
  },
];

const STEPS = [
  {
    icon: Upload,
    title: "Upload contracts",
    description: "Drag and drop PDF vendor contracts, SLAs or DPAs. We support batch uploads of up to 500 documents.",
  },
  {
    icon: Bot,
    title: "AI extracts & scores",
    description: "Our AI pipeline extracts Entity Name, LEI Code, Critical Function, dates and sub-outsourcing details with confidence scores.",
  },
  {
    icon: FileCheck2,
    title: "Review & register",
    description: "Your compliance team reviews flagged fields in the split-view, approves, and the record is pushed to your DORA register.",
  },
];

/* ── Profile Dropdown (logged-in navbar) ──────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProfileDropdown({ session }: { session: any }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = session?.user?.name || session?.user?.email || "User";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close on outside click
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
    { icon: User, label: "Profile", href: "/settings" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="size-8 rounded-full bg-gradient-to-br from-[#635BFF] to-[#4F46E5] flex items-center justify-center text-white text-[11px] font-bold select-none cursor-pointer hover:scale-110 hover:shadow-[0_4px_12px_rgba(99,91,255,0.4)] active:scale-95 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        {initials}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#E3E8EF] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden z-50"
          >
            {/* User info header */}
            <div className="px-3.5 py-3 border-b border-[#E3E8EF]">
              <p className="text-[13px] font-semibold text-[#0A2540] truncate">{name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{session?.user?.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              {items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#374151] hover:bg-[#F6F9FC] hover:text-[#0A2540] transition-colors duration-150"
                >
                  <item.icon className="size-3.5 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Log out */}
            <div className="border-t border-[#E3E8EF] py-1.5">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <LogOut className="size-3.5" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
