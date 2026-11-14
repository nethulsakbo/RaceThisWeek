# Race This Week (2026 Motorsport Hub) 🏁

A high-performance, minimalist single-page web application displaying all major motorsport events happening around the world this week in one cohesive view.

## Features

- **All Major Motorsport Series Supported**:
  - **Formula 1** (F1)
  - **FIA Formula 2** (F2)
  - **FIA Formula 3** (F3)
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
Serve `index.html` with any static web server to enable F2/F3 standings auto-refresh. Opening the file directly shows the bundled standings snapshot but browser security prevents fetching updates:
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
   - This must be configured before the first deployment. The workflow's default `GITHUB_TOKEN` cannot create a missing Pages site.

3. **Automatic Deployment**:
   - The included workflow in `.github/workflows/deploy.yml` will build the project with `npm ci && npm run build` and publish the generated `./out` directory to GitHub Pages.
   - If the first deployment failed because no Pages site was found, enable Pages as described above, then rerun the workflow.
   - The workflow also runs every 15 minutes to refresh Formula 1 standings from the [Jolpica F1 API](https://github.com/jolpica/jolpica-f1) and Formula 2/3 driver and team standings from their [official F2](https://www.fiaformula2.com/en/standings) and [official F3](https://www.fiaformula3.com/en/standings) pages. These are published championship standings, not live lap timing; updates appear after the championships publish results.
   - Jolpica F1 data is available for non-commercial use under CC BY-NC-SA 4.0; see its [terms](https://github.com/jolpica/jolpica-f1/blob/main/TERMS.md).

### Use a custom domain

The site is a static export, so you can keep GitHub Pages as the host and point your domain to it:

1. Choose a domain, such as `racing.example.com`. In your domain registrar's DNS settings, add a `CNAME` record for `racing` pointing to `nethulsakbo.github.io`. For an apex domain (`example.com`), use the A/AAAA records in [GitHub's DNS guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain).
2. In the repository, open **Settings → Pages**, keep **Source** set to **GitHub Actions**, and enter your domain under **Custom domain**. Complete the DNS check and enable **Enforce HTTPS** when it becomes available.
3. Add a file named `public/CNAME` containing only your chosen hostname (for example, `racing.example.com`), then commit and push it. This preserves the custom domain in each static deployment.
4. The workflow reads the Pages base path from `actions/configure-pages`. Project pages use the repository sub-path; a custom domain is served from `/`, so the same build config supports both without editing `next.config.mjs`.
5. Wait for DNS propagation and verify both the custom URL and HTTPS certificate.

For official race dates and times, cards use the venue timezone by default; the time button cycles through track time, your browser's time, and UTC. Session classifications and non-F1/F2/F3 standings are only shown when synced/published data is available; check the linked series site when this app has no result.

---

## File Structure

- `src/types/motorsport.ts` - TypeScript interfaces for events, series, sessions, results, and standings.
- `src/data/series.ts` - Single source of truth for series metadata, broadcast channels, and synced championship standings.
- `scripts/refresh-f2f3-standings.mjs` - Refreshes F2/F3 driver and team standings from official championship pages.
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
