import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/warnings — Create a warning (called by idle detection)
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { sessionId, groupId, warningType, message } = body;

    const validTypes = ["IDLE", "CHECKPOINT", "OTHER"];
    if (!warningType || !validTypes.includes(warningType)) {
      return NextResponse.json({ error: "Invalid warning type" }, { status: 400 });
    }

    const warning = await prisma.warning.create({
      data: {
        userId: user.id,
        groupId: groupId || null,
        sessionId: sessionId || null,
        warningType,
        message: typeof message === "string" ? message.trim().slice(0, 500) : "Idle detected",
      },
    });

    // Increment user warning count
    await prisma.user.update({
      where: { id: user.id },
      data: { warningCount: { increment: 1 } },
    });

    return NextResponse.json({ warning }, { status: 201 });
  } catch (error) {
    console.error("Warning error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/warnings — Get user's warnings
export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

    const warnings = await prisma.warning.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        group: { select: { name: true } },
        session: { select: { subject: true } },
      },
    });

    return NextResponse.json({ warnings });
  } catch (error) {
    console.error("Get warnings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
