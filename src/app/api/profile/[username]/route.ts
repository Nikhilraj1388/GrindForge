import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/profile/[username] — Get public profile by username
export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { userId: clerkId } = await auth();

    const profile = await prisma.user.findUnique({
      where: { username },
      include: {
        statistics: true,
        userAchievements: { include: { achievement: true }, orderBy: { earnedAt: "desc" } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check privacy
    const isOwner = clerkId && profile.clerkId === clerkId;
    if (!profile.isPublic && !isOwner) {
      return NextResponse.json({ error: "This profile is private" }, { status: 403 });
    }

    // Get recent sessions (public view)
    const recentSessions = await prisma.studySession.findMany({
      where: { userId: profile.id, status: "COMPLETED" },
      select: { id: true, subject: true, topic: true, totalDurationSeconds: true, startedAt: true },
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    // Get groups user is in (public only)
    const groups = await prisma.groupMember.findMany({
      where: { userId: profile.id, status: "ACTIVE" },
      include: { group: { select: { name: true, slug: true, visibility: true, memberCount: true } } },
      take: 5,
    });
    const publicGroups = groups
      .filter((g) => g.group.visibility === "PUBLIC")
      .map((g) => g.group);

    return NextResponse.json({
      profile: {
        username: profile.username,
        fullName: profile.fullName,
        profileImage: profile.profileImage,
        bio: profile.bio,
        forgeScore: profile.forgeScore,
        currentStreak: profile.currentStreak,
        bestStreak: profile.bestStreak,
        createdAt: profile.createdAt,
        isPublic: profile.isPublic,
      },
      statistics: profile.statistics,
      achievements: profile.userAchievements,
      recentSessions,
      publicGroups,
      isOwner: !!isOwner,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
