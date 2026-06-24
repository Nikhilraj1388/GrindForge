"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type GroupOption = { id: string; name: string; slug: string };

export default function NewStudyPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [resourceLink, setResourceLink] = useState("");
  const [notionLink, setNotionLink] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/groups?filter=my&limit=50")
      .then((r) => r.json())
      .then((d) => setGroups(d.groups?.map((g: GroupOption) => ({ id: g.id, name: g.name, slug: g.slug })) || []))
      .catch(() => {});
  }, []);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) { setError("Subject is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), topic: topic.trim() || undefined, description: description.trim() || undefined, resourceLink: resourceLink.trim() || undefined, notionLink: notionLink.trim() || undefined, groupId: groupId || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.activeSessionId) {
          router.push(`/study/${data.activeSessionId}`);
          return;
        }
        setError(data.error || "Failed to start session");
        setLoading(false);
        return;
      }
      const data = await res.json();
      router.push(`/study/${data.session.id}`);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/study" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold text-foreground">Start Forge 🔥</h1>
      <p className="mt-1 text-sm text-muted-foreground">What are you studying today?</p>

      <form onSubmit={handleStart} className="mt-6 space-y-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <label className="text-sm font-medium text-foreground">Subject *</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Data Structures and Algorithms" maxLength={100}
            className="mt-2 w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <label className="text-sm font-medium text-foreground">Topic</label>
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Binary Search" maxLength={100}
            className="mt-2 w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What exactly are you working on?" rows={2} maxLength={500}
            className="mt-2 w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <label className="text-sm font-medium text-foreground">Resource Link</label>
            <input type="url" value={resourceLink} onChange={(e) => setResourceLink(e.target.value)} placeholder="https://leetcode.com/..."
              className="mt-2 w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <label className="text-sm font-medium text-foreground">Notes Link</label>
            <input type="url" value={notionLink} onChange={(e) => setNotionLink(e.target.value)} placeholder="https://notion.so/..."
              className="mt-2 w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        {groups.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <label className="text-sm font-medium text-foreground">Track in Group</label>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">No group (solo)</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold gap-2">
          <Flame className="size-5" />
          {loading ? "Starting..." : "Start Forge"}
          {!loading && <Play className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
