"use client";

import { useEffect, useState } from "react";
import { Zap, Shield, Server, AlertCircle, TrendingDown, ArrowRight, Laptop, Plus, Loader2, Inbox } from "lucide-react";
import { ComingSoonPage } from "@/components/coming-soon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/format";
import { getDoraData } from "@/app/actions/dora";

const mockStats = [
  { title: "Critical Assets", value: "14", icon: Server, color: "text-red-600", bg: "bg-red-50" },
  { title: "High Risks", value: "5", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
  { title: "Avg Risk Score", value: "68", icon: TrendingDown, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Protected Assets", value: "89%", icon: Shield, color: "text-[#635BFF]", bg: "bg-[#635BFF]/10" },
];

const mockAssets = [
  { id: "AST-001", name: "Core Banking DB", type: "Database", criticality: "Critical", riskScore: 85, lastAssessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
  { id: "AST-002", name: "Payment API Gateway", type: "Service", criticality: "Critical", riskScore: 72, lastAssessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString() },
  { id: "AST-003", name: "Employee CRM", type: "Application", criticality: "Medium", riskScore: 45, lastAssessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
  { id: "AST-004", name: "Mainframe Storage", type: "Infrastructure", criticality: "High", riskScore: 78, lastAssessed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
];

function getRiskScoreColor(score: number) {
  if (score >= 80) return "text-red-600 bg-red-50 border-red-200";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-emerald-600 bg-emerald-50 border-emerald-200";
}

function getCriticalityColor(criticality: string) {
  switch (criticality) {
    case "Critical": return "bg-red-50 text-red-700 border-red-200";
    case "High": return "bg-amber-50 text-amber-700 border-amber-200";
    default: return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

export default function IctRiskPage() {
  const [data, setData] = useState<any[]>([]);
  const [isTest, setIsTest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoraData().then((res) => {
      setIsTest(res.isTestAccount);
      setData(res.data?.ictAssets || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAssessRisk = () => {
    toast.success("Risk Assessment Initiated", {
      description: "A new ICT risk assessment workflow has been started.",
    });
  };

  const displayAssets = isTest ? mockAssets : data.map(d => ({
    id: d.id,
    name: d.name,
    type: d.category,
    criticality: d.criticality,
    riskScore: d.riskScore || 0,
    lastAssessed: d.lastAssessedAt || d.createdAt
  }));

  const avgRisk = data.length > 0 ? Math.round(data.reduce((acc, d) => acc + (d.riskScore || 0), 0) / data.length) : 0;

  const displayStats = isTest ? mockStats : [
    { title: "Critical Assets", value: data.filter(d => d.criticality === "Critical").length.toString(), icon: Server, color: "text-red-600", bg: "bg-red-50" },
    { title: "High Risks", value: data.filter(d => d.riskScore && d.riskScore >= 60).length.toString(), icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Avg Risk Score", value: avgRisk.toString(), icon: TrendingDown, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Protected Assets", value: data.length > 0 ? "100%" : "-", icon: Shield, color: "text-[#635BFF]", bg: "bg-[#635BFF]/10" },
  ];

  const dashboardContent = loading ? (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="size-6 text-[#635BFF] animate-spin" />
    </div>
  ) : (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h2 className="text-lg font-bold text-[#0A2540] tracking-tight">ICT Asset Inventory</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage and assess risks for your critical ICT assets</p>
        </div>
        <Button onClick={handleAssessRisk} className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white btn-lift">
          <Plus className="size-3.5 mr-1.5" />
          Assess Risk
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-[#E3E8EF] shadow-none bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.title}</p>
                  <div className={cn("size-7 rounded-md flex items-center justify-center", stat.bg)}>
                    <Icon className={cn("size-3.5", stat.color)} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#0A2540] tabular-nums">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-[#E3E8EF] shadow-none bg-white">
        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Critical Assets</CardTitle>
          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-[#635BFF] px-2" onClick={() => toast.info("View asset inventory")}>
            View all <ArrowRight className="size-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {displayAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="size-12 rounded-full bg-[#F6F9FC] flex items-center justify-center mb-3">
                <Inbox className="size-5 text-muted-foreground" />
              </div>
              <p className="text-[14px] font-semibold text-[#0A2540]">No ICT Assets found</p>
              <p className="text-[12px] text-muted-foreground mt-1 max-w-[200px]">You haven't added any critical assets to your inventory.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#F6F9FC]">
                <TableRow>
                  <TableHead className="w-[120px] text-[11px] font-semibold text-muted-foreground">Asset ID</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Name</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Type</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Criticality</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Risk Score</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold text-muted-foreground">Last Assessed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayAssets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-[#F6F9FC]/50 transition-colors">
                    <TableCell className="font-semibold text-[12px] text-[#0A2540]">
                      <div className="flex items-center gap-2">
                         <Laptop className="size-3.5 text-muted-foreground" />
                         <span className="truncate max-w-[80px]">{asset.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[12px] font-medium text-[#0A2540]">{asset.name}</TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">{asset.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px] font-semibold h-auto py-0.5", getCriticalityColor(asset.criticality))}>
                        {asset.criticality}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px] font-semibold h-auto py-0.5", getRiskScoreColor(asset.riskScore))}>
                        {asset.riskScore}/100
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-[12px] text-muted-foreground tabular-nums">{formatRelativeTime(asset.lastAssessed)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ComingSoonPage
      title="ICT Risk Management"
      description="Risk identification, protection, detection, response, and recovery framework management."
      icon={Zap}
      article="DORA Art. 5-16"
      requiredTier="PRO"
    >
      {dashboardContent}
    </ComingSoonPage>
  );
}
