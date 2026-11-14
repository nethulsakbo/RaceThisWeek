import { RaceEvent, SessionItem } from "@/types/motorsport";

export function getWeekRange(date: Date = new Date()) {
  const current = new Date(date);
  const day = current.getDay();
  // Monday as start of week (0 is Sunday, so if Sunday, diff is -6)
  const diffToMonday = current.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(current.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

export function isEventThisWeek(event: RaceEvent, targetDate: Date = new Date()): boolean {
  const { start, end } = getWeekRange(targetDate);
  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate);

  // Overlaps if eventStart <= end && eventEnd >= start
  return eventStart <= end && eventEnd >= start;
}

export function isSessionLive(session: SessionItem, now: Date = new Date()): boolean {
  if (session.completed) return false;
  const start = new Date(session.startTime).getTime();
  const end = session.endTime ? new Date(session.endTime).getTime() : start + 2 * 60 * 60 * 1000;
  const currentTime = now.getTime();
  return currentTime >= start && currentTime <= end;
}

export function getEventCurrentStatus(event: RaceEvent, now: Date = new Date()): 'live' | 'upcoming' | 'completed' {
  const anyLiveSession = event.sessions.some(s => isSessionLive(s, now));
  if (anyLiveSession) return 'live';

  const allCompleted = event.sessions.every(s => s.completed || new Date(s.endTime || s.startTime).getTime() < now.getTime());
  if (allCompleted) return 'completed';

  return 'upcoming';
}

export function formatEventDateRange(
  startDateStr: string,
  endDateStr: string,
  timeZone?: string
): string {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const dateOptions: Intl.DateTimeFormatOptions = { timeZone };
  const startParts = new Intl.DateTimeFormat("en-US", {
    ...dateOptions,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).formatToParts(start);
  const endParts = new Intl.DateTimeFormat("en-US", {
    ...dateOptions,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).formatToParts(end);
  const startMonth = startParts.find((part) => part.type === "month")?.value;
  const endMonth = endParts.find((part) => part.type === "month")?.value;
  const startDay = startParts.find((part) => part.type === "day")?.value;
  const endDay = endParts.find((part) => part.type === "day")?.value;
  const startYear = startParts.find((part) => part.type === "year")?.value;
  const endYear = endParts.find((part) => part.type === "year")?.value;

  if (startMonth === endMonth && startYear === endYear) {
    return `${startMonth} ${startDay}–${endDay}, ${endYear}`;
  }
  if (startYear === endYear) {
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${endYear}`;
  }
  return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
}

export function formatTimeInUserTimezone(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatDayAndDate(isoString: string, timeZone?: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone,
  });
}

export function isEventCurrentlyLive(
  event: { sessions: { startTime: string; endTime?: string; completed?: boolean }[] },
  now: Date
): boolean {
  return event.sessions.some((s) => isSessionLive(s as SessionItem, now));
}

export function getCountdown(targetIso: string, now: Date = new Date()): { days: number; hours: number; minutes: number; isPast: boolean } {
  const diff = new Date(targetIso).getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return { days, hours, minutes, isPast: false };
}

