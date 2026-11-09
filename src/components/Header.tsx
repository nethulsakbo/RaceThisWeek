"use client";

import React, { useEffect, useState } from "react";
import { Flag, Clock, Moon, Sun, Radio } from "lucide-react";

interface HeaderProps {
  activeLiveCount: number;
}

export function Header({ activeLiveCount }: HeaderProps) {
  const [timeZone, setTimeZone] = useState<string>("Local");
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimeZone(tz);
    } catch {
      setTimeZone("Local Time");
    }

    // Default to dark mode for motorsport aesthetic
    const root = document.documentElement;
    if (!root.classList.contains("dark")) {
      root.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-sm">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-lg text-zinc-900 dark:text-zinc-50">
                RACE THIS WEEK
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                2026 Season
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              All major motorsport events, schedules, live sessions & standings in one place
            </p>
          </div>
        </div>

        {/* Right Info: Live Status, Timezone & Theme */}
        <div className="flex items-center space-x-3 text-xs">
          {activeLiveCount > 0 ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse font-medium">
              <Radio className="w-3.5 h-3.5" />
              <span>{activeLiveCount} Session Live</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-1 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All feeds synced</span>
            </div>
          )}

          <div className="hidden sm:flex items-center space-x-1.5 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800">
            <Clock className="w-3.5 h-3.5" />
            <span className="truncate max-w-[130px]">{timeZone}</span>
          </div>

          <button
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

