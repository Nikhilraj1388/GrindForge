"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Notification = {
  id: string; title: string; message: string; type: string;
  isRead: boolean; createdAt: string;
};

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  async function fetchNotifications() {
    setLoading(true);
    const res = await fetch("/api/notifications?limit=30");
    if (res.ok) {
      const d = await res.json();
      setNotifications(d.notifications || []);
      setUnreadCount(d.unreadCount || 0);
    }
    setLoading(false);
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    fetchNotifications();
  }

  async function markRead(ids: string[]) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds: ids }),
    });
    fetchNotifications();
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <CheckCheck className="size-3.5" /> Mark all read
          </button>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="size-6 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="mx-auto size-12 text-muted-foreground/20" />
            <p className="mt-3 text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.id}
                onClick={() => !n.isRead && markRead([n.id])}
                className={cn("flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-secondary/30",
                  !n.isRead && "bg-primary/5")}>
                <div className={cn("mt-1 size-2 shrink-0 rounded-full", !n.isRead ? "bg-primary" : "bg-transparent")} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <Check className="size-4 text-muted-foreground mt-1 shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
