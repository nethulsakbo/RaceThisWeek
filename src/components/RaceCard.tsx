"use client";

import React, { useEffect, useState } from "react";
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
  CheckCircle2,
  Globe,
} from "lucide-react";
import { RaceEvent, SessionItem } from "@/types/motorsport";
import { MOTORSPORT_SERIES } from "@/data/series";
import {
  formatEventDateRange,
  formatDayAndDate,
  getCountdown,
  isSessionLive,
} from "@/lib/dateUtils";

interface RaceCardProps {
  event: RaceEvent;
  now: Date;
  onOpenResults: (event: RaceEvent, session: SessionItem) => void;
}

function buildGcalUrl(event: RaceEvent, session: SessionItem, broadcast: string): string {
  const start = new Date(session.startTime);
  const end = session.endTime
    ? new Date(session.endTime)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const startFormatted = start.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const endFormatted = end.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const series = MOTORSPORT_SERIES[event.seriesId];
  const title = `${series.shortName}: ${event.name} — ${session.name}`;
  const details = `Round ${event.round} at ${event.circuit}. Broadcast: ${broadcast}`;
  const location = `${event.circuit}, ${event.location}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(
    details
  )}&location=${encodeURIComponent(location)}`;
}

export function RaceCard({ event, now, onOpenResults }: RaceCardProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [timeMode, setTimeMode] = useState<"track" | "viewer" | "utc">("track");
  const series = MOTORSPORT_SERIES[event.seriesId];

  useEffect(() => {
    setExpanded(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  const liveSession = event.sessions.find((s) => isSessionLive(s, now));
  const nextSession = event.sessions.find(
    (s) => !s.completed && new Date(s.startTime).getTime() > now.getTime()
  );
  const sessionsWithResults = event.sessions.filter((session) => session.results?.length);

  const countdown = nextSession ? getCountdown(nextSession.startTime, now) : null;

  const formatSessionTime = (isoString: string) => {
    const d = new Date(isoString);
    if (timeMode === "utc") {
      return (
        d.toLocaleTimeString("en-GB", {
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }) + " UTC"
      );
    }
    return d.toLocaleTimeString([], {
      ...(timeMode === "track" && event.venueTimeZone
        ? { timeZone: event.venueTimeZone }
        : {}),
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all overflow-hidden flex flex-col justify-between">
      {/* Top Banner Accent Strip */}
      <div className="h-1 w-full" style={{ backgroundColor: series.color }} />

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header: Series Badge & Round */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${series.badgeBg}`}
              >
                {series.shortName}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Round {event.round}
                {event.totalRounds ? ` / ${event.totalRounds}` : ""}
              </span>
            </div>

            {/* Status / Countdown */}
            {liveSession ? (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse">
                <Radio className="w-3 h-3" />
                <span>{liveSession.name} LIVE</span>
              </span>
            ) : countdown && !countdown.isPast ? (
              <span className="flex items-center space-x-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>
                  {countdown.days > 0 ? `${countdown.days}d ` : ""}
                  {countdown.hours}h {countdown.minutes}m
                </span>
              </span>
            ) : event.status === "completed" ? (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                Final
              </span>
            ) : null}
          </div>

          {/* Event Title */}
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
            {event.name}
          </h3>

          {/* Location & Circuit */}
          <div className="flex items-center space-x-1.5 text-xs text-zinc-600 dark:text-zinc-400 mt-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            <span className="truncate">
              {event.circuit} • {event.location}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatEventDateRange(event.startDate, event.endDate, event.venueTimeZone)}</span>
          </div>
        </div>

        {/* Sessions Schedule Breakdown */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Timetable
              </span>
              <button
                type="button"
                onClick={() =>
                  setTimeMode((current) =>
                    current === "track" ? "viewer" : current === "viewer" ? "utc" : "track"
                  )
                }
                className="flex min-h-11 items-center space-x-1 px-2 text-[10px] font-medium rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                title="Cycle track, your local, and UTC times"
              >
                <Globe className="w-2.5 h-2.5" />
                <span>
                  {timeMode === "track" ? "Track" : timeMode === "viewer" ? "Your time" : "UTC"}
                </span>
              </button>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Collapse schedule" : "Expand schedule"}
              className="min-h-11 px-2 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center space-x-0.5"
            >
              <span>{expanded ? "Hide" : "Show"}</span>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {expanded && (
            <div className="space-y-1.5 text-xs">
              {event.sessions.length === 0 && (
                <p className="text-zinc-500 dark:text-zinc-400">
                  Session schedule isn&apos;t synced here.{" "}
                  <a
                    href={event.officialScheduleUrl ?? series.officialSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-200"
                  >
                    Official schedule
                  </a>
                </p>
              )}
              {event.sessions.map((session) => {
                const isLive = isSessionLive(session, now);
                const isFinished =
                  session.completed ||
                  (session.endTime
                    ? new Date(session.endTime).getTime() < now.getTime()
                    : new Date(session.startTime).getTime() + 2 * 3600000 < now.getTime());
                const hasResults = !!session.results?.length;
                const calUrl = buildGcalUrl(event, session, series.broadcast);

                return (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                      isLive
                        ? "bg-red-500/5 border-red-500/30 text-red-600 dark:text-red-400 font-semibold"
                        : "bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/50 dark:border-zinc-800/60 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate pr-2">
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />}
                      <span className="font-medium truncate">{session.name}</span>
                      {isFinished && !isLive && (
                        <span className="shrink-0 flex items-center space-x-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-1 py-0.2 rounded">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Done</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="text-right">
                        <div className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                          {formatDayAndDate(
                            session.startTime,
                            timeMode === "track" ? event.venueTimeZone : timeMode === "utc" ? "UTC" : undefined
                          )}
                        </div>
                        <div className="font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100">
                          {formatSessionTime(session.startTime)}
                        </div>
                      </div>

                      {hasResults && (
                        <button
                          type="button"
                          onClick={() => onOpenResults(event, session)}
                          title="View classification"
                          className="min-h-11 px-2 rounded bg-zinc-200/80 dark:bg-zinc-700 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 flex items-center space-x-1 transition-colors"
                        >
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>Results</span>
                        </button>
                      )}

                      {!isFinished && (
                        <a
                          href={calUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Add this session to Google Calendar"
                          className="min-w-11 min-h-11 flex items-center justify-center rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: TV Broadcast & Overall Actions */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex min-w-0 items-center space-x-1.5 text-zinc-600 dark:text-zinc-400">
            <Tv className="w-3.5 h-3.5 text-zinc-500" />
            <span className="truncate max-w-[55vw] sm:max-w-[200px]" title={series.broadcast}>
              {series.broadcast}
            </span>
          </div>

          {sessionsWithResults.length > 0 && !liveSession && (
            <button
              type="button"
              onClick={() => onOpenResults(event, sessionsWithResults[sessionsWithResults.length - 1])}
              className="min-h-11 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1"
            >
              <Award className="w-3 h-3" />
              <span>Latest Results</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
