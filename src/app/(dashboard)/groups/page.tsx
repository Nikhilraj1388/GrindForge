"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Plus, Search, Globe, Lock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Group = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  goalMode: string;
  memberCount: number;
  isMember: boolean;
  isAdmin: boolean;
  admin: { username: string | null; fullName: string | null };
};

type Invitation = {
  id: string;
  groupId: string;
  group: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    visibility: "PUBLIC" | "PRIVATE";
    memberCount: number;
    admin: { username: string | null; fullName: string | null };
  };
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
    fetchInvitations();
  }, [filter]);

  async function fetchGroups() {
    setLoading(true);
    const params = new URLSearchParams({ filter });
    if (search) params.set("search", search);
    const res = await fetch(`/api/groups?${params}`);
    if (res.ok) {
      const data = await res.json();
      setGroups(data.groups);
    }
    setLoading(false);
  }

  async function fetchInvitations() {
    try {
      const res = await fetch("/api/groups/invitations");
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
    }
  }

  async function handleJoin(groupId: string) {
    const res = await fetch(`/api/groups/${groupId}/join`, { method: "POST" });
    if (res.ok) fetchGroups();
  }

  async function handleInvitationAction(groupId: string, action: "accept" | "reject") {
    try {
      const res = await fetch("/api/groups/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, action }),
      });
      if (res.ok) {
        fetchInvitations();
        fetchGroups();
      }
    } catch (err) {
      console.error("Error responding to invitation:", err);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Groups</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join a guild or create your own</p>
        </div>
        <Link href="/groups/create">
          <Button className="h-9 gap-1.5 font-semibold">
            <Plus className="size-4" /> Create Group
          </Button>
        </Link>
      </div>

      {/* Group Invitations Panel */}
      {invitations.length > 0 && (
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <h2 className="text-sm font-bold text-foreground">Group Invitations</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Admins have invited you to join these groups:</p>
          <div className="mt-3 space-y-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{inv.group.name}</h3>
                  {inv.group.description && <p className="text-xs text-muted-foreground mt-1 max-w-md">{inv.group.description}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Invited by: {inv.group.admin.fullName || inv.group.admin.username || "Admin"} · {inv.group.memberCount} members
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleInvitationAction(inv.groupId, "accept")}
                    className="h-8 text-xs font-semibold px-4"
                  >
                     Accept
                  </Button>
                  <Button
                    onClick={() => handleInvitationAction(inv.groupId, "reject")}
                    variant="outline"
                    className="h-8 text-xs font-semibold px-4 border-destructive text-destructive hover:bg-destructive/10"
                  >
                     Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Filters + Search */}
      <div className="mt-5 flex items-center gap-3">
        {["all", "my", "public"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground border border-border"
            )}
          >
            {f === "all" ? "All" : f === "my" ? "My Groups" : "Public"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchGroups()}
            placeholder="Search groups..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-40"
          />
        </div>
      </div>

      {/* Groups Grid */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-card" />
          ))
        ) : groups.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Users className="mx-auto size-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No groups found</p>
          </div>
        ) : (
          groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.slug}`}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                  <Flame className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-foreground">{group.name}</h3>
                    {group.visibility === "PUBLIC" ? (
                      <Globe className="size-3.5 text-muted-foreground" />
                    ) : (
                      <Lock className="size-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {group.memberCount} member{group.memberCount !== 1 && "s"}
                  </p>
                </div>
              </div>
              {group.description && (
                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{group.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                {group.isMember ? (
                  <span className="rounded-md bg-[#22c55e]/10 px-2 py-0.5 text-[10px] font-medium text-[#22c55e]">
                    {group.isAdmin ? "Admin" : "Member"}
                  </span>
                ) : (
                  <button
                    onClick={(e) => { e.preventDefault(); handleJoin(group.id); }}
                    className="rounded-md bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/20"
                  >
                    Join
                  </button>
                )}
                <span className="rounded-md border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                  {group.goalMode}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
