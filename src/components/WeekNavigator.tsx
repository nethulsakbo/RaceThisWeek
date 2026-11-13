"use client";

import React from "react";
import { ChevronLeft, ChevronRight, CalendarDays, RotateCcw } from "lucide-react";
import { getWeekRange } from "@/lib/dateUtils";

interface WeekNavigatorProps {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetThisWeek: () => void;
  isCurrentWeek: boolean;
}

export function WeekNavigator({
  currentDate,
  onPrevWeek,
  onNextWeek,
  onResetThisWeek,
  isCurrentWeek,
}: WeekNavigatorProps) {
  const { start, end } = getWeekRange(currentDate);

  const startFormatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endFormatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
      <div className="flex items-center space-x-2">
        <CalendarDays className="w-4 h-4 text-zinc-500" />
        <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
          Showing Week:
        </span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {startFormatted} – {endFormatted}
        </span>
        {isCurrentWeek && (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Active Week
          </span>
        )}
      </div>

      <div className="flex items-center space-x-1">
        {!isCurrentWeek && (
          <button
            onClick={onResetThisWeek}
            className="min-h-11 flex items-center space-x-1 px-2.5 text-xs font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors mr-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Today</span>
          </button>
        )}
        <button
          onClick={onPrevWeek}
          aria-label="Previous week"
          className="min-w-11 min-h-11 flex items-center justify-center rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNextWeek}
          aria-label="Next week"
          className="min-w-11 min-h-11 flex items-center justify-center rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

