import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/engine/state';
import { startTurn, resolveTurn, turnsUntilElection, getCampaignSeason } from '../src/engine/turn';
import { ALL_EVENTS } from '../src/data';
import { INDICATORS } from '../src/engine/indicators';
import { enactDecree } from '../src/engine/decrees';
import type { GameState } from '../src/engine/types';

/**
 * Integration tests for the critical path: a full game loop driven only by
 * the public engine API (createInitialState → startTurn → resolveTurn).
 */

/** Play `turns` quarters, always picking choice `pick(turn)`. */
function playGame(seed: number, turns: number, pick: (turn: number) => number = () => 0): GameState {
  let state = createInitialState(seed);
  for (let i = 0; i < turns && !state.gameOver; i++) {
    const result = startTurn(state, ALL_EVENTS);
    const decisions = result.events.map(event => ({
      event,
      choiceIndex: pick(result.state.turn) % event.choices.length,
    }));
    state = resolveTurn(result.state, decisions);
  }
  return state;
}

function expectIndicatorsInBounds(state: GameState) {
  for (const meta of INDICATORS) {
    const value = state.indicators[meta.key];
    expect(Number.isFinite(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(meta.min);
    expect(value).toBeLessThanOrEqual(meta.max);
  }
}

describe('game loop — startTurn', () => {
  it('presents at least one event with valid choices', () => {
    const state = createInitialState(42);
    const { events } = startTurn(state, ALL_EVENTS);
    expect(events.length).toBeGreaterThan(0);
    for (const event of events) {
      expect(event.choices.length).toBeGreaterThan(0);
      for (const choice of event.choices) {
        expect(choice.label).toBeTruthy();
        expect(Array.isArray(choice.effects)).toBe(true);
      }
    }
  });

  it('is deterministic for the same seed and turn', () => {
    const a = startTurn(createInitialState(7), ALL_EVENTS);
    const b = startTurn(createInitialState(7), ALL_EVENTS);
    expect(a.events.map(e => e.id)).toEqual(b.events.map(e => e.id));
  });

  it('does not mutate the input state', () => {
    const state = createInitialState(11);
    const before = { ...state.indicators };
    startTurn(state, ALL_EVENTS);
    expect(state.indicators).toEqual(before);
    expect(state.turn).toBe(0);
  });
});

describe('game loop — resolveTurn', () => {
  it('advances the calendar by one quarter and records history', () => {
    const state = createInitialState(42);
    const { state: started, events } = startTurn(state, ALL_EVENTS);
    const next = resolveTurn(started, events.map(event => ({ event, choiceIndex: 0 })));

    expect(next.turn).toBe(state.turn + 1);
    expect(next.history).toHaveLength(1);
    expect(next.history[0].turn).toBe(state.turn);
    expect(next.history[0].narrative).toBeTruthy();

    const expectedQuarter = state.quarter === 4 ? 1 : state.quarter + 1;
    const expectedYear = state.quarter === 4 ? state.year + 1 : state.year;
    expect(next.quarter).toBe(expectedQuarter);
    expect(next.year).toBe(expectedYear);
  });

  it('does not mutate the previous state', () => {
    const state = createInitialState(42);
    const { state: started, events } = startTurn(state, ALL_EVENTS);
    const indicatorsBefore = { ...started.indicators };
    const historyLengthBefore = started.history.length;
    resolveTurn(started, events.map(event => ({ event, choiceIndex: 0 })));
    expect(started.indicators).toEqual(indicatorsBefore);
    expect(started.history).toHaveLength(historyLengthBefore);
  });

  it('records one-time events so they cannot fire twice', () => {
    const state = createInitialState(42);
    const oneTime = ALL_EVENTS.find(e => e.oneTime)!;
    const next = resolveTurn(state, [{ event: oneTime, choiceIndex: 0 }]);
    expect(next.firedOneTimeEvents.has(oneTime.id)).toBe(true);

    const later = startTurn({ ...next, turn: next.turn }, ALL_EVENTS);
    expect(later.events.some(e => e.id === oneTime.id)).toBe(false);
  });

  it('applies active decree effects each quarter', () => {
    const base = createInitialState(42);
    const { state: withDecree } = enactDecree(
      { ...base, constitution: { ...base.constitution, politicalCapital: 40 } },
      'cyber_hardening'
    );
    expect(withDecree.decrees.active).toContain('cyber_hardening');

    const resolved = resolveTurn(withDecree, []);
    const plain = resolveTurn({ ...base, constitution: { ...base.constitution, politicalCapital: 40 } }, []);
    expect(resolved.indicators.cyberDefense).toBeGreaterThan(plain.indicators.cyberDefense);
  });

  it('accrues political capital each quarter (capped at 40)', () => {
    const state = createInitialState(42);
    const next = resolveTurn(state, []);
    expect(next.constitution.politicalCapital).toBeGreaterThan(state.constitution.politicalCapital);

    const capped = resolveTurn({ ...state, constitution: { ...state.constitution, politicalCapital: 40 } }, []);
    expect(capped.constitution.politicalCapital).toBe(40);
  });
});

describe('game loop — full playthrough', () => {
  it('keeps every indicator within its metadata bounds', () => {
    const state = playGame(1234, 20);
    expectIndicatorsInBounds(state);
  });

  it('keeps indicators in bounds when always picking the last choice', () => {
    const state = playGame(99, 20, () => Number.MAX_SAFE_INTEGER - 1);
    expectIndicatorsInBounds(state);
  });

  it('is fully deterministic for the same seed and choices', () => {
    const a = playGame(2024, 12, turn => turn % 2);
    const b = playGame(2024, 12, turn => turn % 2);
    expect(a.turn).toBe(b.turn);
    expect(a.indicators).toEqual(b.indicators);
    expect(a.score).toBe(b.score);
    expect(a.history.map(h => h.narrative)).toEqual(b.history.map(h => h.narrative));
  });

  it('produces different outcomes for different seeds', () => {
    const a = playGame(1, 12);
    const b = playGame(2, 12);
    expect(a.indicators).not.toEqual(b.indicators);
  });

  it('records one history entry per resolved turn', () => {
    const state = playGame(555, 8);
    expect(state.history).toHaveLength(state.turn);
    state.history.forEach((record, i) => {
      expect(record.turn).toBe(i);
      expect(record.indicatorsBefore).toBeDefined();
      expect(record.indicatorsAfter).toBeDefined();
    });
  });

  it('holds an election on the scheduled turn', () => {
    let state = createInitialState(4242);
    const electionTurn = state.parliament.nextElectionTurn;
    for (let i = 0; i < electionTurn && !state.gameOver; i++) {
      const { state: started, events } = startTurn(state, ALL_EVENTS);
      state = resolveTurn(started, events.map(event => ({ event, choiceIndex: 0 })));
    }
    expect(state.turn).toBe(electionTurn);
    expect(state.electionPending).toBe(true);
    expect(state.lastElectionResult).toBeDefined();
    if (!state.lastElectionResult!.won) {
      expect(state.gameOver).toBe(true);
      expect(state.gameOverReason).toBeTruthy();
    }
  });

  it('always sets a reason when the game ends', () => {
    const state = playGame(31337, 40);
    if (state.gameOver) {
      expect(state.gameOverReason).toBeTruthy();
    }
  });
});

describe('game loop — campaign season', () => {
  it('counts down to the next election', () => {
    const state = createInitialState(42);
    expect(turnsUntilElection(state)).toBe(state.parliament.nextElectionTurn);
    expect(turnsUntilElection({ ...state, turn: state.parliament.nextElectionTurn + 5 })).toBe(0);
  });

  it('escalates through campaign phases as the election nears', () => {
    const state = createInitialState(42);
    const election = state.parliament.nextElectionTurn;
    expect(getCampaignSeason({ ...state, turn: election - 6 })).toBe(0);
    expect(getCampaignSeason({ ...state, turn: election - 3 })).toBe(1);
    expect(getCampaignSeason({ ...state, turn: election - 1 })).toBe(2);
  });
});
