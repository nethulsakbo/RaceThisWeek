import { mkdir, writeFile } from "node:fs/promises";

const season = new Date().getUTCFullYear();
const series = [
  { id: "f2", site: "https://www.fiaformula2.com" },
  { id: "f3", site: "https://www.fiaformula3.com" },
];

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent": "RaceThisWeek/1.0",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Official standings request failed (${response.status}): ${url}`);
  }

  return response.text();
}

function stripTags(value) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .trim();
}

function parseInteger(value, field) {
  const parsed = Number(stripTags(value).replace(/,/g, ""));
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Official standings returned an invalid ${field}: ${value}`);
  }
  return parsed;
}

function getStandingsRows(html, label) {
  const captionIndex = html.indexOf("Standings Table");
  const tableStart = html.lastIndexOf("<table", captionIndex);
  const tableEnd = html.indexOf("</table>", captionIndex);
  const table =
    captionIndex >= 0 && tableStart >= 0 && tableEnd > captionIndex
      ? html.slice(tableStart, tableEnd + "</table>".length)
      : undefined;
  const body = table?.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i)?.[1];
  const rows = body?.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi);

  if (!rows?.length) {
    throw new Error(`Official standings page contains no ${label.toLowerCase()} rows`);
  }

  return rows;
}

function getRowLabel(row, field) {
  const firstHeader = row.match(/<th\b[^>]*>([\s\S]*?)<\/th>/i)?.[1];
  if (!firstHeader) {
    throw new Error(`Official standings returned a row without ${field}`);
  }

  const positionMarkup = firstHeader.match(
    /<span\b[^>]*class="[^"]*e-Wj0W_position[^"]*"[^>]*>([\s\S]*?)<\/span>/i
  )?.[1];
  const labelMarkup = [...firstHeader.matchAll(/<span\b[^>]*class="([^"]*)"[^>]*>([^<]*)<\/span>/gi)]
    .find((match) => match[1].includes("e-Wj0W_text_trim") && !match[1].includes("e-Wj0W_position"))?.[2];

  if (!positionMarkup || !labelMarkup) {
    throw new Error(`Official standings returned an incomplete ${field} row`);
  }

  return {
    position: parseInteger(positionMarkup, `${field} position`),
    label: stripTags(labelMarkup),
  };
}

function getRowPoints(row, field) {
  const headers = [...row.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)];
  const points = headers.at(-1)?.[1];
  if (!points) {
    throw new Error(`Official standings returned no ${field} points`);
  }
  return parseInteger(points, `${field} points`);
}

function parseDrivers(html) {
  return getStandingsRows(html, "Driver Standings Table").map((row) => {
    const { position, label } = getRowLabel(row, "driver");
    if (!label) {
      throw new Error("Official standings returned a driver without a name");
    }

    return {
      position,
      driver: label,
      team: "—",
      points: getRowPoints(row, "driver"),
    };
  });
}

function parseTeams(html) {
  return getStandingsRows(html, "Team Standings Table").map((row) => {
    const { position, label } = getRowLabel(row, "team");
    if (!label) {
      throw new Error("Official standings returned a team without a name");
    }

    return {
      position,
      team: label,
      points: getRowPoints(row, "team"),
    };
  });
}

for (const championship of series) {
  const [driverHtml, teamHtml] = await Promise.all([
    fetchPage(`${championship.site}/en/standings/${season}/drivers`),
    fetchPage(`${championship.site}/en/standings/${season}/teams`),
  ]);
  const standings = {
    seriesId: championship.id,
    season,
    updatedAt: new Date().toISOString(),
    drivers: parseDrivers(driverHtml),
    teams: parseTeams(teamHtml),
  };

  const serializedStandings = `${JSON.stringify(standings, null, 2)}\n`;
  await Promise.all(
    [
      new URL(`../src/data/${championship.id}-standings.json`, import.meta.url),
      new URL(`../public/${championship.id}-standings.json`, import.meta.url),
    ].map((url) => writeFile(url, serializedStandings))
  );
  console.log(
    `Refreshed ${championship.id.toUpperCase()} standings for ${season}: ${standings.drivers.length} drivers, ${standings.teams.length} teams.`
  );
}
