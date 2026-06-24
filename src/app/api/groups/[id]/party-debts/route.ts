import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/groups/[id]/party-debts — Get party debts for a group
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

    const membership = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: user.id, status: "ACTIVE" },
    });
    if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const debts = await prisma.partyDebt.findMany({
      where: { groupId: id },
      include: {
        user: { select: { id: true, username: true, fullName: true } },
        markedBy: { select: { username: true, fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ debts });
  } catch (error) {
    console.error("Get party debts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/groups/[id]/party-debts — Create a party debt (admin/mod only)
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

    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
    if (!group.partyMode) return NextResponse.json({ error: "Party mode is disabled" }, { status: 400 });

    const membership = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: user.id, status: "ACTIVE", role: { in: ["ADMIN", "MODERATOR"] } },
    });
    if (!membership) return NextResponse.json({ error: "Only admins/mods can create party debts" }, { status: 403 });

    const body = await req.json();
    const { targetUserId, reason } = body;

    if (!targetUserId) return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });

    const debt = await prisma.partyDebt.create({
      data: {
        groupId: id,
        userId: targetUserId,
        reason: typeof reason === "string" ? reason.trim().slice(0, 200) : "Goal not met",
        status: "PENDING",
        markedById: user.id,
      },
    });

    // Increment user's party debt count
    await prisma.user.update({
      where: { id: targetUserId },
      data: { partyDebtCount: { increment: 1 } },
    });

    return NextResponse.json({ debt }, { status: 201 });
  } catch (error) {
    console.error("Create party debt error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/groups/[id]/party-debts — Complete a party debt
export async function PATCH(
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
    const { debtId } = body;

    const debt = await prisma.partyDebt.findUnique({ where: { id: debtId } });
    if (!debt || debt.groupId !== id) return NextResponse.json({ error: "Debt not found" }, { status: 404 });

    // Only the debtor or admin can mark complete
    const membership = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: user.id, status: "ACTIVE" },
    });
    if (debt.userId !== user.id && membership?.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.partyDebt.update({
      where: { id: debtId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    return NextResponse.json({ message: "Debt completed" });
  } catch (error) {
    console.error("Complete debt error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
