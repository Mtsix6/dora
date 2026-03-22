import type { Metadata } from "next";
import { GitBranch } from "lucide-react";
import { ComingSoonPage } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <ComingSoonPage
      title="ICT Third-Party Register"
      description="Your register of all contractual arrangements with ICT third-party service providers, ready for supervisory reporting."
      icon={GitBranch}
      article="DORA Art. 28(3)"
    />
  );
}
