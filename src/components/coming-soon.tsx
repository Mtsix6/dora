"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppShell } from "@/components/app-shell";
import { EASE_OUT_EXPO } from "@/lib/motion";

interface ComingSoonPageProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  article?: string;
}

export function ComingSoonPage({
  title,
  description,
  icon: Icon = Lock,
  article,
}: ComingSoonPageProps) {
  return (
    <AppShell>
      <div className="h-full flex flex-col p-6 overflow-y-auto">
        {/* Page header — matches real pages */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">
                {title}
              </h1>
              <Badge className="text-[10px] bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20 font-semibold h-auto px-2 py-0.5 rounded-full">
                Pro
              </Badge>
            </div>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {article && `${article} · `}
              {description ??
                "This module is under active development."}
            </p>
          </div>
        </div>

        {/* Empty state card */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.1 }}
            className="max-w-md text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.25 }}
              className="mx-auto size-16 rounded-2xl bg-gradient-to-br from-[#635BFF]/10 to-[#635BFF]/5 border border-[#635BFF]/10 flex items-center justify-center mb-5"
            >
              <Icon className="size-7 text-[#635BFF]" />
            </motion.div>

            <h2 className="text-lg font-bold text-[#0A2540] tracking-tight">
              Upgrade to unlock {title}
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed max-w-sm mx-auto">
              This module is available on the Pro plan. Upgrade to access full
              DORA pillar coverage, advanced reporting, and team collaboration.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/pricing">
                <Button className="h-9 px-5 text-[12px] font-semibold bg-[#635BFF] hover:bg-[#4F46E5] text-white btn-lift">
                  View plans
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-9 px-5 text-[12px] font-semibold border-[#E3E8EF]"
              >
                <Bell className="size-3.5 mr-1.5" />
                Notify me when ready
              </Button>
            </div>

            {/* Mock preview skeleton */}
            <div className="mt-10 rounded-xl border border-[#E3E8EF] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-24 bg-[#E3E8EF] rounded-full" />
                <div className="flex-1" />
                <div className="h-2 w-12 bg-[#635BFF]/20 rounded-full" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-[#E3E8EF]/60 p-2.5"
                  >
                    <div className="size-6 rounded bg-[#F6F9FC] flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div
                        className="h-1.5 bg-[#E3E8EF] rounded-full"
                        style={{ width: `${70 - i * 15}%` }}
                      />
                      <div
                        className="h-1.5 bg-[#F6F9FC] rounded-full"
                        style={{ width: `${50 - i * 10}%` }}
                      />
                    </div>
                    <div className="h-4 w-12 bg-[#F6F9FC] rounded-full" />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent rounded-xl pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
