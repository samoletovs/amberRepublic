/**
 * Latvia CSP data integration for game features:
 * - Dynamic starting conditions (fetch real data on game start)
 * - Historical crisis scenarios
 * - Beat Reality end-game comparison
 * - News ticker / advisor briefings
 * - Budget allocation data
 * - Population pyramid
 * - Regional data
 */

const API_BASE = '/api';

// ─── Types ───────────────────────────────────────────────────────

export interface HistoricalScenario {
  id: string;
  name: string;
  year: number;
  description: string;
  emoji: string;
  challenge: string;
}

export interface BudgetItem {
  code: string;
  name: string;
  emoji: string;
  amount: number;
}

export interface PyramidBar {
  ageGroup: string;
  male: number;
  female: number;
}

export interface RegionData {
  code: string;
  name: string;
  nameEn: string;
  population: number | null;
}

export interface NewsBriefing {
  text: string;
  emoji: string;
  source: string;
}

// ─── Historical Scenarios ────────────────────────────────────────

export const HISTORICAL_SCENARIOS: HistoricalScenario[] = [
  {
    id: 'crisis_2009',
    name: 'The Great Recession',
    year: 2009,
    description: 'Latvia\'s GDP crashed 14% in one year. The IMF and EU had to bail you out. Unemployment is rocketing toward 20%. Can you steer the recovery without destroying the social fabric?',
    emoji: '📉',
    challenge: 'Survive the bailout. Restore growth without mass emigration.',
  },
  {
    id: 'crisis_2015',
    name: 'Refugee & Security Crisis',
    year: 2015,
    description: 'Europe is in turmoil. The refugee crisis tests EU solidarity. Russia annexed Crimea last year and NATO\'s eastern flank feels exposed. Latvia must balance security, EU obligations, and integration.',
    emoji: '🌍',
    challenge: 'Navigate EU refugee quotas while strengthening NATO defense.',
  },
  {
    id: 'crisis_2020',
    name: 'COVID-19 Pandemic',
    year: 2020,
    description: 'A global pandemic hits. Healthcare pressure is extreme, the economy is shutting down, and Latvia\'s already-struggling health system faces its greatest test. Remote work changes everything.',
    emoji: '🦠',
    challenge: 'Protect lives AND the economy. Latvia\'s healthcare was ranked worst in EU.',
  },
  {
    id: 'crisis_2022',
    name: 'Energy & Inflation Crisis',
    year: 2022,
    description: 'Russia invades Ukraine. Energy prices explode. Inflation hits 20%+ — the worst in the eurozone. Latvia cuts all ties with Russia. Your eastern border is now a frontline state.',
    emoji: '⚡',
    challenge: 'Energy independence. Tame inflation. Support Ukraine while protecting citizens.',
  },
];

// ─── Fetch helpers ───────────────────────────────────────────────

interface StatResult {
  key: string;
  value: number;
  unit: string;
  label: string;
  period: string;
}

interface StatsResponse {
  stats: Record<string, StatResult>;
  errors?: string[];
}

