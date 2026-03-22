import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { ComingSoonPage } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Regulatory Library" };

export default function LibraryPage() {
  return (
    <ComingSoonPage
      title="Regulatory Library"
      description="Searchable library of DORA regulation text, EBA/ESMA/EIOPA guidelines, RTS, and ITS documentation."
      icon={BookOpen}
    />
  );
}
