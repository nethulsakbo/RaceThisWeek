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
  - Automatically calculates and isolates events taking place during the current calendar week using live date calculation (`useNow()` ticking clock).
  - Interactive week navigator: browse Previous Weeks, Next Week, or jump back to Today with one click.
  - Deep linking / URL state: bookmark or share specific views (`?view=this-week&series=f1&week=0&q=las+vegas`).

- **Detailed Session Schedules & Automatic Local Time**:
  - Free Practice (FP1, FP2, FP3), Qualifying, Sprints, Shootouts, and Main Grand Prix races.
  - Every session shows local time with a one-click Local / UTC switcher.
  - One-click Google Calendar integration per session (`📅` / `+ Cal`).
  - Broadcaster guide badges (ESPN, Sky Sports, TNT Sports, Peacock, F1 TV, etc.).
  - Clear session status badges (`Done` / `LIVE`).

- **Live Session Classification & Timing Results**:
  - Accessible modal dialog (`role="dialog"`, `aria-modal="true"`, focus trap, Escape key dismiss, backdrop click) showing finishing positions, interval/gap times, team names, fastest lap indicators, and championship points awarded.

- **Championship Standings**:
  - Dedicated Championship Standings tab with Drivers & Constructors championship tables across all series (including NASCAR, IndyCar, WRC, and IMSA).

- **Design Philosophy**:
  - Ultra-clean minimalist aesthetic with subtle brand accent borders, dark mode default, persisted theme toggle in `localStorage`, and responsive layout.

---

## Quick Start Options

### Option 1: Full Next.js Application (Static Export)
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build and export static site to ./out
npm run build

# 4. Run lint check
npm run lint
```

### Option 2: Standalone Static Distribution
Double-click `index.html` in your browser or serve it with any static web server:
```bash
python -m http.server 3000
# or simply open index.html directly in your browser
```

---

## GitHub Pages Deployment

This project uses Next.js Static Export (`output: 'export'`) deployed automatically to GitHub Pages:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Race This Week"
   git remote add origin https://github.com/<your-username>/RaceThisWeek.git
   git push -u origin main
   ```

2. **Enable GitHub Pages in Repository Settings**:
   - Go to your repository on GitHub.
   - Click **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.

3. **Automatic Deployment**:
   - The included workflow in `.github/workflows/deploy.yml` will automatically build the project with `npm ci && npm run build` and publish the generated `./out` directory to `https://<your-username>.github.io/RaceThisWeek/`.

*(Note: If deploying to a project page sub-path like `https://username.github.io/RaceThisWeek/`, uncomment `basePath: '/RaceThisWeek'` in `next.config.mjs` before deploying.)*

---

## File Structure

- `src/types/motorsport.ts` - TypeScript interfaces for events, series, sessions, results, and standings.
- `src/data/series.ts` - Single source of truth for series metadata, broadcast channels, and championship standings.
- `src/data/calendar.ts` - Racing calendar with sessions, circuits, and classification results.
- `src/hooks/useNow.ts` - Ticking clock hook for live updates every 30 seconds.
- `src/lib/dateUtils.ts` - Date calculations, timezone formatting, and week boundaries.
- `src/components/Header.tsx` - App header with live indicator, timezone label, and theme persistence.
- `src/components/SeriesFilter.tsx` - Accessible series filter with event counts and brand indicators.
- `src/components/RaceCard.tsx` - Motorsport card with session timetable, Local/UTC toggle, and per-session GCal links.
- `src/components/LiveResultsModal.tsx` - Fully accessible timing and classification results dialog.
- `src/components/StandingsTable.tsx` - Driver & Constructor Championship standings tables.
- `src/app/page.tsx` - Main client island with URL state synchronization and Suspense boundary.
- `index.html` - Self-contained standalone distribution.
- `.github/workflows/deploy.yml` - GitHub Actions CI/CD deployment to GitHub Pages.
