"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  Loader2,
  Shield,
  Sparkles,
  Zap,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MarketingNavbar } from "@/components/marketing-navbar";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.1 },
  }),
};

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For teams evaluating DORA compliance tooling.",
    cta: "Get started",
    highlight: false,
    action: "signup" as const,
    features: [
      "Up to 10 contract extractions",
      "Single user",
      "AI extraction with confidence scoring",
      "Split-view review interface",
      "Basic audit trail",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "€249",
    period: "/month",
    description: "For compliance teams managing active DORA registers.",
    cta: "Start free trial",
    highlight: true,
    badge: "Most popular",
    action: "checkout" as const,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
    features: [
      "Unlimited contract extractions",
      "Up to 10 team members",
      "Priority AI processing",
      "Full DORA Art. 28 register",
      "LEI validation (GLEIF)",
      "Expiry alerts & renewal tracking",
      "Immutable audit log",
      "Email & chat support",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For regulated institutions with advanced requirements.",
    cta: "Contact sales",
    highlight: false,
    action: "contact" as const,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "SSO / SAML authentication",
      "Custom AI model fine-tuning",
      "On-premise deployment option",
      "Dedicated customer success manager",
      "SLA with 99.99% uptime guarantee",
      "Custom integrations (GRC, ERP)",
      "Regulatory reporting exports",
      "Priority phone support",
    ],
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);

  async function handlePlanAction(plan: (typeof PLANS)[number]) {
    if (plan.action === "signup") {
      router.push(session ? "/dashboard" : "/signup");
      return;
    }
    if (plan.action === "contact") {
      window.location.href =
        "mailto:sales@dora-roi.eu?subject=Enterprise%20Pricing%20Request";
      return;
    }
    if (!session) {
      router.push("/signup?plan=pro");
      return;
    }
    if (!plan.stripePriceId) {
      toast.error("Stripe not configured", {
        description:
          "Set NEXT_PUBLIC_STRIPE_PRO_PRICE_ID in your environment variables.",
      });
      return;
    }
    setLoadingPlan(plan.name);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.stripePriceId }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to start checkout");
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 35%, #0d1b3e 65%, #0a0a1a 100%)" }}>
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[900px] h-[900px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,91,255,0.25) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2], x: [0, -50, 0], y: [0, 60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 3 }}
          className="absolute -bottom-[10%] -right-[5%] w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 6 }}
          className="absolute top-[40%] left-[45%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)", filter: "blur(60px)" }}
        />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      </div>

      {/* Shared navbar */}
      <MarketingNavbar />

      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl px-6 pt-40 pb-16 text-center"
      >
        <motion.div variants={fadeUp} custom={0}>
          <Badge className="mb-6 border border-white/20 bg-white/10 text-white/80 backdrop-blur-sm font-semibold text-[11px] px-4 py-1.5 rounded-full">
            <Sparkles className="size-3 mr-1.5 text-indigo-300" />
            14-day free trial on Pro · No credit card required
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          custom={1}
          className="text-4xl md:text-[56px] font-black text-white leading-[1.08] tracking-tight"
        >
          Simple pricing for{" "}
          <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
            every stage
          </span>{" "}
          of compliance
        </motion.h1>

        <motion.p
          variants={fadeUp}
          custom={2}
          className="mt-5 text-lg text-white/55 max-w-xl mx-auto leading-relaxed"
        >
          Start free, upgrade when you need unlimited extractions and team
          collaboration. No hidden fees.
        </motion.p>

        {/* Annual toggle */}
        <motion.div variants={fadeUp} custom={3} className="mt-8 inline-flex items-center gap-3">
          <span className={cn("text-sm font-medium transition-colors", !annual ? "text-white" : "text-white/40")}>Monthly</span>
          <button
            onClick={() => setAnnual((a) => !a)}
            className={cn(
              "relative h-6 w-11 rounded-full border transition-colors duration-300",
              annual ? "bg-indigo-500 border-indigo-400" : "bg-white/10 border-white/20"
            )}
          >
            <motion.span
              animate={{ x: annual ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 size-5 rounded-full bg-white shadow-md block"
            />
          </button>
          <span className={cn("text-sm font-medium transition-colors", annual ? "text-white" : "text-white/40")}>
            Annual
            <span className="ml-1.5 text-[11px] font-bold text-emerald-400">–20%</span>
          </span>
        </motion.div>
      </motion.section>

      {/* Pricing cards */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => {
            const isLoading = loadingPlan === plan.name;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.4 + i * 0.1 }}
                className={cn(
                  "relative flex flex-col rounded-3xl border p-7 transition-all duration-300",
                  plan.highlight
                    ? "border-indigo-400/50 shadow-[0_0_60px_rgba(99,91,255,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]"
                    : "border-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]",
                  "backdrop-blur-xl"
                )}
                style={{
                  background: plan.highlight
                    ? "linear-gradient(145deg, rgba(99,91,255,0.18) 0%, rgba(99,91,255,0.08) 50%, rgba(15,12,41,0.6) 100%)"
                    : "rgba(255,255,255,0.04)",
                }}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-[0_4px_12px_rgba(99,91,255,0.5)]">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Highlight ring */}
                {plan.highlight && (
                  <div className="pointer-events-none absolute inset-0 rounded-3xl border border-indigo-400/30" />
                )}

                <div className="mb-6">
                  <h3 className="text-[15px] font-bold text-white/90">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${plan.name}-${annual}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="text-4xl font-black text-white tracking-tight"
                      >
                        {plan.price === "€249" && annual ? "€199" : plan.price}
                      </motion.span>
                    </AnimatePresence>
                    {plan.period && (
                      <span className="text-[13px] text-white/40">{plan.period}</span>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] text-white/45 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <Button
                  onClick={() => handlePlanAction(plan)}
                  disabled={isLoading}
                  className={cn(
                    "w-full h-11 text-[13px] font-bold rounded-xl transition-all duration-200",
                    plan.highlight
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-[0_4px_20px_rgba(99,91,255,0.45)] hover:shadow-[0_6px_28px_rgba(99,91,255,0.6)] hover:-translate-y-0.5"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/25 backdrop-blur-sm"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </>
                  )}
                </Button>

                <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <div className={cn(
                        "mt-0.5 size-4 rounded-full flex items-center justify-center flex-shrink-0",
                        plan.highlight ? "bg-indigo-500/20" : "bg-white/8"
                      )}>
                        <Check className={cn("size-2.5", plan.highlight ? "text-indigo-300" : "text-white/50")} />
                      </div>
                      <span className="text-[13px] text-white/60 leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Trust bar */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.8 }}
        className="relative z-10 border-t border-white/8 py-14"
        style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(20px)" }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { icon: Shield, text: "SOC 2 Type II" },
              { icon: Zap, text: "GDPR compliant" },
              { icon: Shield, text: "ISO 27001" },
              { icon: Zap, text: "99.9% SLA" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-[13px] text-white/40 font-medium">
                <item.icon className="size-4 text-indigo-400/70" />
                {item.text}
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13px] text-white/30 max-w-md mx-auto">
            All plans include bank-grade encryption, EU data residency, and full
            regulatory audit trail. Cancel anytime.
          </p>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 select-none">
            <div className="flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#5B5BD6] to-[#7E7BFF]">
              <LayoutGrid className="size-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold text-white/60">
              DORA<span className="text-indigo-400">·</span>RoI Automator
            </span>
          </div>
          <p className="text-[12px] text-white/25">
            © 2026 DORA RoI Ltd · All rights reserved
          </p>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Security"].map((l) => (
              <Link key={l} href="#" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
