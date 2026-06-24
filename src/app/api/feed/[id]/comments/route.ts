import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/feed/[id]/comments — Get comments for a post
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const comments = await prisma.comment.findMany({
      where: { postId: id },
      include: {
        user: { select: { id: true, username: true, fullName: true, profileImage: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/feed/[id]/comments — Add a comment
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length < 1) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        userId: user.id,
        content: content.trim().slice(0, 500),
      },
      include: {
        user: { select: { id: true, username: true, fullName: true, profileImage: true } },
      },
    });

    await prisma.feedPost.update({ where: { id }, data: { commentsCount: { increment: 1 } } });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
