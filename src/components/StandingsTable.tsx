"use client";

import React, { useState } from "react";
import { Trophy, Users, Shield } from "lucide-react";
import { MotorsportSeriesId, SeriesStandings } from "@/types/motorsport";
import { MOTORSPORT_SERIES } from "@/data/series";

interface StandingsTableProps {
  standings: Record<MotorsportSeriesId, SeriesStandings>;
}

export function StandingsTable({ standings }: StandingsTableProps) {
  const seriesIds = Object.keys(standings) as MotorsportSeriesId[];
  const [selectedSeries, setSelectedSeries] = useState<MotorsportSeriesId>("f1");
  const [viewType, setViewType] = useState<"drivers" | "teams">("drivers");

  const activeSeries = MOTORSPORT_SERIES[selectedSeries];
  const activeStandings = standings[selectedSeries];

  return (
    <div className="space-y-6">
      {/* Series Selector Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
        {seriesIds.map((id) => {
          const s = MOTORSPORT_SERIES[id];
          const isSelected = selectedSeries === id;

          return (
            <button
              key={id}
              onClick={() => {
                setSelectedSeries(id);
                // If teams not available, fallback to drivers
                if (!standings[id]?.teams && viewType === "teams") {
                  setViewType("drivers");
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isSelected
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200/60 dark:border-zinc-800/80"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: s.color }}
              />
              <span>{s.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Standings Header & Drivers/Teams Toggle */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
              style={{ backgroundColor: activeSeries.color }}
            >
              {activeSeries.shortName.slice(0, 3)}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {activeSeries.name} Championship Standings
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                2026 World Championship • Updated after last round
              </p>
            </div>
          </div>

          {activeStandings?.teams && activeStandings.teams.length > 0 && (
            <div className="flex bg-zinc-200/80 dark:bg-zinc-800 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewType("drivers")}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
                  viewType === "drivers"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Drivers</span>
              </button>
              <button
                onClick={() => setViewType("teams")}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all ${
                  viewType === "teams"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Constructors</span>
              </button>
            </div>
          )}
        </div>

        {/* Standings Table */}
        <div className="overflow-x-auto">
          {viewType === "drivers" ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-900/60">
                  <th className="py-3 pl-6 w-16">Pos</th>
                  <th className="py-3">Driver</th>
                  <th className="py-3">Team</th>
                  <th className="py-3 text-center">Wins</th>
                  <th className="py-3 text-center">Podiums</th>
                  <th className="py-3 text-right pr-6">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans text-xs">
                {activeStandings?.drivers.map((d) => {
                  return (
                    <tr
                      key={d.position}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3.5 pl-6">
                        {d.position === 1 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                            1
                          </span>
                        ) : d.position === 2 ? (
                          <span className="w-6 h-6 rounded-full bg-zinc-300/30 text-zinc-400 flex items-center justify-center font-bold text-xs">
                            2
                          </span>
                        ) : d.position === 3 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-600 flex items-center justify-center font-bold text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-mono pl-1.5">{d.position}</span>
                        )}
                      </td>
                      <td className="py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center space-x-2">
                          <span>{d.driver}</span>
                          {d.nationality && (
                            <span className="text-[10px] text-zinc-400 font-mono px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800">
                              {d.nationality}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 text-zinc-500 dark:text-zinc-400">{d.team}</td>
                      <td className="py-3.5 text-center font-mono text-zinc-600 dark:text-zinc-400">
                        {d.wins ?? 0}
                      </td>
                      <td className="py-3.5 text-center font-mono text-zinc-600 dark:text-zinc-400">
                        {d.podiums ?? "—"}
                      </td>
                      <td className="py-3.5 text-right pr-6 font-mono font-bold text-sm text-zinc-900 dark:text-zinc-50">
                        {d.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-900/60">
                  <th className="py-3 pl-6 w-16">Pos</th>
                  <th className="py-3">Team / Constructor</th>
                  <th className="py-3 text-center">Wins</th>
                  <th className="py-3 text-right pr-6">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans text-xs">
                {activeStandings?.teams?.map((t) => (
                  <tr
                    key={t.position}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-3.5 pl-6 font-mono font-bold text-zinc-500">
                      {t.position}
                    </td>
                    <td className="py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                      {t.team}
                    </td>
                    <td className="py-3.5 text-center font-mono text-zinc-600 dark:text-zinc-400">
                      {t.wins ?? 0}
                    </td>
                    <td className="py-3.5 text-right pr-6 font-mono font-bold text-sm text-zinc-900 dark:text-zinc-50">
                      {t.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

