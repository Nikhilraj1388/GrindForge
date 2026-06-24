"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Flame, Pause, Play, Square, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type SessionData = {
  id: string; subject: string; topic: string | null; description: string | null;
  resourceLink: string | null; notionLink: string | null;
  status: "RUNNING" | "PAUSED" | "COMPLETED"; totalDurationSeconds: number;
  startedAt: string; endedAt: string | null;
  state: { currentDurationSeconds: number; isActive: boolean } | null;
  group: { id: string; name: string } | null;
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function StudySessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSession(data.session);
      setElapsed(data.session.state?.currentDurationSeconds || data.session.totalDurationSeconds || 0);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  // Keep a ref of elapsed time to avoid resetting intervals every second
  const elapsedRef = useRef(elapsed);
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  // Timer
  useEffect(() => {
    if (session?.status === "RUNNING") {
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session?.status]);

  // Heartbeat: auto-save every 30s (no longer recreates every second)
  useEffect(() => {
    if (session?.status === "RUNNING") {
      heartbeatRef.current = setInterval(async () => {
        await fetch(`/api/sessions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "heartbeat", currentDurationSeconds: elapsedRef.current }),
        });
      }, 30000);
    }
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, [session?.status, id]);

  // Save on unload (no longer recreates every second)
  useEffect(() => {
    const handleUnload = () => {
      if (session?.status === "RUNNING") {
        navigator.sendBeacon(`/api/sessions/${id}`, JSON.stringify({ action: "heartbeat", currentDurationSeconds: elapsedRef.current }));
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [session?.status, id]);

  async function handleAction(action: "pause" | "resume" | "stop") {
    if (action === "stop" && !confirm("Stop this session?")) return;

    // Optimistically update the UI to avoid lag
    const previousSession = session;
    if (action === "pause") {
      setSession((prev) => prev ? { ...prev, status: "PAUSED" } : null);
    } else if (action === "resume") {
      setSession((prev) => prev ? { ...prev, status: "RUNNING" } : null);
    } else if (action === "stop") {
      setSession((prev) => prev ? { ...prev, status: "COMPLETED" } : null);
    }

    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, currentDurationSeconds: elapsed }),
      });
      
      if (!res.ok) {
        // Revert on error
        setSession(previousSession);
        alert("Failed to update study session. Please try again.");
      } else {
        if (action === "stop") {
          router.push("/study");
        } else {
          // Re-fetch the session in background to sync any other metadata
          fetchSession();
        }
      }
    } catch (err) {
      setSession(previousSession);
      console.error("Session action error:", err);
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!session) return <div className="p-6 text-center text-muted-foreground">Session not found</div>;

  const isActive = session.status === "RUNNING" || session.status === "PAUSED";

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      {/* Timer Circle */}
      <div className="relative flex size-64 items-center justify-center">
        <svg viewBox="0 0 200 200" className="size-full -rotate-90">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
          {isActive && (
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="4"
              strokeDasharray={`${Math.min((elapsed / 3600) * 565.48, 565.48)} 565.48`}
              strokeLinecap="round" className="text-primary transition-all duration-1000" />
          )}
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-mono text-4xl font-extrabold text-foreground tracking-wider">{formatTime(elapsed)}</span>
          <span className={`mt-1 text-sm font-medium ${session.status === "RUNNING" ? "text-primary" : session.status === "PAUSED" ? "text-[#facc15]" : "text-[#22c55e]"}`}>
            {session.status === "RUNNING" ? "🔥 Forging..." : session.status === "PAUSED" ? "⏸ Paused" : "✅ Completed"}
          </span>
        </div>
      </div>

      {/* Session Info */}
      <div className="mt-6 text-center">
        <h2 className="text-lg font-bold text-foreground">{session.subject}</h2>
        {session.topic && <p className="text-sm text-muted-foreground">{session.topic}</p>}
        {session.group && (
          <p className="mt-1 text-xs text-primary">📍 {session.group.name}</p>
        )}
      </div>

      {/* Controls */}
      {isActive && (
        <div className="mt-8 flex items-center gap-4">
          {session.status === "RUNNING" ? (
            <Button onClick={() => handleAction("pause")} variant="outline" className="h-12 w-32 gap-2 text-sm font-semibold">
              <Pause className="size-4" /> Pause
            </Button>
          ) : (
            <Button onClick={() => handleAction("resume")} className="h-12 w-32 gap-2 text-sm font-semibold">
              <Play className="size-4" /> Resume
            </Button>
          )}
          <Button onClick={() => handleAction("stop")} variant="ghost" className="h-12 w-32 gap-2 text-sm font-semibold text-destructive hover:text-destructive hover:bg-destructive/10">
            <Square className="size-4" /> Stop
          </Button>
        </div>
      )}

      {/* Links */}
      {(session.resourceLink || session.notionLink) && (
        <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
          {session.resourceLink && (
            <a href={session.resourceLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
              <ExternalLink className="size-3" /> Resource
            </a>
          )}
          {session.notionLink && (
            <a href={session.notionLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
              <ExternalLink className="size-3" /> Notes
            </a>
          )}
        </div>
      )}
    </div>
  );
}
