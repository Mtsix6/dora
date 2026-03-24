"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Bell,
  Building2,
  Check,
  CreditCard,
  Crown,
  Database,
  Download,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Pencil,
  Plus,
  Shield,
  Sparkles,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EASE_OUT_EXPO, fadeUp, tabContent } from "@/lib/motion";

/* ── Types ──────────────────────────────────────────────────────────── */

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

interface NotificationPrefs {
  email: boolean;
  inApp: boolean;
  weeklyDigest: boolean;
  incidents: boolean;
  extractions: boolean;
}

/* ── Constants ──────────────────────────────────────────────────────── */

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20",
  ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
  MEMBER: "bg-slate-50 text-slate-600 border-slate-200",
};

type TabId =
  | "profile"
  | "workspace"
  | "team"
  | "billing"
  | "ai"
  | "security"
  | "notifications"
  | "data";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: "profile", label: "Profile", icon: <User className="size-4" /> },
  {
    id: "workspace",
    label: "Workspace",
    icon: <Building2 className="size-4" />,
  },
  { id: "team", label: "Team", icon: <Users className="size-4" /> },
  { id: "billing", label: "Billing", icon: <CreditCard className="size-4" /> },
  {
    id: "ai",
    label: "AI Configuration",
    icon: <Sparkles className="size-4" />,
  },
  { id: "security", label: "Security", icon: <Lock className="size-4" /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="size-4" />,
  },
  {
    id: "data",
    label: "Data & Export",
    icon: <Database className="size-4" />,
  },
];

