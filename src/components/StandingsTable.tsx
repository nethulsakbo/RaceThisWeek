"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Users, Shield } from "lucide-react";
import { MotorsportSeriesId, SeriesStandings } from "@/types/motorsport";
import { MOTORSPORT_SERIES } from "@/data/series";

interface StandingsTableProps {
  standings: Record<MotorsportSeriesId, SeriesStandings>;
  searchQuery: string;
  onClearSearch: () => void;
}

function isDriverStanding(value: unknown): value is SeriesStandings["drivers"][number] {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.position === "number" &&
    typeof entry.driver === "string" &&
    typeof entry.team === "string" &&
    typeof entry.points === "number"
  );
}

function isTeamStanding(value: unknown): value is NonNullable<SeriesStandings["teams"]>[number] {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.position === "number" &&
    typeof entry.team === "string" &&
    typeof entry.points === "number"
  );
}

const LIVE_STANDINGS_SERIES = ["f1", "f2", "f3"] as const;
type LiveStandingsSeriesId = (typeof LIVE_STANDINGS_SERIES)[number];

function isSeriesStandings(
  value: unknown,
  seriesId: LiveStandingsSeriesId
): value is SeriesStandings {
  if (typeof value !== "object" || value === null) return false;
  const standings = value as Partial<SeriesStandings>;
  return (
    standings.seriesId === seriesId &&
    typeof standings.season === "number" &&
    typeof standings.updatedAt === "string" &&
    Array.isArray(standings.drivers) &&
    standings.drivers.every(isDriverStanding) &&
    (standings.teams === undefined ||
      (Array.isArray(standings.teams) && standings.teams.every(isTeamStanding)))
  );
}

