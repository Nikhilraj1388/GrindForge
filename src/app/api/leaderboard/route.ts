import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/leaderboard — Get leaderboard data (server-side calculated per RULES.md)
export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "weekly"; // daily | weekly | monthly | alltime
    const groupId = url.searchParams.get("groupId");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0); // all time
    }

    const sessionWhere: Record<string, unknown> = {
      status: "COMPLETED",
      startedAt: { gte: startDate },
    };
    if (groupId) sessionWhere.groupId = groupId;

    // Get aggregated hours per user
    const rankings = await prisma.studySession.groupBy({
      by: ["userId"],
      where: sessionWhere,
      _sum: { totalDurationSeconds: true },
      orderBy: { _sum: { totalDurationSeconds: "desc" } },
      take: limit,
    });

    // Fetch user details for rankings
    const userIds = rankings.map((r) => r.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, isPublic: true },
      select: { id: true, username: true, fullName: true, profileImage: true, forgeScore: true, currentStreak: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard = rankings
      .map((r, i) => {
        const u = userMap.get(r.userId);
        if (!u) return null;
        const totalSeconds = r._sum.totalDurationSeconds || 0;
        return {
          rank: i + 1,
          userId: r.userId,
          username: u.username,
          fullName: u.fullName,
          profileImage: u.profileImage,
          forgeScore: u.forgeScore,
          streak: u.currentStreak,
          totalHours: Math.round((totalSeconds / 3600) * 100) / 100,
          totalSeconds,
          isYou: r.userId === user.id,
        };
      })
      .filter(Boolean);

    // Find current user's rank if not in top
    let userRank = leaderboard.find((e) => e?.isYou);
    if (!userRank) {
      const userSessions = await prisma.studySession.aggregate({
        where: { ...sessionWhere, userId: user.id },
        _sum: { totalDurationSeconds: true },
      });
      const userSeconds = userSessions._sum.totalDurationSeconds || 0;
      const usersAbove = await prisma.studySession.groupBy({
        by: ["userId"],
        where: sessionWhere,
        _sum: { totalDurationSeconds: true },
        having: { totalDurationSeconds: { _sum: { gt: userSeconds } } },
      });
      userRank = {
        rank: usersAbove.length + 1,
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        profileImage: user.profileImage,
        forgeScore: user.forgeScore,
        streak: user.currentStreak,
        totalHours: Math.round((userSeconds / 3600) * 100) / 100,
        totalSeconds: userSeconds,
        isYou: true,
      };
    }

    return NextResponse.json({ leaderboard, userRank, period });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
