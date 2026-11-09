export type MotorsportSeriesId = 
  | 'f1' 
  | 'motogp' 
  | 'nascar' 
  | 'indycar' 
  | 'wec' 
  | 'formula-e' 
  | 'wrc' 
  | 'imsa';

export interface SeriesMeta {
  id: MotorsportSeriesId;
  name: string;
  shortName: string;
  category: 'Open Wheel' | 'Motorcycle' | 'Stock Car' | 'Endurance' | 'Rally';
  color: string; // Brand accent hex
  badgeBg: string;
  badgeText: string;
  officialSite: string;
  broadcast: string;
}

export type SessionType = 
  | 'Practice 1' 
  | 'Practice 2' 
  | 'Practice 3' 
  | 'Shakedown'
  | 'Qualifying' 
  | 'Sprint Shootout' 
  | 'Sprint' 
  | 'Superpole'
  | 'Warm Up' 
  | 'Race';

export interface SessionItem {
  id: string;
  name: SessionType | string;
  startTime: string; // ISO 8601 string
  endTime?: string;
  completed?: boolean;
  isLive?: boolean;
  results?: SessionResultDriver[];
}

export interface SessionResultDriver {
  position: number;
  driver: string;
  driverCode?: string;
  driverNumber?: string | number;
  team: string;
  timeOrGap: string;
  points?: number;
  status?: string;
}

export interface RaceEvent {
  id: string;
  seriesId: MotorsportSeriesId;
  season: number;
  round: number;
  totalRounds: number;
  name: string;
  officialName: string;
  circuit: string;
  location: string;
  country: string;
  countryCode: string; // ISO 2-letter for flags
  startDate: string; // ISO string
  endDate: string; // ISO string
  laps?: number;
  circuitLengthKm?: number;
  sessions: SessionItem[];
  status: 'upcoming' | 'live' | 'completed';
  featured?: boolean;
}

export interface StandingEntry {
  position: number;
  driver: string;
  nationality?: string;
  team: string;
  points: number;
  wins?: number;
  podiums?: number;
}

export interface TeamStandingEntry {
  position: number;
  team: string;
  points: number;
  wins?: number;
}

export interface SeriesStandings {
  seriesId: MotorsportSeriesId;
  season: number;
  updatedAt: string;
  drivers: StandingEntry[];
  teams?: TeamStandingEntry[];
}

