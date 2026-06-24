import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/groups/[id]/goals — Get goals for a group
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Verify membership
    const membership = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: user.id, status: "ACTIVE" },
    });
    if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const [groupGoals, userGoals] = await Promise.all([
      prisma.groupGoal.findMany({
        where: { groupId: id },
        include: { createdBy: { select: { username: true, fullName: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.userGoal.findMany({
        where: { groupId: id, userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ groupGoals, userGoals });
  } catch (error) {
    console.error("Get goals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/groups/[id]/goals — Create a goal
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

    const membership = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: user.id, status: "ACTIVE" },
    });
    if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const body = await req.json();
    const { goalType, targetHours, isPersonal } = body;

    // Validate
    const validTypes = ["DAILY", "WEEKLY", "MONTHLY"];
    if (!goalType || !validTypes.includes(goalType)) {
      return NextResponse.json({ error: "Invalid goal type" }, { status: 400 });
    }
    if (!targetHours || typeof targetHours !== "number" || targetHours < 1 || targetHours > 720) {
      return NextResponse.json({ error: "Target hours must be 1-720" }, { status: 400 });
    }

    // Personal goal: any member can create
    if (isPersonal || group.goalMode === "PERSONAL") {
      const goal = await prisma.userGoal.create({
        data: { userId: user.id, groupId: id, goalType, targetHours },
      });
      return NextResponse.json({ goal, type: "personal" }, { status: 201 });
    }

    // Common goal: admin/moderator only
    if (group.goalMode === "COMMON" && !["ADMIN", "MODERATOR"].includes(membership.role)) {
      return NextResponse.json({ error: "Only admins can set common goals" }, { status: 403 });
    }

    const goal = await prisma.groupGoal.create({
      data: { groupId: id, goalType, targetHours, createdById: user.id },
    });
    return NextResponse.json({ goal, type: "group" }, { status: 201 });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
