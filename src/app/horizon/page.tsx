import type { Metadata } from "next";
import {
  Globe,
  ArrowUpRight,
  Zap,
  AlertCircle,
  Radar,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Horizon Scanning" };

function impactBarColor(impact: string) {
  switch (impact) {
    case "Critical":
      return "bg-red-500";
    case "High":
      return "bg-amber-500";
    case "Medium":
      return "bg-[#635BFF]";
    default:
      return "bg-emerald-500";
  }
}

function impactDotClass(impact: string) {
  switch (impact) {
    case "Critical":
      return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
    case "High":
      return "bg-amber-500";
    default:
      return "bg-emerald-500";
  }
}

export default async function HorizonScanningPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;

  const dbAlerts = await prisma.horizonAlert.findMany({
    where: { workspaceId, dismissed: false },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const allItems = dbAlerts.map((a) => ({
    id: a.id,
    title: a.title,
    source: a.source,
    category: a.category,
    impact: a.impact,
    summary: a.summary,
    doraArticle: a.doraArticle ?? "DORA Art. 5",
    createdAt: a.createdAt,
  }));

  const criticalCount = allItems.filter(
    (i) => i.impact === "Critical"
  ).length;
  const highCount = allItems.filter((i) => i.impact === "High").length;

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-[#0A2540] tracking-tight">
            Regulatory Horizon Scanning
          </h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Real-time AI-powered monitoring of DORA regulatory changes, cyber
            threats, and authority guidelines
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ---- Left: News feed ---- */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {allItems.length === 0 && (
              <Card className="border-[#E3E8EF] shadow-none bg-white">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="size-14 rounded-2xl bg-[#635BFF]/10 flex items-center justify-center mb-5">
                    <Radar className="size-7 text-[#635BFF]" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#0A2540]">
                    No horizon alerts yet
                  </h3>
                  <p className="text-[13px] text-muted-foreground mt-2 max-w-md leading-relaxed">
                    When regulatory updates, cyber threats, or authority
                    guidelines are detected, they will appear here. Learn more
                    about DORA horizon scanning to understand how AI-powered
                    monitoring keeps your organisation informed.
                  </p>
                  <div className="mt-6 pt-6 border-t border-[#F6F9FC] w-full max-w-sm">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Monitoring ESMA, EBA, EIOPA, CERT-EU, BaFin and more
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {allItems.map((item) => (
              <Card
                key={item.id}
                className="border-[#E3E8EF] shadow-none bg-white hover:border-[#635BFF]/30 hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden relative"
              >
                {/* Left color bar */}
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    impactBarColor(item.impact)
                  )}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="bg-[#F6F9FC] text-muted-foreground border-[#E3E8EF] text-[10px] font-bold py-0"
                      >
                        {item.source}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-[#635BFF]/10 text-[#635BFF] border-transparent text-[10px] font-bold py-0"
                      >
                        {item.category}
                      </Badge>
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase whitespace-nowrap ml-2">
                      {formatRelativeTime(item.createdAt.toISOString())}
                    </span>
                  </div>

                  <h3 className="text-[16px] font-bold text-[#0A2540] group-hover:text-[#635BFF] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-[13px] text-muted-foreground mt-2 line-clamp-2">
                    {item.summary}
                  </p>

                  <div className="mt-4 pt-4 border-t border-[#F6F9FC] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "size-2 rounded-full",
                            impactDotClass(item.impact)
                          )}
                        />
                        <span className="text-[11px] font-bold text-[#0A2540]">
                          Impact: {item.impact}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground underline decoration-[#E3E8EF] underline-offset-4">
                        Ref: {item.doraArticle}
                      </span>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ---- Right sidebar ---- */}
          <div className="flex flex-col gap-6">
            {/* Horizon Insights dark card */}
            <Card className="border-none bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] text-white overflow-hidden shadow-2xl">
              <CardContent className="p-6 relative">
                <div className="absolute -top-6 -right-6 size-32 bg-white/5 rounded-full blur-3xl" />
                <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 border border-white/20">
                  <Zap className="size-5 text-amber-400" />
                </div>
                <h4 className="text-[15px] font-bold">Horizon Insights</h4>
                <p className="text-[13px] text-white/70 mt-2 leading-relaxed">
                  AI detection found{" "}
                  <span className="text-white font-semibold">
                    {criticalCount} critical
                  </span>{" "}
                  and{" "}
                  <span className="text-white font-semibold">
                    {highCount} high-impact
                  </span>{" "}
                  alerts across {allItems.length} monitored regulatory sources.
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 text-[12px] text-white/50">
                  Scanning ESMA, EBA, EIOPA, CERT-EU, BaFin and 12 more
                  authorities
                </div>
              </CardContent>
            </Card>

            {/* Critical Warnings */}
            <Card className="border-[#E3E8EF] shadow-sm bg-white">
              <CardHeader className="p-4 border-b border-[#F6F9FC]">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Critical Warnings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-4">
                {allItems
                  .filter(
                    (i) => i.impact === "Critical" || i.impact === "High"
                  )
                  .slice(0, 4)
                  .map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div
                        className={cn(
                          "size-8 rounded-full flex items-center justify-center flex-shrink-0",
                          item.impact === "Critical"
                            ? "bg-red-50"
                            : "bg-amber-50"
                        )}
                      >
                        {item.impact === "Critical" ? (
                          <AlertCircle className="size-4 text-red-500" />
                        ) : (
                          <Globe className="size-4 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-[#0A2540] line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {item.source} &middot; {item.doraArticle}
                        </p>
                      </div>
                    </div>
                  ))}
                {allItems.filter(
                  (i) => i.impact === "Critical" || i.impact === "High"
                ).length === 0 && (
                  <p className="text-[12px] text-muted-foreground text-center py-2">
                    No critical warnings at this time.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
