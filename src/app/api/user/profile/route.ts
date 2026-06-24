import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user/profile — Get current user's profile
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { statistics: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile — Update current user's profile
export async function PATCH(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username, bio, isPublic } = body;

    // Validate username if provided
    if (username !== undefined) {
      if (typeof username !== "string" || username.trim().length < 3) {
        return NextResponse.json(
          { error: "Username must be at least 3 characters" },
          { status: 400 }
        );
      }
      if (username.trim().length > 20) {
        return NextResponse.json(
          { error: "Username must be 20 characters or less" },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        return NextResponse.json(
          {
            error:
              "Username can only contain letters, numbers, and underscores",
          },
          { status: 400 }
        );
      }

      // Check uniqueness
      const existing = await prisma.user.findUnique({
        where: { username: username.trim().toLowerCase() },
      });
      if (existing && existing.clerkId !== clerkId) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (username !== undefined)
      updateData.username = username.trim().toLowerCase();
    if (bio !== undefined)
      updateData.bio =
        typeof bio === "string" ? bio.trim().slice(0, 200) : null;
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);

    const user = await prisma.user.update({
      where: { clerkId },
      data: updateData,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
