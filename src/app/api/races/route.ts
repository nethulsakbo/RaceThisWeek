import { NextResponse } from "next/server";
import { ALL_RACE_EVENTS } from "@/data/calendar";
import { STANDINGS_DATA, MOTORSPORT_SERIES } from "@/data/series";
import { isEventThisWeek } from "@/lib/dateUtils";
import { MotorsportSeriesId } from "@/types/motorsport";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") || "this-week"; // 'this-week' | 'all' | 'past' | 'upcoming'
  const series = searchParams.get("series") as MotorsportSeriesId | null;
  const targetDateStr = searchParams.get("date");

  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();

  let filtered = [...ALL_RACE_EVENTS];

  if (series && MOTORSPORT_SERIES[series]) {
    filtered = filtered.filter(event => event.seriesId === series);
  }

  if (view === "this-week") {
    filtered = filtered.filter(event => isEventThisWeek(event, targetDate));
  } else if (view === "upcoming") {
    filtered = filtered.filter(event => new Date(event.endDate) >= targetDate);
  } else if (view === "past") {
    filtered = filtered.filter(event => new Date(event.endDate) < targetDate);
  }

  // Sort by start date
  filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    view,
    totalEvents: filtered.length,
    events: filtered,
    standings: STANDINGS_DATA,
    series: MOTORSPORT_SERIES,
  });
}

