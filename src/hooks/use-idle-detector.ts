"use client";

import { useEffect, useRef, useCallback } from "react";

type UseIdleDetectorOptions = {
  sessionId: string;
  idleTimeoutMs: number;
  onIdle: () => void;
  enabled: boolean;
};

export function useIdleDetector({ sessionId, idleTimeoutMs, onIdle, enabled }: UseIdleDetectorOptions) {
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (enabled) {
      timerRef.current = setTimeout(() => {
        onIdle();
      }, idleTimeoutMs);
    }
  }, [idleTimeoutMs, onIdle, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, resetTimer]);

  // Send activity data with heartbeat
  const getActivityData = useCallback(() => ({
    lastMouseActivity: new Date().toISOString(),
    lastKeyboardActivity: new Date().toISOString(),
    sessionId,
  }), [sessionId]);

  return { getActivityData, lastActivity: lastActivityRef };
}
