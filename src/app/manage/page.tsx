"use client";

import { Crown, KeyRound, BrainCircuit, Webhook, ShieldCheck, Plus, ArrowRight, Cog } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

export default function EnterpriseManagePage() {
  const [samlSaving, setSamlSaving] = useState(false);

  const handleSaveSAML = () => {
    setSamlSaving(true);
    setTimeout(() => {
      setSamlSaving(false);
      toast.success("SAML configuration saved", {
        description: "Your Identity Provider has been configured for Enterprise SSO.",
      });
    }, 1200);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full custom-scrollbar">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Crown className="size-5 text-[#635BFF]" />
            <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">
              Enterprise Management
            </h1>
          </div>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Advanced organization controls, SSO, and custom integrations
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* SSO Configuration */}
          <Card className="border-[#E3E8EF] shadow-none bg-white">
            <CardHeader className="pb-4 pt-5 px-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="size-8 rounded-lg bg-[#635BFF]/10 flex items-center justify-center">
                  <ShieldCheck className="size-4 text-[#635BFF]" />
                </div>
                <CardTitle className="text-[14px] font-bold text-[#0A2540]">Single Sign-On (SAML)</CardTitle>
              </div>
              <CardDescription className="text-[12px] text-muted-foreground">
                Configure your Identity Provider (IdP) for centralized authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">IdP Entity ID</label>
                <Input defaultValue="https://login.microsoftonline.com/example/v2.0" className="h-9 text-[13px] border-[#E3E8EF] bg-white focus-visible:ring-[#635BFF]/30" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">SSO URL</label>
                <Input defaultValue="https://login.microsoftonline.com/example/saml2" className="h-9 text-[13px] border-[#E3E8EF] bg-white focus-visible:ring-[#635BFF]/30" />
              </div>
              <div className="flex flex-col gap-1.5 border-t border-[#E3E8EF] pt-4 mt-2">
                <Button onClick={handleSaveSAML} disabled={samlSaving} className="h-9 text-[13px] w-full bg-[#635BFF] hover:bg-[#4F46E5] text-white btn-lift">
                  {samlSaving ? "Saving Configuration..." : "Save Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom AI Models */}
          <Card className="border-[#E3E8EF] shadow-none bg-white">
            <CardHeader className="pb-4 pt-5 px-5">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                     <BrainCircuit className="size-4 text-emerald-600" />
                   </div>
                   <CardTitle className="text-[14px] font-bold text-[#0A2540]">Custom AI Extraction</CardTitle>
                 </div>
                 <Badge className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold border-emerald-200">Active</Badge>
              </div>
              <CardDescription className="text-[12px] text-muted-foreground">
                Fine-tune the DORA extraction engine with your own compliance history.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
               <div className="p-3 bg-[#F6F9FC] border border-[#E3E8EF] rounded-lg mb-4">
                 <p className="text-[12px] font-medium text-[#0A2540] mb-1">Current Model</p>
                 <div className="flex items-center justify-between">
                   <span className="text-[13px] text-muted-foreground">dora-roi-enterprise-v4-finetuned</span>
                   <Button variant="ghost" size="sm" className="h-6 text-[11px] text-[#635BFF] px-2" onClick={() => toast.info("Training history")}>
                     History <ArrowRight className="size-3 ml-1" />
                   </Button>
                 </div>
               </div>
               <div className="space-y-2">
                  <Button variant="outline" className="w-full h-9 text-[13px] text-[#0A2540] border-[#E3E8EF]" onClick={() => toast.success("Upload dataset modal opened")}>
                    <Plus className="size-3.5 mr-1.5" /> Upload Training Data
                  </Button>
                  <Button variant="outline" className="w-full h-9 text-[13px] text-[#0A2540] border-[#E3E8EF]" onClick={() => toast.info("Retraining initiated")}>
                    <Cog className="size-3.5 mr-1.5" /> Retrain Model
                  </Button>
               </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card className="border-[#E3E8EF] shadow-none bg-white">
            <CardHeader className="pb-4 pt-5 px-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <KeyRound className="size-4 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-[14px] font-bold text-[#0A2540]">API Keys</CardTitle>
                  <CardDescription className="text-[12px] text-muted-foreground">Manage programmatic access.</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-[11px] border-[#E3E8EF]" onClick={() => toast.success("New API Key generated")}>
                Generate
              </Button>
            </CardHeader>
            <CardContent className="px-5 pb-5">
               <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-2 rounded border border-[#E3E8EF] bg-slate-50">
                     <div>
                       <p className="text-[12px] font-medium text-[#0A2540]">Production ERP Sync</p>
                       <p className="text-[11px] text-muted-foreground font-mono mt-0.5">dora_live_8f9...3xP</p>
                     </div>
                     <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 font-semibold border-emerald-200">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border border-[#E3E8EF] bg-slate-50">
                     <div>
                       <p className="text-[12px] font-medium text-[#0A2540]">GRC Platform Dev</p>
                       <p className="text-[11px] text-muted-foreground font-mono mt-0.5">dora_test_4a2...9bQ</p>
                     </div>
                     <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-50 font-semibold border-amber-200">Testing</Badge>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* Webhooks */}
          <Card className="border-[#E3E8EF] shadow-none bg-white">
            <CardHeader className="pb-4 pt-5 px-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Webhook className="size-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-[14px] font-bold text-[#0A2540]">Webhooks</CardTitle>
                  <CardDescription className="text-[12px] text-muted-foreground">Real-time event streaming.</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-[11px] border-[#E3E8EF]" onClick={() => toast.success("Add Webhook modal opened")}>
                Add URL
              </Button>
            </CardHeader>
            <CardContent className="px-5 pb-5">
               <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-2 rounded border border-[#E3E8EF]">
                     <div className="flex flex-col max-w-[180px]">
                       <p className="text-[12px] font-medium text-[#0A2540] truncate">https://api.internal/webhook/dora</p>
                       <p className="text-[11px] text-muted-foreground mt-0.5">Subscribed to: `contract.extracted`</p>
                     </div>
                     <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 font-semibold border-emerald-200">Healthy</Badge>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
