import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/groups/[id]/leave — Leave a group
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Admin cannot leave (must transfer or delete)
    if (group.adminId === user.id) {
      return NextResponse.json(
        {
          error:
            "Admin cannot leave. Transfer admin role or delete the group.",
        },
        { status: 400 }
      );
    }

    const membership = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: user.id, status: "ACTIVE" },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 400 }
      );
    }

    await prisma.groupMember.update({
      where: { id: membership.id },
      data: { status: "REMOVED" },
    });

    // Update member count
    const activeCount = await prisma.groupMember.count({
      where: { groupId: id, status: "ACTIVE" },
    });
    await prisma.group.update({
      where: { id },
      data: { memberCount: activeCount },
    });

    return NextResponse.json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Leave group error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
