"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Bot,
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
  Trash2,
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

  // AI Provider state
  const [aiConfig, setAiConfig] = useState<{
    configured: boolean;
    maskedKey?: string | null;
    hasEnvKey?: boolean;
    status?: string;
  } | null>(null);
  const [aiKey, setAiKey] = useState("");
  const [showAiKey, setShowAiKey] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [deletingAi, setDeletingAi] = useState(false);

  const fetchAiConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/settings");
      if (res.ok) setAiConfig(await res.json());
    } catch {}
  }, []);

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await fetch("/api/workspace");
      if (res.ok) {
        const data = await res.json();
        setWorkspace(data);
        setNewName(data.name);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspace();
    fetchAiConfig();
  }, [fetchWorkspace, fetchAiConfig]);

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
      if (res.ok) {
        toast.success("Workspace name updated");
        await fetchWorkspace();
        setEditingName(false);
      } else {
        toast.error("Failed to update workspace name");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="size-6 text-[#635BFF] animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full max-w-3xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">Settings</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Manage your account and workspace
          </p>
        </motion.div>

        {/* Profile Section */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <Card className="border-[#E3E8EF] shadow-none bg-white">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-[13px] font-semibold text-[#0A2540] flex items-center gap-2">
                <User className="size-4 text-[#635BFF]" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-full bg-gradient-to-br from-[#635BFF] to-[#4F46E5] flex items-center justify-center text-white text-lg font-bold">
                  {(session?.user?.name || session?.user?.email || "U")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold text-[#0A2540]">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
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

        {/* Workspace Section */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <Card className="border-[#E3E8EF] shadow-none bg-white">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[13px] font-semibold text-[#0A2540] flex items-center gap-2">
                  <Building2 className="size-4 text-[#635BFF]" />
                  Workspace
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold bg-[#635BFF]/5 text-[#635BFF] border-[#635BFF]/20"
                >
                  {workspace?.tier || "FREE"} plan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-4">
              {/* Workspace Name */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Workspace name
                  </p>
                  {editingName ? (
                    <div className="flex items-center gap-2 mt-1.5">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-8 text-[13px] w-56 border-[#E3E8EF] bg-[#F6F9FC] focus-visible:ring-[#635BFF]/30"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") setEditingName(false);
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white"
                        onClick={handleSaveName}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[14px] font-medium text-[#0A2540] mt-0.5">
                      {workspace?.name}
                    </p>
                  )}
                </div>
                {!editingName && (session?.user?.role === "OWNER" || session?.user?.role === "ADMIN") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-muted-foreground"
                    onClick={() => setEditingName(true)}
                  >
                    <Pencil className="size-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              <Separator className="bg-[#F6F9FC]" />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Contracts
                  </p>
                  <p className="text-lg font-bold text-[#0A2540] tabular-nums mt-0.5">
                    {workspace?._count?.contracts ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Members
                  </p>
                  <p className="text-lg font-bold text-[#0A2540] tabular-nums mt-0.5">
                    {workspace?.users?.length ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Created
                  </p>
                  <p className="text-[13px] font-medium text-[#0A2540] mt-1">
                    {workspace?.createdAt
                      ? new Date(workspace.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Members */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <Card className="border-[#E3E8EF] shadow-none bg-white">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-[13px] font-semibold text-[#0A2540] flex items-center gap-2">
                <Users className="size-4 text-[#635BFF]" />
                Team members
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex flex-col gap-2">
                {workspace?.users?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#E3E8EF] hover:bg-[#F6F9FC] transition-colors duration-150"
                  >
                    <div className="size-8 rounded-full bg-gradient-to-br from-[#635BFF]/80 to-[#4F46E5]/80 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                      {(member.name || member.email)
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#0A2540] truncate">
                        {member.name || member.email}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold flex-shrink-0 ${ROLE_COLORS[member.role]}`}
                    >
                      {member.role === "OWNER" && <Crown className="size-2.5 mr-1" />}
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Billing */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <Card className="border-[#E3E8EF] shadow-none bg-white">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-[13px] font-semibold text-[#0A2540] flex items-center gap-2">
                <Shield className="size-4 text-[#635BFF]" />
                Billing & Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#635BFF]/5 to-transparent border border-[#635BFF]/10">
                <div>
                  <p className="text-[14px] font-semibold text-[#0A2540]">
                    {workspace?.tier === "PRO"
                      ? "Pro Plan"
                      : workspace?.tier === "ENTERPRISE"
                        ? "Enterprise Plan"
                        : "Free Plan"}
                  </p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {workspace?.tier === "FREE"
                      ? "Upgrade to unlock all DORA compliance features"
                      : "All features unlocked"}
                  </p>
                </div>
                {workspace?.tier === "FREE" && (
                  <Button
                    size="sm"
                    className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white btn-lift"
                    onClick={() => (window.location.href = "/pricing")}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Provider */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <Card className="border-[#E3E8EF] shadow-none bg-white">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-[13px] font-semibold text-[#0A2540] flex items-center gap-2">
                <Sparkles className="size-4 text-[#635BFF]" />
                AI Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-4">
              <p className="text-[12px] text-muted-foreground">
                Configure the AI provider for DORA Copilot and contract extraction.
                {aiConfig?.hasEnvKey && (
                  <span className="ml-1 text-emerald-600 font-medium">
                    Server environment key detected.
                  </span>
                )}
              </p>

              {aiConfig?.configured && aiConfig.maskedKey && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
                  <Key className="size-4 text-emerald-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-emerald-800">Active API Key</p>
                    <p className="text-[11px] text-emerald-700 font-mono truncate">{aiConfig.maskedKey}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={deletingAi}
                    onClick={async () => {
                      setDeletingAi(true);
                      try {
                        const res = await fetch("/api/ai/settings", { method: "DELETE" });
                        if (res.ok) {
                          toast.success("AI provider key removed");
                          fetchAiConfig();
                        } else {
                          toast.error("Failed to remove key");
                        }
                      } catch {
                        toast.error("Something went wrong");
                      } finally {
                        setDeletingAi(false);
                      }
                    }}
                  >
                    {deletingAi ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3 mr-1" />}
                    Remove
                  </Button>
                </div>
              )}

              {(session?.user?.role === "OWNER" || session?.user?.role === "ADMIN") && (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Anthropic API Key
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showAiKey ? "text" : "password"}
                        value={aiKey}
                        onChange={(e) => setAiKey(e.target.value)}
                        placeholder="sk-ant-api03-..."
                        className="h-8 text-[13px] pr-8 border-[#E3E8EF] bg-[#F6F9FC] focus-visible:ring-[#635BFF]/30 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAiKey(!showAiKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0A2540]"
                      >
                        {showAiKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                    <Button
                      size="sm"
                      className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white"
                      disabled={!aiKey.trim() || savingAi}
                      onClick={async () => {
                        setSavingAi(true);
                        try {
                          const res = await fetch("/api/ai/settings", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ apiKey: aiKey }),
                          });
                          if (res.ok) {
                            toast.success("API key validated and saved");
                            setAiKey("");
                            fetchAiConfig();
                          } else {
                            const data = await res.json();
                            toast.error(data.error || "Failed to save key");
                          }
                        } catch {
                          toast.error("Something went wrong");
                        } finally {
                          setSavingAi(false);
                        }
                      }}
                    >
                      {savingAi ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                      <span className="ml-1">Save</span>
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    The key is validated on save and stored encrypted. Used by DORA Copilot and extraction.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
          <Card className="border-red-200/50 shadow-none bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-[#0A2540]">Sign out</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[12px] border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="size-3 mr-1.5" />
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
