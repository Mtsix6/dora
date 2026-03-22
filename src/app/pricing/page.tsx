"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  LayoutGrid,
  Loader2,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EASE_OUT_EXPO, fadeUp, staggerContainer } from "@/lib/motion";
import { toast } from "sonner";

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

  async function handlePlanAction(plan: typeof PLANS[number]) {
    if (plan.action === "signup") {
      router.push(session ? "/dashboard" : "/signup");
      return;
    }

    if (plan.action === "contact") {
      toast.info("Contact our sales team", {
        description: "Email sales@dora-roi.eu for Enterprise pricing and a custom demo.",
      });
      return;
    }

    // Checkout flow — requires auth
    if (!session) {
      router.push("/signup?plan=pro");
      return;
    }

    if (!plan.stripePriceId) {
      toast.error("Stripe not configured", {
        description: "Set NEXT_PUBLIC_STRIPE_PRO_PRICE_ID in your environment variables.",
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
      if (url) {
        window.location.href = url;
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-full bg-white overflow-auto">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[#E3E8EF] bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 select-none">
            <div className="size-6 rounded-md bg-[#635BFF] flex items-center justify-center">
              <LayoutGrid className="size-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-[#0A2540] tracking-tight">
              DORA<span className="text-[#635BFF]">·</span>RoI
            </span>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {session ? (
              <Link href="/dashboard">
                <Button size="sm" className="h-8 text-[13px] bg-[#635BFF] hover:bg-[#4F46E5] text-white px-4">
                  Dashboard
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-8 text-[13px]">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="h-8 text-[13px] bg-[#635BFF] hover:bg-[#4F46E5] text-white px-4">
                    Get started free
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center"
      >
        <motion.div variants={fadeUp}>
          <Badge
            variant="outline"
            className="mb-6 border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/5 font-semibold text-[11px] px-3 py-1 rounded-full"
          >
            <Sparkles className="size-3 mr-1.5" />
            14-day free trial on Pro · No credit card required
          </Badge>
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-[#0A2540] leading-tight tracking-tight">
          Simple pricing for{" "}
          <span className="text-[#635BFF]">every stage</span> of compliance
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Start free, upgrade when you need unlimited extractions and team
          collaboration. No hidden fees.
        </motion.p>
      </motion.section>

      {/* Pricing grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
          className="grid md:grid-cols-3 gap-6"
        >
          {PLANS.map((plan, planIdx) => {
            const isLoading = loadingPlan === plan.name;
            return (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={planIdx}
                className={cn(
                  "relative rounded-2xl border p-6 flex flex-col transition-all duration-300",
                  plan.highlight
                    ? "border-[#635BFF] bg-gradient-to-b from-[#635BFF]/[0.03] to-white shadow-[0_4px_24px_rgba(99,91,255,0.12)] scale-[1.02] hover:shadow-[0_8px_32px_rgba(99,91,255,0.18)]"
                    : "border-[#E3E8EF] bg-white hover:border-[#635BFF]/30 hover:shadow-md hover:-translate-y-1"
                )}
              >
                {plan.badge && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#635BFF] text-white text-[10px] font-semibold px-3 py-0.5 rounded-full border-0">
                    {plan.badge}
                  </Badge>
                )}

                <div className="mb-6">
                  <h3 className="text-[15px] font-bold text-[#0A2540]">
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#0A2540] tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-[13px] text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <Button
                  className={cn(
                    "w-full h-10 text-[13px] font-semibold btn-lift",
                    plan.highlight
                      ? "bg-[#635BFF] hover:bg-[#4F46E5] text-white"
                      : "bg-white border border-[#E3E8EF] text-[#0A2540] hover:bg-[#F6F9FC] hover:border-[#635BFF]/30"
                  )}
                  onClick={() => handlePlanAction(plan)}
                  disabled={isLoading}
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

                <div className="mt-6 pt-6 border-t border-[#E3E8EF] flex flex-col gap-3 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <Check className="size-3.5 text-[#635BFF] mt-0.5 flex-shrink-0" />
                      <span className="text-[13px] text-[#374151] leading-snug">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Trust section */}
      <section className="border-t border-[#E3E8EF] bg-[#F6F9FC] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { icon: Shield, text: "SOC 2 Type II" },
              { icon: Zap, text: "GDPR compliant" },
              { icon: Shield, text: "ISO 27001" },
              { icon: Zap, text: "99.9% SLA" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 text-[13px] text-muted-foreground font-medium"
              >
                <item.icon className="size-4 text-[#635BFF]" />
                {item.text}
              </div>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-muted-foreground max-w-md mx-auto">
            All plans include bank-grade encryption, EU data residency, and full
            regulatory audit trail. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E3E8EF] bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 select-none">
            <div className="size-5 rounded bg-[#635BFF] flex items-center justify-center">
              <LayoutGrid className="size-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold text-[#0A2540]">
              DORA<span className="text-[#635BFF]">·</span>RoI Automator
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            © 2026 DORA RoI Ltd · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
