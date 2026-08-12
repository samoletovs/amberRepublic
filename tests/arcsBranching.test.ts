import { describe, expect, it } from 'vitest';
import { nextArcEvent } from '../src/engine/arcs';
import { createInitialState } from '../src/engine/state';
import { resolveTurn } from '../src/engine/turn';

describe('arc branching scenarios', () => {
  it('selects branch-specific stage 2 event based on earlier arc branch', () => {
    const state = createInitialState(42);
    const renewable = nextArcEvent({ arcId: 'energyPivot', stage: 1, turnStarted: 0, branch: 'renewables' }, 4, state);
    const lng = nextArcEvent({ arcId: 'energyPivot', stage: 1, turnStarted: 0, branch: 'lng' }, 4, state);

    expect(renewable.event?.id).toBe('arc_energyPivot_2_renewables');
    expect(lng.event?.id).toBe('arc_energyPivot_2_lng');
  });

  it('records branch choice and keeps immediate + delayed consequences', () => {
    const initialState = createInitialState(7);
    const state = {
      ...initialState,
      turn: 0,
      activeArcs: [{ arcId: 'energyPivot', stage: 0, turnStarted: 0 }],
    };

    const stage1 = nextArcEvent(state.activeArcs[0], state.turn, state).event;
    expect(stage1).toBeTruthy();
    const renewablesChoiceIndex = stage1!.choices.findIndex(choice => choice.branch === 'renewables');
    expect(renewablesChoiceIndex).toBeGreaterThanOrEqual(0);

    const beforeDebt = state.indicators.publicDebt;
    const nextState = resolveTurn(state, [{ event: stage1!, choiceIndex: renewablesChoiceIndex }]);

    expect(nextState.activeArcs[0]?.branch).toBe('renewables');
    expect(nextState.activeArcs[0]?.stage).toBe(1);
    expect(nextState.indicators.publicDebt).toBeGreaterThan(beforeDebt);
    expect(nextState.scheduledEffects.some(effect => effect.source.includes('arc_energyPivot_1') && effect.indicator === 'energyIndependence' && effect.turnsRemaining === 3)).toBe(true);
  });
});
