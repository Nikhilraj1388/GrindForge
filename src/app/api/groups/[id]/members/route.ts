import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/groups/[id]/members — Admin: manage members (remove, change role, approve request)
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

    // Check admin/moderator role
    const adminMembership = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: user.id,
        status: "ACTIVE",
        role: { in: ["ADMIN", "MODERATOR"] },
      },
    });

    if (!adminMembership) {
      return NextResponse.json(
        { error: "Only admins and moderators can manage members" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, targetUserId, role } = body;

    if (!action || !targetUserId) {
      return NextResponse.json(
        { error: "action and targetUserId are required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "remove": {
        // Cannot remove self or admin
        const group = await prisma.group.findUnique({ where: { id } });
        if (targetUserId === group?.adminId) {
          return NextResponse.json(
            { error: "Cannot remove the group admin" },
            { status: 400 }
          );
        }

        await prisma.groupMember.updateMany({
          where: { groupId: id, userId: targetUserId, status: "ACTIVE" },
          data: { status: "REMOVED" },
        });

        const activeCount = await prisma.groupMember.count({
          where: { groupId: id, status: "ACTIVE" },
        });
        await prisma.group.update({
          where: { id },
          data: { memberCount: activeCount },
        });

        return NextResponse.json({ message: "Member removed" });
      }

      case "changeRole": {
        // Only admin can change roles
        const group2 = await prisma.group.findUnique({ where: { id } });
        if (group2?.adminId !== user.id) {
          return NextResponse.json(
            { error: "Only the admin can change roles" },
            { status: 403 }
          );
        }

        const validRoles = ["MEMBER", "MODERATOR"];
        if (!role || !validRoles.includes(role)) {
          return NextResponse.json(
            { error: "Invalid role. Must be MEMBER or MODERATOR" },
            { status: 400 }
          );
        }

        await prisma.groupMember.updateMany({
          where: { groupId: id, userId: targetUserId, status: "ACTIVE" },
          data: { role },
        });

        return NextResponse.json({ message: `Role changed to ${role}` });
      }

      case "approveRequest": {
        const joinRequest = await prisma.joinRequest.findFirst({
          where: {
            groupId: id,
            userId: targetUserId,
            status: "PENDING",
          },
        });

        if (!joinRequest) {
          return NextResponse.json(
            { error: "No pending request found" },
            { status: 404 }
          );
        }

        // Approve: create membership and update request
        await prisma.$transaction([
          prisma.joinRequest.update({
            where: { id: joinRequest.id },
            data: { status: "APPROVED" },
          }),
          prisma.groupMember.create({
            data: {
              groupId: id,
              userId: targetUserId,
              role: "MEMBER",
              status: "ACTIVE",
            },
          }),
        ]);

        const activeCount2 = await prisma.groupMember.count({
          where: { groupId: id, status: "ACTIVE" },
        });
        await prisma.group.update({
          where: { id },
          data: { memberCount: activeCount2 },
        });

        return NextResponse.json({ message: "Request approved" });
      }

      case "rejectRequest": {
        await prisma.joinRequest.updateMany({
          where: { groupId: id, userId: targetUserId, status: "PENDING" },
          data: { status: "REJECTED" },
        });

        return NextResponse.json({ message: "Request rejected" });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Manage members error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
