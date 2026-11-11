"use client";

import React, { useEffect, useRef } from "react";
import { X, Trophy, Timer, Award } from "lucide-react";
import { RaceEvent, SessionItem } from "@/types/motorsport";
import { MOTORSPORT_SERIES } from "@/data/series";

interface LiveResultsModalProps {
  event: RaceEvent | null;
  session: SessionItem | null;
  onClose: () => void;
}

export function LiveResultsModal({ event, session, onClose }: LiveResultsModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus close button on open
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Escape key handler + body scroll lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!event || !session) return null;

  const series = MOTORSPORT_SERIES[event.seriesId];
  const results = session.results || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between bg-zinc-50 dark:bg-zinc-950/50">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: series.color }}
              >
                {series.shortName}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Round {event.round} • {event.circuit}
              </span>
            </div>
            <h3 id="modal-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {session.name} Classification
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {event.name}
            </p>
          </div>

          <button
            ref={closeRef}
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    <th className="pb-2 pl-2 w-12">Pos</th>
                    <th className="pb-2">Driver</th>
                    <th className="pb-2">Team / Car</th>
                    <th className="pb-2 text-right">Time / Gap</th>
                    <th className="pb-2 text-right pr-2">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-xs">
                  {results.map((res) => {
                    const isPodium = res.position <= 3;
                    return (
                      <tr
                        key={`${res.driver}-${res.position}`}
                        className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                          res.position === 1 ? "bg-amber-500/5 font-semibold" : ""
                        }`}
                      >
                        <td className="py-2.5 pl-2">
                          {res.position === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                              1
                            </span>
                          ) : res.position === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-zinc-300/30 text-zinc-400 flex items-center justify-center font-bold text-xs">
                              2
                            </span>
                          ) : res.position === 3 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-600 flex items-center justify-center font-bold text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-zinc-400 pl-1.5">{res.position}</span>
                          )}
                        </td>
                        <td className="py-2.5 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                          <div className="flex items-center space-x-1.5">
                            {res.driverNumber && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                #{res.driverNumber}
                              </span>
                            )}
                            <span>{res.driver}</span>
                            {res.status && (
                              <span className="text-[9px] font-sans font-semibold px-1.5 py-0.2 rounded bg-red-500/10 text-red-500 border border-red-500/20">
                                {res.status}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 font-sans text-zinc-500 dark:text-zinc-400 text-xs">
                          {res.team}
                        </td>
                        <td className="py-2.5 text-right font-mono text-zinc-800 dark:text-zinc-200">
                          {res.timeOrGap}
                        </td>
                        <td className="py-2.5 text-right pr-2 font-mono text-zinc-500 dark:text-zinc-400">
                          {res.points !== undefined ? `+${res.points}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400">
              <Timer className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No official timing data published yet for this session.</p>
              <p className="text-xs mt-1">Live timing will populate once cars take to the track.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center space-x-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Official Timing &amp; Scoring Feed</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
