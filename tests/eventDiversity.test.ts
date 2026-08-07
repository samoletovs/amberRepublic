import { describe, expect, it } from 'vitest';
import { extraEvents } from '../src/data/extra-events';
import { selectEvents } from '../src/engine/events';
import { createRng } from '../src/engine/random';
import { createInitialState } from '../src/engine/state';

describe('event diversity additions', () => {
  it('includes the new economic-crisis and demographic events', () => {
    const ids = new Set(extraEvents.map(event => event.id));
    expect(ids.has('energy_price_shock')).toBe(true);
    expect(ids.has('demographic_winter')).toBe(true);
    expect(ids.has('diaspora_return_program')).toBe(true);
  });

  it('selects demographic_winter only when its precondition is met', () => {
    const event = extraEvents.find(item => item.id === 'demographic_winter');
    expect(event).toBeDefined();

    const eligibleState = createInitialState(11);
    const ineligibleState = {
      ...eligibleState,
      indicators: {
        ...eligibleState.indicators,
        birthRate: 40,
      },
    };

    const eligiblePick = selectEvents(eligibleState, [event!], createRng(1), 1);
    const ineligiblePick = selectEvents(ineligibleState, [event!], createRng(1), 1);

    expect(eligiblePick).toHaveLength(1);
    expect(eligiblePick[0].id).toBe('demographic_winter');
    expect(ineligiblePick).toHaveLength(0);
  });
});
