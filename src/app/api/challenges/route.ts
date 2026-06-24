import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/challenges — List challenges
export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const url = new URL(req.url);
    const filter = url.searchParams.get("filter") || "all"; // all | joined | public
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

    let where = {};
    if (filter === "joined") {
      where = { participants: { some: { userId: user.id } } };
    } else if (filter === "public") {
      where = { isPublic: true };
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        createdBy: { select: { username: true, fullName: true } },
        participants: { where: { userId: user.id }, select: { id: true, progress: true } },
        _count: { select: { participants: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const result = challenges.map((c) => ({
      ...c,
      isJoined: c.participants.length > 0,
      userProgress: c.participants[0]?.progress || 0,
    }));

    return NextResponse.json({ challenges: result });
  } catch (error) {
    console.error("List challenges error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/challenges — Create a challenge
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { title, description, challengeType, goalValue, durationDays, isPublic } = body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json({ error: "Title must be at least 3 characters" }, { status: 400 });
    }

    const validTypes = ["HOURS", "STREAK", "CUSTOM"];
    if (!challengeType || !validTypes.includes(challengeType)) {
      return NextResponse.json({ error: "Invalid challenge type" }, { status: 400 });
    }

    const challenge = await prisma.challenge.create({
      data: {
        title: title.trim().slice(0, 100),
        description: typeof description === "string" ? description.trim().slice(0, 500) : null,
        challengeType,
        goalValue: typeof goalValue === "number" ? goalValue : 100,
        durationDays: typeof durationDays === "number" ? Math.max(1, Math.min(365, durationDays)) : 30,
        isPublic: isPublic !== false,
        createdById: user.id,
        participants: { create: { userId: user.id, progress: 0 } },
      },
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error("Create challenge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
