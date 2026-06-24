import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/groups — List groups (public + user's groups)
export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const filter = url.searchParams.get("filter") || "all"; // all | my | public
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let where = {};

    if (filter === "my") {
      where = {
        members: { some: { userId: user.id, status: "ACTIVE" } },
      };
    } else if (filter === "public") {
      where = { visibility: "PUBLIC" };
    } else {
      // all: public groups + groups user is a member of
      where = {
        OR: [
          { visibility: "PUBLIC" },
          { members: { some: { userId: user.id, status: "ACTIVE" } } },
        ],
      };
    }

    if (search) {
      where = {
        AND: [
          where,
          {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              {
                description: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          },
        ],
      };
    }

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        include: {
          admin: {
            select: { id: true, username: true, fullName: true, profileImage: true },
          },
          members: {
            where: { status: "ACTIVE" },
            take: 5,
            include: {
              user: {
                select: { id: true, username: true, profileImage: true },
              },
            },
          },
          _count: {
            select: { members: { where: { status: "ACTIVE" } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.group.count({ where }),
    ]);

    // Add isMember flag
    const groupsWithMembership = groups.map((group) => ({
      ...group,
      isMember: group.members.some((m) => m.userId === user.id),
      isAdmin: group.adminId === user.id,
    }));

    return NextResponse.json({
      groups: groupsWithMembership,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List groups error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/groups — Create a new group
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
    const { name, description, visibility, goalMode, partyMode, idleTimeoutMinutes } = body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Group name must be at least 3 characters" },
        { status: 400 }
      );
    }
    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: "Group name must be 50 characters or less" },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check slug uniqueness
    const existingSlug = await prisma.group.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Validate visibility
    const validVisibilities = ["PUBLIC", "PRIVATE"];
    const groupVisibility =
      visibility && validVisibilities.includes(visibility) ? visibility : "PRIVATE";

    // Validate goalMode
    const validGoalModes = ["COMMON", "PERSONAL", "HYBRID"];
    const groupGoalMode =
      goalMode && validGoalModes.includes(goalMode) ? goalMode : "COMMON";

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        slug,
        description:
          typeof description === "string"
            ? description.trim().slice(0, 500)
            : null,
        visibility: groupVisibility,
        goalMode: groupGoalMode,
        partyMode: Boolean(partyMode),
        idleTimeoutMinutes:
          typeof idleTimeoutMinutes === "number"
            ? Math.max(1, Math.min(60, idleTimeoutMinutes))
            : 10,
        adminId: user.id,
        memberCount: 1,
        members: {
          create: {
            userId: user.id,
            role: "ADMIN",
            status: "ACTIVE",
          },
        },
      },
      include: {
        admin: {
          select: { id: true, username: true, fullName: true, profileImage: true },
        },
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
