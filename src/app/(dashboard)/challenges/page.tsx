"use client";

import { useState, useEffect } from "react";
import { Trophy, Plus, Users, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Challenge = {
  id: string; title: string; description: string | null;
  challengeType: string; goalValue: number; durationDays: number;
  isPublic: boolean; createdAt: string; isJoined: boolean; userProgress: number;
  createdBy: { username: string | null; fullName: string | null };
  _count: { participants: number };
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", challengeType: "HOURS", goalValue: 100, durationDays: 30 });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchChallenges(); }, [filter]);

  async function fetchChallenges() {
    setLoading(true);
    const res = await fetch(`/api/challenges?filter=${filter}`);
    if (res.ok) { const d = await res.json(); setChallenges(d.challenges || []); }
    setLoading(false);
  }

  async function handleJoin(id: string) {
    await fetch(`/api/challenges/${id}/join`, { method: "POST" });
    fetchChallenges();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    const res = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowCreate(false); setForm({ title: "", description: "", challengeType: "HOURS", goalValue: 100, durationDays: 30 }); fetchChallenges(); }
    setCreating(false);
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Challenges</h1>
          <p className="mt-1 text-sm text-muted-foreground">Push your limits</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="h-9 gap-1.5 font-semibold">
          <Plus className="size-4" /> Create
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="mt-4 rounded-xl border border-border bg-card p-5 space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Challenge title" maxLength={100}
            className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} maxLength={500}
            className="w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <select value={form.challengeType} onChange={(e) => setForm({ ...form, challengeType: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-2 py-1.5 text-sm text-foreground focus:outline-none">
                <option value="HOURS">Hours</option><option value="STREAK">Streak</option><option value="CUSTOM">Custom</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Goal</label>
              <input type="number" value={form.goalValue} onChange={(e) => setForm({ ...form, goalValue: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-2 py-1.5 text-sm text-foreground focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Days</label>
              <input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-2 py-1.5 text-sm text-foreground focus:outline-none" />
            </div>
          </div>
          <Button type="submit" disabled={creating} className="h-8 text-sm font-semibold">
            {creating ? "Creating..." : "Create Challenge"}
          </Button>
        </form>
      )}

      {/* Filter */}
      <div className="mt-5 flex gap-2">
        {["all", "joined", "public"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border hover:text-foreground")}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Challenges List */}
      <div className="mt-5 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />)
        ) : challenges.length === 0 ? (
          <div className="py-16 text-center">
            <Trophy className="mx-auto size-12 text-muted-foreground/20" />
            <p className="mt-3 text-sm text-muted-foreground">No challenges found</p>
          </div>
        ) : (
          challenges.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Trophy className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground">{c.title}</h3>
                  {c.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="size-3" /> {c._count.participants}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3" /> {c.durationDays}d</span>
                    <span className="flex items-center gap-1"><Flame className="size-3" /> {c.goalValue} {c.challengeType === "HOURS" ? "hrs" : c.challengeType === "STREAK" ? "days" : "pts"}</span>
                  </div>
                </div>
                {c.isJoined ? (
                  <div className="text-right">
                    <span className="rounded-md bg-[#22c55e]/10 px-2 py-0.5 text-[10px] font-medium text-[#22c55e]">Joined</span>
                    <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (c.userProgress / c.goalValue) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{c.userProgress}/{c.goalValue}</p>
                  </div>
                ) : (
                  <button onClick={() => handleJoin(c.id)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                    Join
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
