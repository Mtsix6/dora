"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Info, Zap, Shield } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  error: <AlertCircle className="size-4 text-red-500" />,
  warning: <AlertCircle className="size-4 text-amber-500" />,
  success: <CheckCircle2 className="size-4 text-emerald-500" />,
  info: <Info className="size-4 text-blue-500" />,
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  incident: <AlertCircle className="size-4 text-red-500" />,
  contract: <Zap className="size-4 text-[#635BFF]" />,
  compliance: <Shield className="size-4 text-emerald-500" />,
  vendor: <Info className="size-4 text-blue-500" />,
};

interface DBNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export function LiveNotifications() {
  const { data: session } = useSession();
  const lastCheckedRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;

    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;

      const notifications: DBNotification[] = await res.json();
      const unread = notifications.filter((n) => !n.read);

      // On first load, just record the latest timestamp
      if (!lastCheckedRef.current) {
        lastCheckedRef.current = unread[0]?.createdAt || new Date().toISOString();
        return;
      }

      // Show toasts only for new notifications since last check
      const newNotifs = unread.filter(
        (n) => new Date(n.createdAt) > new Date(lastCheckedRef.current!),
      );

      for (const notif of newNotifs.slice(0, 3)) {
        const icon =
          CATEGORY_ICON[notif.category] || ICON_MAP[notif.type] || ICON_MAP.info;

        toast(notif.title, {
          description: notif.message,
          icon,
          duration: 5000,
          position: "top-right",
          action: notif.actionUrl
            ? {
                label: "View",
                onClick: () => {
                  window.location.href = notif.actionUrl!;
                },
              }
            : undefined,
        });
      }

      if (newNotifs.length > 0) {
        lastCheckedRef.current = newNotifs[0].createdAt;
      }
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, [session?.user]);

  useEffect(() => {
    // Initial fetch after short delay
    const timeout = setTimeout(fetchNotifications, 2000);

    // Poll every 30 seconds
    intervalRef.current = setInterval(fetchNotifications, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  return null;
}
