/**
 * Dynamic Event Generator.
 *
 * Turns live Latvian statistics (CSP, via the `/api/latvia-stats` proxy) into
 * playable `GameEvent`s. The generator itself is a pure function — it takes a
 * snapshot of real stats and returns events, with no side effects — so it stays
 * deterministic and testable. Fetching is isolated in `fetchDynamicEvents`.
 */

import type { GameEvent, RealStat } from './types';
import { fetchStats } from './latviaData';

/** Stat keys the generator asks the API for. */
export const DYNAMIC_STAT_KEYS = [
  'unemployment',
  'cpi',
  'netMigration',
  'births',
  'avgSalary',
] as const;

/** Prefix for every generated event id — lets the UI/telemetry spot them. */
export const DYNAMIC_EVENT_PREFIX = 'dyn_';

interface DynamicBand {
  /** Suffix appended to the template id — must be unique within a template. */
  id: string;
  /**
   * Inclusive lower bound / exclusive upper bound on the real value.
   * Omitting a bound leaves that side open. Bands are evaluated in order and
   * the first match wins, so overlapping ranges resolve to the earlier band.
   */
  min?: number;
  max?: number;
  build: (ctx: BandContext) => Omit<GameEvent, 'id' | 'preconditions' | 'oneTime' | 'flavor'>;
}

interface BandContext {
  /** Raw value from the statistics API. */
  value: number;
  /** Human-readable value, pre-formatted for prose. */
  display: string;
  /** Reporting period of the underlying stat (e.g. "2024"). */
  period: string;
}

interface DynamicTemplate {
  statKey: string;
  /** Formats the raw value for use inside event prose. */
  format: (value: number) => string;
  bands: DynamicBand[];
}

