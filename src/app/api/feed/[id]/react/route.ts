import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/feed/[id]/react — Toggle reaction on a post
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
    const { reactionType } = body;

    const validTypes = ["LIKE", "FIRE", "CLAP"];
    if (!reactionType || !validTypes.includes(reactionType)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    // Toggle: remove if exists, create if not
    const existing = await prisma.reaction.findFirst({
      where: { postId: id, userId: user.id },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      await prisma.feedPost.update({ where: { id }, data: { likesCount: { decrement: 1 } } });
      return NextResponse.json({ action: "removed" });
    }

    await prisma.reaction.create({
      data: { postId: id, userId: user.id, reactionType },
    });
    await prisma.feedPost.update({ where: { id }, data: { likesCount: { increment: 1 } } });

    return NextResponse.json({ action: "added", reactionType });
  } catch (error) {
    console.error("React error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
