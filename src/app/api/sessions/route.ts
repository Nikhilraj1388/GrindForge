import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sessions — Get user's sessions
export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const url = new URL(req.url);
    const status = url.searchParams.get("status"); // RUNNING | PAUSED | COMPLETED
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

    const where: Record<string, unknown> = { userId: user.id };
    if (status && ["RUNNING", "PAUSED", "COMPLETED"].includes(status)) {
      where.status = status;
    }

    const [sessions, total, activeSession] = await Promise.all([
      prisma.studySession.findMany({
        where,
        include: {
          group: { select: { id: true, name: true, slug: true } },
          state: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.studySession.count({ where }),
      prisma.studySession.findFirst({
        where: { userId: user.id, status: { in: ["RUNNING", "PAUSED"] } },
        include: { state: true, group: { select: { id: true, name: true } } },
      }),
    ]);

    return NextResponse.json({
      sessions,
      activeSession,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/sessions — Create & start a new session
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Rule: only one active session per user
    const existing = await prisma.studySession.findFirst({
      where: { userId: user.id, status: { in: ["RUNNING", "PAUSED"] } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already have an active session. Complete or stop it first.", activeSessionId: existing.id },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { subject, topic, description, resourceLink, notionLink, groupId } = body;

    if (!subject || typeof subject !== "string" || subject.trim().length < 1) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    // Verify group membership if groupId provided
    if (groupId) {
      const membership = await prisma.groupMember.findFirst({
        where: { groupId, userId: user.id, status: "ACTIVE" },
      });
      if (!membership) {
        return NextResponse.json({ error: "You are not a member of this group" }, { status: 403 });
      }
    }

    const now = new Date();
    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        groupId: groupId || null,
        subject: subject.trim().slice(0, 100),
        topic: typeof topic === "string" ? topic.trim().slice(0, 100) : null,
        description: typeof description === "string" ? description.trim().slice(0, 500) : null,
        resourceLink: typeof resourceLink === "string" ? resourceLink.trim().slice(0, 500) : null,
        notionLink: typeof notionLink === "string" ? notionLink.trim().slice(0, 500) : null,
        status: "RUNNING",
        startedAt: now,
        state: {
          create: {
            lastActiveTimestamp: now,
            currentDurationSeconds: 0,
            isActive: true,
          },
        },
      },
      include: { state: true, group: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
