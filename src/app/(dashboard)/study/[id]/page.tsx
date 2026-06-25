"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pause, Play, Square, ExternalLink } from "lucide-react";
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
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ─── localStorage helpers for persisting timer state ───
const STORAGE_KEY_PREFIX = "grindforge_timer_";

type PersistedTimerState = {
  wallStartTime: number;       // Date.now() when session last started/resumed
  accumulatedSeconds: number;  // seconds accumulated before the last start/resume
  status: "RUNNING" | "PAUSED" | "COMPLETED";
};

function saveTimerState(sessionId: string, state: PersistedTimerState) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + sessionId, JSON.stringify(state));
  } catch { /* quota exceeded or SSR — ignore */ }
}

function loadTimerState(sessionId: string): PersistedTimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + sessionId);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearTimerState(sessionId: string) {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + sessionId);
  } catch { /* ignore */ }
}

// ─── Compute elapsed from wall‑clock timestamps ───
function computeElapsed(state: PersistedTimerState): number {
  if (state.status !== "RUNNING") return state.accumulatedSeconds;
  return state.accumulatedSeconds + (Date.now() - state.wallStartTime) / 1000;
}

export default function StudySessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Refs for the timestamp‑based timer
  const timerStateRef = useRef<PersistedTimerState | null>(null);
  const rafRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Tick: compute elapsed from wall‑clock ───
  const tick = useCallback(() => {
    if (timerStateRef.current && timerStateRef.current.status === "RUNNING") {
      setElapsed(Math.floor(computeElapsed(timerStateRef.current)));
    }
  }, []);

  // ─── Start the UI update loop ───
  const startTicking = useCallback(() => {
    // Use requestAnimationFrame for smooth updates when tab is visible
    const rafLoop = () => {
      tick();
      rafRef.current = requestAnimationFrame(rafLoop);
    };
    rafRef.current = requestAnimationFrame(rafLoop);

    // Also run a 1‑second setInterval as a fallback — browsers throttle rAF
    // in background tabs but still run setInterval (at ~1s minimum). Since we
    // compute from wall‑clock, the value will jump to the correct time even
    // after throttling.
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const stopTicking = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  // ─── Fetch session from server ───
  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${id}`);
    if (res.ok) {
      const data = await res.json();
      const s: SessionData = data.session;
      setSession(s);

      const serverElapsed = s.state?.currentDurationSeconds ?? s.totalDurationSeconds ?? 0;

      // Try to recover persisted wall‑clock state
      const persisted = loadTimerState(id);

      if (s.status === "RUNNING") {
        if (persisted && persisted.status === "RUNNING") {
          // Persisted state exists — use it (covers page refresh)
          timerStateRef.current = persisted;
        } else {
          // No persisted state (first load or after clear) — initialise
          timerStateRef.current = {
            wallStartTime: Date.now(),
            accumulatedSeconds: serverElapsed,
            status: "RUNNING",
          };
          saveTimerState(id, timerStateRef.current);
        }
        setElapsed(Math.floor(computeElapsed(timerStateRef.current)));
      } else {
        timerStateRef.current = {
          wallStartTime: 0,
          accumulatedSeconds: serverElapsed,
          status: s.status,
        };
        setElapsed(serverElapsed);
        if (s.status === "COMPLETED") clearTimerState(id);
        else saveTimerState(id, timerStateRef.current);
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  // ─── Start / stop the tick loop when status changes ───
  useEffect(() => {
    if (session?.status === "RUNNING") {
      startTicking();
    } else {
      stopTicking();
    }
    return stopTicking;
  }, [session?.status, startTicking, stopTicking]);

  // ─── Visibility change: recalculate immediately when tab becomes visible ───
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && timerStateRef.current?.status === "RUNNING") {
        tick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [tick]);

  // ─── Heartbeat: auto‑save to server every 30 s ───
  useEffect(() => {
    if (session?.status === "RUNNING") {
      heartbeatRef.current = setInterval(async () => {
        const currentElapsed = timerStateRef.current ? Math.floor(computeElapsed(timerStateRef.current)) : 0;
        await fetch(`/api/sessions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "heartbeat", currentDurationSeconds: currentElapsed }),
        });
      }, 30000);
    }
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, [session?.status, id]);

  // ─── Save on unload via sendBeacon ───
  useEffect(() => {
    const handleUnload = () => {
      if (timerStateRef.current?.status === "RUNNING") {
        const currentElapsed = Math.floor(computeElapsed(timerStateRef.current));
        navigator.sendBeacon(
          `/api/sessions/${id}`,
          JSON.stringify({ action: "heartbeat", currentDurationSeconds: currentElapsed }),
        );
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [id]);

  // ─── Action handler (pause / resume / stop) ───
  async function handleAction(action: "pause" | "resume" | "stop") {
    if (action === "stop" && !confirm("Stop this session?")) return;

    const currentElapsed = timerStateRef.current
      ? Math.floor(computeElapsed(timerStateRef.current))
      : elapsed;

    // Optimistically update the UI
    const previousSession = session;
    const previousTimerState = timerStateRef.current ? { ...timerStateRef.current } : null;

    if (action === "pause") {
      setSession((prev) => prev ? { ...prev, status: "PAUSED" } : null);
      timerStateRef.current = { wallStartTime: 0, accumulatedSeconds: currentElapsed, status: "PAUSED" };
      saveTimerState(id, timerStateRef.current);
      setElapsed(currentElapsed);
    } else if (action === "resume") {
      setSession((prev) => prev ? { ...prev, status: "RUNNING" } : null);
      timerStateRef.current = { wallStartTime: Date.now(), accumulatedSeconds: currentElapsed, status: "RUNNING" };
      saveTimerState(id, timerStateRef.current);
    } else if (action === "stop") {
      setSession((prev) => prev ? { ...prev, status: "COMPLETED" } : null);
      timerStateRef.current = { wallStartTime: 0, accumulatedSeconds: currentElapsed, status: "COMPLETED" };
      clearTimerState(id);
      setElapsed(currentElapsed);
    }

    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, currentDurationSeconds: currentElapsed }),
      });

      if (!res.ok) {
        setSession(previousSession);
        if (previousTimerState) { timerStateRef.current = previousTimerState; saveTimerState(id, previousTimerState); }
        alert("Failed to update study session. Please try again.");
      } else {
        if (action === "stop") {
          router.push("/study");
        } else {
          fetchSession();
        }
      }
    } catch (err) {
      setSession(previousSession);
      if (previousTimerState) { timerStateRef.current = previousTimerState; saveTimerState(id, previousTimerState); }
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

