"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Info, Zap } from "lucide-react";

const NOTIFICATIONS = [
  {
    title: "New Incident Reported",
    description: "Critical vulnerability detected in Azure SQL clusters.",
    type: "error",
    icon: <AlertCircle className="size-4 text-red-500" />,
  },
  {
    title: "Resilience Test Passed",
    description: "Annual penetration test for core systems has completed successfully.",
    type: "success",
    icon: <CheckCircle2 className="size-4 text-emerald-500" />,
  },
  {
    title: "New Policy Uploaded",
    description: "ICT Risk Management Policy 2026 is ready for review.",
    type: "info",
    icon: <Info className="size-4 text-blue-500" />,
  },
  {
    title: "AI Analysis Complete",
    description: "DORA AI finished extracting 52 clauses from AWS Service Agreement.",
    type: "success",
    icon: <Zap className="size-4 text-[#635BFF]" />,
  },
];

export function LiveNotifications() {
  useEffect(() => {
    // Only run in production-like simulation or if user is on dashboard
    const interval = setInterval(() => {
      const notification = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
      
      toast(notification.title, {
        description: notification.description,
        icon: notification.icon,
        duration: 5000,
        position: "top-right",
      });
    }, 45000); // Every 45 seconds to not be too annoying

    return () => clearInterval(interval);
  }, []);

  return null;
}
