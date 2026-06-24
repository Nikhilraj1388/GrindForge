import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/sessions/[id]/checkpoint — Submit learning checkpoint
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

    const session = await prisma.studySession.findUnique({ where: { id } });
    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const body = await req.json();
    const { response } = body;

    if (!response || typeof response !== "string" || response.trim().length < 1) {
      return NextResponse.json({ error: "Response is required" }, { status: 400 });
    }

    const checkpoint = await prisma.learningCheckpoint.create({
      data: {
        sessionId: id,
        userId: user.id,
        response: response.trim().slice(0, 500),
      },
    });

    return NextResponse.json({ checkpoint }, { status: 201 });
  } catch (error) {
    console.error("Checkpoint error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
