"use client";
import { useState, useEffect } from "react";

/**
 * Returns the current Date, re-rendering every `intervalMs` milliseconds.
 * Default: 30 000 ms (30 s) — fast enough for countdowns, cheap enough for perf.
 */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
