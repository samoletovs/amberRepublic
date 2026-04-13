import type { GameEvent, GameState } from './types';
import { checkCondition } from './effects';
import { createRng } from './random';

const STORAGE_KEY = 'amberRepublic_savedAiEvents';
const MAX_SAVED = 200;

function isGameEvent(value: unknown): value is GameEvent {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GameEvent>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    Array.isArray(candidate.choices) &&
    typeof candidate.category === 'string' &&
    typeof candidate.weight === 'number' &&
    typeof candidate.oneTime === 'boolean' &&
    Array.isArray(candidate.preconditions)
  );
}

/** Load saved AI events from localStorage */
export function loadSavedEvents(): GameEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isGameEvent);
  } catch {
    return [];
  }
}

/** Save an AI event to the localStorage library */
export function saveAiEvent(event: GameEvent): void {
  const events = loadSavedEvents();

  // Skip if already saved (by id)
  if (events.some(e => e.id === event.id)) return;

  // Strip the _model field (runtime metadata, not needed for replay)
  const { ...clean } = event;
  if ('_model' in clean) {
    delete (clean as unknown as Record<string, unknown>)['_model'];
  }

  events.push(clean);

  // Cap at MAX_SAVED — drop oldest when full
  while (events.length > MAX_SAVED) events.shift();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Ignore storage write failures so gameplay can continue.
  }
}

/**
 * Pick a saved AI event that is eligible for the current state
 * and hasn't been shown recently.
 */
export function pickSavedEvent(
  state: GameState,
  recentTitles: string[],
): GameEvent | null {
  const saved = loadSavedEvents();
  if (saved.length === 0) return null;

  const recentSet = new Set(recentTitles.map(t => t.toLowerCase()));

  const eligible = saved.filter(event => {
    // Skip recently shown
    if (recentSet.has(event.title.toLowerCase())) return false;
    // Skip one-time events already fired
    if (event.oneTime && state.firedOneTimeEvents.has(event.id)) return false;
    // Check preconditions
    return event.preconditions.every(cond => checkCondition(state, cond));
  });

  if (eligible.length === 0) return null;

  // Pick deterministically from game seed + turn for reproducible playthroughs.
  const rng = createRng(state.seed + state.turn * 104729 + eligible.length);
  return eligible[rng.int(0, eligible.length - 1)];
}

/** Get count of saved events */
export function getSavedEventCount(): number {
  return loadSavedEvents().length;
}
