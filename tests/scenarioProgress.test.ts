import { describe, expect, it } from 'vitest';
import { arcIdFromEventId, getScenarioProgress, scenarioForEvent } from '../src/engine/arcs';

describe('scenario progress helpers', () => {
  it('summarises active scenarios with chapter and chosen path', () => {
    const progress = getScenarioProgress([
      { arcId: 'energyPivot', stage: 1, turnStarted: 4, branch: 'renewables' },
      { arcId: 'rigaHousing', stage: 0, turnStarted: 6 },
    ]);

    expect(progress).toHaveLength(2);
    expect(progress[0]).toMatchObject({
      arcId: 'energyPivot',
      chapter: 2,
      totalChapters: 2,
      branch: 'renewables',
      branchLabel: 'Renewables first',
    });
    expect(progress[1]).toMatchObject({ arcId: 'rigaHousing', chapter: 1 });
    expect(progress[1].branchLabel).toBeUndefined();
  });

  it('maps arc-stage event ids back to their scenario', () => {
    expect(arcIdFromEventId('arc_energyPivot_2_lng')).toBe('energyPivot');
    expect(arcIdFromEventId('eco_budget_squeeze')).toBeNull();

    const context = scenarioForEvent('arc_rigaHousing_2', [
      { arcId: 'rigaHousing', stage: 1, turnStarted: 4 },
    ]);
    expect(context).toMatchObject({ arcId: 'rigaHousing', chapter: 2, totalChapters: 3 });

    expect(scenarioForEvent('soc_language_debate', [])).toBeNull();
  });
});
