import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/feed — Get feed posts
export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    const groupId = url.searchParams.get("groupId");

    // Get user's group IDs for feed visibility
    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: { groupId: true },
    });
    const groupIds = memberships.map((m) => m.groupId);

    const where: Record<string, unknown> = groupId
      ? { groupId }
      : {
          OR: [
            { visibility: "PUBLIC" },
            { userId: user.id },
            { groupId: { in: groupIds } },
          ],
        };

    const [posts, total] = await Promise.all([
      prisma.feedPost.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, fullName: true, profileImage: true } },
          group: { select: { id: true, name: true, slug: true } },
          session: { select: { subject: true, topic: true, totalDurationSeconds: true } },
          _count: { select: { comments: true, reactions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.feedPost.count({ where }),
    ]);

    // Check if user has reacted to each post
    const postIds = posts.map((p) => p.id);
    const userReactions = await prisma.reaction.findMany({
      where: { userId: user.id, postId: { in: postIds } },
      select: { postId: true, reactionType: true },
    });
    const reactionMap = new Map(userReactions.map((r) => [r.postId, r.reactionType]));

    const postsWithReactions = posts.map((p) => ({
      ...p,
      userReaction: reactionMap.get(p.id) || null,
    }));

    return NextResponse.json({
      posts: postsWithReactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Feed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/feed — Create a feed post
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { content, groupId, sessionId, resourceLink, notionLink, visibility } = body;

    if (!content || typeof content !== "string" || content.trim().length < 1) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Verify session belongs to user if provided (no orphan posts per RULES.md)
    if (sessionId) {
      const session = await prisma.studySession.findUnique({ where: { id: sessionId } });
      if (!session || session.userId !== user.id) {
        return NextResponse.json({ error: "Invalid session" }, { status: 400 });
      }
    }

    // Verify group membership if groupId
    if (groupId) {
      const membership = await prisma.groupMember.findFirst({
        where: { groupId, userId: user.id, status: "ACTIVE" },
      });
      if (!membership) {
        return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
      }
    }

    const post = await prisma.feedPost.create({
      data: {
        userId: user.id,
        groupId: groupId || null,
        sessionId: sessionId || null,
        content: content.trim().slice(0, 1000),
        resourceLink: typeof resourceLink === "string" ? resourceLink.trim() : null,
        notionLink: typeof notionLink === "string" ? notionLink.trim() : null,
        visibility: visibility === "GROUP" ? "GROUP" : "PUBLIC",
      },
      include: {
        user: { select: { id: true, username: true, fullName: true, profileImage: true } },
        group: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
