import { mkdir, writeFile } from "node:fs/promises";

const apiBaseUrl = "https://api.jolpi.ca/ergast/f1/current";
const outputUrls = [
  new URL("../src/data/f1-standings.json", import.meta.url),
  new URL("../public/f1-standings.json", import.meta.url),
];

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "RaceThisWeek/1.0",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Jolpica F1 request failed (${response.status}): ${url}`);
  }

  return response.json();
}

function parseInteger(value, field) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Jolpica F1 returned an invalid ${field}: ${value}`);
  }
  return parsed;
}

function getStandingsList(response, key) {
  const standings = response?.MRData?.StandingsTable?.StandingsLists?.[0]?.[key];
  if (!Array.isArray(standings) || standings.length === 0) {
    throw new Error(`Jolpica F1 returned no ${key}`);
  }
  return standings;
}

const [driverResponse, constructorResponse] = await Promise.all([
  fetchJson(`${apiBaseUrl}/driverStandings/?format=json`),
  fetchJson(`${apiBaseUrl}/constructorStandings/?format=json`),
]);

const driverStandings = getStandingsList(driverResponse, "DriverStandings");
const constructorStandings = getStandingsList(constructorResponse, "ConstructorStandings");
const season = parseInteger(driverResponse.MRData.StandingsTable.season, "season");

const standings = {
  seriesId: "f1",
  season,
  updatedAt: new Date().toISOString(),
  drivers: driverStandings.map((standing) => {
    const driver = standing.Driver;
    const team = standing.Constructors?.[0]?.name;
    if (!driver?.givenName || !driver?.familyName || !team) {
      throw new Error("Jolpica F1 returned an incomplete driver standing");
    }

    return {
      position: parseInteger(standing.position, "driver position"),
      driver: `${driver.givenName} ${driver.familyName}`,
      nationality: driver.nationality,
      team,
      points: parseInteger(standing.points, "driver points"),
      wins: parseInteger(standing.wins, "driver wins"),
    };
  }),
  teams: constructorStandings.map((standing) => {
    if (!standing.Constructor?.name) {
      throw new Error("Jolpica F1 returned an incomplete constructor standing");
    }

    return {
      position: parseInteger(standing.position, "constructor position"),
      team: standing.Constructor.name,
      points: parseInteger(standing.points, "constructor points"),
      wins: parseInteger(standing.wins, "constructor wins"),
    };
  }),
};

const serializedStandings = `${JSON.stringify(standings, null, 2)}\n`;
await mkdir(new URL("../public/", import.meta.url), { recursive: true });
await Promise.all(outputUrls.map((url) => writeFile(url, serializedStandings)));
console.log(`Refreshed F1 standings for ${season}: ${standings.drivers.length} drivers, ${standings.teams.length} teams.`);
