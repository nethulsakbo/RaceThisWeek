"use client";

import React from "react";
import { Calendar, Trophy, ListOrdered, History } from "lucide-react";

export type ViewTab = "this-week" | "upcoming" | "past" | "standings";

interface ViewToggleProps {
  currentView: ViewTab;
  onViewChange: (view: ViewTab) => void;
  thisWeekCount: number;
}

export function ViewToggle({ currentView, onViewChange, thisWeekCount }: ViewToggleProps) {
  const tabs: { id: ViewTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "this-week",
      label: "This Week",
      icon: <Calendar className="w-3.5 h-3.5" />,
      badge: thisWeekCount,
    },
    {
      id: "upcoming",
      label: "Upcoming Calendar",
      icon: <ListOrdered className="w-3.5 h-3.5" />,
    },
    {
      id: "past",
      label: "Recent Results",
      icon: <History className="w-3.5 h-3.5" />,
    },
    {
      id: "standings",
      label: "Championship Standings",
      icon: <Trophy className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="relative min-w-0 w-full md:w-auto">
      <div role="tablist" aria-label="View selection" className="flex w-full md:w-auto overflow-x-auto scrollbar-none bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onViewChange(tab.id)}
            className={`flex min-h-11 shrink-0 items-center space-x-1.5 md:space-x-2 px-2.5 md:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500 focus-visible:outline-none ${
              isActive
                ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            {tab.icon}
            <span className="md:hidden">{tab.id === "this-week" ? "Week" : tab.id === "upcoming" ? "Upcoming" : tab.id === "past" ? "Results" : "Standings"}</span>
            <span className="hidden md:inline">{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
      </div>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-1 right-1 w-6 rounded-r-xl bg-gradient-to-l from-zinc-100 dark:from-zinc-900/90 md:hidden" />
    </div>
  );
}
