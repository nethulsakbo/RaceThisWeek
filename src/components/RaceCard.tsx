"use client";

import React, { useState } from "react";
import {
  MapPin,
  Tv,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  Radio,
  Clock,
} from "lucide-react";
import { RaceEvent, SessionItem } from "@/types/motorsport";
import { MOTORSPORT_SERIES } from "@/data/series";
import {
  formatEventDateRange,
  formatTimeInUserTimezone,
  formatDayAndDate,
  getCountdown,
  isSessionLive,
} from "@/lib/dateUtils";

interface RaceCardProps {
  event: RaceEvent;
  onOpenResults: (event: RaceEvent, session: SessionItem) => void;
}

export function RaceCard({ event, onOpenResults }: RaceCardProps) {
  const [expanded, setExpanded] = useState<boolean>(true);
  const series = MOTORSPORT_SERIES[event.seriesId];

  // Find next upcoming session or currently live session
  const now = new Date();
  const liveSession = event.sessions.find((s) => isSessionLive(s, now));
  const nextSession = event.sessions.find(
    (s) => !s.completed && new Date(s.startTime).getTime() > now.getTime()
  );
  const completedSessions = event.sessions.filter((s) => s.completed || s.results?.length);

  const countdown = nextSession ? getCountdown(nextSession.startTime, now) : null;

  // Generate Google Calendar Link for the main race session
  const mainRaceSession = event.sessions.find((s) => s.name.toLowerCase().includes("race")) || event.sessions[event.sessions.length - 1];
  const gcalUrl = mainRaceSession
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        `${series.shortName}: ${event.name} - ${mainRaceSession.name}`
      )}&dates=${new Date(mainRaceSession.startTime)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}/${new Date(
        mainRaceSession.endTime ||
          new Date(new Date(mainRaceSession.startTime).getTime() + 2 * 3600000).toISOString()
      )
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}&details=${encodeURIComponent(
        `Round ${event.round} of ${event.totalRounds} at ${event.circuit}. Broadcast: ${series.broadcast}`
      )}&location=${encodeURIComponent(`${event.circuit}, ${event.location}`)}`
    : "#";

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all overflow-hidden flex flex-col justify-between">
      {/* Top Banner / Color Accent Strip */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: series.color }}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Header: Series, Round & Status Badge */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white flex items-center space-x-1"
                style={{ backgroundColor: series.color }}
              >
                <span>{series.shortName}</span>
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                Round {event.round}{event.totalRounds ? ` / ${event.totalRounds}` : ""}
              </span>
            </div>

            {/* Status / Countdown */}
            {liveSession ? (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                <Radio className="w-3 h-3" />
                <span>{liveSession.name} LIVE</span>
              </span>
            ) : countdown && !countdown.isPast ? (
              <span className="flex items-center space-x-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60">
                <Clock className="w-3 h-3 text-zinc-400" />
                <span>
                  {countdown.days > 0 ? `${countdown.days}d ` : ""}
                  {countdown.hours}h {countdown.minutes}m
                </span>
              </span>
            ) : event.status === "completed" ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                Final
              </span>
            ) : null}
          </div>

          {/* Event Title */}
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
            {event.name}
          </h3>

          {/* Location & Circuit */}
          <div className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">
              {event.circuit} • {event.location}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-zinc-400 mt-1">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatEventDateRange(event.startDate, event.endDate)}</span>
          </div>
        </div>

        {/* Sessions Schedule Breakdown */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Timetable (Local Time)
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center space-x-0.5"
            >
              <span>{expanded ? "Hide" : "Show"}</span>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {expanded && (
            <div className="space-y-1.5 text-xs">
              {event.sessions.map((session) => {
                const isLive = isSessionLive(session, now);
                const hasResults = !!session.results?.length;

                return (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                      isLive
                        ? "bg-red-500/5 border-red-500/20 text-red-500 font-semibold"
                        : "bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/40 dark:border-zinc-800/60 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                      <span className="font-medium">{session.name}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                          {formatDayAndDate(session.startTime)}
                        </div>
                        <div className="font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100">
                          {formatTimeInUserTimezone(session.startTime)}
                        </div>
                      </div>

                      {hasResults && (
                        <button
                          onClick={() => onOpenResults(event, session)}
                          title="View session results"
                          className="px-2 py-1 rounded bg-zinc-200/80 dark:bg-zinc-700 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 flex items-center space-x-1 transition-colors"
                        >
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>Results</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: TV Broadcast & Actions */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5 text-zinc-500 dark:text-zinc-400">
            <Tv className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate max-w-[200px]" title={series.broadcast}>
              {series.broadcast}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {completedSessions.length > 0 && !liveSession && (
              <button
                onClick={() => onOpenResults(event, completedSessions[completedSessions.length - 1])}
                className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1"
              >
                <Award className="w-3 h-3" />
                <span>Latest Results</span>
              </button>
            )}

            <a
              href={gcalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center space-x-0.5"
            >
              <span>+ Cal</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

