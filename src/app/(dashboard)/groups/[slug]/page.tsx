"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Globe, Lock, Flame, Settings, LogOut, UserMinus, Shield, Crown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Member = {
  id: string;
  role: "ADMIN" | "MODERATOR" | "MEMBER";
  user: { id: string; username: string | null; fullName: string | null; profileImage: string | null; forgeScore: number; currentStreak: number };
};
type GroupDetail = {
  id: string; name: string; slug: string; description: string | null;
  visibility: "PUBLIC" | "PRIVATE"; goalMode: string; partyMode: boolean;
  memberCount: number; idleTimeoutMinutes: number; createdAt: string;
  admin: { id: string; username: string | null; fullName: string | null };
  members: Member[];
  _count: { members: number; studySessions: number };
};

export default function GroupDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Invite state
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchGroup = useCallback(async () => {
    const res = await fetch(`/api/groups/${slug}`);
    if (res.ok) {
      const data = await res.json();
      setGroup(data.group);
      setIsMember(data.isMember);
      setIsAdmin(data.isAdmin);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  async function handleJoin() {
    const res = await fetch(`/api/groups/${group?.id}/join`, { method: "POST" });
    if (res.ok) fetchGroup();
  }

  async function handleLeave() {
    if (!confirm("Are you sure you want to leave this group?")) return;
    const res = await fetch(`/api/groups/${group?.id}/leave`, { method: "POST" });
    if (res.ok) router.push("/groups");
  }

  async function handleRemove(userId: string) {
    if (!confirm("Remove this member?")) return;
    await fetch(`/api/groups/${group?.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", targetUserId: userId }),
    });
    fetchGroup();
  }

  async function handleChangeRole(userId: string, role: string) {
    await fetch(`/api/groups/${group?.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "changeRole", targetUserId: userId, role }),
    });
    fetchGroup();
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteUsername.trim() || !group) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      const res = await fetch(`/api/groups/${group.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: inviteUsername.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteMsg({ type: "success", text: data.message || "Invitation sent!" });
        setInviteUsername("");
      } else {
        setInviteMsg({ type: "error", text: data.error || "Failed to invite user." });
      }
    } catch {
      setInviteMsg({ type: "error", text: "Something went wrong." });
    } finally {
      setInviting(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!group) return <div className="p-6 text-center text-muted-foreground">Group not found</div>;

  return (
    <div className="p-6">
      <Link href="/groups" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Back to Groups
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
              <Flame className="size-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{group.name}</h1>
                {group.visibility === "PUBLIC" ? <Globe className="size-4 text-muted-foreground" /> : <Lock className="size-4 text-muted-foreground" />}
              </div>
              {group.description && <p className="mt-1 text-sm text-muted-foreground max-w-lg">{group.description}</p>}
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="size-3" /> {group._count.members} members</span>
                <span className="flex items-center gap-1"><Clock className="size-3" /> {group.idleTimeoutMinutes}m idle timeout</span>
                <span className="rounded-md border border-border px-1.5 py-0.5">{group.goalMode}</span>
                {group.partyMode && <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-primary font-medium">Party Mode</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isMember && (
              <Button onClick={handleJoin} className="h-8 gap-1.5 text-sm font-semibold"><Users className="size-3.5" /> Join</Button>
            )}
            {isMember && !isAdmin && (
              <Button onClick={handleLeave} variant="ghost" className="h-8 gap-1.5 text-sm text-destructive hover:text-destructive"><LogOut className="size-3.5" /> Leave</Button>
            )}
            {isAdmin && (
              <Link href={`/groups/${slug}/settings`}>
                <Button variant="ghost" className="h-8 gap-1.5 text-sm"><Settings className="size-3.5" /> Settings</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground">Members ({group._count.members})</h2>

        {isAdmin && (
          <div className="mt-4 border-b border-border pb-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invite User to Group</h3>
            <form onSubmit={handleInvite} className="mt-2 flex gap-2">
              <input
                type="text"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="Enter username to invite..."
                className="flex-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={inviting}
              />
              <Button type="submit" disabled={inviting || !inviteUsername.trim()} className="h-8 text-xs font-semibold px-4">
                {inviting ? "Inviting..." : "Invite"}
              </Button>
            </form>
            {inviteMsg && (
              <p className={cn("mt-2 text-xs", inviteMsg.type === "success" ? "text-[#22c55e]" : "text-destructive")}>
                {inviteMsg.text}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 space-y-2">
          {group.members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary/50">
              <div className="size-9 rounded-full bg-secondary flex items-center justify-center">
                {member.user.profileImage ? (
                  <img src={member.user.profileImage} alt="" className="size-9 rounded-full object-cover" />
                ) : (
                  <Users className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {member.user.fullName || member.user.username || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Score: {member.user.forgeScore} · Streak: {member.user.currentStreak}d
                </p>
              </div>
              <div className="flex items-center gap-2">
                {member.role === "ADMIN" && <span className="flex items-center gap-1 text-[10px] font-medium text-primary"><Crown className="size-3" /> Admin</span>}
                {member.role === "MODERATOR" && <span className="flex items-center gap-1 text-[10px] font-medium text-[#22c55e]"><Shield className="size-3" /> Mod</span>}
                {isAdmin && member.role !== "ADMIN" && (
                  <>
                    <button onClick={() => handleChangeRole(member.user.id, member.role === "MODERATOR" ? "MEMBER" : "MODERATOR")}
                      className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary" title={member.role === "MODERATOR" ? "Demote" : "Promote"}>
                      <Shield className="size-3.5" />
                    </button>
                    <button onClick={() => handleRemove(member.user.id)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Remove">
                      <UserMinus className="size-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

