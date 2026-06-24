"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Play, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Session = {
  id: string; subject: string; topic: string | null;
  status: "RUNNING" | "PAUSED" | "COMPLETED"; totalDurationSeconds: number;
  startedAt: string; endedAt: string | null;
  group: { name: string } | null;
};

function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function StudyPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions?limit=20")
      .then((r) => r.json())
      .then((d) => { setSessions(d.sessions || []); setActiveSession(d.activeSession || null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your grind</p>
        </div>
        <Link href="/study/new">
          <Button className="h-9 gap-1.5 font-semibold"><Plus className="size-4" /> Start Forge</Button>
        </Link>
      </div>

      {/* Active Session Banner */}
      {activeSession && (
        <Link href={`/study/${activeSession.id}`}
          className="mt-5 flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 transition-colors hover:bg-primary/10">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Flame className="size-6 text-primary animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-primary">{activeSession.status === "RUNNING" ? "🔥 Currently Forging" : "⏸ Paused"}</p>
            <p className="text-sm font-bold text-foreground">{activeSession.subject}</p>
            {activeSession.topic && <p className="text-xs text-muted-foreground">{activeSession.topic}</p>}
          </div>
          <span className="font-mono text-lg font-bold text-primary">{formatDuration(activeSession.totalDurationSeconds)}</span>
          <Play className="size-5 text-primary" />
        </Link>
      )}

      {/* History */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-foreground">History</h2>
        {loading ? (
          <div className="mt-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-card" />)}</div>
        ) : sessions.filter((s) => s.status === "COMPLETED").length === 0 ? (
          <div className="mt-8 text-center">
            <Clock className="mx-auto size-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No completed sessions yet. Start forging!</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {sessions.filter((s) => s.status === "COMPLETED").map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                  <Flame className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.subject}</p>
                  <p className="text-xs text-muted-foreground">{s.topic || "No topic"} · {new Date(s.startedAt).toLocaleDateString()}</p>
                </div>
                <span className="font-mono text-sm font-medium text-foreground">{formatDuration(s.totalDurationSeconds)}</span>
                {s.group && <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{s.group.name}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