function getInitials(name?: string | null, email?: string | null): string {
  const source = name || email || "U";
  return source
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ── Profile Section ────────────────────────────────────────────────── */

function ProfileSection({
  session,
  workspace,
  fetchWorkspace,
}: {
  session: ReturnType<typeof useSession>["data"];
  workspace: WorkspaceData | null;
  fetchWorkspace: () => Promise<void>;
}) {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);

  const currentUser = workspace?.users?.find(
    (u) => u.email === session?.user?.email,
  );

  async function handleSaveProfileName() {
    if (!newName.trim()) {
      setEditingName(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Failed to update name" }));
        throw new Error(data.error || "Failed to update name");
      }
      toast.success("Profile name updated");
      setEditingName(false);
      await fetchWorkspace();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-[#0A2540]">Profile</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Manage your personal account details.
        </p>
      </div>

      <Card className="border-[#E3E8EF] bg-white shadow-none">
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="flex size-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#635BFF] to-[#4F46E5] text-xl font-bold text-white">
              {getInitials(session?.user?.name, session?.user?.email)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-9 w-64 border-[#E3E8EF] bg-[#F6F9FC] text-[14px] focus-visible:ring-[#635BFF]/30"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveProfileName();
                        if (e.key === "Escape") setEditingName(false);
                      }}
                    />
                    <Button
                      size="sm"
                      className="h-9 bg-[#635BFF] text-[12px] text-white hover:bg-[#4F46E5]"
                      onClick={handleSaveProfileName}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Check className="size-3" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <Fragment>
                    <p className="text-[16px] font-semibold text-[#0A2540]">
                      {session?.user?.name || "User"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] text-muted-foreground"
                      onClick={() => {
                        setNewName(session?.user?.name || "");
                        setEditingName(true);
                      }}
                    >
                      <Pencil className="mr-1 size-3" />
                      Edit
                    </Button>
                  </Fragment>
                )}
              </div>

              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Mail className="size-3" />
                {session?.user?.email}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold ${ROLE_COLORS[session?.user?.role || "MEMBER"]}`}
                >
                  {session?.user?.role || "MEMBER"}
                </Badge>
                {currentUser?.createdAt && (
                  <span className="text-[11px] text-muted-foreground">
                    Joined{" "}
                    {new Date(currentUser.createdAt).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200/50 bg-white shadow-none">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#0A2540]">
                Sign out
              </p>
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
    </div>
  );
}

/* ── Workspace Section ──────────────────────────────────────────────── */

function WorkspaceSection({
  session,
  workspace,
  fetchWorkspace,
}: {
  session: ReturnType<typeof useSession>["data"];
  workspace: WorkspaceData | null;
  fetchWorkspace: () => Promise<void>;
}) {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(workspace?.name || "");
  const [saving, setSaving] = useState(false);

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
        const data = await res
          .json()
          .catch(() => ({ error: "Failed to update workspace name" }));
        throw new Error(data.error || "Failed to update workspace name");
      }
      toast.success("Workspace name updated");
      await fetchWorkspace();
      setEditingName(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-[#0A2540]">Workspace</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Configure your workspace settings and view usage.
        </p>
      </div>

      <Card className="border-[#E3E8EF] bg-white shadow-none">
        <CardHeader className="px-6 pb-3 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[13px] font-semibold text-[#0A2540]">
              Workspace details
            </CardTitle>
            <Badge
              variant="outline"
              className="border-[#635BFF]/20 bg-[#635BFF]/5 text-[10px] font-semibold text-[#635BFF]"
            >
              {workspace?.tier || "FREE"} plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 px-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Workspace name
              </p>
              {editingName ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-8 w-56 border-[#E3E8EF] bg-[#F6F9FC] text-[13px] focus-visible:ring-[#635BFF]/30"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                  />
                  <Button
                    size="sm"
                    className="h-8 bg-[#635BFF] text-[12px] text-white hover:bg-[#4F46E5]"
                    onClick={handleSaveName}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Check className="size-3" />
                    )}
                  </Button>
                </div>
              ) : (
                <p className="mt-0.5 text-[14px] font-medium text-[#0A2540]">
                  {workspace?.name}
                </p>
              )}
            </div>
            {!editingName &&
              (session?.user?.role === "OWNER" ||
                session?.user?.role === "ADMIN") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] text-muted-foreground"
                  onClick={() => {
                    setNewName(workspace?.name || "");
                    setEditingName(true);
                  }}
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
    </div>
  );
}

/* ── Team Section ───────────────────────────────────────────────────── */

function TeamSection({ workspace, fetchWorkspace }: { workspace: WorkspaceData | null; fetchWorkspace: () => Promise<void> }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Failed to send invite" }));
        throw new Error(data.error || "Failed to send invite");
      }
      toast.success(`Invitation sent to ${inviteEmail.trim()}`);
      setInviteEmail("");
      setInviteOpen(false);
      await fetchWorkspace();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send invite",
      );
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0A2540]">Team</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Manage team members and invitations.
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                className="h-8 bg-[#635BFF] text-[12px] text-white hover:bg-[#4F46E5]"
              >
                <UserPlus className="mr-1.5 size-3" />
                Invite member
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a team member</DialogTitle>
              <DialogDescription>
                Send an invitation email to add a new member to your workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-2">
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="border-[#E3E8EF] bg-[#F6F9FC] text-[13px] focus-visible:ring-[#635BFF]/30"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInvite();
                }}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                size="sm"
                className="bg-[#635BFF] text-white hover:bg-[#4F46E5]"
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
              >
                {inviting ? (
                  <Loader2 className="mr-1.5 size-3 animate-spin" />
                ) : (
                  <Mail className="mr-1.5 size-3" />
                )}
                Send invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-[#E3E8EF] bg-white shadow-none">
        <CardContent className="p-6">
          <div className="flex flex-col gap-2">
            {workspace?.users?.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg border border-[#E3E8EF] p-3 transition-colors duration-150 hover:bg-[#F6F9FC]"
              >
                <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#635BFF]/80 to-[#4F46E5]/80 text-[11px] font-bold text-white">
                  {getInitials(member.name, member.email)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#0A2540]">
                    {member.name || member.email}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`flex-shrink-0 text-[10px] font-semibold ${ROLE_COLORS[member.role]}`}
                >
                  {member.role === "OWNER" && (
                    <Crown className="mr-1 size-2.5" />
                  )}
                  {member.role}
                </Badge>
              </div>
            ))}
            {(!workspace?.users || workspace.users.length === 0) && (
              <p className="py-8 text-center text-[13px] text-muted-foreground">
                No team members found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Billing Section ────────────────────────────────────────────────── */

function BillingSection({ workspace }: { workspace: WorkspaceData | null }) {
  const [loadingPortal, setLoadingPortal] = useState(false);

  async function handleManageSubscription() {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Failed to open billing portal" }));
        throw new Error(data.error || "Failed to open billing portal");
      }
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to open billing portal",
      );
    } finally {
      setLoadingPortal(false);
    }
  }

  const planName =
    workspace?.tier === "PRO"
      ? "Pro Plan"
      : workspace?.tier === "ENTERPRISE"
        ? "Enterprise Plan"
        : "Free Plan";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-[#0A2540]">Billing</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      <Card className="border-[#E3E8EF] bg-white shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between rounded-xl border border-[#635BFF]/10 bg-gradient-to-r from-[#635BFF]/5 to-transparent p-5">
            <div>
              <p className="text-[15px] font-semibold text-[#0A2540]">
                {planName}
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {workspace?.tier === "FREE"
                  ? "Upgrade to unlock all DORA compliance features"
                  : "All features unlocked"}
              </p>
            </div>
            <div className="flex items-center gap-2">
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
          </div>

          {workspace?.tier !== "FREE" && (
            <Fragment>
              <Separator className="my-5 bg-[#F6F9FC]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-[#0A2540]">
                    Manage subscription
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    Update payment method, view invoices, or cancel your plan
                    via Stripe.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-[#E3E8EF] text-[12px]"
                  onClick={handleManageSubscription}
                  disabled={loadingPortal}
                >
                  {loadingPortal ? (
                    <Loader2 className="mr-1.5 size-3 animate-spin" />
                  ) : (
                    <CreditCard className="mr-1.5 size-3" />
                  )}
                  Manage
                </Button>
              </div>
            </Fragment>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── AI Configuration Section ───────────────────────────────────────── */

function AiSection() {
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
      if (!res.ok) throw new Error("Failed to load AI settings");
      const data = (await res.json()) as AiConfigData;
      setAiConfig(data);
      setSelectedProvider(data.provider);
      setSelectedModel(data.modelId || "");
    } catch (error) {
      console.error(error);
      toast.error("Unable to load AI settings");
    }
  }, []);

  useEffect(() => {
    fetchAiConfig();
  }, [fetchAiConfig]);

  const selectedProviderConfig = aiConfig?.providers.find(
    (provider) => provider.value === selectedProvider,
  );
  const canManageAi = aiConfig?.canManage ?? false;
  const usagePercent =
    aiConfig &&
    typeof aiConfig.usage.limit === "number" &&
    aiConfig.usage.limit > 0
      ? Math.min(100, (aiConfig.usage.count / aiConfig.usage.limit) * 100)
      : 0;

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
      const data = await res
        .json()
        .catch(() => ({ error: "Failed to update settings" }));
      if (!res.ok)
        throw new Error(data.error || "Failed to update settings");
      toast.success("AI configuration updated");
      setAiKey("");
      await fetchAiConfig();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update settings",
      );
    } finally {
      setSavingAi(false);
    }
  }

  async function handleResetAi() {
    if (!canManageAi) {
      toast.error("Only workspace admins can reset AI settings");
      return;
    }
    if (
      !confirm(
        "Revert the AI provider, model, and key back to platform defaults?",
      )
    )
      return;
    setDeletingAi(true);
    try {
      const res = await fetch("/api/ai/settings", { method: "DELETE" });
      const data = await res
        .json()
        .catch(() => ({ error: "Failed to reset settings" }));
      if (!res.ok)
        throw new Error(data.error || "Failed to reset settings");
      toast.success("AI settings reverted to defaults");
      setAiKey("");
      await fetchAiConfig();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset settings",
      );
    } finally {
      setDeletingAi(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-[#0A2540]">AI Configuration</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Configure the AI provider, model, and API key for contract extraction.
        </p>
      </div>

      {/* Usage stats */}
      <Card className="border-[#E3E8EF] bg-white shadow-none">
        <CardHeader className="px-6 pb-3 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[13px] font-semibold text-[#0A2540]">
              <Sparkles className="size-4 text-[#635BFF]" />
              Usage
            </CardTitle>
            {aiConfig?.usage && (
              <Badge
                variant="outline"
                className="bg-[#F6F9FC] py-0 text-[10px] font-bold"
              >
                {aiConfig.usage.count} / {aiConfig.usage.limit} usage
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#E3E8EF] bg-[#F6F9FC]/50 p-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Daily Usage
              </p>
              <div className="flex items-end gap-1.5">
                <span className="text-xl font-bold text-[#0A2540]">
                  {aiConfig?.usage.count ?? 0}
                </span>
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
              <p className="text-xl font-bold text-[#0A2540]">
                {aiConfig?.usage.remaining ?? "-"}
              </p>
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
        </CardContent>
      </Card>

      {/* Provider & Model */}
      <Card className="border-[#E3E8EF] bg-white shadow-none">
        <CardHeader className="px-6 pb-3 pt-6">
          <CardTitle className="text-[13px] font-semibold text-[#0A2540]">
            Provider & Model
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 px-6 pb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                AI Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => {
                  const provider = e.target.value;
                  setSelectedProvider(provider);
                  const providerConfig = aiConfig?.providers.find(
                    (item) => item.value === provider,
                  );
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
                  Default model:{" "}
                  <span className="font-mono">
                    {selectedProviderConfig.defaultModel}
                  </span>
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Model ID
              </label>
              <Input
                placeholder={
                  selectedProviderConfig?.defaultModel || "Enter a model ID"
                }
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!canManageAi}
                className="h-9 border-[#E3E8EF] bg-[#F6F9FC] text-[13px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom API Key */}
      <Card className="border-[#E3E8EF] bg-white shadow-none">
        <CardHeader className="px-6 pb-3 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[13px] font-semibold text-[#0A2540]">
              <Key className="size-4 text-[#635BFF]" />
              Custom API Key
            </CardTitle>
            {aiConfig?.hasCustomKey && (
              <Badge
                variant="outline"
                className="border-emerald-100 bg-emerald-50 text-[10px] font-bold text-emerald-600"
              >
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-6 pb-6">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {selectedProviderConfig?.usesPlatformKeyByDefault
              ? "Platform defaults work for Gemini if the server key is configured. Add your own key for dedicated throughput."
              : "This provider needs either a workspace key here or the matching server environment variable."}
          </p>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type={showAiKey ? "text" : "password"}
                value={aiKey}
                onChange={(e) => setAiKey(e.target.value)}
                placeholder={aiConfig?.maskedKey || "Paste your secret key..."}
                disabled={!canManageAi}
                className="h-9 border-[#E3E8EF] bg-[#F6F9FC] pr-9 font-mono text-[13px]"
              />
              <button
                type="button"
                onClick={() => setShowAiKey((c) => !c)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#0A2540]"
              >
                {showAiKey ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
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

          <div className="flex items-center justify-between gap-4">
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
              {deletingAi ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                "Revert to defaults"
              )}
            </Button>
          </div>

          {!canManageAi && (
            <p className="text-[11px] text-muted-foreground">
              Only owners and admins can change AI settings.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Security Section ───────────────────────────────────────────────── */

function SecuritySection({
  session,
}: {
  session: ReturnType<typeof useSession>["data"];
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Failed to change password" }));
        throw new Error(data.error || "Failed to change password");
      }
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-[#0A2540]">Security</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Update your password and manage account security.
        </p>
      </div>

      <Card className="border-[#E3E8EF] bg-white shadow-none">
        <CardHeader className="px-6 pb-3 pt-6">
          <CardTitle className="flex items-center gap-2 text-[13px] font-semibold text-[#0A2540]">
            <Shield className="size-4 text-[#635BFF]" />
            Change password
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-6 pb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Current password
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="h-9 border-[#E3E8EF] bg-[#F6F9FC] pr-9 text-[13px] focus-visible:ring-[#635BFF]/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((c) => !c)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#0A2540]"
              >
                {showCurrent ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              New password
            </label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                className="h-9 border-[#E3E8EF] bg-[#F6F9FC] pr-9 text-[13px] focus-visible:ring-[#635BFF]/30"
              />
              <button
                type="button"
                onClick={() => setShowNew((c) => !c)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#0A2540]"
              >
                {showNew ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm new password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="h-9 border-[#E3E8EF] bg-[#F6F9FC] text-[13px] focus-visible:ring-[#635BFF]/30"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleChangePassword();
              }}
            />
          </div>

          <Button
            size="sm"
            className="mt-1 w-fit bg-[#635BFF] text-[12px] text-white hover:bg-[#4F46E5]"
            onClick={handleChangePassword}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-1.5 size-3 animate-spin" />
            ) : (
              <Lock className="mr-1.5 size-3" />
            )}
            Update password
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[#E3E8EF] bg-white shadow-none">
        <CardHeader className="px-6 pb-3 pt-6">
          <CardTitle className="text-[13px] font-semibold text-[#0A2540]">
            Active sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex items-center gap-3 rounded-lg border border-[#E3E8EF] bg-[#F6F9FC]/50 p-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50">
              <div className="size-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#0A2540]">
                Current session
              </p>
              <p className="text-[11px] text-muted-foreground">
                {session?.user?.email} — Active now
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-100 bg-emerald-50 text-[10px] font-bold text-emerald-600"
            >
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Notifications Section ──────────────────────────────────────────── */

function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    email: true,
    inApp: true,
    weeklyDigest: false,
    incidents: true,
    extractions: true,
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load current prefs from profile endpoint
    async function loadPrefs() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.notificationPrefs) {
            setPrefs({
              email: data.notificationPrefs.email ?? true,
              inApp: data.notificationPrefs.inApp ?? true,
              weeklyDigest: data.notificationPrefs.weeklyDigest ?? false,
              incidents: data.notificationPrefs.incidents ?? true,
              extractions: data.notificationPrefs.extractions ?? true,
            });
          }
        }
      } catch {
        // Use defaults
      } finally {
        setLoaded(true);
      }
    }
    loadPrefs();
  }, []);

  async function handleSave(updated: NotificationPrefs) {
    setPrefs(updated);
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationPrefs: updated }),
      });
      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Failed to save preferences" }));
        throw new Error(data.error || "Failed to save preferences");
      }
      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save preferences",
      );
    } finally {
      setSaving(false);
    }
  }

  function togglePref(key: keyof NotificationPrefs) {
    const updated = { ...prefs, [key]: !prefs[key] };
    handleSave(updated);
  }

  const toggleItems: {
    key: keyof NotificationPrefs;
    label: string;
    description: string;
  }[] = [
    {
      key: "email",
      label: "Email alerts",
      description: "Receive important updates via email",
    },
    {
      key: "inApp",
      label: "In-app notifications",
      description: "Show notifications within the application",
    },
    {
      key: "weeklyDigest",
      label: "Weekly digest",
      description: "Receive a weekly summary of workspace activity",
    },
    {
      key: "incidents",
      label: "Incident alerts",
      description: "Get notified about compliance incidents and issues",
    },
    {
      key: "extractions",
      label: "Extraction complete",
      description: "Notification when contract extraction finishes",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-[#0A2540]">Notifications</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Choose which notifications you want to receive.
        </p>
      </div>

      <Card className="border-[#E3E8EF] bg-white shadow-none">
        <CardContent className="p-6">
          <div className="flex flex-col gap-1">
            {toggleItems.map((item, idx) => (
              <Fragment key={item.key}>
                {idx > 0 && <Separator className="my-1 bg-[#F6F9FC]" />}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-[#0A2540]">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs[item.key]}
                    onClick={() => togglePref(item.key)}
                    disabled={saving || !loaded}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      prefs[item.key] ? "bg-[#635BFF]" : "bg-[#E3E8EF]"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        prefs[item.key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Data & Export Section ──────────────────────────────────────────── */

function DataExportSection() {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/audit-log?format=csv");
      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Failed to export data" }));
        throw new Error(data.error || "Failed to export data");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Audit log exported successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export data",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-[#0A2540]">Data & Export</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Export workspace data and manage data retention settings.
        </p>
      </div>

      <Card className="border-[#E3E8EF] bg-white shadow-none">
        <CardHeader className="px-6 pb-3 pt-6">
          <CardTitle className="flex items-center gap-2 text-[13px] font-semibold text-[#0A2540]">
            <Download className="size-4 text-[#635BFF]" />
            Export workspace data
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-6 pb-6">
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Download a complete CSV export of your workspace audit log, including
            all user actions, contract changes, and compliance events.
          </p>
          <Button
            size="sm"
            className="w-fit bg-[#635BFF] text-[12px] text-white hover:bg-[#4F46E5]"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="mr-1.5 size-3 animate-spin" />
            ) : (
              <Download className="mr-1.5 size-3" />
            )}
            Export audit log (CSV)
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[#E3E8EF] bg-white shadow-none">
        <CardHeader className="px-6 pb-3 pt-6">
          <CardTitle className="text-[13px] font-semibold text-[#0A2540]">
            Data retention
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-6 pb-6">
          <div className="rounded-lg border border-[#E3E8EF] bg-[#F6F9FC]/50 p-4">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[13px] font-semibold text-[#0A2540]">
                  Retention policy
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  All workspace data is retained for the duration of your
                  subscription. Deleted contracts are permanently removed after 30
                  days. Audit logs are retained for 7 years to meet DORA
                  regulatory requirements.
                </p>
              </div>
              <Separator className="bg-[#E3E8EF]" />
              <div>
                <p className="text-[13px] font-semibold text-[#0A2540]">
                  GDPR compliance
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  DORA RoI Automator is fully GDPR compliant. You can request a
                  full data export or account deletion at any time by contacting
                  our support team at{" "}
                  <a
                    href="mailto:privacy@dora-roi.com"
                    className="font-medium text-[#635BFF] hover:underline"
                  >
                    privacy@dora-roi.com
                  </a>
                  . Personal data processing is governed by our Data Processing
                  Agreement (DPA).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Main Settings Page ─────────────────────────────────────────────── */

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Read hash on mount and on hash changes
  useEffect(() => {
    function readHash() {
      const hash = window.location.hash.replace("#", "") as TabId;
      if (TABS.some((t) => t.id === hash)) {
        setActiveTab(hash);
      }
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await fetch("/api/workspace");
      if (!res.ok) throw new Error("Failed to load workspace");
      const data = (await res.json()) as WorkspaceData;
      setWorkspace(data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load workspace");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  function handleTabChange(tabId: TabId) {
    setActiveTab(tabId);
    window.location.hash = tabId;
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
      <div className="flex h-full overflow-hidden">
        {/* Sidebar navigation */}
        <nav className="flex w-60 flex-shrink-0 flex-col border-r border-[#E3E8EF] bg-[#F6F9FC]">
          <div className="px-5 pb-3 pt-6">
            <h1 className="text-[15px] font-bold tracking-tight text-[#0A2540]">
              Settings
            </h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Manage your account and workspace
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-white text-[#0A2540] shadow-[0_1px_3px_rgba(10,37,64,0.06)]"
                      : "text-muted-foreground hover:bg-white/60 hover:text-[#0A2540]"
                  }`}
                >
                  <span
                    className={`transition-colors duration-150 ${
                      isActive
                        ? "text-[#635BFF]"
                        : "text-muted-foreground group-hover:text-[#635BFF]/70"
                    }`}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContent}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {activeTab === "profile" && (
                  <ProfileSection
                    session={session}
                    workspace={workspace}
                    fetchWorkspace={fetchWorkspace}
                  />
                )}
                {activeTab === "workspace" && (
                  <WorkspaceSection
                    session={session}
                    workspace={workspace}
                    fetchWorkspace={fetchWorkspace}
                  />
                )}
                {activeTab === "team" && (
                  <TeamSection
                    workspace={workspace}
                    fetchWorkspace={fetchWorkspace}
                  />
                )}
                {activeTab === "billing" && (
                  <BillingSection workspace={workspace} />
                )}
                {activeTab === "ai" && <AiSection />}
                {activeTab === "security" && (
                  <SecuritySection session={session} />
                )}
                {activeTab === "notifications" && <NotificationsSection />}
                {activeTab === "data" && <DataExportSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
