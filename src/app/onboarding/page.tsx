"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  FileText,
  LayoutGrid,
  Loader2,
  Shield,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EASE_OUT_EXPO } from "@/lib/motion";

const INDUSTRIES = [
  { value: "banking", label: "Banking & Finance" },
  { value: "insurance", label: "Insurance" },
  { value: "fintech", label: "Fintech" },
  { value: "asset_mgmt", label: "Asset Management" },
  { value: "payments", label: "Payment Services" },
  { value: "other", label: "Other Financial Entity" },
];

const FEATURES = [
  {
    icon: Upload,
    title: "Upload contracts",
    desc: "PDF, DOCX or TXT — AI extracts DORA fields automatically",
  },
  {
    icon: Shield,
    title: "Compliance tracking",
    desc: "Monitor your DORA Art. 28 register in real time",
  },
  {
    icon: FileText,
    title: "Audit-ready reports",
    desc: "Generate reports for your regulator in one click",
  },
];

const slideVariants = {
  enter: { opacity: 0, x: 60, scale: 0.97 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -60, scale: 0.97 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    setLoading(true);
    try {
      if (companyName.trim()) {
        await fetch("/api/workspace", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: companyName.trim() }),
        });
      }
      router.replace("/dashboard");
    } catch {
      router.replace("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="flex items-center gap-2.5 mb-10"
      >
        <div className="size-9 rounded-xl bg-[#635BFF] flex items-center justify-center shadow-[0_4px_14px_rgba(99,91,255,0.3)]">
          <LayoutGrid className="size-5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold text-[#0A2540] tracking-tight">
          DORA<span className="text-[#635BFF]">·</span>RoI
        </span>
      </motion.div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            >
              <div className="bg-white rounded-2xl border border-[#E3E8EF] shadow-[0_8px_32px_rgba(10,37,64,0.08)] p-8">
                <div className="size-12 rounded-xl bg-[#635BFF]/10 flex items-center justify-center mb-5">
                  <Sparkles className="size-6 text-[#635BFF]" />
                </div>

                <h1 className="text-2xl font-bold text-[#0A2540] tracking-tight">
                  Set up your workspace
                </h1>
                <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">
                  Tell us about your organisation so we can tailor your DORA compliance experience.
                </p>

                <div className="mt-8 flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#0A2540]">
                      Company name
                    </label>
                    <Input
                      placeholder="e.g. Acme Financial Services"
                      className="h-11 text-[14px] border-[#E3E8EF] bg-[#F6F9FC] focus-visible:ring-[#635BFF]/30 focus-visible:border-[#635BFF]"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-semibold text-[#0A2540]">
                      Industry
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {INDUSTRIES.map((ind) => (
                        <button
                          key={ind.value}
                          type="button"
                          onClick={() => setIndustry(ind.value)}
                          className={`px-3 py-2.5 rounded-lg border text-[13px] font-medium text-left transition-all duration-200 ${
                            industry === ind.value
                              ? "border-[#635BFF] bg-[#635BFF]/5 text-[#635BFF] shadow-[0_0_0_1px_#635BFF]"
                              : "border-[#E3E8EF] text-[#374151] hover:border-[#635BFF]/40 hover:bg-[#F6F9FC]"
                          }`}
                        >
                          {ind.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-11 text-[14px] font-semibold bg-[#635BFF] hover:bg-[#4F46E5] text-white mt-8 btn-lift"
                  onClick={() => setStep(1)}
                  disabled={!companyName.trim()}
                >
                  Continue
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>

              <div className="flex justify-center gap-2 mt-6">
                <div className="h-1.5 w-8 rounded-full bg-[#635BFF] transition-all duration-300" />
                <div className="h-1.5 w-8 rounded-full bg-[#E3E8EF] transition-all duration-300" />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            >
              <div className="bg-white rounded-2xl border border-[#E3E8EF] shadow-[0_8px_32px_rgba(10,37,64,0.08)] p-8 text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: 0.15 }}
                  className="size-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5"
                >
                  <Check className="size-7 text-emerald-600" />
                </motion.div>

                <h1 className="text-2xl font-bold text-[#0A2540] tracking-tight">
                  You&apos;re all set!
                </h1>
                <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
                  <span className="font-semibold text-[#0A2540]">{companyName}</span>{" "}
                  workspace is ready. Here&apos;s what you can do:
                </p>

                <div className="mt-6 flex flex-col gap-2">
                  {FEATURES.map((feat, i) => (
                    <motion.div
                      key={feat.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT_EXPO, delay: 0.2 + i * 0.08 }}
                      className="flex items-center gap-3 text-left p-3 rounded-lg bg-[#F6F9FC] border border-[#E3E8EF]"
                    >
                      <div className="size-8 rounded-lg bg-[#635BFF]/10 flex items-center justify-center flex-shrink-0">
                        <feat.icon className="size-4 text-[#635BFF]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#0A2540]">{feat.title}</p>
                        <p className="text-[11px] text-muted-foreground">{feat.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button
                  className="w-full h-11 text-[14px] font-semibold bg-[#635BFF] hover:bg-[#4F46E5] text-white mt-8 btn-lift"
                  onClick={handleFinish}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Go to Dashboard
                      <ArrowRight className="size-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <div className="flex justify-center gap-2 mt-6">
                <div className="h-1.5 w-8 rounded-full bg-[#635BFF] transition-all duration-300" />
                <div className="h-1.5 w-8 rounded-full bg-[#635BFF] transition-all duration-300" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
