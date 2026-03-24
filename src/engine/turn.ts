import { GameState, GameEvent, TurnRecord } from './types';
import { applyEffect, processScheduledEffects, applyCascadingEffects, checkGameOver, calculateScore } from './effects';
import { selectEvents, generateNarrative } from './events';
import { createRng } from './random';
import { updatePartyApprovals, updateCoalitionLoyalty, runElection, calculateRatings, getCoalitionSeats, getCoalitionLoyalty, applyCoalitionReactions, checkCoalitionCollapse } from './politics';

export interface TurnResult {
  state: GameState;
  events: GameEvent[];
}

/** Start a new turn: select events to present to the player */
export function startTurn(state: GameState, allEvents: GameEvent[]): TurnResult {
  const rng = createRng(state.seed + state.turn * 7919);
  // Inject virtual coalition loyalty indicator so events can use it as a precondition
  const stateWithVirtuals: GameState = {
    ...state,
    indicators: {
      ...state.indicators,
      _coalitionLoyalty: getCoalitionLoyalty(state.parliament),
    },
  };
  const events = selectEvents(stateWithVirtuals, allEvents, rng, 2);
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

  // 1b. Coalition partners immediately react to how player choices affect their priorities
  const allChoiceEffects = decisions.flatMap(({ event, choiceIndex }) => event.choices[choiceIndex].effects);
  newState = {
    ...newState,
    parliament: applyCoalitionReactions(newState.parliament, allChoiceEffects, rng),
  };

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

  // 7b. Check for coalition collapse
  const collapseRng = createRng(state.seed + newState.turn * 7919 + 3);
  const { parliament: postCollapseParl, collapsed, message } = checkCoalitionCollapse(newState.parliament, collapseRng);
  if (collapsed) {
    newState = { ...newState, parliament: postCollapseParl, coalitionCollapseMessage: message };
    // If no majority coalition formed, trigger an early election
    if (getCoalitionSeats(postCollapseParl) < 51) {
      const earlyElRng = createRng(state.seed + newState.turn * 13337 + 1);
      const { parliament: earlyParl, result: earlyResult } = runElection(postCollapseParl, newState.indicators, newState.turn, newState.year, earlyElRng);
      newState = { ...newState, parliament: earlyParl };
      if (!earlyResult.won) {
        newState.gameOver = true;
        newState.gameOverReason = `Coalition collapsed and the emergency election was lost. Your bloc secured only ${getCoalitionSeats(earlyParl)} seats — not enough to govern. A new government takes over.`;
      } else {
        newState.coalitionCollapseMessage = `Coalition collapsed! Emergency election called. New coalition secured ${getCoalitionSeats(earlyParl)} seats — you remain in power.`;
      }
    }
  } else {
    newState = { ...newState, coalitionCollapseMessage: undefined };
  }

  // 8. Check for election
  if (newState.turn >= newState.parliament.nextElectionTurn) {
    const elRng = createRng(state.seed + newState.turn * 13337);
    const { parliament: newParl, result } = runElection(newState.parliament, newState.indicators, newState.turn, newState.year, elRng);
    newState.parliament = newParl;
    newState.electionPending = true;
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
