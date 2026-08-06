import { describe, expect, it } from 'vitest';
import {
  HISTORICAL_SCENARIOS,
  applyHistoricalScenarioDecision,
  type HistoricalScenarioDecision,
} from '../src/engine/latviaData';

describe('historical scenario educational decisions', () => {
  it('includes at least one interactive decision per historical scenario', () => {
    for (const scenario of HISTORICAL_SCENARIOS) {
      expect(scenario.decisions.length).toBeGreaterThan(0);
      for (const decision of scenario.decisions) {
        expect(decision.title.length).toBeGreaterThan(0);
        expect(decision.learningNote.length).toBeGreaterThan(0);
      }
    }
  });

  it('applies selected scenario decision deltas without mutating base indicators', () => {
    const base = {
      publicDebt: 40,
      publicHappiness: 55,
    };

    const decision: HistoricalScenarioDecision = {
      id: 'test',
      title: 'Test',
      description: 'Test',
      learningNote: 'Test',
      effects: [
        { indicator: 'publicDebt', delta: -3 },
        { indicator: 'publicHappiness', delta: 4 },
        { indicator: 'unknownIndicator', delta: 10 },
      ],
    };

    const next = applyHistoricalScenarioDecision(base, decision);

    expect(next).toEqual({
      publicDebt: 37,
      publicHappiness: 59,
    });
    expect(base).toEqual({
      publicDebt: 40,
      publicHappiness: 55,
    });
  });
});
