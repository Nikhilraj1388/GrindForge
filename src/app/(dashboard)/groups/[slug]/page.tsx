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
  user: {
    id: string;
    username: string | null;
    fullName: string | null;
    profileImage: string | null;
    forgeScore: number;
    currentStreak: number;
    statistics: {
      dailyHours: number;
      weeklyHours: number;
      allTimeHours: number;
    } | null;
  };
};
type GroupDetail = {
  id: string; name: string; slug: string; description: string | null;
  visibility: "PUBLIC" | "PRIVATE"; goalMode: string; partyMode: boolean;
  memberCount: number; idleTimeoutMinutes: number; createdAt: string;
  admin: { id: string; username: string | null; fullName: string | null };
  members: Member[];
  _count: { members: number; studySessions: number };
};

type GroupGoal = {
  id: string;
  goalType: "DAILY" | "WEEKLY" | "MONTHLY";
  targetHours: number;
  createdAt: string;
  createdBy?: { username: string | null; fullName: string | null };
};

type UserGoal = {
  id: string;
  goalType: "DAILY" | "WEEKLY" | "MONTHLY";
  targetHours: number;
  createdAt: string;
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

  // Goals state
  const [groupGoals, setGroupGoals] = useState<GroupGoal[]>([]);
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [goalType, setGoalType] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [targetHours, setTargetHours] = useState<number>(2);
  const [isPersonalGoal, setIsPersonalGoal] = useState(false);
  const [settingGoal, setSettingGoal] = useState(false);
  const [goalMsg, setGoalMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchGoals = useCallback(async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/goals`);
      if (res.ok) {
        const data = await res.json();
        setGroupGoals(data.groupGoals || []);
        setUserGoals(data.userGoals || []);
      }
    } catch (err) {
      console.error("Error fetching goals:", err);
    } finally {
      setGoalsLoading(false);
    }
  }, []);

  const fetchGroup = useCallback(async () => {
    const res = await fetch(`/api/groups/${slug}`);
    if (res.ok) {
      const data = await res.json();
      setGroup(data.group);
      setIsMember(data.isMember);
      setIsAdmin(data.isAdmin);
      fetchGoals(data.group.id);
    }
    setLoading(false);
  }, [slug, fetchGoals]);

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

  async function handleSetGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!group) return;
    setSettingGoal(true);
    setGoalMsg(null);
    try {
      const res = await fetch(`/api/groups/${group.id}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalType,
          targetHours,
          isPersonal: isPersonalGoal || group.goalMode === "PERSONAL",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setGoalMsg({ type: "success", text: "Goal set successfully!" });
        fetchGoals(group.id);
      } else {
        setGoalMsg({ type: "error", text: data.error || "Failed to set goal." });
      }
    } catch {
      setGoalMsg({ type: "error", text: "Something went wrong." });
    } finally {
      setSettingGoal(false);
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

      {/* Goals & Study Limits */}
      {isMember && (
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {/* Active Goals list */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-primary" /> Study Limits & Targets
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Current study target hours for this group (Goal Mode: <span className="font-semibold text-foreground">{group.goalMode}</span>)
            </p>

            <div className="mt-4 space-y-4">
              {/* Group Goals */}
              {group.goalMode !== "PERSONAL" && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Common Group Goals</h3>
                  {goalsLoading ? (
                    <div className="mt-2 h-10 animate-pulse bg-secondary rounded-lg" />
                  ) : groupGoals.length === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground italic">No group goals set yet.</p>
                  ) : (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {groupGoals.map((g) => (
                        <div key={g.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                          <div className="flex items-center justify-between">
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                              {g.goalType}
                            </span>
                            <span className="text-xs text-muted-foreground">Target Limit</span>
                          </div>
                          <p className="mt-1.5 text-lg font-bold text-foreground">
                            {g.targetHours} {g.targetHours === 1 ? "hour" : "hours"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Personal Goals */}
              {group.goalMode !== "COMMON" && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Personal Targets</h3>
                  {goalsLoading ? (
                    <div className="mt-2 h-10 animate-pulse bg-secondary rounded-lg" />
                  ) : userGoals.length === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground italic">You haven&apos;t set any personal study targets for this group.</p>
                  ) : (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {userGoals.map((g) => (
                        <div key={g.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                          <div className="flex items-center justify-between">
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                              {g.goalType}
                            </span>
                            <span className="text-xs text-muted-foreground">My Limit</span>
                          </div>
                          <p className="mt-1.5 text-lg font-bold text-foreground">
                            {g.targetHours} {g.targetHours === 1 ? "hour" : "hours"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Set Goal Form */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground">Set Study Limit / Goal</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {isAdmin 
                ? "Define study targets for yourself or the entire group." 
                : "Define your personal study targets."}
            </p>

            <form onSubmit={handleSetGoal} className="mt-4 space-y-4">
              {/* Goal Type */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Goal Frequency</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as "DAILY" | "WEEKLY" | "MONTHLY")}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>

              {/* Target Hours */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Target Hours</label>
                <input
                  type="number"
                  value={targetHours}
                  onChange={(e) => setTargetHours(Math.max(1, Number(e.target.value)))}
                  min={1}
                  max={720}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Admin toggle for Personal vs Group goal */}
              {isAdmin && group.goalMode === "HYBRID" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPersonal"
                    checked={isPersonalGoal}
                    onChange={(e) => setIsPersonalGoal(e.target.checked)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <label htmlFor="isPersonal" className="text-xs text-muted-foreground cursor-pointer select-none">
                    Set as personal goal only
                  </label>
                </div>
              )}

              {goalMsg && (
                <p className={cn("text-xs", goalMsg.type === "success" ? "text-[#22c55e]" : "text-destructive")}>
                  {goalMsg.text}
                </p>
              )}

              <Button
                type="submit"
                disabled={settingGoal}
                className="w-full h-8 text-xs font-semibold"
              >
                {settingGoal ? "Saving..." : "Set Target Limit"}
              </Button>
            </form>
          </div>
        </div>
      )}


      {/* Members & Leaderboard */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Weekly Competition Leaderboard</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Ranked by study hours this week</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {group.members.length} active
          </span>
        </div>

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
          {[...(group.members || [])]
            .sort((a, b) => {
              const aHours = a.user.statistics?.weeklyHours || 0;
              const bHours = b.user.statistics?.weeklyHours || 0;
              if (bHours !== aHours) return bHours - aHours;
              return (b.user.forgeScore || 0) - (a.user.forgeScore || 0);
            })
            .map((member, index) => {
              const weeklyHours = member.user.statistics?.weeklyHours || 0;
              const allTimeHours = member.user.statistics?.allTimeHours || 0;
              
              let rankEmoji = "";
              if (index === 0) rankEmoji = "🥇";
              else if (index === 1) rankEmoji = "🥈";
              else if (index === 2) rankEmoji = "🥉";
              else rankEmoji = `#${index + 1}`;

              return (
                <div key={member.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary/50">
                  <div className="text-sm font-bold w-6 text-center text-muted-foreground shrink-0">
                    {rankEmoji}
                  </div>
                  <div className="size-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
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
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                      <span>Score: {member.user.forgeScore}</span>
                      <span>·</span>
                      <span>Streak: {member.user.currentStreak}d</span>
                      <span>·</span>
                      <span className="font-semibold text-primary">Studied: {weeklyHours.toFixed(1)}h this week</span>
                      <span className="text-[10px] text-muted-foreground">({allTimeHours.toFixed(1)}h total)</span>
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
              );
            })}
        </div>
      </div>
    </div>
  );
}

