import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncUser } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await syncUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
