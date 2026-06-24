import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/groups/[id] — Get group details
export async function GET(
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

    // Find by id (UUID) or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const group = await prisma.group.findFirst({
      where: isUUID ? { OR: [{ id }, { slug: id }] } : { slug: id },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImage: true,
          },
        },
        members: {
          where: { status: "ACTIVE" },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profileImage: true,
                forgeScore: true,
                currentStreak: true,
                statistics: {
                  select: {
                    dailyHours: true,
                    weeklyHours: true,
                    allTimeHours: true,
                  },
                },
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        goals: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            members: { where: { status: "ACTIVE" } },
            studySessions: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check access for private groups
    const membership = group.members.find((m) => m.userId === user.id);
    if (group.visibility === "PRIVATE" && !membership) {
      return NextResponse.json(
        { error: "This is a private group" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      group,
      isMember: !!membership,
      isAdmin: group.adminId === user.id,
      userRole: membership?.role || null,
    });
  } catch (error) {
    console.error("Get group error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/groups/[id] — Update group (admin only)
export async function PATCH(
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

    // Admin check
    if (group.adminId !== user.id) {
      return NextResponse.json(
        { error: "Only the admin can edit this group" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length < 3) {
        return NextResponse.json(
          { error: "Group name must be at least 3 characters" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim().slice(0, 50);
    }
    if (body.description !== undefined) {
      updateData.description =
        typeof body.description === "string"
          ? body.description.trim().slice(0, 500)
          : null;
    }
    if (body.visibility !== undefined && ["PUBLIC", "PRIVATE"].includes(body.visibility)) {
      updateData.visibility = body.visibility;
    }
    if (body.goalMode !== undefined && ["COMMON", "PERSONAL", "HYBRID"].includes(body.goalMode)) {
      updateData.goalMode = body.goalMode;
    }
    if (body.partyMode !== undefined) {
      updateData.partyMode = Boolean(body.partyMode);
    }
    if (body.idleTimeoutMinutes !== undefined) {
      updateData.idleTimeoutMinutes = Math.max(
        1,
        Math.min(60, Number(body.idleTimeoutMinutes) || 10)
      );
    }
    if (body.allowJoinRequests !== undefined) {
      updateData.allowJoinRequests = Boolean(body.allowJoinRequests);
    }

    const updated = await prisma.group.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ group: updated });
  } catch (error) {
    console.error("Update group error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id] — Delete group (admin only)
export async function DELETE(
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

    if (group.adminId !== user.id) {
      return NextResponse.json(
        { error: "Only the admin can delete this group" },
        { status: 403 }
      );
    }

    await prisma.group.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete group error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
