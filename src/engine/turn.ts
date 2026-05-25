import { GameState, GameEvent, TurnRecord } from './types';
import { applyEffect, processScheduledEffects, applyCascadingEffects, checkGameOver, calculateScore } from './effects';
import { selectEvents, generateNarrative } from './events';
import { createRng } from './random';
import { updatePartyApprovals, updateCoalitionLoyalty, runElection, calculateRatings, getCoalitionSeats, getCoalitionLoyalty, checkCoalitionStability } from './politics';
import { scheduleEcho, dueEchoes } from './echoes';
import { generateHeadlines } from './newsfeed';
import { applyFactionReactions, driftFactionApproval } from './factions';
import { evaluatePromises } from './manifesto';
import { checkArcTriggers, nextArcEvent, ARCS } from './arcs';
import { rollSuperpowerDemands, expireDemands } from './superpowers';
import { applyDecreeEffects } from './decrees';
import { INDICATORS } from './indicators';
import { clamp } from './random';

export interface TurnResult {
  state: GameState;
  events: GameEvent[];
}

/** How many quarters until next election (0 = election turn) */
export function turnsUntilElection(state: GameState): number {
  return Math.max(0, state.parliament.nextElectionTurn - state.turn);
}

/** Campaign season: 1 = early campaign (3Q before), 2 = late campaign (1Q before), 0 = not campaign */
export function getCampaignSeason(state: GameState): number {
  const remaining = turnsUntilElection(state);
  if (remaining <= 1) return 2; // intense final stretch
  if (remaining <= 3) return 1; // early campaign
  return 0;
}

/** Start a new turn: select events to present to the player */
export function startTurn(state: GameState, allEvents: GameEvent[]): TurnResult {
  const rng = createRng(state.seed + state.turn * 7919);

  // Inject virtual indicators for event preconditions
  const campaign = getCampaignSeason(state);
  const loyalty = getCoalitionLoyalty(state.parliament);
  const coalitionStability = loyalty < 30 ? 0 : loyalty < 50 ? 1 : 2;
  const virtualIndicators = {
    ...state.indicators,
    ...(campaign > 0 ? { campaignSeason: campaign } : {}),
    coalitionStability,
  };
  const stateWithVirtuals = { ...state, indicators: virtualIndicators };

  // 1. Trigger any newly-eligible arcs (read-only — no state mutation)
  const completed = state.completedArcs ?? new Set();
  const activeArcs = checkArcTriggers(state.activeArcs ?? [], completed, state, state.turn);

  // 2. Pull arc-stage events that are due for any active arc
  const arcEvents: GameEvent[] = [];
  for (const a of activeArcs) {
    const { event } = nextArcEvent(a, state.turn, state);
    if (event) arcEvents.push(event);
  }

  // 3. Static event pool — pull at most (2 - arc count) so we don't flood
  const remainingSlots = Math.max(1, 2 - arcEvents.length);
  const events = selectEvents(stateWithVirtuals, allEvents, rng, remainingSlots);

  // Persist new arc triggers; stage advances happen in resolveTurn.
  return { state: { ...state, activeArcs }, events: [...arcEvents, ...events] };
}

