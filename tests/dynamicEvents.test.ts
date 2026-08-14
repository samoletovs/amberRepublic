import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RealStat } from '../src/engine/types';
import {
  DYNAMIC_EVENT_PREFIX,
  DYNAMIC_STAT_KEYS,
  fetchDynamicEvents,
  generateDynamicEvents,
  isDynamicEvent,
} from '../src/engine/dynamicEvents';

function stat(key: string, value: number, period = '2024'): RealStat {
  return { key, value, unit: '', label: key, period };
}

describe('dynamicEvents', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should generate an event per matching stat band', () => {
    const events = generateDynamicEvents({
      unemployment: stat('unemployment', 9.4),
      cpi: stat('cpi', 5.1),
    });

    expect(events).toHaveLength(2);
    expect(events.every(isDynamicEvent)).toBe(true);
    expect(events[0].description).toContain('9.4%');
    expect(events[1].description).toContain('+5.1%');
  });

  it('should produce identical output for identical input', () => {
    const stats = { netMigration: stat('netMigration', -4200) };

    expect(generateDynamicEvents(stats)).toEqual(generateDynamicEvents(stats));
  });

  it('should pick different bands for different values', () => {
    const high = generateDynamicEvents({ unemployment: stat('unemployment', 12) });
    const low = generateDynamicEvents({ unemployment: stat('unemployment', 4) });

    expect(high[0].id).not.toBe(low[0].id);
  });

  it('should skip stats with no matching band', () => {
    // 7% sits between the "high" (>=8) and "low" (<6) unemployment bands.
    expect(generateDynamicEvents({ unemployment: stat('unemployment', 7) })).toEqual([]);
  });

  it('should skip missing, null and non-finite values', () => {
    const events = generateDynamicEvents({
      unemployment: stat('unemployment', Number.NaN),
      cpi: { ...stat('cpi', 0), value: null as unknown as number },
    });

    expect(events).toEqual([]);
  });

  it('should produce valid, unique, one-time events with usable choices', () => {
    const events = generateDynamicEvents({
      unemployment: stat('unemployment', 9),
      cpi: stat('cpi', -0.5),
      netMigration: stat('netMigration', -3000),
      births: stat('births', 14000),
      avgSalary: stat('avgSalary', 1650),
    });

    expect(events).toHaveLength(DYNAMIC_STAT_KEYS.length);
    expect(new Set(events.map(e => e.id)).size).toBe(events.length);

    for (const event of events) {
      expect(event.id.startsWith(DYNAMIC_EVENT_PREFIX)).toBe(true);
      expect(event.oneTime).toBe(true);
      expect(event.preconditions).toEqual([]);
      expect(event.weight).toBeGreaterThan(0);
      expect(event.flavor).toContain('2024');
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
      for (const choice of event.choices) {
        expect(choice.label.length).toBeGreaterThan(0);
        expect(choice.effects.length).toBeGreaterThan(0);
      }
    }
  });

  it('should include the reporting period in the id so new data yields new events', () => {
    const a = generateDynamicEvents({ cpi: stat('cpi', 6, '2024') })[0];
    const b = generateDynamicEvents({ cpi: stat('cpi', 6, '2025') })[0];

    expect(a.id).not.toBe(b.id);
  });

  it('should fetch stats and build events', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ stats: { unemployment: stat('unemployment', 9.9) } }),
    })));

    const events = await fetchDynamicEvents();

    expect(events).toHaveLength(1);
    expect(events[0].description).toContain('9.9%');
  });

  it('should request year-specific stats when a year is provided', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ stats: { unemployment: stat('unemployment', 9.9, '2020') } }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchDynamicEvents(2020);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/latvia-stats?keys=unemployment,cpi,netMigration,births,avgSalary&year=2020'
    );
  });

  it('should return an empty list when the data source fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network down');
    }));

    await expect(fetchDynamicEvents()).resolves.toEqual([]);
  });
});