/** Fetch stats from API, optionally for a specific year */
export async function fetchStats(keys: string[], year?: number): Promise<Record<string, StatResult>> {
  let url = `${API_BASE}/latvia-stats?keys=${keys.join(',')}`;
  if (year) url += `&year=${year}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch stats');
  const data: StatsResponse = await res.json();
  return data.stats;
}

/** Fetch real data to overlay on initial game state */
export async function fetchDynamicStartData(): Promise<Partial<Record<string, number>>> {
  try {
    const stats = await fetchStats(['population', 'unemployment', 'gdp', 'cpi', 'avgSalary']);
    const overrides: Partial<Record<string, number>> = {};

    if (stats.population?.value) overrides.population = stats.population.value / 1_000_000;
    if (stats.unemployment?.value) overrides.unemployment = stats.unemployment.value;
    if (stats.gdp?.value) overrides.gdp = stats.gdp.value / 1_000_000;
    if (stats.cpi?.value) overrides.inflation = stats.cpi.value;

    return overrides;
  } catch {
    return {};
  }
}

/** Fetch historical data for a crisis scenario */
export async function fetchHistoricalData(year: number): Promise<Partial<Record<string, number>>> {
  try {
    const stats = await fetchStats(['population', 'unemployment', 'gdp', 'cpi'], year);
    const overrides: Partial<Record<string, number>> = {};

    if (stats.population?.value) overrides.population = stats.population.value / 1_000_000;
    if (stats.unemployment?.value) overrides.unemployment = stats.unemployment.value;
    if (stats.gdp?.value) overrides.gdp = stats.gdp.value / 1_000_000;
    if (stats.cpi?.value) overrides.inflation = stats.cpi.value;

    return overrides;
  } catch {
    return {};
  }
}

// ─── Budget ──────────────────────────────────────────────────────

export async function fetchBudget(): Promise<BudgetItem[]> {
  try {
    const res = await fetch(`${API_BASE}/latvia-budget`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.budget || [];
  } catch {
    return [];
  }
}

// ─── Pyramid ─────────────────────────────────────────────────────

export async function fetchPyramid(): Promise<PyramidBar[]> {
  try {
    const res = await fetch(`${API_BASE}/latvia-pyramid`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.pyramid || [];
  } catch {
    return [];
  }
}

// ─── Regions ─────────────────────────────────────────────────────

export async function fetchRegions(): Promise<RegionData[]> {
  try {
    const res = await fetch(`${API_BASE}/latvia-regions`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.regions || [];
  } catch {
    return [];
  }
}

// ─── Crime ───────────────────────────────────────────────────────

export async function fetchCrime(): Promise<{ year: string; total: number }[]> {
  try {
    const res = await fetch(`${API_BASE}/latvia-crime`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.crimes || [];
  } catch {
    return [];
  }
}

// ─── News Ticker / Advisor Briefings ─────────────────────────────

export async function generateNewsBriefings(): Promise<NewsBriefing[]> {
  try {
    const [stats, regions, crimes] = await Promise.all([
      fetchStats(['population', 'avgSalary', 'unemployment', 'births', 'netMigration', 'cpi']),
      fetchRegions(),
      fetchCrime(),
    ]);

    const briefings: NewsBriefing[] = [];

    if (stats.population?.value) {
      briefings.push({
        text: `CSP reports Latvia's population at ${(stats.population.value).toLocaleString()} (${stats.population.period})`,
        emoji: '👥',
        source: 'CSP',
      });
    }
    if (stats.avgSalary?.value) {
      briefings.push({
        text: `Average gross salary reached €${stats.avgSalary.value}/month`,
        emoji: '💶',
        source: 'CSP',
      });
    }
    if (stats.unemployment?.value) {
      briefings.push({
        text: `Unemployment rate stands at ${stats.unemployment.value}%`,
        emoji: '👷',
        source: 'CSP',
      });
    }
    if (stats.births?.value) {
      briefings.push({
        text: `${stats.births.value.toLocaleString()} babies born last year — ${stats.births.value < 15000 ? 'a record low' : 'holding steady'}`,
        emoji: '👶',
        source: 'CSP',
      });
    }
    if (stats.netMigration?.value != null) {
      const net = stats.netMigration.value;
      briefings.push({
        text: `Net migration: ${net > 0 ? '+' : ''}${net.toLocaleString()} people ${net > 0 ? 'arrived' : 'left'}`,
        emoji: net > 0 ? '🏠' : '✈️',
        source: 'CSP',
      });
    }
    if (stats.cpi?.value) {
      briefings.push({
        text: `Consumer prices changed ${stats.cpi.value > 0 ? '+' : ''}${stats.cpi.value}% year-on-year`,
        emoji: '🏷️',
        source: 'CSP',
      });
    }
    if (regions.length > 0) {
      const riga = regions.find(r => r.nameEn === 'Riga');
      const latgale = regions.find(r => r.nameEn === 'Latgale');
      if (riga?.population && latgale?.population) {
        briefings.push({
          text: `Riga region: ${(riga.population).toLocaleString()} people. Latgale: ${(latgale.population).toLocaleString()} — the inequality persists`,
          emoji: '🗺️',
          source: 'CSP',
        });
      }
    }
    if (crimes.length > 0) {
      const latest = crimes[crimes.length - 1];
      if (latest) {
        briefings.push({
          text: `${latest.total.toLocaleString()} crimes registered in ${latest.year}`,
          emoji: '🚔',
          source: 'CSP',
        });
      }
    }

    return briefings;
  } catch {
    return [];
  }
}

// ─── Beat Reality: fetch real trajectory for end-game comparison ──

export async function fetchRealTrajectory(startYear: number, endYear: number): Promise<{
  year: number;
  population?: number;
  gdp?: number;
  unemployment?: number;
}[]> {
  const trajectory: { year: number; population?: number; gdp?: number; unemployment?: number }[] = [];

  for (let y = startYear; y <= Math.min(endYear, new Date().getFullYear()); y++) {
    try {
      const stats = await fetchStats(['population', 'gdp', 'unemployment'], y);
      trajectory.push({
        year: y,
        population: stats.population?.value ? stats.population.value / 1_000_000 : undefined,
        gdp: stats.gdp?.value ? stats.gdp.value / 1_000_000 : undefined,
        unemployment: stats.unemployment?.value ?? undefined,
      });
    } catch {
      // Skip years with no data
    }
  }

  return trajectory;
}
