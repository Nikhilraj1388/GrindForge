import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stats — Get current user's statistics
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { statistics: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate hours from completed sessions
    const [todaySessions, weekSessions, monthSessions, allTimeSessions] = await Promise.all([
      prisma.studySession.aggregate({
        where: { userId: user.id, status: "COMPLETED", startedAt: { gte: todayStart } },
        _sum: { totalDurationSeconds: true },
        _count: true,
      }),
      prisma.studySession.aggregate({
        where: { userId: user.id, status: "COMPLETED", startedAt: { gte: weekStart } },
        _sum: { totalDurationSeconds: true },
        _count: true,
      }),
      prisma.studySession.aggregate({
        where: { userId: user.id, status: "COMPLETED", startedAt: { gte: monthStart } },
        _sum: { totalDurationSeconds: true },
        _count: true,
      }),
      prisma.studySession.aggregate({
        where: { userId: user.id, status: "COMPLETED" },
        _sum: { totalDurationSeconds: true },
        _count: true,
      }),
    ]);

    // Update cached statistics
    const dailyHours = (todaySessions._sum.totalDurationSeconds || 0) / 3600;
    const weeklyHours = (weekSessions._sum.totalDurationSeconds || 0) / 3600;
    const monthlyHours = (monthSessions._sum.totalDurationSeconds || 0) / 3600;
    const allTimeHours = (allTimeSessions._sum.totalDurationSeconds || 0) / 3600;

    if (user.statistics) {
      await prisma.userStatistics.update({
        where: { userId: user.id },
        data: { dailyHours, weeklyHours, monthlyHours, allTimeHours, totalSessions: allTimeSessions._count },
      });
    }

    // Recent sessions for chart data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const dailyData = await Promise.all(
      last7Days.map(async (dayStart) => {
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const result = await prisma.studySession.aggregate({
          where: { userId: user.id, status: "COMPLETED", startedAt: { gte: dayStart, lt: dayEnd } },
          _sum: { totalDurationSeconds: true },
        });
        return {
          date: dayStart.toISOString().split("T")[0],
          day: dayStart.toLocaleDateString("en", { weekday: "short" }),
          hours: Math.round(((result._sum.totalDurationSeconds || 0) / 3600) * 100) / 100,
        };
      })
    );

    return NextResponse.json({
      stats: {
        dailyHours: Math.round(dailyHours * 100) / 100,
        weeklyHours: Math.round(weeklyHours * 100) / 100,
        monthlyHours: Math.round(monthlyHours * 100) / 100,
        allTimeHours: Math.round(allTimeHours * 100) / 100,
        totalSessions: allTimeSessions._count,
        forgeScore: user.forgeScore,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak,
        warningCount: user.warningCount,
      },
      dailyData,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