const TEMPLATES: DynamicTemplate[] = [
  {
    statKey: 'unemployment',
    format: (v) => `${v.toFixed(1)}%`,
    bands: [
      {
        id: 'high',
        min: 8,
        build: ({ display }) => ({
          title: '📊 Live Data: Unemployment Spikes',
          description: `Fresh figures put real unemployment at ${display}. Latgale job centres report queues out the door, and the opposition is quoting the number hourly.`,
          category: 'economy',
          weight: 9,
          choices: [
            {
              label: 'Fund a retraining programme',
              description: 'Emergency budget for reskilling into tech, logistics and green construction.',
              effects: [
                { indicator: 'unemployment', delta: -1.2, delay: 2, duration: 6 },
                { indicator: 'workforceSkill', delta: 5, delay: 3, duration: 0 },
                { indicator: 'publicDebt', delta: 1.5, delay: 0, duration: 0 },
              ],
              factionReactions: { socialDems: 'cheer', entrepreneurs: 'meh' },
              humor: 'Half the trainees discover they prefer welding to JavaScript.',
            },
            {
              label: 'Cut employer payroll taxes',
              description: 'Make hiring cheaper and let the private sector absorb the slack.',
              effects: [
                { indicator: 'unemployment', delta: -0.8, delay: 1, duration: 4 },
                { indicator: 'taxBurden', delta: -2, delay: 0, duration: 0 },
                { indicator: 'publicDebt', delta: 2, delay: 1, duration: 0 },
              ],
              factionReactions: { entrepreneurs: 'love', socialDems: 'frown' },
              humor: 'Employers promise to hire. Some of them even do.',
            },
            {
              label: 'Insist the figures are seasonal',
              description: 'Say nothing, spend nothing, wait for the next quarterly release.',
              effects: [
                { indicator: 'mediaTrust', delta: -4, delay: 0, duration: 0 },
                { indicator: 'socialStrain', delta: 3, delay: 1, duration: 4 },
              ],
              factionReactions: { socialDems: 'rage' },
              humor: 'The statisticians politely note that they already adjusted for seasonality.',
            },
          ],
        }),
      },
      {
        id: 'low',
        max: 6,
        build: ({ display }) => ({
          title: '📊 Live Data: Labour Market Runs Hot',
          description: `Real unemployment has fallen to ${display}. Employers cannot fill vacancies; wage demands are climbing across Riga and Valmiera alike.`,
          category: 'economy',
          weight: 7,
          choices: [
            {
              label: 'Open targeted work permits',
              description: 'Let in skilled workers to relieve the shortage.',
              effects: [
                { indicator: 'gdpGrowth', delta: 0.4, delay: 2, duration: 6 },
                { indicator: 'nationalIdentity', delta: -3, delay: 1, duration: 0 },
                { indicator: 'foreignInvestment', delta: 4, delay: 2, duration: 0 },
              ],
              factionReactions: { entrepreneurs: 'love', identity: 'rage' },
              humor: 'The permit portal survives its first day. Barely.',
            },
            {
              label: 'Invest in automation grants',
              description: 'Subsidise machinery and software instead of importing labour.',
              effects: [
                { indicator: 'techSector', delta: 4, delay: 3, duration: 0 },
                { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
                { indicator: 'gdpGrowth', delta: 0.3, delay: 4, duration: 6 },
              ],
              factionReactions: { entrepreneurs: 'cheer', reformBloc: 'cheer' },
              humor: 'A sawmill in Kurzeme buys a robot and names it Jānis.',
            },
          ],
        }),
      },
    ],
  },
  {
    statKey: 'cpi',
    format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`,
    bands: [
      {
        id: 'hot',
        min: 4,
        build: ({ display }) => ({
          title: '📊 Live Data: Prices Bite',
          description: `Consumer prices moved ${display} year-on-year in the latest release. Pensioners are comparing receipts on television again.`,
          category: 'economy',
          weight: 9,
          choices: [
            {
              label: 'Targeted support for low incomes',
              description: 'Direct payments to pensioners and low-wage households.',
              effects: [
                { indicator: 'publicConfidence', delta: 5, delay: 0, duration: 0 },
                { indicator: 'socialStrain', delta: -4, delay: 1, duration: 4 },
                { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
              ],
              factionReactions: { socialDems: 'love', entrepreneurs: 'frown' },
              humor: 'The payment arrives with a leaflet explaining who authorised it.',
            },
            {
              label: 'Hold the line on spending',
              description: 'Fiscal discipline now to avoid feeding inflation further.',
              effects: [
                { indicator: 'inflation', delta: -1, delay: 2, duration: 4 },
                { indicator: 'publicConfidence', delta: -4, delay: 0, duration: 0 },
                { indicator: 'euStanding', delta: 3, delay: 1, duration: 0 },
              ],
              factionReactions: { entrepreneurs: 'cheer', socialDems: 'rage' },
              humor: 'The finance minister uses the word "prudent" eleven times.',
            },
          ],
        }),
      },
      {
        id: 'cold',
        max: 0,
        build: ({ display }) => ({
          title: '📊 Live Data: Prices Stall',
          description: `The latest reading shows consumer prices at ${display}. Cheaper shopping baskets sound wonderful until shops start postponing orders.`,
          category: 'economy',
          weight: 6,
          choices: [
            {
              label: 'Bring forward public investment',
              description: 'Accelerate infrastructure projects to keep demand alive.',
              effects: [
                { indicator: 'gdpGrowth', delta: 0.5, delay: 2, duration: 6 },
                { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
              ],
              factionReactions: { entrepreneurs: 'cheer' },
              humor: 'Three roundabouts are announced before lunch.',
            },
            {
              label: 'Let the market settle',
              description: 'No intervention. Falling prices are a gift to households.',
              effects: [
                { indicator: 'publicConfidence', delta: 2, delay: 0, duration: 0 },
                { indicator: 'gdpGrowth', delta: -0.3, delay: 2, duration: 4 },
              ],
              factionReactions: { entrepreneurs: 'meh' },
              humor: 'Economists disagree loudly, as is tradition.',
            },
          ],
        }),
      },
    ],
  },
  {
    statKey: 'netMigration',
    format: (v) => `${v > 0 ? '+' : ''}${Math.round(v).toLocaleString('en-US')}`,
    bands: [
      {
        id: 'outflow',
        max: 0,
        build: ({ display }) => ({
          title: '📊 Live Data: The Departures Board',
          description: `Net migration came in at ${display} people. Every leaving flight is a small policy verdict.`,
          category: 'society',
          weight: 9,
          choices: [
            {
              label: 'Launch a return-home package',
              description: 'Relocation grants, housing help and job matching for the diaspora.',
              effects: [
                { indicator: 'emigrationRate', delta: -6, delay: 2, duration: 6 },
                { indicator: 'population', delta: 0.01, delay: 4, duration: 0 },
                { indicator: 'publicDebt', delta: 1.5, delay: 0, duration: 0 },
              ],
              factionReactions: { identity: 'cheer', socialDems: 'cheer' },
              humor: 'The campaign slogan tests better in Dublin than in Daugavpils.',
            },
            {
              label: 'Fix the regions instead',
              description: 'Pour the money into healthcare and schools outside Riga.',
              effects: [
                { indicator: 'healthcareQuality', delta: 4, delay: 3, duration: 0 },
                { indicator: 'educationQuality', delta: 4, delay: 3, duration: 0 },
                { indicator: 'emigrationRate', delta: -3, delay: 5, duration: 8 },
                { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
              ],
              factionReactions: { socialDems: 'love', entrepreneurs: 'frown' },
              humor: 'A Latgale hospital reopens its maternity ward. Photographers outnumber patients.',
            },
            {
              label: 'Accept a smaller, richer Latvia',
              description: 'Stop fighting demography; optimise for productivity per person.',
              effects: [
                { indicator: 'gdpGrowth', delta: 0.3, delay: 3, duration: 6 },
                { indicator: 'nationalIdentity', delta: -5, delay: 1, duration: 0 },
                { indicator: 'socialCohesion', delta: -3, delay: 1, duration: 0 },
              ],
              irreversible: true,
              factionReactions: { identity: 'rage', reformBloc: 'cheer' },
              humor: 'Someone in the ministry calls it "right-sizing". The word does not survive contact with voters.',
            },
          ],
        }),
      },
      {
        // Zero net migration counts as inflow — the 'outflow' band above is
        // strictly negative.
        id: 'inflow',
        min: 0,
        build: ({ display }) => ({
          title: '📊 Live Data: More Arrivals Than Departures',
          description: `Net migration registered ${display} people. Riga landlords noticed before the statisticians did.`,
          category: 'society',
          weight: 6,
          choices: [
            {
              label: 'Fund integration and language courses',
              description: 'Invest early so arrivals become neighbours, not headlines.',
              effects: [
                { indicator: 'socialCohesion', delta: 4, delay: 2, duration: 0 },
                { indicator: 'russianMinorityIntegration', delta: 3, delay: 3, duration: 0 },
                { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
              ],
              factionReactions: { socialDems: 'cheer', identity: 'frown' },
              humor: 'The language school orders more chairs.',
            },
            {
              label: 'Expand housing supply',
              description: 'Release land and speed permits before rents outrun wages.',
              effects: [
                { indicator: 'socialStrain', delta: -3, delay: 3, duration: 6 },
                { indicator: 'gdpGrowth', delta: 0.3, delay: 3, duration: 4 },
                { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
              ],
              factionReactions: { entrepreneurs: 'cheer', green: 'frown' },
              humor: 'Cranes return to the Riga skyline, cautiously.',
            },
          ],
        }),
      },
    ],
  },
  {
    statKey: 'births',
    format: (v) => Math.round(v).toLocaleString('en-US'),
    bands: [
      {
        id: 'low',
        max: 15000,
        build: ({ display }) => ({
          title: '📊 Live Data: Fewer Cradles',
          description: `Only ${display} babies were born in the latest reporting year — among the lowest counts on record. Maternity wards are quiet.`,
          category: 'society',
          weight: 8,
          choices: [
            {
              label: 'Expand family benefits',
              description: 'Bigger child payments, longer paid leave, guaranteed kindergarten places.',
              effects: [
                { indicator: 'birthRate', delta: 5, delay: 4, duration: 10 },
                { indicator: 'publicDebt', delta: 2.5, delay: 0, duration: 0 },
                { indicator: 'publicConfidence', delta: 3, delay: 1, duration: 0 },
              ],
              factionReactions: { socialDems: 'love', identity: 'cheer', entrepreneurs: 'frown' },
              humor: 'The kindergarten waiting list is now merely long instead of mythical.',
            },
            {
              label: 'Housing first for young families',
              description: 'State-backed mortgages and rental stock aimed at under-35s.',
              effects: [
                { indicator: 'birthRate', delta: 3, delay: 5, duration: 10 },
                { indicator: 'emigrationRate', delta: -3, delay: 4, duration: 6 },
                { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
              ],
              factionReactions: { socialDems: 'cheer', entrepreneurs: 'meh' },
              humor: 'A two-bedroom flat becomes a demographic instrument.',
            },
          ],
        }),
      },
    ],
  },
  {
    statKey: 'avgSalary',
    format: (v) => `€${Math.round(v).toLocaleString('en-US')}`,
    bands: [
      {
        // Any plausible published wage triggers this event; the guard only
        // rejects nonsensical zero/negative readings.
        id: 'report',
        min: 1,
        build: ({ display }) => ({
          title: '📊 Live Data: The Wage Question',
          description: `The average gross monthly salary now stands at ${display}. Unions call it proof of nothing; employers call it proof of everything.`,
          category: 'economy',
          weight: 6,
          choices: [
            {
              label: 'Raise the minimum wage',
              description: 'Lift the floor and accept the cost to smaller employers.',
              effects: [
                { indicator: 'publicConfidence', delta: 4, delay: 1, duration: 0 },
                { indicator: 'socialStrain', delta: -3, delay: 2, duration: 4 },
                { indicator: 'unemployment', delta: 0.4, delay: 3, duration: 4 },
              ],
              factionReactions: { socialDems: 'love', entrepreneurs: 'rage' },
              humor: 'A bakery in Cēsis raises prices by exactly one cent, out of spite.',
            },
            {
              label: 'Cut labour taxes on low wages',
              description: 'Increase take-home pay without forcing employers to pay more.',
              effects: [
                { indicator: 'taxBurden', delta: -2, delay: 0, duration: 0 },
                { indicator: 'publicConfidence', delta: 3, delay: 1, duration: 0 },
                { indicator: 'publicDebt', delta: 1.5, delay: 1, duration: 0 },
              ],
              factionReactions: { entrepreneurs: 'cheer', socialDems: 'meh' },
              humor: 'Payslips get slightly friendlier. Accountants get slightly busier.',
            },
          ],
        }),
      },
    ],
  },
];

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function matchesBand(band: DynamicBand, value: number): boolean {
  if (band.min !== undefined && value < band.min) return false;
  if (band.max !== undefined && value >= band.max) return false;
  return true;
}

/**
 * Build game events from a snapshot of real Latvian statistics.
 * Pure and deterministic: the same stats always yield the same events.
 * Stats that are missing, non-numeric or outside every band are skipped.
 */
export function generateDynamicEvents(stats: Record<string, RealStat>): GameEvent[] {
  const events: GameEvent[] = [];

  for (const template of TEMPLATES) {
    const stat = stats?.[template.statKey];
    if (!stat || !isFiniteNumber(stat.value)) continue;

    const band = template.bands.find(b => matchesBand(b, stat.value));
    if (!band) continue;

    const period = stat.period || 'latest data';
    const built = band.build({
      value: stat.value,
      display: template.format(stat.value),
      period,
    });

    events.push({
      ...built,
      id: `${DYNAMIC_EVENT_PREFIX}${template.statKey}_${band.id}_${period}`,
      preconditions: [],
      oneTime: true,
      flavor: `Live figure from Latvia's official statistics (CSP), ${period}.`,
    });
  }

  return events;
}

/** True if the event was produced by the dynamic generator. */
export function isDynamicEvent(event: GameEvent): boolean {
  return event.id.startsWith(DYNAMIC_EVENT_PREFIX);
}

/**
 * Fetch the latest real Latvian stats and turn them into events.
 * Never throws — returns an empty list if the data source is unavailable so
 * the game always falls back to the hand-written event pool.
 */
export async function fetchDynamicEvents(): Promise<GameEvent[]> {
  try {
    const stats = await fetchStats([...DYNAMIC_STAT_KEYS]);
    return generateDynamicEvents(stats as Record<string, RealStat>);
  } catch {
    return [];
  }
}
