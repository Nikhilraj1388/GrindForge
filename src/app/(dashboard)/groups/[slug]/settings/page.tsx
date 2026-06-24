"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type GroupSettings = {
  id: string; name: string; slug: string; description: string | null;
  visibility: "PUBLIC" | "PRIVATE"; goalMode: string; partyMode: boolean;
  idleTimeoutMinutes: number; checkpointFrequency: number; allowJoinRequests: boolean;
};

export default function GroupSettingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<GroupSettings | null>(null);
  const [form, setForm] = useState({ name: "", description: "", visibility: "PUBLIC", partyMode: false, idleTimeoutMinutes: 5, checkpointFrequency: 30, allowJoinRequests: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchGroup = useCallback(async () => {
    const res = await fetch(`/api/groups/${slug}`);
    if (res.ok) {
      const data = await res.json();
      const g = data.group;
      setGroup(g);
      setForm({ name: g.name, description: g.description || "", visibility: g.visibility, partyMode: g.partyMode, idleTimeoutMinutes: g.idleTimeoutMinutes, checkpointFrequency: g.checkpointFrequency || 30, allowJoinRequests: g.allowJoinRequests });
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!group) return;
    setSaving(true); setMsg("");
    const res = await fetch(`/api/groups/${group.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setMsg("Settings saved!"); fetchGroup(); }
    else { const d = await res.json(); setMsg(d.error || "Failed to save"); }
    setSaving(false);
  }

  async function handleDelete() {
    if (!group) return;
    if (!confirm("Are you sure? This will permanently delete the group and all its data.")) return;
    const res = await fetch(`/api/groups/${group.id}`, { method: "DELETE" });
    if (res.ok) router.push("/groups");
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!group) return <div className="p-6 text-center text-muted-foreground">Group not found</div>;

  return (
    <div className="p-6 max-w-2xl">
      <Link href={`/groups/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Back to Group
      </Link>

      <h1 className="text-xl font-bold text-foreground">Group Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">{group.name}</p>

      <form onSubmit={handleSave} className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground">Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={50}
            className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} maxLength={300}
            className="mt-1 w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">Visibility</label>
            <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none">
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Idle Timeout (min)</label>
            <input type="number" value={form.idleTimeoutMinutes} onChange={(e) => setForm({ ...form, idleTimeoutMinutes: Number(e.target.value) })} min={1} max={60}
              className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.partyMode} onChange={(e) => setForm({ ...form, partyMode: e.target.checked })}
              className="size-4 rounded border-border accent-primary" />
            <span className="text-sm text-foreground">Enable Party Mode</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.allowJoinRequests} onChange={(e) => setForm({ ...form, allowJoinRequests: e.target.checked })}
              className="size-4 rounded border-border accent-primary" />
            <span className="text-sm text-foreground">Allow Join Requests</span>
          </label>
        </div>

        {msg && <p className={`text-sm ${msg.includes("saved") ? "text-[#22c55e]" : "text-destructive"}`}>{msg}</p>}

        <div className="flex items-center justify-between pt-2">
          <Button type="submit" disabled={saving} className="h-9 gap-1.5 font-semibold">
            <Save className="size-4" /> {saving ? "Saving..." : "Save Settings"}
          </Button>
          <button type="button" onClick={handleDelete}
            className="text-sm text-destructive hover:underline">Delete Group</button>
        </div>
      </form>
    </div>
  );
}
