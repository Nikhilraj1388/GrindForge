import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/groups/[id]/join — Join a group
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

    const group = await prisma.group.findUnique({
      where: { id },
      include: { members: { where: { userId: user.id } } },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Already a member?
    const existing = group.members[0];
    if (existing && existing.status === "ACTIVE") {
      return NextResponse.json(
        { error: "You are already a member of this group" },
        { status: 409 }
      );
    }

    // Private group: create join request
    if (group.visibility === "PRIVATE" && group.allowJoinRequests) {
      // Check for existing pending request
      const existingRequest = await prisma.joinRequest.findFirst({
        where: { groupId: id, userId: user.id, status: "PENDING" },
      });
      if (existingRequest) {
        return NextResponse.json(
          { error: "You already have a pending join request" },
          { status: 409 }
        );
      }

      await prisma.joinRequest.create({
        data: {
          groupId: id,
          userId: user.id,
          status: "PENDING",
        },
      });

      return NextResponse.json({
        message: "Join request sent. Waiting for admin approval.",
        status: "pending",
      });
    }

    // Private group with requests disabled
    if (group.visibility === "PRIVATE" && !group.allowJoinRequests) {
      return NextResponse.json(
        { error: "This group is not accepting new members" },
        { status: 403 }
      );
    }

    // Public group: join directly
    if (existing) {
      // Reactivate removed member
      await prisma.groupMember.update({
        where: { id: existing.id },
        data: { status: "ACTIVE", role: "MEMBER" },
      });
    } else {
      await prisma.groupMember.create({
        data: {
          groupId: id,
          userId: user.id,
          role: "MEMBER",
          status: "ACTIVE",
        },
      });
    }

    // Update member count
    const activeCount = await prisma.groupMember.count({
      where: { groupId: id, status: "ACTIVE" },
    });
    await prisma.group.update({
      where: { id },
      data: { memberCount: activeCount },
    });

    return NextResponse.json({ message: "Joined group successfully" });
  } catch (error) {
    console.error("Join group error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
