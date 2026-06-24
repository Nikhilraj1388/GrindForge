"use client";

import { useState, useEffect } from "react";
import { BarChart3, Crown, Flame, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

type LeaderEntry = {
  rank: number; username: string | null; fullName: string | null;
  totalHours: number; forgeScore: number; streak: number; isYou: boolean;
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("weekly");
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}&limit=20`)
      .then((r) => r.json())
      .then((d) => { setEntries(d.leaderboard || []); setUserRank(d.userRank || null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="size-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="size-4 text-gray-300" />;
    if (rank === 3) return <Medal className="size-4 text-amber-600" />;
    return <span className="w-4 text-center text-xs font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">See who&apos;s grinding the hardest</p>
        </div>
        <BarChart3 className="size-8 text-primary/30" />
      </div>

      {/* Period Tabs */}
      <div className="mt-5 flex gap-2">
        {["daily", "weekly", "monthly", "alltime"].map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              period === p ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border hover:text-foreground")}>
            {p === "alltime" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Your Rank */}
      {userRank && (
        <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs font-medium text-primary mb-2">Your Ranking</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-foreground">#{userRank.rank}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{userRank.fullName || userRank.username}</p>
              <p className="text-xs text-muted-foreground">{userRank.totalHours}h studied · {userRank.streak}d streak</p>
            </div>
            <span className="flex items-center gap-1 text-sm font-bold text-primary">
              {userRank.forgeScore} <Flame className="size-3.5" />
            </span>
          </div>
        </div>
      )}

      {/* Rankings */}
      <div className="mt-4 rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="size-6 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No data yet. Start studying!</div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((e) => (
              <div key={e.rank} className={cn("flex items-center gap-3 px-5 py-3 transition-colors", e.isYou && "bg-primary/5")}>
                <div className="w-8 flex justify-center">{rankIcon(e.rank)}</div>
                <div className="size-8 rounded-full bg-secondary" />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", e.isYou ? "text-primary font-semibold" : "text-foreground")}>
                    {e.fullName || e.username || "User"} {e.isYou && "(You)"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{e.totalHours}h</p>
                  <p className="text-[10px] text-muted-foreground">{e.streak}d streak</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
