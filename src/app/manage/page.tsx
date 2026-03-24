"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  Cog,
  Crown,
  KeyRound,
  Loader2,
  Plus,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ManageState {
  saml: {
    entityId: string;
    ssoUrl: string;
    active: boolean;
  };
  currentModel: string;
  apiKeys: Array<{ id: string; name: string; prefix: string; createdAt: string }>;
  webhooks: Array<{ id: string; url: string; events: string[]; status: string; createdAt: string }>;
  trainingHistory: Array<{ id: string; action: string; createdAt: string; metadata: unknown }>;
}

const EMPTY_STATE: ManageState = {
  saml: { entityId: "", ssoUrl: "", active: false },
  currentModel: "dora-roi-enterprise-v4-finetuned",
  apiKeys: [],
  webhooks: [],
  trainingHistory: [],
};

export default function EnterpriseManagePage() {
  const router = useRouter();
  const [data, setData] = useState<ManageState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [samlSaving, setSamlSaving] = useState(false);
  const [apiKeySaving, setApiKeySaving] = useState(false);
  const [webhookSaving, setWebhookSaving] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [trainingUploading, setTrainingUploading] = useState(false);
  const [latestRawKey, setLatestRawKey] = useState<string | null>(null);
  const [entityId, setEntityId] = useState("");
  const [ssoUrl, setSsoUrl] = useState("");
  const trainingInputRef = useRef<HTMLInputElement>(null);

  async function loadManageState() {
    setLoading(true);
    try {
      const response = await fetch("/api/enterprise/manage");
      if (!response.ok) throw new Error("Failed to load enterprise settings");
      const nextData = (await response.json()) as ManageState;
      setData(nextData);
      setEntityId(nextData.saml.entityId);
      setSsoUrl(nextData.saml.ssoUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load enterprise settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadManageState();
  }, []);

  async function handleSaveSAML() {
    setSamlSaving(true);
    try {
      const response = await fetch("/api/enterprise/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_saml",
          entityId,
          ssoUrl,
        }),
      });
      const body = await response.json().catch(() => ({ error: "Failed to save SAML configuration" }));
      if (!response.ok) throw new Error(body.error || "Failed to save SAML configuration");
      toast.success("SAML configuration saved");
      await loadManageState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save SAML configuration");
    } finally {
      setSamlSaving(false);
    }
  }

  async function handleGenerateApiKey() {
    setApiKeySaving(true);
    try {
      const response = await fetch("/api/enterprise/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_api_key" }),
      });
      const body = await response.json().catch(() => ({ error: "Failed to generate API key" }));
      if (!response.ok) throw new Error(body.error || "Failed to generate API key");
      setLatestRawKey(body.rawKey);
      toast.success("New API key generated");
      await loadManageState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate API key");
    } finally {
      setApiKeySaving(false);
    }
  }

  async function handleAddWebhook() {
    const url = globalThis.prompt("Webhook URL");
    if (!url) return;
    setWebhookSaving(true);
    try {
      const response = await fetch("/api/enterprise/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_webhook", url }),
      });
      const body = await response.json().catch(() => ({ error: "Failed to add webhook" }));
      if (!response.ok) throw new Error(body.error || "Failed to add webhook");
      toast.success("Webhook added");
      await loadManageState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add webhook");
    } finally {
      setWebhookSaving(false);
    }
  }

  async function handleRetrainModel() {
    setRetraining(true);
    try {
      const response = await fetch("/api/enterprise/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retrain_model" }),
      });
      const body = await response.json().catch(() => ({ error: "Failed to queue retraining" }));
      if (!response.ok) throw new Error(body.error || "Failed to queue retraining");
      toast.success("Model retraining queued");
      await loadManageState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to queue retraining");
    } finally {
      setRetraining(false);
    }
  }

  async function handleTrainingUpload(file: File) {
    setTrainingUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/enterprise/training-data", {
        method: "POST",
        body: formData,
      });
      const body = await response.json().catch(() => ({ error: "Failed to upload training file" }));
      if (!response.ok) throw new Error(body.error || "Failed to upload training file");
      toast.success(`Uploaded ${body.fileName}`);
      await loadManageState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload training file");
    } finally {
      setTrainingUploading(false);
    }
  }

  const latestTraining = data.trainingHistory[0];

  return (
    <AppShell>
      <div className="custom-scrollbar flex h-full flex-col gap-6 overflow-y-auto p-6">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="size-5 text-[#635BFF]" />
            <h1 className="text-xl font-bold tracking-tight text-[#0A2540]">Enterprise Management</h1>
          </div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Advanced organization controls, SSO, and custom integrations
          </p>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-[#635BFF]" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-[#E3E8EF] bg-white shadow-none">
              <CardHeader className="px-5 pb-4 pt-5">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[#635BFF]/10">
                    <ShieldCheck className="size-4 text-[#635BFF]" />
                  </div>
                  <CardTitle className="text-[14px] font-bold text-[#0A2540]">Single Sign-On (SAML)</CardTitle>
                </div>
                <CardDescription className="text-[12px] text-muted-foreground">
                  Configure your identity provider for centralized authentication.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 px-5 pb-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">IdP Entity ID</label>
                  <Input value={entityId} onChange={(e) => setEntityId(e.target.value)} className="h-9 border-[#E3E8EF] bg-white text-[13px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">SSO URL</label>
                  <Input value={ssoUrl} onChange={(e) => setSsoUrl(e.target.value)} className="h-9 border-[#E3E8EF] bg-white text-[13px]" />
                </div>
                <div className="mt-2 border-t border-[#E3E8EF] pt-4">
                  <Button onClick={handleSaveSAML} disabled={samlSaving} className="btn-lift h-9 w-full bg-[#635BFF] text-[13px] text-white hover:bg-[#4F46E5]">
                    {samlSaving ? "Saving Configuration..." : data.saml.active ? "Update Configuration" : "Save Configuration"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E3E8EF] bg-white shadow-none">
              <CardHeader className="px-5 pb-4 pt-5">
                <div className="flex items-center justify-between">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50">
                      <BrainCircuit className="size-4 text-emerald-600" />
                    </div>
                    <CardTitle className="text-[14px] font-bold text-[#0A2540]">Custom AI Extraction</CardTitle>
                  </div>
                  <Badge className="border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-700">Active</Badge>
                </div>
                <CardDescription className="text-[12px] text-muted-foreground">
                  Fine-tune the extraction engine with your own compliance history.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="mb-4 rounded-lg border border-[#E3E8EF] bg-[#F6F9FC] p-3">
                  <p className="mb-1 text-[12px] font-medium text-[#0A2540]">Current Model</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-muted-foreground">{data.currentModel}</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-[#635BFF]" onClick={() => router.push("/audit")}>
                      History <ArrowRight className="ml-1 size-3" />
                    </Button>
                  </div>
                  {latestTraining && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Last model event: {new Date(latestTraining.createdAt).toLocaleString("en-GB")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={trainingInputRef}
                    type="file"
                    className="hidden"
                    accept=".json,.jsonl,.csv,.txt,.md"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleTrainingUpload(file);
                      event.target.value = "";
                    }}
                  />
                  <Button variant="outline" className="h-9 w-full border-[#E3E8EF] text-[13px] text-[#0A2540]" onClick={() => trainingInputRef.current?.click()} disabled={trainingUploading}>
                    <Plus className="mr-1.5 size-3.5" /> {trainingUploading ? "Uploading..." : "Upload Training Data"}
                  </Button>
                  <Button variant="outline" className="h-9 w-full border-[#E3E8EF] text-[13px] text-[#0A2540]" onClick={handleRetrainModel} disabled={retraining}>
                    <Cog className="mr-1.5 size-3.5" /> {retraining ? "Queueing..." : "Retrain Model"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E3E8EF] bg-white shadow-none">
              <CardHeader className="flex flex-row items-center justify-between px-5 pb-4 pt-5">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50">
                    <KeyRound className="size-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-[14px] font-bold text-[#0A2540]">API Keys</CardTitle>
                    <CardDescription className="text-[12px] text-muted-foreground">Manage programmatic access.</CardDescription>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 border-[#E3E8EF] text-[11px]" onClick={handleGenerateApiKey} disabled={apiKeySaving}>
                  {apiKeySaving ? "Generating..." : "Generate"}
                </Button>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {latestRawKey && (
                  <div className="mb-3 rounded border border-emerald-200 bg-emerald-50 p-2">
                    <p className="text-[11px] font-semibold text-emerald-700">Copy this key now</p>
                    <p className="mt-1 break-all font-mono text-[11px] text-[#0A2540]">{latestRawKey}</p>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  {data.apiKeys.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">No API keys generated yet.</p>
                  ) : (
                    data.apiKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between rounded border border-[#E3E8EF] bg-slate-50 p-2">
                        <div>
                          <p className="text-[12px] font-medium text-[#0A2540]">{key.name}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{key.prefix}...</p>
                        </div>
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-600">Active</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E3E8EF] bg-white shadow-none">
              <CardHeader className="flex flex-row items-center justify-between px-5 pb-4 pt-5">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50">
                    <Webhook className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-[14px] font-bold text-[#0A2540]">Webhooks</CardTitle>
                    <CardDescription className="text-[12px] text-muted-foreground">Real-time event streaming.</CardDescription>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 border-[#E3E8EF] text-[11px]" onClick={handleAddWebhook} disabled={webhookSaving}>
                  {webhookSaving ? "Adding..." : "Add URL"}
                </Button>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex flex-col gap-3">
                  {data.webhooks.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">No webhook endpoints configured.</p>
                  ) : (
                    data.webhooks.map((webhook) => (
                      <div key={webhook.id} className="flex items-center justify-between rounded border border-[#E3E8EF] p-2">
                        <div className="flex max-w-[220px] flex-col">
                          <p className="truncate text-[12px] font-medium text-[#0A2540]">{webhook.url}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Subscribed to: `{webhook.events.join(", ")}`
                          </p>
                        </div>
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-600">
                          {webhook.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
