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

export interface HistoricalScenarioDecisionEffect {
  indicator: string;
  delta: number;
}

export interface HistoricalScenarioDecision {
  id: string;
  title: string;
  description: string;
  learningNote: string;
  effects: HistoricalScenarioDecisionEffect[];
}

export interface HistoricalScenario {
  id: string;
  name: string;
  year: number;
  description: string;
  emoji: string;
  challenge: string;
  decisions: HistoricalScenarioDecision[];
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
    decisions: [
      {
        id: 'austerity_first',
        title: 'Austerity first',
        description: 'Cut spending fast to satisfy lenders and stabilize public finances.',
        learningNote: 'Historically, Latvia chose deep austerity and recovered macro stability quickly, but social costs were severe.',
        effects: [
          { indicator: 'publicDebt', delta: -5 },
          { indicator: 'unemployment', delta: 4 },
          { indicator: 'publicHappiness', delta: -8 },
        ],
      },
      {
        id: 'social_buffer',
        title: 'Protect social spending',
        description: 'Negotiate slower cuts and preserve healthcare, education, and municipal services.',
        learningNote: 'A softer path can reduce immediate social pain, but usually leaves debt pressure and investor anxiety higher.',
        effects: [
          { indicator: 'publicDebt', delta: 4 },
          { indicator: 'publicHappiness', delta: 4 },
          { indicator: 'euStanding', delta: -2 },
        ],
      },
    ],
  },
  {
    id: 'crisis_2015',
    name: 'Refugee & Security Crisis',
    year: 2015,
    description: 'Europe is in turmoil. The refugee crisis tests EU solidarity. Russia annexed Crimea last year and NATO\'s eastern flank feels exposed. Latvia must balance security, EU obligations, and integration.',
    emoji: '🌍',
    challenge: 'Navigate EU refugee quotas while strengthening NATO defense.',
    decisions: [
      {
        id: 'solidarity_line',
        title: 'EU solidarity line',
        description: 'Accept larger refugee quotas and prioritize integration support.',
        learningNote: 'Cooperating with EU migration policy often improves diplomatic capital while increasing domestic polarization risk.',
        effects: [
          { indicator: 'euStanding', delta: 6 },
          { indicator: 'socialCohesion', delta: -5 },
          { indicator: 'publicHappiness', delta: -3 },
        ],
      },
      {
        id: 'security_line',
        title: 'Security-first line',
        description: 'Limit intake and focus resources on border control and NATO readiness.',
        learningNote: 'A restrictive approach can calm domestic fears, but may weaken trust with EU partners.',
        effects: [
          { indicator: 'borderSecurity', delta: 5 },
          { indicator: 'natoRelations', delta: 3 },
          { indicator: 'euStanding', delta: -4 },
        ],
      },
    ],
  },
  {
    id: 'crisis_2020',
    name: 'COVID-19 Pandemic',
    year: 2020,
    description: 'A global pandemic hits. Healthcare pressure is extreme, the economy is shutting down, and Latvia\'s already-struggling health system faces its greatest test. Remote work changes everything.',
    emoji: '🦠',
    challenge: 'Protect lives AND the economy. Latvia\'s healthcare was ranked worst in EU.',
    decisions: [
      {
        id: 'strict_lockdown',
        title: 'Strict early lockdowns',
        description: 'Prioritize public health restrictions and emergency hospital expansion.',
        learningNote: 'Early restrictions can reduce system collapse risk, but carry immediate social and business backlash.',
        effects: [
          { indicator: 'healthcareQuality', delta: 6 },
          { indicator: 'gdpGrowth', delta: -1.2 },
          { indicator: 'publicHappiness', delta: -4 },
        ],
      },
      {
        id: 'open_economy',
        title: 'Keep economy more open',
        description: 'Use lighter restrictions while subsidizing vulnerable sectors.',
        learningNote: 'A looser response can cushion GDP in the short run, but often raises healthcare pressure and policy volatility.',
        effects: [
          { indicator: 'gdpGrowth', delta: 0.6 },
          { indicator: 'healthcareQuality', delta: -4 },
          { indicator: 'publicDebt', delta: 2 },
        ],
      },
    ],
  },
  {
    id: 'crisis_2022',
    name: 'Energy & Inflation Crisis',
    year: 2022,
    description: 'Russia invades Ukraine. Energy prices explode. Inflation hits 20%+ — the worst in the eurozone. Latvia cuts all ties with Russia. Your eastern border is now a frontline state.',
    emoji: '⚡',
    challenge: 'Energy independence. Tame inflation. Support Ukraine while protecting citizens.',
    decisions: [
      {
        id: 'price_shield',
        title: 'Massive household support',
        description: 'Freeze tariffs and subsidize heating bills through emergency spending.',
        learningNote: 'Price shields protect households quickly, but can increase debt and delay structural energy reforms.',
        effects: [
          { indicator: 'publicHappiness', delta: 7 },
          { indicator: 'publicDebt', delta: 4 },
          { indicator: 'inflation', delta: -2 },
        ],
      },
      {
        id: 'accelerate_transition',
        title: 'Accelerate energy transition',
        description: 'Fund rapid insulation, heat pumps, and renewables instead of broad price controls.',
        learningNote: 'Transition-heavy policy hurts initially but often improves medium-term resilience and strategic autonomy.',
        effects: [
          { indicator: 'greenTransition', delta: 8 },
          { indicator: 'publicHappiness', delta: -3 },
          { indicator: 'natoRelations', delta: 2 },
        ],
      },
    ],
  },
];

/** Apply a selected historical scenario decision as immediate starting deltas. */
export function applyHistoricalScenarioDecision(
  baseIndicators: Record<string, number>,
  decision?: HistoricalScenarioDecision,
): Record<string, number> {
  if (!decision) return { ...baseIndicators };
  const next = { ...baseIndicators };

  for (const effect of decision.effects) {
    if (!(effect.indicator in next)) continue;
    const current = next[effect.indicator] ?? 0;
    next[effect.indicator] = current + effect.delta;
  }

  return next;
}

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
    if (stats.netMigration?.value !== null && stats.netMigration?.value !== undefined) {
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
