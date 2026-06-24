"use client";

import { useState, useEffect, useCallback } from "react";

type UseCheckpointOptions = {
  sessionId: string;
  frequencyMs: number;
  enabled: boolean;
};

export function useCheckpoint({ sessionId, frequencyMs, enabled }: UseCheckpointOptions) {
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [checkpointText, setCheckpointText] = useState("");

  useEffect(() => {
    if (!enabled || frequencyMs <= 0) return;
    const interval = setInterval(() => {
      setShowCheckpoint(true);
    }, frequencyMs);
    return () => clearInterval(interval);
  }, [enabled, frequencyMs]);

  const submitCheckpoint = useCallback(async () => {
    if (!checkpointText.trim()) return;
    try {
      await fetch(`/api/sessions/${sessionId}/checkpoint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: checkpointText.trim() }),
      });
    } catch {
      // silent
    }
    setCheckpointText("");
    setShowCheckpoint(false);
  }, [sessionId, checkpointText]);

  const dismissCheckpoint = useCallback(() => {
    setShowCheckpoint(false);
    setCheckpointText("");
  }, []);

  return { showCheckpoint, checkpointText, setCheckpointText, submitCheckpoint, dismissCheckpoint };
}