export function StandingsTable({ standings, searchQuery, onClearSearch }: StandingsTableProps) {
  const seriesIds = Object.keys(standings) as MotorsportSeriesId[];
  const [selectedSeries, setSelectedSeries] = useState<MotorsportSeriesId>("f1");
  const [viewType, setViewType] = useState<"drivers" | "teams">("drivers");
  const [liveStandings, setLiveStandings] = useState<
    Partial<Record<LiveStandingsSeriesId, SeriesStandings>>
  >({});
  const [refreshErrors, setRefreshErrors] = useState<
    Partial<Record<LiveStandingsSeriesId, string>>
  >({});

  const activeSeries = MOTORSPORT_SERIES[selectedSeries];
  const activeStandings =
    liveStandings[selectedSeries as LiveStandingsSeriesId] ?? standings[selectedSeries];
  const isLiveSeries = (LIVE_STANDINGS_SERIES as readonly string[]).includes(selectedSeries);
  const refreshError = refreshErrors[selectedSeries as LiveStandingsSeriesId];
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredDrivers = (activeStandings?.drivers ?? []).filter(
    (driver) =>
      !normalizedQuery ||
      driver.driver.toLocaleLowerCase().includes(normalizedQuery) ||
      driver.team.toLocaleLowerCase().includes(normalizedQuery)
  );
  const filteredTeams = (activeStandings?.teams ?? []).filter(
    (team) => !normalizedQuery || team.team.toLocaleLowerCase().includes(normalizedQuery)
  );
  const visibleRows = viewType === "drivers" ? filteredDrivers.length : filteredTeams.length;

  useEffect(() => {
    let cancelled = false;

    const refreshStandings = async (seriesId: LiveStandingsSeriesId) => {
      try {
        const url = new URL(`${seriesId}-standings.json`, window.location.href);
        url.searchParams.set("refresh", Date.now().toString());
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Standings refresh failed (${response.status})`);
        }

        const latestStandings: unknown = await response.json();
        if (!isSeriesStandings(latestStandings, seriesId)) {
          throw new Error("Standings refresh returned invalid data");
        }

        if (!cancelled) {
          setLiveStandings((current) => ({ ...current, [seriesId]: latestStandings }));
          setRefreshErrors((current) => ({ ...current, [seriesId]: undefined }));
        }
      } catch (error) {
        if (!cancelled) {
          setRefreshErrors((current) => ({
            ...current,
            [seriesId]: error instanceof Error ? error.message : "Unknown refresh error",
          }));
        }
      }
    };

    const refreshAllStandings = () => {
      LIVE_STANDINGS_SERIES.forEach((seriesId) => void refreshStandings(seriesId));
    };

    refreshAllStandings();
    const intervalId = window.setInterval(() => {
      refreshAllStandings();
    }, 15 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="space-y-6">
      {normalizedQuery && (
        <p className="text-xs text-zinc-600 dark:text-zinc-400" aria-live="polite">
          {visibleRows} {visibleRows === 1 ? "match" : "matches"} for{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">‘{searchQuery.trim()}’</span>
          {" "}— standings
        </p>
      )}
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
              className={`min-h-11 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
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
              {(activeSeries as any).abbreviation ?? activeSeries.shortName.slice(0, 4)}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {activeSeries.name} Championship Standings
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {activeStandings?.season} World Championship
                {activeStandings?.updatedAt &&
                  ` • ${selectedSeries === "f1" ? "Jolpica F1 data published" : "Data timestamp"} ${new Date(activeStandings.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`}
              </p>
              {isLiveSeries && (
                <p className={`text-[11px] ${refreshError ? "text-red-500" : "text-zinc-500 dark:text-zinc-400"}`} aria-live="polite">
                  {refreshError
                    ? `Auto-refresh failed: ${refreshError}. Showing the last published standings.`
                    : "Auto-refresh checks official standings for updates every 15 minutes."}
                </p>
              )}
              {isLiveSeries && (
                <a
                  href={
                    selectedSeries === "f1"
                      ? "https://api.jolpi.ca/ergast/f1/current/driverStandings/"
                      : `${activeSeries.officialSite}/en/standings/${activeStandings?.season}/drivers`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  {selectedSeries === "f1"
                    ? "F1 standings source: Jolpica F1"
                    : `${activeSeries.shortName} standings source: official championship`}
                </a>
              )}
              {!isLiveSeries &&
                activeStandings?.drivers.length === 0 &&
                activeStandings.teams?.length === 0 && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Standings are not synced here yet.{" "}
                      <a
                        href={activeSeries.officialSite}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-2"
                      >
                        Check the official site
                      </a>
                    </p>
                )}
            </div>
          </div>

          {activeStandings?.teams && activeStandings.teams.length > 0 && (
            <div className="flex bg-zinc-200/80 dark:bg-zinc-800 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewType("drivers")}
                className={`min-h-11 flex items-center space-x-1.5 px-3 rounded-md transition-all ${
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
                className={`min-h-11 flex items-center space-x-1.5 px-3 rounded-md transition-all ${
                  viewType === "teams"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{selectedSeries === "f2" || selectedSeries === "f3" ? "Teams" : "Constructors"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Standings Table */}
        <div className="overflow-x-auto">
          {normalizedQuery && visibleRows === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                No results for ‘{searchQuery.trim()}’
              </p>
              <button
                type="button"
                onClick={onClearSearch}
                className="mt-2 min-h-11 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 underline underline-offset-2"
              >
                Clear search
              </button>
            </div>
          )}
          {visibleRows === 0 && !normalizedQuery ? (
            <div className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No standings are synced for this series yet.
            </div>
          ) : viewType === "drivers" ? (
            <table className={`w-full text-left text-sm ${normalizedQuery && visibleRows === 0 ? "hidden" : ""}`}>
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
                {filteredDrivers.map((d) => {
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
                        {d.wins ?? "—"}
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
            <table className={`w-full text-left text-sm ${normalizedQuery && visibleRows === 0 ? "hidden" : ""}`}>
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-900/60">
                  <th className="py-3 pl-6 w-16">Pos</th>
                  <th className="py-3">Team / Constructor</th>
                  <th className="py-3 text-center">Wins</th>
                  <th className="py-3 text-right pr-6">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans text-xs">
                {filteredTeams.map((t) => (
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
