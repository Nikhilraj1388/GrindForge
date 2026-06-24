import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sessions/[id] — Get session detail
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const session = await prisma.studySession.findUnique({
      where: { id },
      include: { state: true, group: { select: { id: true, name: true, slug: true } } },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/sessions/[id] — Update session (pause, resume, stop, heartbeat)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const session = await prisma.studySession.findUnique({
      where: { id },
      include: { state: true },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const body = await req.json();
    const { action, currentDurationSeconds } = body;

    switch (action) {
      case "pause": {
        if (session.status !== "RUNNING") {
          return NextResponse.json({ error: "Session is not running" }, { status: 400 });
        }

        const duration = typeof currentDurationSeconds === "number" ? currentDurationSeconds : session.state?.currentDurationSeconds || 0;

        await prisma.$transaction([
          prisma.studySession.update({
            where: { id },
            data: { status: "PAUSED", totalDurationSeconds: duration },
          }),
          ...(session.state ? [prisma.sessionState.update({
            where: { id: session.state.id },
            data: { isActive: false, currentDurationSeconds: duration, lastActiveTimestamp: new Date() },
          })] : []),
        ]);

        return NextResponse.json({ message: "Session paused", status: "PAUSED" });
      }

      case "resume": {
        if (session.status !== "PAUSED") {
          return NextResponse.json({ error: "Session is not paused" }, { status: 400 });
        }

        // Check no other active session
        const otherActive = await prisma.studySession.findFirst({
          where: { userId: user.id, status: "RUNNING", id: { not: id } },
        });
        if (otherActive) {
          return NextResponse.json({ error: "Another session is already running" }, { status: 409 });
        }

        await prisma.$transaction([
          prisma.studySession.update({
            where: { id },
            data: { status: "RUNNING" },
          }),
          ...(session.state ? [prisma.sessionState.update({
            where: { id: session.state.id },
            data: { isActive: true, lastActiveTimestamp: new Date() },
          })] : []),
        ]);

        return NextResponse.json({ message: "Session resumed", status: "RUNNING" });
      }

      case "stop": {
        if (session.status === "COMPLETED") {
          return NextResponse.json({ error: "Session already completed" }, { status: 400 });
        }

        const finalDuration = typeof currentDurationSeconds === "number" ? currentDurationSeconds : session.totalDurationSeconds;

        await prisma.$transaction([
          prisma.studySession.update({
            where: { id },
            data: { status: "COMPLETED", totalDurationSeconds: finalDuration, endedAt: new Date() },
          }),
          ...(session.state ? [prisma.sessionState.update({
            where: { id: session.state.id },
            data: { isActive: false, currentDurationSeconds: finalDuration },
          })] : []),
          // Update user statistics
          prisma.userStatistics.update({
            where: { userId: user.id },
            data: { totalSessions: { increment: 1 } },
          }),
        ]);

        return NextResponse.json({ message: "Session completed", status: "COMPLETED" });
      }

      case "heartbeat": {
        // Auto-save: update duration and activity timestamps
        if (session.status !== "RUNNING") {
          return NextResponse.json({ error: "Session is not running" }, { status: 400 });
        }

        const heartbeatDuration = typeof currentDurationSeconds === "number" ? currentDurationSeconds : session.state?.currentDurationSeconds || 0;

        if (session.state) {
          await prisma.sessionState.update({
            where: { id: session.state.id },
            data: {
              currentDurationSeconds: heartbeatDuration,
              lastActiveTimestamp: new Date(),
              lastMouseActivity: body.lastMouseActivity ? new Date(body.lastMouseActivity) : undefined,
              lastKeyboardActivity: body.lastKeyboardActivity ? new Date(body.lastKeyboardActivity) : undefined,
            },
          });
        }

        await prisma.studySession.update({
          where: { id },
          data: { totalDurationSeconds: heartbeatDuration },
        });

        return NextResponse.json({ message: "Heartbeat received" });
      }

      default:
        return NextResponse.json({ error: "Invalid action. Use: pause, resume, stop, heartbeat" }, { status: 400 });
    }
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