/** Resolve a turn after player has made choices */
export function resolveTurn(
  state: GameState,
  decisions: { event: GameEvent; choiceIndex: number }[]
): GameState {
  const rng = createRng(state.seed + state.turn * 7919 + 1);
  const indicatorsBefore = { ...state.indicators };

  let newState: GameState = { ...state, coalitionCrises: undefined };

  // 1. Apply all choice effects + schedule echoes + faction reactions
  const newEchoes = [];
  let factionApproval = { ...(newState.factionApproval ?? {}) };
  for (const { event, choiceIndex } of decisions) {
    const choice = event.choices[choiceIndex];
    for (const effect of choice.effects) {
      newState = applyEffect(newState, effect, `${event.id}:${choice.label}`, rng);
    }
    if (choice.factionReactions) {
      factionApproval = applyFactionReactions(factionApproval as never, choice.factionReactions, rng) as never;
    }
    if (choice.hasEcho) {
      const echo = scheduleEcho(event, choice, newState.turn, newState.year, newState.quarter, rng);
      if (echo) newEchoes.push(echo);
    }
    // Mark one-time events
    if (event.oneTime) {
      newState = {
        ...newState,
        firedOneTimeEvents: new Set([...newState.firedOneTimeEvents, event.id]),
      };
    }
  }
  newState = {
    ...newState,
    pendingEchoes: [...(newState.pendingEchoes ?? []), ...newEchoes],
    factionApproval,
  };

  // 1b. Advance any arc stages that were resolved this turn (by id pattern)
  const completedArcs = new Set(newState.completedArcs ?? []);
  const activeArcs = (newState.activeArcs ?? []).map(a => {
    const arcDef = ARCS.find(x => x.id === a.arcId);
    if (!arcDef) return a;
    const matched = decisions.find(d => d.event.id.startsWith(`arc_${a.arcId}_`));
    if (matched) {
      const newStage = a.stage + 1;
      if (newStage >= arcDef.stages.length) {
        completedArcs.add(a.arcId);
      }
      return { ...a, stage: newStage };
    }
    return a;
  }).filter(a => !completedArcs.has(a.arcId));
  newState = { ...newState, activeArcs, completedArcs };

  // 2. Process scheduled effects from previous turns
  newState = processScheduledEffects(newState, rng);

  // 3. Apply cascading second-order effects
  newState = applyCascadingEffects(newState, rng);

  // 3a. Apply per-quarter decree effects + clamp
  if (newState.decrees && newState.decrees.active.length > 0) {
    const after = applyDecreeEffects(newState.decrees, newState.indicators);
    // Clamp to indicator metadata bounds
    const clamped: Record<string, number> = {};
    for (const k of Object.keys(after)) {
      const meta = INDICATORS.find(i => i.key === k);
      const min = meta?.min ?? 0;
      const max = meta?.max ?? 100;
      clamped[k] = clamp(after[k], min, max);
    }
    newState = { ...newState, indicators: clamped };
  }

  // 3a. Passive faction drift based on indicator priorities + cynicism
  newState = {
    ...newState,
    factionApproval: driftFactionApproval(newState.factionApproval as never, newState.indicators, rng, newState.cynicism ?? 0) as never,
  };

  // 3b. Fire any echoes due this turn
  const { fired, remaining } = dueEchoes(newState.pendingEchoes ?? [], newState.turn);
  newState = { ...newState, pendingEchoes: remaining };

  // 4. Generate narrative + headlines
  const narrative = generateNarrative(newState, decisions);
  const headlines = generateHeadlines(newState, decisions, indicatorsBefore, rng);

  // 5. Record history
  const record: TurnRecord = {
    turn: newState.turn,
    year: newState.year,
    quarter: newState.quarter,
    events: decisions,
    indicatorsBefore,
    indicatorsAfter: { ...newState.indicators },
    narrative,
    echoes: fired.map(e => e.narrative),
    headlines,
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

  // 7b. Check coalition stability — partners may leave if loyalty is too low
  const rng3 = createRng(state.seed + newState.turn * 7919 + 3);
  const { parliament: stableParl, crises } = checkCoalitionStability(newState.parliament, rng3);
  newState.parliament = stableParl;
  if (crises.length > 0) {
    newState.coalitionCrises = crises;
    // Coalition collapse that can't be recovered = game over
    const collapse = crises.find(c => c.type === 'coalition_collapsed');
    if (collapse) {
      newState.gameOver = true;
      newState.gameOverReason = `Coalition collapsed! ${collapse.reason} Without a parliamentary majority, you can no longer govern.`;
    }
  }

  // 8. Check for election
  if (newState.turn >= newState.parliament.nextElectionTurn) {
    const elRng = createRng(state.seed + newState.turn * 13337);
    const { parliament: newParl, result } = runElection(newState.parliament, newState.indicators, newState.turn, newState.year, elRng);
    newState.parliament = newParl;
    newState.electionPending = true;
    newState.lastElectionResult = result;
    // Evaluate manifesto promises for the just-ended term
    const currentTermIndex = newParl.electionHistory.length - 1;
    const { cynicismDelta, resolved } = evaluatePromises(newState.promises ?? [], newState, currentTermIndex);
    newState.promises = resolved;
    newState.cynicism = Math.max(0, (newState.cynicism ?? 0) + cynicismDelta);
    if (!result.won) {
      newState.gameOver = true;
      newState.gameOverReason = `Election defeat! Your coalition won only ${getCoalitionSeats(newParl)} seats — not enough to govern. The opposition forms a new government. Your time as leader is over.`;
    }
  }

  // 9. Update international ratings
  newState.ratings = calculateRatings(newState.indicators);

  // 9b. Accrue Political Capital each quarter (bonus from reform position).
  const civilBonus = (newState.constitution?.positions.civil ?? 0) > 0 ? 1 : 0;
  newState.constitution = newState.constitution
    ? { ...newState.constitution, politicalCapital: Math.min(40, newState.constitution.politicalCapital + 1 + civilBonus) }
    : newState.constitution;

  // 9c. Roll & expire superpower demands
  const spRng = createRng(state.seed + newState.turn * 24317);
  let spState = newState.superpowers ?? { standing: { eu: 50, ru: 12, us: 50 }, active: [], resolved: [] };
  const { state: expiredState } = expireDemands(spState, newState.turn);
  spState = expiredState;
  spState = rollSuperpowerDemands(spState, newState.turn, spRng, newState.indicators.russiaRelations);
  newState.superpowers = spState;

  // 10. Check game over
  newState = checkGameOver(newState);

  return newState;
}
