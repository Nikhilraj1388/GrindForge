"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Flame, Clock, Trophy, Calendar, Users, Shield } from "lucide-react";

type ProfileData = {
  profile: {
    username: string; fullName: string | null; profileImage: string | null;
    bio: string | null; forgeScore: number; currentStreak: number;
    bestStreak: number; createdAt: string; isPublic: boolean;
  };
  statistics: { dailyHours: number; weeklyHours: number; monthlyHours: number; allTimeHours: number; totalSessions: number } | null;
  recentSessions: { id: string; subject: string; topic: string | null; totalDurationSeconds: number; startedAt: string }[];
  publicGroups: { name: string; slug: string; memberCount: number }[];
  isOwner: boolean;
};

function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch_ = useCallback(async () => {
    const res = await fetch(`/api/profile/${username}`);
    if (res.ok) setData(await res.json());
    else setError((await res.json()).error || "Not found");
    setLoading(false);
  }, [username]);

  useEffect(() => { fetch_(); }, [fetch_]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Shield className="size-12 text-muted-foreground/20" /><p className="mt-3 text-sm text-muted-foreground">{error}</p></div>;
  if (!data) return null;

  const { profile, statistics, recentSessions, publicGroups } = data;

  return (
    <div className="p-6 max-w-3xl">
      {/* Profile Header */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt="" className="size-20 rounded-full border-2 border-primary object-cover" />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full border-2 border-primary bg-secondary text-2xl font-bold text-muted-foreground">
                {(profile.fullName || profile.username || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary">
              <Flame className="size-4 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{profile.fullName || profile.username}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="mt-1 text-sm text-foreground/80">{profile.bio}</p>}
            <p className="mt-1 text-xs text-muted-foreground">
              Joined {new Date(profile.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-5 grid grid-cols-4 gap-4">
          {[
            { icon: Flame, label: "Forge Score", value: profile.forgeScore.toLocaleString() },
            { icon: Calendar, label: "Current Streak", value: `${profile.currentStreak}d` },
            { icon: Trophy, label: "Best Streak", value: `${profile.bestStreak}d` },
            { icon: Clock, label: "Total Hours", value: `${Math.round(statistics?.allTimeHours || 0)}h` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-background p-3 text-center">
              <s.icon className="mx-auto size-4 text-primary" />
              <p className="mt-1 text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          <div className="mt-3 space-y-2">
            {recentSessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
                  <Flame className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.subject}</p>
                  <p className="text-xs text-muted-foreground">{s.topic || "General"} · {new Date(s.startedAt).toLocaleDateString()}</p>
                </div>
                <span className="font-mono text-xs font-medium text-foreground">{formatDuration(s.totalDurationSeconds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups */}
      {publicGroups.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">Groups</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {publicGroups.map((g) => (
              <div key={g.slug} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Users className="size-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground">{g.name}</span>
                <span className="text-[10px] text-muted-foreground">{g.memberCount}m</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
