import { describe, expect, it } from 'vitest';
import {
  decodeCustomScenario,
  encodeCustomScenario,
  sanitizeCustomScenario,
} from '../src/engine/scenarioBuilder';

describe('scenarioBuilder', () => {
  it('round-trips a valid custom scenario payload', () => {
    const encoded = encodeCustomScenario({
      name: 'Security Stress Test',
      year: 2030,
      indicatorOverrides: {
        unemployment: 10.2,
        natoRelations: 80,
      },
    });

    expect(decodeCustomScenario(encoded)).toEqual({
      name: 'Security Stress Test',
      year: 2030,
      indicatorOverrides: {
        unemployment: 10.2,
        natoRelations: 80,
      },
    });
  });

  it('sanitizes invalid values and drops unknown indicators', () => {
    const scenario = sanitizeCustomScenario({
      name: '  Deep Recession  ',
      year: 1800,
      indicatorOverrides: {
        unemployment: 99,
        gdpGrowth: -100,
        unknown: 50,
        inflation: Number.NaN,
      },
    });

    expect(scenario).toEqual({
      name: 'Deep Recession',
      year: 1991,
      indicatorOverrides: {
        unemployment: 30,
        gdpGrowth: -20,
      },
    });
  });

  it('returns null for malformed encoded payloads', () => {
    expect(decodeCustomScenario('not-a-valid-payload')).toBeNull();
  });
});
