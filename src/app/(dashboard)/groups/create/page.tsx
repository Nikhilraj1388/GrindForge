"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Globe, Lock, Flame } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [goalMode, setGoalMode] = useState<"COMMON" | "PERSONAL" | "HYBRID">("COMMON");
  const [partyMode, setPartyMode] = useState(false);
  const [idleTimeout, setIdleTimeout] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 3) {
      setError("Group name must be at least 3 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), visibility, goalMode, partyMode, idleTimeoutMinutes: idleTimeout }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create group");
        setLoading(false);
        return;
      }
      const data = await res.json();
      router.push(`/groups/${data.group.slug}`);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/groups" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Back to Groups
      </Link>

      <h1 className="text-2xl font-bold text-foreground">Create Group</h1>
      <p className="mt-1 text-sm text-muted-foreground">Build your accountability guild</p>

      <form onSubmit={handleCreate} className="mt-6 space-y-5">
        {/* Name */}
        <div className="rounded-xl border border-border bg-card p-5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Users className="size-3.5" /> Group Name
          </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DSA Grind Squad" maxLength={50}
            className="mt-2 w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        {/* Description */}
        <div className="rounded-xl border border-border bg-card p-5">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this group about?" rows={3} maxLength={500}
            className="mt-2 w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        {/* Visibility */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground">Visibility</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {([["PUBLIC", Globe, "Anyone can find and join"] , ["PRIVATE", Lock, "Invite or request to join"]] as const).map(([v, Icon, desc]) => (
              <button type="button" key={v} onClick={() => setVisibility(v)}
                className={`rounded-xl border p-4 text-left transition-colors ${visibility === v ? "border-primary bg-primary/5" : "border-border bg-secondary hover:border-primary/30"}`}>
                <Icon className={`size-5 ${visibility === v ? "text-primary" : "text-muted-foreground"}`} />
                <p className="mt-2 text-sm font-medium text-foreground">{v === "PUBLIC" ? "Public" : "Private"}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Goal Mode */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground">Goal Mode</p>
          <div className="mt-3 flex gap-2">
            {(["COMMON", "PERSONAL", "HYBRID"] as const).map((m) => (
              <button type="button" key={m} onClick={() => setGoalMode(m)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${goalMode === m ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground border border-border"}`}>
                {m.charAt(0) + m.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {goalMode === "COMMON" ? "Everyone shares the same goal" : goalMode === "PERSONAL" ? "Each member sets their own goal" : "Mix of common and personal goals"}
          </p>
        </div>

        {/* Party Mode + Idle Timeout */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Party Mode</p>
              <p className="text-xs text-muted-foreground">Enable group accountability penalties</p>
            </div>
            <button type="button" onClick={() => setPartyMode(!partyMode)}
              className={`relative h-6 w-11 rounded-full transition-colors ${partyMode ? "bg-primary" : "bg-secondary border border-border"}`}>
              <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform ${partyMode ? "translate-x-5" : ""}`} />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Idle Timeout</p>
            <div className="mt-2 flex items-center gap-3">
              <input type="range" min={1} max={60} value={idleTimeout} onChange={(e) => setIdleTimeout(Number(e.target.value))}
                className="flex-1 accent-primary" />
              <span className="text-sm font-medium text-foreground w-16 text-right">{idleTimeout} min</span>
            </div>
          </div>
        </div>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full h-10 font-semibold gap-1.5">
          <Flame className="size-4" /> {loading ? "Creating..." : "Create Group"}
        </Button>
      </form>
    </div>
  );
}
