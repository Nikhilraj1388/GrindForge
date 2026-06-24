import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/groups/invitations — List pending group invitations
export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const invitations = await prisma.groupMember.findMany({
      where: {
        userId: user.id,
        status: "PENDING",
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            visibility: true,
            memberCount: true,
            admin: {
              select: {
                username: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("List invitations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/groups/invitations — Accept or Reject an invitation
export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { groupId, action } = body;

    if (!groupId || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "groupId and a valid action ('accept' or 'reject') are required" },
        { status: 400 }
      );
    }

    const invitation = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id,
        },
      },
    });

    if (!invitation || invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Invitation not found or no longer pending" },
        { status: 404 }
      );
    }

    if (action === "accept") {
      // Accept: activate membership and update memberCount
      await prisma.groupMember.update({
        where: { id: invitation.id },
        data: { status: "ACTIVE" },
      });

      const activeCount = await prisma.groupMember.count({
        where: { groupId, status: "ACTIVE" },
      });

      await prisma.group.update({
        where: { id: groupId },
        data: { memberCount: activeCount },
      });

      return NextResponse.json({ message: "Joined group successfully!" });
    } else {
      // Reject: delete membership
      await prisma.groupMember.delete({
        where: { id: invitation.id },
      });

      return NextResponse.json({ message: "Invitation rejected." });
    }
  } catch (error) {
    console.error("Handle invitation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
