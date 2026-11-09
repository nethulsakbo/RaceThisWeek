"use client";

import React, { useState, useMemo } from "react";
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
import { isEventThisWeek, isSessionLive } from "@/lib/dateUtils";
import { Search, Flag, Compass, CalendarCheck2 } from "lucide-react";

export default function Home() {
  const [selectedSeries, setSelectedSeries] = useState<MotorsportSeriesId | "all">("all");
  const [currentView, setCurrentView] = useState<ViewTab>("this-week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date("2026-11-09T12:00:00Z"));
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [modalEvent, setModalEvent] = useState<RaceEvent | null>(null);
  const [modalSession, setModalSession] = useState<SessionItem | null>(null);

  const seriesList = useMemo(() => Object.values(MOTORSPORT_SERIES), []);

  // Check how many sessions are currently live
  const activeLiveCount = useMemo(() => {
    let count = 0;
    const now = new Date();
    for (const event of ALL_RACE_EVENTS) {
      for (const session of event.sessions) {
        if (isSessionLive(session, now)) {
          count++;
        }
      }
    }
    return count;
  }, []);

  // Week navigation handlers
  const handlePrevWeek = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleResetThisWeek = () => {
    setCurrentDate(new Date("2026-11-09T12:00:00Z"));
  };

  const isCurrentWeekActive = useMemo(() => {
    const today = new Date("2026-11-09T12:00:00Z");
    const diff = Math.abs(currentDate.getTime() - today.getTime());
    return diff < 4 * 24 * 60 * 60 * 1000;
  }, [currentDate]);

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

  // Filtered Events
  const displayedEvents = useMemo(() => {
    let list = ALL_RACE_EVENTS.filter((ev) => {
      // Series filter
      if (selectedSeries !== "all" && ev.seriesId !== selectedSeries) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          ev.name.toLowerCase().includes(query) ||
          ev.circuit.toLowerCase().includes(query) ||
          ev.location.toLowerCase().includes(query) ||
          ev.country.toLowerCase().includes(query) ||
          MOTORSPORT_SERIES[ev.seriesId].name.toLowerCase().includes(query);
        if (!matches) return false;
      }

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

    // Sort by event start date
    if (currentView === "past") {
      list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } else {
      list.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }

    return list;
  }, [selectedSeries, currentView, currentDate, searchQuery]);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Control Bar: View Toggle + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <ViewToggle
            currentView={currentView}
            onViewChange={setCurrentView}
            thisWeekCount={seriesCounts["all"] || 0}
          />

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search races, tracks, drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Series Filter Bar */}
        {currentView !== "standings" && (
          <div className="space-y-3">
            <SeriesFilter
              seriesList={seriesList}
              selectedSeries={selectedSeries}
              onSelectSeries={setSelectedSeries}
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

        {/* View Content */}
        {currentView === "standings" ? (
          <StandingsTable standings={STANDINGS_DATA} />
        ) : (
          <div>
            {displayedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedEvents.map((event) => (
                  <RaceCard
                    key={event.id}
                    event={event}
                    onOpenResults={handleOpenResults}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <Compass className="w-12 h-12 mx-auto text-zinc-400 mb-3 opacity-60" />
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  No racing events scheduled for this selection
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                  Try switching the series filter, or toggle to{" "}
                  <button
                    onClick={() => setCurrentView("upcoming")}
                    className="text-zinc-900 dark:text-zinc-100 underline font-medium"
                  >
                    Upcoming Calendar
                  </button>{" "}
                  or{" "}
                  <button
                    onClick={handleNextWeek}
                    className="text-zinc-900 dark:text-zinc-100 underline font-medium"
                  >
                    Next Week
                  </button>
                  .
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

