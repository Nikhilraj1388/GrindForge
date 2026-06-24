"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  Flame,
  LayoutDashboard,
  BookOpen,
  Users,
  Trophy,
  BarChart3,
  Rss,
  Bell,
  FolderOpen,
  Settings,
  Hammer,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/study", label: "Study", icon: BookOpen },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/challenges", label: "Challenges", icon: Trophy },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/resources", label: "Resources", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [forgeScore, setForgeScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch user stats and notification count
    fetch("/api/stats").then((r) => r.json()).then((d) => {
      setForgeScore(d.stats?.forgeScore || 0);
      setStreak(d.stats?.currentStreak || 0);
    }).catch(() => {});

    fetch("/api/notifications?unread=true&limit=1").then((r) => r.json()).then((d) => {
      setUnreadCount(d.unreadCount || 0);
    }).catch(() => {});
  }, [pathname]); // re-fetch on nav

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5">
        <Flame className="size-7 text-primary" />
        <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
          GrindForge
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const badge = item.label === "Notifications" ? unreadCount : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 h-6 w-[3px] rounded-r-full bg-primary" />
              )}
              <item.icon className="size-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
              {badge > 0 && (
                <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="border-t border-border p-3">
        <div className="rounded-xl bg-sidebar-accent p-3">
          <div className="flex items-center gap-2.5">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-9",
                },
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {user?.fullName || user?.username || "User"}
                </p>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Forge Score & Streak */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Forge Score
              </p>
              <p className="flex items-center gap-1 text-lg font-bold text-sidebar-foreground">
                {forgeScore.toLocaleString()}
                <Flame className="size-3.5 text-primary" />
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Streak
              </p>
              <p className="flex items-center gap-1 text-lg font-bold text-sidebar-foreground">
                {streak} days
                <span className="text-sm">{streak > 0 ? "🔥" : ""}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Start Forge Button */}
        <Link
          href="/study/new"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
        >
          <Hammer className="size-4" />
          Start Forge
        </Link>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          Start your study session
        </p>
      </div>
    </aside>
  );
}
