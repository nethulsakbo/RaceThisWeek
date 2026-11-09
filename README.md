# Race This Week (2026 Motorsport Hub) 🏁

A high-performance, minimalist single-page web application displaying all major motorsport events happening around the world this week in one cohesive view.

## Features

- **All Major Motorsport Series Supported**:
  - **Formula 1** (F1)
  - **MotoGP** (Grand Prix & Sprint)
  - **NASCAR Cup Series**
  - **NTT IndyCar Series**
  - **FIA World Endurance Championship (WEC)**
  - **ABB FIA Formula E**
  - **World Rally Championship (WRC)**
  - **IMSA WeatherTech SportsCar Championship**

- **"This Week" Focused View**:
  - Automatically calculates and isolates events taking place during the current calendar week.
  - Interactive week navigator: browse Previous Weeks, Next Week, or jump back to Today with one click.

- **Detailed Session Schedules & Automatic Local Time**:
  - Free Practice (FP1, FP2, FP3), Qualifying, Sprints, Shootouts, and Main Grand Prix races.
  - Every session is converted to the user's local timezone.
  - One-click Google Calendar integration (`+ Cal`).
  - Broadcaster guide badges (ESPN, Sky Sports, TNT Sports, Peacock, F1 TV, etc.).

- **Live Session Classification & Timing Results**:
  - Click **Results** on any session to inspect driver finishing positions, intervals/gap times, team names, fastest lap indicators, and championship points awarded.

- **Championship Standings**:
  - Dedicated Championship Standings tab with tabs for Drivers & Constructors across all supported series.

- **Design Philosophy**:
  - Ultra-clean minimalist aesthetic with subtle brand accent borders, dark mode default, and responsive layout.

---

## Quick Start Options

### Option 1: Instant Standalone (No Node.js install required)
Double-click `index.html` in your browser or serve it with any static web server:
```bash
# Python:
python -m http.server 3000
# or simply open index.html in Chrome / Edge / Firefox
```

### Option 2: Full Next.js Application
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser:
http://localhost:3000
```

---

## File Structure

- `src/types/motorsport.ts` - TypeScript interfaces for events, series, sessions, results, and standings.
- `src/data/series.ts` - Series metadata (brand accents, broadcast info, championship standings).
- `src/data/calendar.ts` - Racing calendar with sessions, circuits, and classification results.
- `src/lib/dateUtils.ts` - Date calculations, local timezone conversion, and week boundaries.
- `src/components/Header.tsx` - App header with live indicator and timezone badge.
- `src/components/SeriesFilter.tsx` - Series selector pills with event counters.
- `src/components/RaceCard.tsx` - Motorsport card with session timetable and broadcaster info.
- `src/components/LiveResultsModal.tsx` - Timing and classification results popup.
- `src/components/StandingsTable.tsx` - Full Championship Driver & Constructor standings.
- `src/app/api/races/route.ts` - REST API route for filtering races by week, series, or date.
- `index.html` - Self-contained offline-ready distribution.

