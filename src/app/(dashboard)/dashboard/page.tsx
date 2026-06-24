"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Search,
  Bell,
  Clock,
  CalendarDays,
  CalendarRange,
  Trophy,
  Play,
  Plus,
  Users,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

type Stats = {
  dailyHours: number;
  weeklyHours: number;
  monthlyHours: number;
  allTimeHours: number;
  totalSessions: number;
  forgeScore: number;
  currentStreak: number;
  bestStreak: number;
  warningCount: number;
};

type DailyData = { day: string; hours: number }[];

type ActiveSession = {
  id: string;
  subject: string;
  topic: string | null;
  totalDurationSeconds: number;
  status: string;
  resourceLink: string | null;
  notionLink: string | null;
  group: { name: string } | null;
};

type GroupItem = {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  isMember: boolean;
  isAdmin: boolean;
};

function formatHours(h: number) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [dailyData, setDailyData] = useState<DailyData>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()).catch(() => ({})),
      fetch("/api/sessions?limit=1").then((r) => r.json()).catch(() => ({})),
      fetch("/api/groups?filter=my&limit=3").then((r) => r.json()).catch(() => ({ groups: [] })),
      fetch("/api/notifications?unread=true&limit=1").then((r) => r.json()).catch(() => ({ unreadCount: 0 })),
    ]).then(([statsData, sessionsData, groupsData, notifData]) => {
      setStats(statsData.stats || null);
      setDailyData(statsData.dailyData || []);
      setActiveSession(sessionsData.activeSession || null);
      setGroups(groupsData.groups || []);
      setUnreadCount(notifData.unreadCount || 0);
      setLoading(false);
    });
  }, []);

  const firstName = user?.firstName || user?.username || "Learner";
  const maxHour = Math.max(...dailyData.map((d) => d.hours), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              &ldquo;Small progress everyday leads to big results.&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-48"
              />
            </div>
            <Link href="/notifications" className="relative rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Weekly Goal Hero Card */}
        <div className="mt-6 relative overflow-hidden rounded-2xl border border-border bg-card p-6">
          <div className="relative z-10 max-w-md">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="size-4" />
              <span className="text-sm font-medium">Weekly Progress</span>
            </div>
            <div className="mt-3">
              <span className="text-5xl font-extrabold text-foreground">
                {formatHours(stats?.weeklyHours || 0)}
              </span>
              <span className="ml-2 text-xl text-muted-foreground">
                studied this week
              </span>
            </div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, ((stats?.weeklyHours || 0) / Math.max(stats?.weeklyHours || 1, 30)) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {stats?.totalSessions || 0} total sessions · {stats?.currentStreak || 0} day streak
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-40">
            <div className="absolute inset-0 bg-gradient-to-l from-primary/20 to-transparent" />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 size-32 rounded-full bg-primary/10 blur-3xl" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          {[
            {
              icon: Clock,
              label: "Today's Hours",
              value: formatHours(stats?.dailyHours || 0),
              delta: `${stats?.totalSessions || 0} total sessions`,
              deltaColor: "text-[#22c55e]",
            },
            {
              icon: CalendarDays,
              label: "Weekly Hours",
              value: formatHours(stats?.weeklyHours || 0),
              delta: `${stats?.currentStreak || 0} day streak`,
              deltaColor: "text-primary",
            },
            {
              icon: CalendarRange,
              label: "Monthly Hours",
              value: formatHours(stats?.monthlyHours || 0),
              delta: `Best streak: ${stats?.bestStreak || 0}d`,
              deltaColor: "text-[#22c55e]",
            },
            {
              icon: Trophy,
              label: "Forge Score",
              value: (stats?.forgeScore || 0).toLocaleString(),
              delta: `${stats?.warningCount || 0} warnings`,
              deltaColor: "text-primary",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <stat.icon className="size-4" />
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className={`mt-1 text-xs ${stat.deltaColor}`}>{stat.delta}</p>
            </div>
          ))}
        </div>

        {/* Active Session + Streak */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Active Session / Start New */}
          <div className="rounded-xl border border-border bg-card p-5">
            {activeSession ? (
              <>
                <h3 className="text-sm font-semibold text-foreground">
                  {activeSession.status === "RUNNING" ? "🔥 Active Session" : "⏸ Paused Session"}
                </h3>
                <Link href={`/study/${activeSession.id}`} className="mt-3 flex items-center gap-3 group">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                    <Flame className="size-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{activeSession.subject}</p>
                    <p className="text-sm font-semibold text-foreground">{activeSession.topic || "General"}</p>
                  </div>
                  <span className="font-mono text-lg font-bold text-primary">
                    {formatHours(activeSession.totalDurationSeconds / 3600)}
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Play className="size-4 ml-0.5" />
                  </div>
                </Link>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  {activeSession.resourceLink && (
                    <a href={activeSession.resourceLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <ExternalLink className="size-3" /> Resource
                    </a>
                  )}
                  {activeSession.notionLink && (
                    <a href={activeSession.notionLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <ExternalLink className="size-3" /> Notes
                    </a>
                  )}
                  {activeSession.group && (
                    <span className="text-primary">📍 {activeSession.group.name}</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-foreground">Start a Session</h3>
                <p className="mt-1 text-xs text-muted-foreground">Begin tracking your study time</p>
                <Link href="/study/new"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <Plus className="size-4" /> Start Forge
                </Link>
              </>
            )}
          </div>

          {/* Current Streak */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Current Streak</h3>
              <span className="text-sm">{(stats?.currentStreak || 0) > 0 ? "🔥" : "Start today!"}</span>
            </div>
            <div className="mt-3 flex items-center gap-6">
              {/* Streak Ring */}
              <div className="relative flex size-20 items-center justify-center">
                <svg viewBox="0 0 80 80" className="size-full -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-secondary" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6"
                    strokeDasharray={`${Math.min(((stats?.currentStreak || 0) / Math.max(stats?.bestStreak || 1, 30)) * 213.6, 213.6)} 213.6`}
                    strokeLinecap="round" className="text-primary" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-extrabold text-foreground">{stats?.currentStreak || 0}</span>
                  <span className="text-[9px] font-medium text-muted-foreground">days</span>
                </div>
              </div>

              {/* Weekly Bars */}
              <div className="flex flex-1 items-end gap-1.5 h-16">
                {dailyData.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm bg-primary transition-all"
                      style={{ height: `${Math.max(5, (d.hours / maxHour) * 100)}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Your Groups */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Your Groups</h3>
            <Link href="/groups" className="text-xs text-primary hover:underline">View All</Link>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {groups.length === 0 ? (
              <Link href="/groups"
                className="col-span-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Users className="size-4" /> Join or create a group
              </Link>
            ) : (
              groups.map((group) => (
                <Link key={group.id} href={`/groups/${group.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Flame className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.memberCount} Members</p>
                  </div>
                  {group.isAdmin && (
                    <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">Admin</span>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Quick Actions */}
      <div className="w-[280px] shrink-0 border-l border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        <div className="mt-4 space-y-2">
          <Link href="/study/new"
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary/30 transition-colors">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Flame className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Start Forge</p>
              <p className="text-[10px] text-muted-foreground">Begin a study session</p>
            </div>
          </Link>
          <Link href="/groups/create"
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary/30 transition-colors">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Create Group</p>
              <p className="text-[10px] text-muted-foreground">Build your guild</p>
            </div>
          </Link>
          <Link href="/challenges"
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary/30 transition-colors">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Challenges</p>
              <p className="text-[10px] text-muted-foreground">Push your limits</p>
            </div>
          </Link>
          <Link href="/leaderboard"
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary/30 transition-colors">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Leaderboard</p>
              <p className="text-[10px] text-muted-foreground">See rankings</p>
            </div>
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-foreground">Your Stats</h3>
          <div className="mt-3 space-y-2.5">
            {[
              { label: "All-Time Hours", value: formatHours(stats?.allTimeHours || 0) },
              { label: "Forge Score", value: (stats?.forgeScore || 0).toLocaleString() },
              { label: "Best Streak", value: `${stats?.bestStreak || 0} days` },
              { label: "Total Sessions", value: (stats?.totalSessions || 0).toString() },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-medium text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
