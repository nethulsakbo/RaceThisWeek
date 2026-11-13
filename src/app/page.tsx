"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { SeriesFilter } from "@/components/SeriesFilter";
import { ViewToggle, ViewTab } from "@/components/ViewToggle";
import { WeekNavigator } from "@/components/WeekNavigator";
import { RaceCard } from "@/components/RaceCard";
import { StandingsTable } from "@/components/StandingsTable";
import { LiveResultsModal } from "@/components/LiveResultsModal";
import { ALL_RACE_EVENTS } from "@/data/calendar";
import { MOTORSPORT_SERIES, STANDINGS_DATA } from "@/data/series";
import { MotorsportSeriesId, RaceEvent, SessionItem } from "@/types/motorsport";
import { isEventThisWeek, isSessionLive, isEventCurrentlyLive } from "@/lib/dateUtils";
import { Search, X, Compass } from "lucide-react";
import { useNow } from "@/hooks/useNow";

function HomeContent() {
  const searchParams = useSearchParams();

  // URL state initialization
  const urlView = (searchParams.get("view") as ViewTab) || "this-week";
  const urlSeries = (searchParams.get("series") as MotorsportSeriesId | "all") || "all";
  const urlWeek = Number(searchParams.get("week") || "0");
  const urlQuery = searchParams.get("q") || "";

  const [selectedSeries, setSelectedSeries] = useState<MotorsportSeriesId | "all">(urlSeries);
  const [currentView, setCurrentView] = useState<ViewTab>(urlView);
  const [weekOffset, setWeekOffset] = useState<number>(urlWeek);
  const [searchQuery, setSearchQuery] = useState<string>(urlQuery);

  // Modal State
  const [modalEvent, setModalEvent] = useState<RaceEvent | null>(null);
  const [modalSession, setModalSession] = useState<SessionItem | null>(null);

  // Live ticking clock — updates every 30s
  const now = useNow();

  // Keep the runtime pathname so static exports retain their GitHub Pages base path.
  const syncToUrl = useCallback(
    (view: ViewTab, series: MotorsportSeriesId | "all", week: number, q: string) => {
      const params = new URLSearchParams();
      if (view !== "this-week") params.set("view", view);
      if (series !== "all") params.set("series", series);
      if (week !== 0) params.set("week", week.toString());
      if (q.trim()) params.set("q", q.trim());
      const queryStr = params.toString();
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${queryStr ? `?${queryStr}` : ""}`
      );
    },
    []
  );

  const handleViewChange = (v: ViewTab) => {
    setCurrentView(v);
    syncToUrl(v, selectedSeries, weekOffset, searchQuery);
  };

  const handleSeriesChange = (s: MotorsportSeriesId | "all") => {
    setSelectedSeries(s);
    syncToUrl(currentView, s, weekOffset, searchQuery);
  };

  const handleWeekOffsetChange = (newOffset: number) => {
    setWeekOffset(newOffset);
    syncToUrl(currentView, selectedSeries, newOffset, searchQuery);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      syncToUrl(currentView, selectedSeries, weekOffset, searchQuery);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [currentView, selectedSeries, weekOffset, searchQuery, syncToUrl]);

  const clearSearch = () => setSearchQuery("");
  const clearAllFilters = () => {
    setSelectedSeries("all");
    setWeekOffset(0);
    setSearchQuery("");
  };

  // currentDate = now offset by weekOffset weeks
  function getOffsetDate(base: Date, offsetWeeks: number): Date {
    const d = new Date(base);
    d.setDate(d.getDate() + offsetWeeks * 7);
    return d;
  }
  const currentDate = getOffsetDate(now, weekOffset);
  const isCurrentWeekActive = weekOffset === 0;

  const seriesList = useMemo(() => Object.values(MOTORSPORT_SERIES), []);

  // Check how many sessions are currently live
  const activeLiveCount = useMemo(() => {
    let count = 0;
    for (const event of ALL_RACE_EVENTS) {
      for (const session of event.sessions) {
        if (isSessionLive(session, now)) {
          count++;
        }
      }
    }
    return count;
  }, [now]);

  // Week navigation handlers
  const handlePrevWeek = () => handleWeekOffsetChange(weekOffset - 1);
  const handleNextWeek = () => handleWeekOffsetChange(weekOffset + 1);
  const handleResetThisWeek = () => handleWeekOffsetChange(0);

  // Compute counts for series pills
  const seriesCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    ALL_RACE_EVENTS.forEach((ev) => {
      const matchesView =
        currentView === "this-week"
          ? isEventThisWeek(ev, currentDate)
          : currentView === "upcoming"
          ? new Date(ev.endDate) >= currentDate
          : currentView === "past"
          ? new Date(ev.endDate) < currentDate
          : true;

      if (matchesView) {
        counts.all = (counts.all || 0) + 1;
        counts[ev.seriesId] = (counts[ev.seriesId] || 0) + 1;
      }
    });
    return counts;
  }, [currentView, currentDate]);

  // Filtered Events (including matching driver names and teams across results and series)
  const displayedEvents = useMemo(() => {
    let list = ALL_RACE_EVENTS.filter((ev) => {
      // Series filter
      if (selectedSeries !== "all" && ev.seriesId !== selectedSeries) {
        return false;
      }

      // Search all calendar events, regardless of the currently selected week or view.
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLocaleLowerCase();
        const matchesBasic =
          [
            ev.name,
            ev.officialName,
            ev.circuit,
            ev.location,
            ev.country,
            MOTORSPORT_SERIES[ev.seriesId].name,
          ].some((value) => value.toLocaleLowerCase().includes(query)) ||
          ev.sessions.some((session) => session.name.toLocaleLowerCase().includes(query));

        // Also check if any driver/team in session results matches
        const matchesSessionDriver = ev.sessions.some((s) =>
          s.results?.some(
            (r) =>
              r.driver.toLocaleLowerCase().includes(query) ||
              r.team.toLocaleLowerCase().includes(query)
          )
        );

        // Also check series standings drivers
        const matchesStandingsDriver = (STANDINGS_DATA[ev.seriesId]?.drivers ?? []).some(
          (d) =>
          d.driver.toLocaleLowerCase().includes(query) ||
          d.team.toLocaleLowerCase().includes(query)
        );

        if (!matchesBasic && !matchesSessionDriver && !matchesStandingsDriver) {
          return false;
        }
      }

      // Active searches intentionally ignore the view and week filters.
      if (searchQuery.trim()) return true;

      // View filter
      if (currentView === "this-week") {
        return isEventThisWeek(ev, currentDate);
      } else if (currentView === "upcoming") {
        return new Date(ev.endDate) >= currentDate;
      } else if (currentView === "past") {
        return new Date(ev.endDate) < currentDate;
      }

      return true;
    });

    // Sort by event start date, then float currently live events to the top
    if (currentView === "past") {
      list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } else {
      list.sort((a, b) => {
        const dateDiff = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        if (dateDiff !== 0) return dateDiff;
        const aLive = isEventCurrentlyLive(a, now);
        const bLive = isEventCurrentlyLive(b, now);
        return aLive ? -1 : bLive ? 1 : 0;
      });
      // Float any currently active live race to top of grid
      list.sort((a, b) => {
        const aLive = isEventCurrentlyLive(a, now);
        const bLive = isEventCurrentlyLive(b, now);
        return aLive === bLive ? 0 : aLive ? -1 : 1;
      });
    }

    return list;
  }, [selectedSeries, currentView, currentDate, searchQuery, now]);

  const handleOpenResults = (event: RaceEvent, session: SessionItem) => {
    setModalEvent(event);
    setModalSession(session);
  };

  const handleCloseModal = () => {
    setModalEvent(null);
    setModalSession(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors">
      <Header activeLiveCount={activeLiveCount} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 space-y-2.5 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/70 dark:border-zinc-800/70 md:static md:mx-0 md:p-0 md:space-y-4 md:bg-transparent md:backdrop-blur-none md:border-0">
          {/* View Toggle + Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4">
          <ViewToggle
            currentView={currentView}
            onViewChange={handleViewChange}
            thisWeekCount={seriesCounts["all"] || 0}
          />

            <div className="relative w-full md:max-w-xs md:shrink-0">
              <label htmlFor="search-input" className="sr-only">
                Search races, tracks, drivers, teams, and standings
              </label>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
              <input
                id="search-input"
                type="search"
                autoComplete="off"
                placeholder="Search races, tracks, drivers..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full min-h-11 pl-9 pr-10 py-2 text-base md:text-sm rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-10 min-h-10 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Series Filter Bar */}
          {currentView !== "standings" && (
            <div className="flex flex-col gap-2.5 md:gap-3">
            <SeriesFilter
              seriesList={seriesList}
              selectedSeries={selectedSeries}
              onSelectSeries={handleSeriesChange}
              seriesCounts={seriesCounts}
            />

            {/* Week Navigator (shown for this-week view) */}
            {currentView === "this-week" && (
              <WeekNavigator
                currentDate={currentDate}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onResetThisWeek={handleResetThisWeek}
                isCurrentWeek={isCurrentWeekActive}
              />
            )}
            </div>
          )}
        </div>

        {/* View Content */}
        {currentView === "standings" ? (
          <StandingsTable
            standings={STANDINGS_DATA}
            searchQuery={searchQuery}
            onClearSearch={clearSearch}
          />
        ) : (
          <div>
            {searchQuery.trim() && (
              <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400" aria-live="polite">
                {displayedEvents.length} {displayedEvents.length === 1 ? "match" : "matches"} for{" "}
                <span className="font-medium text-zinc-800 dark:text-zinc-200">‘{searchQuery.trim()}’</span>
                {" "}— searching all weeks
              </p>
            )}
            {displayedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedEvents.map((event) => (
                  <RaceCard
                    key={event.id}
                    event={event}
                    now={now}
                    onOpenResults={handleOpenResults}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <Compass className="w-12 h-12 mx-auto text-zinc-400 mb-3 opacity-60" />
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  {searchQuery.trim()
                    ? `No results for ‘${searchQuery.trim()}’`
                    : "No racing events scheduled for this selection"}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                  {searchQuery.trim() ? (
                    <span className="inline-flex flex-wrap justify-center gap-3 mt-3">
                      <button onClick={clearSearch} className="min-h-11 px-3 text-zinc-900 dark:text-zinc-100 underline font-medium">
                        Clear search
                      </button>
                      {selectedSeries !== "all" && (
                        <button onClick={clearAllFilters} className="min-h-11 px-3 text-zinc-900 dark:text-zinc-100 underline font-medium">
                          Clear all filters
                        </button>
                      )}
                    </span>
                  ) : (
                    <>
                      Try switching the series filter, or toggle to{" "}
                      <button
                        onClick={() => handleViewChange("upcoming")}
                        className="min-h-11 px-1 text-zinc-900 dark:text-zinc-100 underline font-medium"
                      >
                        Upcoming Calendar
                      </button>{" "}
                      or{" "}
                      <button
                        onClick={handleNextWeek}
                        className="min-h-11 px-1 text-zinc-900 dark:text-zinc-100 underline font-medium"
                      >
                        Next Week
                      </button>
                      .
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Session Classification Results Modal */}
      <LiveResultsModal
        event={modalEvent}
        session={modalSession}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <HomeContent />
    </Suspense>
  );
}
