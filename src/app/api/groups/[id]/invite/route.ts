import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/groups/[id]/invite — Invite a user to a group
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

    // Resolve group (by ID or slug)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const group = await prisma.group.findFirst({
      where: isUUID ? { OR: [{ id }, { slug: id }] } : { slug: id },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if caller is admin or moderator
    const callerMembership = await prisma.groupMember.findFirst({
      where: {
        groupId: group.id,
        userId: user.id,
        status: "ACTIVE",
        role: { in: ["ADMIN", "MODERATOR"] },
      },
    });

    if (!callerMembership && group.adminId !== user.id) {
      return NextResponse.json(
        { error: "Only group admins and moderators can invite members" },
        { status: 403 }
      );
    }

    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // Find target user by username (case-insensitive search)
    const targetUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username.trim(),
          mode: "insensitive" as const,
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: `User "${username}" not found` }, { status: 404 });
    }

    if (targetUser.id === user.id) {
      return NextResponse.json({ error: "You cannot invite yourself" }, { status: 400 });
    }

    // Check existing membership
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId: group.id,
        userId: targetUser.id,
      },
    });

    if (existingMember) {
      if (existingMember.status === "ACTIVE") {
        return NextResponse.json(
          { error: `${targetUser.username || "User"} is already an active member of this group` },
          { status: 400 }
        );
      }
      if (existingMember.status === "PENDING") {
        return NextResponse.json(
          { error: `An invitation or join request is already pending for ${targetUser.username || "User"}` },
          { status: 400 }
        );
      }
    }

    // Create / update invitation membership to PENDING
    if (existingMember) {
      await prisma.groupMember.update({
        where: { id: existingMember.id },
        data: { status: "PENDING", role: "MEMBER" },
      });
    } else {
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: targetUser.id,
          role: "MEMBER",
          status: "PENDING",
        },
      });
    }

    // Create notification for target user
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        title: "Group Invitation",
        message: `You have been invited to join the group "${group.name}".`,
        type: "GROUP_INVITATION",
      },
    });

    return NextResponse.json({ message: "Invitation sent successfully!" });
  } catch (error) {
    console.error("Invite user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
