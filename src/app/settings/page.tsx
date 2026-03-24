"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Building2,
  Check,
  Crown,
  Eye,
  EyeOff,
  Key,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Shield,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EASE_OUT_EXPO, fadeUp } from "@/lib/motion";

interface WorkspaceData {
  id: string;
  name: string;
  tier: string;
  createdAt: string;
  users: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
  }[];
  _count: { contracts: number };
}

interface AiProviderOption {
  value: string;
  label: string;
  defaultModel: string;
  usesPlatformKeyByDefault: boolean;
}

interface AiConfigData {
  tier: string;
  provider: string;
  providerLabel: string;
  modelId: string | null;
  usage: {
    count: number;
    limit: number | string;
    remaining: number | string;
    lastReset: string;
  };
  hasCustomKey: boolean;
  maskedKey?: string | null;
  canManage: boolean;
  providers: AiProviderOption[];
}

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20",
  ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
  MEMBER: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiConfig, setAiConfig] = useState<AiConfigData | null>(null);
  const [aiKey, setAiKey] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("GOOGLE");
  const [selectedModel, setSelectedModel] = useState("");
  const [showAiKey, setShowAiKey] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [deletingAi, setDeletingAi] = useState(false);

  const fetchAiConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/settings");
      if (!res.ok) {
        throw new Error("Failed to load AI settings");
      }

      const data = (await res.json()) as AiConfigData;
      setAiConfig(data);
      setSelectedProvider(data.provider);
      setSelectedModel(data.modelId || "");
    } catch (error) {
      console.error(error);
      toast.error("Unable to load AI settings");
    }
  }, []);

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await fetch("/api/workspace");
      if (!res.ok) {
        throw new Error("Failed to load workspace");
      }

      const data = (await res.json()) as WorkspaceData;
      setWorkspace(data);
      setNewName(data.name);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load workspace");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspace();
    fetchAiConfig();
  }, [fetchWorkspace, fetchAiConfig]);

  const selectedProviderConfig = aiConfig?.providers.find(
    (provider) => provider.value === selectedProvider,
  );
  const canManageAi = aiConfig?.canManage ?? false;
  const usagePercent =
    aiConfig && typeof aiConfig.usage.limit === "number" && aiConfig.usage.limit > 0
      ? Math.min(100, (aiConfig.usage.count / aiConfig.usage.limit) * 100)
      : 0;

  async function handleSaveName() {
    if (!newName.trim() || newName.trim() === workspace?.name) {
      setEditingName(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to update workspace name" }));
        throw new Error(data.error || "Failed to update workspace name");
      }

      toast.success("Workspace name updated");
      await fetchWorkspace();
      setEditingName(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAi() {
    if (!canManageAi) {
      toast.error("Only workspace admins can update AI settings");
      return;
    }

    setSavingAi(true);
    try {
      const res = await fetch("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          modelId: selectedModel,
          apiKey: aiKey || undefined,
        }),
      });

      const data = await res.json().catch(() => ({ error: "Failed to update settings" }));
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      toast.success("AI configuration updated");
      setAiKey("");
      await fetchAiConfig();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update settings");
    } finally {
      setSavingAi(false);
    }
  }

  async function handleResetAi() {
    if (!canManageAi) {
      toast.error("Only workspace admins can reset AI settings");
      return;
    }

    if (!confirm("Revert the AI provider, model, and key back to platform defaults?")) {
      return;
    }

    setDeletingAi(true);
    try {
      const res = await fetch("/api/ai/settings", { method: "DELETE" });
      const data = await res.json().catch(() => ({ error: "Failed to reset settings" }));
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset settings");
      }

      toast.success("AI settings reverted to defaults");
      setAiKey("");
      await fetchAiConfig();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset settings");
    } finally {
      setDeletingAi(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="size-6 animate-spin text-[#635BFF]" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex h-full max-w-3xl flex-col gap-6 overflow-y-auto p-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-xl font-bold tracking-tight text-[#0A2540]">Settings</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Manage your account, workspace, and AI configuration.
          </p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="border-[#E3E8EF] bg-white shadow-none">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="flex items-center gap-2 text-[13px] font-semibold text-[#0A2540]">
                <User className="size-4 text-[#635BFF]" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[#635BFF] to-[#4F46E5] text-lg font-bold text-white">
                  {(session?.user?.name || session?.user?.email || "U")
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold text-[#0A2540]">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <Mail className="size-3" />
                    {session?.user?.email}
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-1.5 text-[10px] font-semibold ${ROLE_COLORS[session?.user?.role || "MEMBER"]}`}
                  >
                    {session?.user?.role || "MEMBER"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Card className="border-[#E3E8EF] bg-white shadow-none">
            <CardHeader className="px-5 pb-3 pt-5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[13px] font-semibold text-[#0A2540]">
                  <Building2 className="size-4 text-[#635BFF]" />
                  Workspace
                </CardTitle>
                <Badge
                  variant="outline"
                  className="border-[#635BFF]/20 bg-[#635BFF]/5 text-[10px] font-semibold text-[#635BFF]"
                >
                  {workspace?.tier || "FREE"} plan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-5 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Workspace name
                  </p>
                  {editingName ? (
                    <div className="mt-1.5 flex items-center gap-2">
                      <Input
                        value={newName}
                        onChange={(event) => setNewName(event.target.value)}
                        className="h-8 w-56 border-[#E3E8EF] bg-[#F6F9FC] text-[13px] focus-visible:ring-[#635BFF]/30"
                        autoFocus
                        onKeyDown={(event) => {
                          if (event.key === "Enter") handleSaveName();
                          if (event.key === "Escape") setEditingName(false);
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-8 bg-[#635BFF] text-[12px] text-white hover:bg-[#4F46E5]"
                        onClick={handleSaveName}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-0.5 text-[14px] font-medium text-[#0A2540]">{workspace?.name}</p>
                  )}
                </div>
                {!editingName && (session?.user?.role === "OWNER" || session?.user?.role === "ADMIN") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-muted-foreground"
                    onClick={() => setEditingName(true)}
                  >
                    <Pencil className="mr-1 size-3" />
                    Edit
                  </Button>
                )}
              </div>

              <Separator className="bg-[#F6F9FC]" />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Contracts
                  </p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-[#0A2540]">
                    {workspace?._count?.contracts ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Members
                  </p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-[#0A2540]">
                    {workspace?.users?.length ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Created
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-[#0A2540]">
                    {workspace?.createdAt
                      ? new Date(workspace.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <Card className="border-[#E3E8EF] bg-white shadow-none">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="flex items-center gap-2 text-[13px] font-semibold text-[#0A2540]">
                <Users className="size-4 text-[#635BFF]" />
                Team members
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex flex-col gap-2">
                {workspace?.users?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg border border-[#E3E8EF] p-3 transition-colors duration-150 hover:bg-[#F6F9FC]"
                  >
                    <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#635BFF]/80 to-[#4F46E5]/80 text-[11px] font-bold text-white">
                      {(member.name || member.email)
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#0A2540]">
                        {member.name || member.email}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`flex-shrink-0 text-[10px] font-semibold ${ROLE_COLORS[member.role]}`}
                    >
                      {member.role === "OWNER" && <Crown className="mr-1 size-2.5" />}
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <Card className="border-[#E3E8EF] bg-white shadow-none">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="flex items-center gap-2 text-[13px] font-semibold text-[#0A2540]">
                <Shield className="size-4 text-[#635BFF]" />
                Billing & Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-center justify-between rounded-xl border border-[#635BFF]/10 bg-gradient-to-r from-[#635BFF]/5 to-transparent p-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#0A2540]">
                    {workspace?.tier === "PRO"
                      ? "Pro Plan"
                      : workspace?.tier === "ENTERPRISE"
                        ? "Enterprise Plan"
                        : "Free Plan"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {workspace?.tier === "FREE"
                      ? "Upgrade to unlock all DORA compliance features"
                      : "All features unlocked"}
                  </p>
                </div>
                {workspace?.tier === "FREE" && (
                  <Button
                    size="sm"
                    className="btn-lift h-8 bg-[#635BFF] text-[12px] text-white hover:bg-[#4F46E5]"
                    onClick={() => {
                      window.location.href = "/pricing";
                    }}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <Card className="border-[#E3E8EF] bg-white shadow-none">
            <CardHeader className="px-5 pb-3 pt-5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[13px] font-semibold text-[#0A2540]">
                  <Sparkles className="size-4 text-[#635BFF]" />
                  AI Intelligence
                </CardTitle>
                {aiConfig?.usage && (
                  <Badge variant="outline" className="bg-[#F6F9FC] text-[10px] font-bold py-0">
                    {aiConfig.usage.count} / {aiConfig.usage.limit} usage
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 px-5 pb-5">
              <div className="grid grid-cols-2 gap-4 pb-2">
                <div className="rounded-xl border border-[#E3E8EF] bg-[#F6F9FC]/50 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Daily Usage
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className="text-xl font-bold text-[#0A2540]">{aiConfig?.usage.count ?? 0}</span>
                    <span className="mb-1 text-[12px] text-muted-foreground">
                      / {aiConfig?.usage.limit ?? "..."} requests
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E3E8EF]">
                    <div
                      className="h-full bg-[#635BFF] transition-all duration-500"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-[#E3E8EF] bg-[#F6F9FC]/50 p-3">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Remaining
                  </p>
                  <p className="text-xl font-bold text-[#0A2540]">{aiConfig?.usage.remaining ?? "-"}</p>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Last reset:{" "}
                    {aiConfig?.usage.lastReset
                      ? new Date(aiConfig.usage.lastReset).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>
              </div>

              <Separator className="bg-[#F6F9FC]" />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Provider
                  </label>
                  <select
                    value={selectedProvider}
                    onChange={(event) => {
                      const provider = event.target.value;
                      setSelectedProvider(provider);
                      const providerConfig = aiConfig?.providers.find((item) => item.value === provider);
                      if (providerConfig && !selectedModel) {
                        setSelectedModel(providerConfig.defaultModel);
                      }
                    }}
                    disabled={!canManageAi}
                    className="h-9 rounded-lg border border-[#E3E8EF] bg-[#F6F9FC] px-3 text-[13px] outline-none transition-all focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {aiConfig?.providers.map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                  {selectedProviderConfig && (
                    <p className="text-[11px] text-muted-foreground">
                      Default model: <span className="font-mono">{selectedProviderConfig.defaultModel}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Model ID
                  </label>
                  <Input
                    placeholder={selectedProviderConfig?.defaultModel || "Enter a model ID"}
                    value={selectedModel}
                    onChange={(event) => setSelectedModel(event.target.value)}
                    disabled={!canManageAi}
                    className="h-9 border-[#E3E8EF] bg-[#F6F9FC] text-[13px]"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#E3E8EF] bg-white p-4">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="size-4 text-[#635BFF]" />
                    <span className="text-[13px] font-bold text-[#0A2540]">Custom API Key</span>
                  </div>
                  {aiConfig?.hasCustomKey && (
                    <Badge
                      variant="outline"
                      className="border-emerald-100 bg-emerald-50 text-[10px] font-bold text-emerald-600"
                    >
                      Active
                    </Badge>
                  )}
                </div>

                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {selectedProviderConfig?.usesPlatformKeyByDefault
                    ? "Platform defaults work for Gemini if the server key is configured. Add your own key for dedicated throughput."
                    : "This provider needs either a workspace key here or the matching server environment variable."}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showAiKey ? "text" : "password"}
                      value={aiKey}
                      onChange={(event) => setAiKey(event.target.value)}
                      placeholder={aiConfig?.maskedKey || "Paste your secret key..."}
                      disabled={!canManageAi}
                      className="h-9 border-[#E3E8EF] bg-[#F6F9FC] pr-9 font-mono text-[13px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAiKey((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#0A2540]"
                    >
                      {showAiKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                  <Button
                    size="sm"
                    className="h-9 rounded-lg bg-[#111827] px-4 text-[12px] font-bold text-white shadow-sm hover:bg-black"
                    disabled={savingAi || !canManageAi}
                    onClick={handleSaveAi}
                  >
                    {savingAi ? <Loader2 className="size-3 animate-spin" /> : "Save"}
                  </Button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <p className="text-[11px] text-muted-foreground">
                    Current provider: {aiConfig?.providerLabel || "Not configured"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={handleResetAi}
                    disabled={deletingAi || !canManageAi}
                  >
                    {deletingAi ? <Loader2 className="size-3 animate-spin" /> : "Revert to defaults"}
                  </Button>
                </div>

                {!canManageAi && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Only owners and admins can change AI settings.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={6}
          transition={{ ease: EASE_OUT_EXPO }}
        >
          <Card className="border-red-200/50 bg-white shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-[#0A2540]">Sign out</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    Sign out of your account on this device.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-red-200 text-[12px] text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-1.5 size-3" />
                  Sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
