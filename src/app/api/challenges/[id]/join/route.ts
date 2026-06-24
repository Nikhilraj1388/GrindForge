import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/challenges/[id]/join — Join a challenge
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

    const challenge = await prisma.challenge.findUnique({ where: { id } });
    if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

    const existing = await prisma.challengeParticipant.findFirst({
      where: { challengeId: id, userId: user.id },
    });
    if (existing) return NextResponse.json({ error: "Already joined" }, { status: 409 });

    await prisma.challengeParticipant.create({
      data: { challengeId: id, userId: user.id, progress: 0 },
    });

    return NextResponse.json({ message: "Joined challenge" });
  } catch (error) {
    console.error("Join challenge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
