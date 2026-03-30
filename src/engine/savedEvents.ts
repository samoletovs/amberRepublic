import type { GameEvent, GameState } from './types';
import { checkCondition } from './effects';

const STORAGE_KEY = 'amberRepublic_savedAiEvents';
const MAX_SAVED = 200;

/** Load saved AI events from localStorage */
export function loadSavedEvents(): GameEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GameEvent[];
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
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

  // Pick a random one (use Math.random — saved events don't need seeded RNG)
  return eligible[Math.floor(Math.random() * eligible.length)];
}

/** Get count of saved events */
export function getSavedEventCount(): number {
  return loadSavedEvents().length;
}
