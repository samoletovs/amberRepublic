import type { GameState, RealStat, RealityComparison } from './types';
import { INDICATORS } from './indicators';

const API_BASE = '/api';

/** Mapping from game indicator keys to CSP stat keys and conversion logic */
interface IndicatorMapping {
  gameKey: string;
  statKey: string;
  /** Convert raw CSP value to game-comparable value */
  convert: (raw: number) => number;
  /** How to compare: what's the threshold for close/moderate/far */
  threshold: { close: number; moderate: number };
  unit: string;
}

const INDICATOR_MAPPINGS: IndicatorMapping[] = [
  {
    gameKey: 'population',
    statKey: 'population',
    convert: (raw) => raw / 1_000_000, // CSP gives absolute, game uses millions
    threshold: { close: 0.05, moderate: 0.15 }, // 5% and 15% difference
    unit: 'M people',
  },
  {
    gameKey: 'gdp',
    statKey: 'gdp',
    convert: (raw) => raw / 1_000_000, // CSP gives thousands EUR, game uses billions
    threshold: { close: 0.1, moderate: 0.25 },
    unit: '€B',
  },
  {
    gameKey: 'unemployment',
    statKey: 'unemployment',
    convert: (raw) => raw, // both in %
    threshold: { close: 2, moderate: 5 }, // absolute percentage points
    unit: '%',
  },
  {
    gameKey: 'inflation',
    statKey: 'cpi',
    convert: (raw) => raw,
    threshold: { close: 2, moderate: 5 },
    unit: '%',
  },
];

let cachedStats: Record<string, RealStat> | null = null;

/** Fetch real Latvia data from our API proxy */
async function fetchRealStats(): Promise<Record<string, RealStat>> {
  if (cachedStats) return cachedStats;

  const keys = INDICATOR_MAPPINGS.map(m => m.statKey);
  const res = await fetch(`${API_BASE}/latvia-stats?keys=${keys.join(',')}`);
  if (!res.ok) throw new Error('Failed to fetch real data');

  const data = await res.json();
  const stats: Record<string, RealStat> = {};

  for (const [key, stat] of Object.entries(data.stats) as [string, { value: number; unit: string; label: string; period: string; key: string }][]) {
    stats[key] = {
      key,
      value: stat.value,
      unit: stat.unit,
      label: stat.label,
      period: stat.period,
    };
  }

  cachedStats = stats;
  return stats;
}

/** Clear cached real stats (e.g., on new game) */
export function clearRealDataCache(): void {
  cachedStats = null;
}

/** Compare game state indicators with real Latvia data */
export async function getRealityComparisons(state: GameState): Promise<RealityComparison[]> {
  const realStats = await fetchRealStats();
  const comparisons: RealityComparison[] = [];

  for (const mapping of INDICATOR_MAPPINGS) {
    const real = realStats[mapping.statKey];
    if (!real || real.value === null || real.value === undefined) continue;

    const gameValue = state.indicators[mapping.gameKey];
    if (gameValue === null || gameValue === undefined) continue;

    const realConverted = mapping.convert(real.value);
    const indicator = INDICATORS.find(i => i.key === mapping.gameKey);
    if (!indicator) continue;

    // Calculate divergence
    let divergence: RealityComparison['divergence'];
    if (mapping.unit === '%') {
      // Absolute comparison for percentages
      const diff = Math.abs(gameValue - realConverted);
      divergence = diff <= mapping.threshold.close ? 'close'
        : diff <= mapping.threshold.moderate ? 'moderate'
        : 'far';
    } else {
      // Relative comparison for other values
      const pctDiff = realConverted !== 0
        ? Math.abs((gameValue - realConverted) / realConverted)
        : 0;
      divergence = pctDiff <= mapping.threshold.close ? 'close'
        : pctDiff <= mapping.threshold.moderate ? 'moderate'
        : 'far';
    }

    comparisons.push({
      indicatorKey: mapping.gameKey,
      indicatorName: indicator.name,
      emoji: indicator.emoji,
      gameValue,
      realValue: realConverted,
      unit: mapping.unit,
      period: real.period,
      divergence,
    });
  }

  return comparisons;
}

/** Format a reality comparison value for display */
export function formatComparisonValue(value: number, unit: string): string {
  if (unit === 'M people') return `${value.toFixed(2)}M`;
  if (unit === '€B') return `€${value.toFixed(1)}B`;
  if (unit === '%') return `${value.toFixed(1)}%`;
  return value.toLocaleString('en-US');
}
