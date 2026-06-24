import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username, bio } = body;

    // Validate username
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    // Check if username is taken
    const existingUser = await prisma.user.findUnique({
      where: { username: trimmedUsername },
    });

    if (existingUser && existingUser.clerkId !== clerkId) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    // Upsert user with profile info
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        username: trimmedUsername,
        bio: typeof bio === "string" ? bio.trim().slice(0, 200) : null,
      },
      create: {
        clerkId,
        email: "", // Will be updated by sync
        username: trimmedUsername,
        bio: typeof bio === "string" ? bio.trim().slice(0, 200) : null,
        statistics: {
          create: {},
        },
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
