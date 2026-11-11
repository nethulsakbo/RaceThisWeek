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
    <div role="tablist" aria-label="View selection" className="flex bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 max-w-fit">
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onViewChange(tab.id)}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500 focus-visible:outline-none ${
              isActive
                ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
