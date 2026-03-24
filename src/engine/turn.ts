import { GameState, GameEvent, TurnRecord } from './types';
import { applyEffect, processScheduledEffects, applyCascadingEffects, checkGameOver, calculateScore } from './effects';
import { selectEvents, generateNarrative } from './events';
import { createRng } from './random';
import { updatePartyApprovals, updateCoalitionLoyalty, runElection, calculateRatings, getCoalitionSeats } from './politics';

export interface TurnResult {
  state: GameState;
  events: GameEvent[];
}

/** Start a new turn: select events to present to the player */
export function startTurn(state: GameState, allEvents: GameEvent[]): TurnResult {
  const rng = createRng(state.seed + state.turn * 7919);
  const events = selectEvents(state, allEvents, rng, 2);
  return { state, events };
}

/** Resolve a turn after player has made choices */
export function resolveTurn(
  state: GameState,
  decisions: { event: GameEvent; choiceIndex: number }[]
): GameState {
  const rng = createRng(state.seed + state.turn * 7919 + 1);
  const indicatorsBefore = { ...state.indicators };

  let newState = { ...state };

  // 1. Apply all choice effects
  for (const { event, choiceIndex } of decisions) {
    const choice = event.choices[choiceIndex];
    for (const effect of choice.effects) {
      newState = applyEffect(newState, effect, `${event.id}:${choice.label}`, rng);
    }
    // Mark one-time events
    if (event.oneTime) {
      newState = {
        ...newState,
        firedOneTimeEvents: new Set([...newState.firedOneTimeEvents, event.id]),
      };
    }
  }

  // 2. Process scheduled effects from previous turns
  newState = processScheduledEffects(newState, rng);

  // 3. Apply cascading second-order effects
  newState = applyCascadingEffects(newState, rng);

  // 4. Generate narrative
  const narrative = generateNarrative(newState, decisions);

  // 5. Record history
  const record: TurnRecord = {
    turn: newState.turn,
    year: newState.year,
    quarter: newState.quarter,
    events: decisions,
    indicatorsBefore,
    indicatorsAfter: { ...newState.indicators },
    narrative,
  };

  // 6. Advance time
  let nextQuarter = newState.quarter + 1;
  let nextYear = newState.year;
  if (nextQuarter > 4) {
    nextQuarter = 1;
    nextYear++;
  }

  newState = {
    ...newState,
    turn: newState.turn + 1,
    year: nextYear,
    quarter: nextQuarter,
    history: [...newState.history, record],
    score: calculateScore(newState),
  };

  // 7. Update parliament (approvals, loyalty)
  const rng2 = createRng(state.seed + newState.turn * 7919 + 2);
  newState.parliament = updatePartyApprovals(newState.parliament, newState.indicators, rng2);
  newState.parliament = updateCoalitionLoyalty(newState.parliament, newState.indicators, rng2);

  // 8. Check for election
  if (newState.turn >= newState.parliament.nextElectionTurn) {
    const elRng = createRng(state.seed + newState.turn * 13337);
    const { parliament: newParl, result } = runElection(newState.parliament, newState.indicators, newState.turn, newState.year, elRng);
    newState.parliament = newParl;
    newState.electionPending = true;
    newState.lastElectionResult = result;
    if (!result.won) {
      newState.gameOver = true;
      newState.gameOverReason = `Election defeat! Your coalition won only ${getCoalitionSeats(newParl)} seats — not enough to govern. The opposition forms a new government. Your time as leader is over.`;
    }
  }

  // 9. Update international ratings
  newState.ratings = calculateRatings(newState.indicators);

  // 10. Check game over
  newState = checkGameOver(newState);

  return newState;
}
