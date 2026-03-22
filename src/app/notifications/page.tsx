"use client";

import { AppShell } from "@/components/app-shell";
import { Bell, CheckCircle2, AlertCircle, Info, MoreVertical, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  createdAt: Date;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Critical Vulnerability Detected",
    message: "A high-severity CVE (CVE-2026-1234) has been identified in the central cloud storage service.",
    type: "error",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
  },
  {
    id: "2",
    title: "New Policy Uploaded",
    message: "The 2026 ICT Risk Management Policy has been uploaded and is ready for review.",
    type: "success",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: false,
  },
  {
    id: "3",
    title: "Resilience Test Scheduled",
    message: "Annual penetration test for core banking systems scheduled for next week.",
    type: "info",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
  },
  {
    id: "4",
    title: "Vendor Risk Assessment Overdue",
    message: "Cloud Provider X assessment is 3 days overdue. Compliance score at risk.",
    type: "warning",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    isRead: false,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return <CheckCircle2 className="size-4 text-emerald-500" />;
      case "error": return <AlertCircle className="size-4 text-red-500" />;
      case "warning": return <AlertCircle className="size-4 text-amber-500" />;
      default: return <Info className="size-4 text-blue-500" />;
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full bg-[#F9FBFC] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-[#E3E8EF] bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-[#111827]">Notification Center</h1>
              <p className="text-sm text-[#475467]">Stay updated on compliance alerts and system events.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-4 text-[#344054] border-[#D0D5DD] font-medium"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
              <Button 
                className="h-9 px-4 bg-[#635BFF] hover:bg-[#5249E0] text-white font-medium shadow-sm"
              >
                Settings
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1 border-b border-[#E3E8EF] w-fit">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                filter === "all" 
                  ? "border-[#635BFF] text-[#635BFF]" 
                  : "border-transparent text-[#475467] hover:text-[#111827]"
              )}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                filter === "unread" 
                  ? "border-[#635BFF] text-[#635BFF]" 
                  : "border-transparent text-[#475467] hover:text-[#111827]"
              )}
            >
              Unread
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#EFF0FE] text-[#635BFF] text-[10px]">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "group relative flex gap-4 p-4 rounded-xl border transition-all duration-200",
                    notification.isRead 
                      ? "bg-white border-[#E3E8EF] opacity-80" 
                      : "bg-white border-[#EFF0FE] shadow-sm ring-1 ring-[#635BFF]/5"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={cn(
                    "flex-shrink-0 size-10 rounded-lg flex items-center justify-center",
                    notification.type === "error" ? "bg-red-50" :
                    notification.type === "warning" ? "bg-amber-50" :
                    notification.type === "success" ? "bg-emerald-50" : "bg-blue-50"
                  )}>
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={cn(
                        "text-sm font-semibold truncate",
                        notification.isRead ? "text-[#475467]" : "text-[#111827]"
                      )}>
                        {notification.title}
                      </h3>
                      <span className="text-[11px] text-[#667085] flex-shrink-0">
                        {formatDistanceToNow(notification.createdAt)} ago
                      </span>
                    </div>
                    <p className="text-sm text-[#475467] leading-relaxed mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3">
                      <button className="text-[12px] font-medium text-[#635BFF] hover:underline">
                        View details
                      </button>
                      {!notification.isRead && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-[12px] font-medium text-[#667085] hover:text-[#111827]"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>

                  {!notification.isRead && (
                    <div className="absolute top-4 right-4 size-2 rounded-full bg-[#635BFF]" />
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-16 rounded-2xl bg-white border border-[#E3E8EF] flex items-center justify-center mb-4 shadow-sm">
                  <Bell className="size-8 text-[#98A2B3]" />
                </div>
                <h3 className="text-base font-semibold text-[#111827]">All caught up!</h3>
                <p className="text-sm text-[#667085] max-w-[280px]">
                  You have no {filter === "unread" ? "unread " : ""}notifications at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
