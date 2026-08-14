import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchDynamicStartData } from '../src/engine/latviaData';

describe('latviaData.fetchDynamicStartData', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests a specific year and maps returned stats to indicator overrides', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        stats: {
          population: { key: 'population', value: 1_865_000, unit: 'people', label: 'Population', period: '2015' },
          unemployment: { key: 'unemployment', value: 9.1, unit: '%', label: 'Unemployment', period: '2015' },
          gdp: { key: 'gdp', value: 40_500_000, unit: 'eur', label: 'GDP', period: '2015' },
          cpi: { key: 'cpi', value: 1.8, unit: '%', label: 'CPI', period: '2015' },
          avgSalary: { key: 'avgSalary', value: 980, unit: 'eur', label: 'Average salary', period: '2015' },
        },
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const overrides = await fetchDynamicStartData(2015);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/latvia-stats?keys=population,unemployment,gdp,cpi,avgSalary&year=2015'
    );
    expect(overrides).toEqual({
      population: 1.865,
      unemployment: 9.1,
      gdp: 40.5,
      inflation: 1.8,
    });
    expect(overrides).not.toHaveProperty('avgSalary');
  });

  it('returns an empty object when the API call fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline');
    }));

    await expect(fetchDynamicStartData(2020)).resolves.toEqual({});
  });
});
