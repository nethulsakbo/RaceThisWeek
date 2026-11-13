"use client";

import React from "react";
import { MotorsportSeriesId, SeriesMeta } from "@/types/motorsport";

interface SeriesFilterProps {
  seriesList: SeriesMeta[];
  selectedSeries: MotorsportSeriesId | "all";
  onSelectSeries: (id: MotorsportSeriesId | "all") => void;
  seriesCounts: Record<string, number>;
}

export function SeriesFilter({
  seriesList,
  selectedSeries,
  onSelectSeries,
  seriesCounts,
}: SeriesFilterProps) {
  return (
    <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-2">
      <span className="sr-only">Filter by series:</span>
      <div role="group" aria-label="Filter by series" className="flex items-center space-x-1.5">
        <button
          onClick={() => onSelectSeries("all")}
          aria-pressed={selectedSeries === "all"}
          className={`min-h-11 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            selectedSeries === "all"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200/60 dark:border-zinc-800/80"
          }`}
        >
          <span>All Series</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedSeries === "all"
                ? "bg-zinc-700 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-800"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {seriesCounts["all"] || 0}
          </span>
        </button>

        {seriesList.map((series) => {
          const isSelected = selectedSeries === series.id;
          const count = seriesCounts[series.id] || 0;

          return (
            <button
              key={series.id}
              onClick={() => onSelectSeries(series.id)}
              aria-pressed={isSelected}
              className={`min-h-11 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isSelected
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200/60 dark:border-zinc-800/80"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: series.color }}
              />
              <span>{series.shortName}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-zinc-700 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-800"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
