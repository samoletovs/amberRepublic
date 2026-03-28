/**
 * Client-side cache for AI-generated events.
 *
 * AI events are saved to localStorage after each turn so that future turns
 * can reuse them without calling the AI API again, growing the event pool
 * over time and reducing latency.
 */

import type { GameEvent } from './types';

const CACHE_KEY = 'amberRepublic_aiEvents';
const MAX_CACHED_EVENTS = 100;

/** Persist an AI-generated event to the local cache. Ignores duplicates. */
export function saveAIEventToCache(event: GameEvent): void {
  try {
    const cached = loadCachedAIEvents();
    if (cached.some(e => e.id === event.id)) return;
    const updated = [...cached, event].slice(-MAX_CACHED_EVENTS);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may not be available (e.g. private browsing with strict settings)
  }
}

/** Load all cached AI events from localStorage. */
export function loadCachedAIEvents(): GameEvent[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GameEvent[];
  } catch {
    return [];
  }
}

/**
 * Pick a random cached AI event that hasn't been shown recently and hasn't
 * already been fired this game session.
 *
 * Returns `null` if no suitable cached event exists.
 */
export function pickCachedAIEvent(
  recentTitles: string[],
  firedEventIds: Set<string> = new Set(),
): GameEvent | null {
  const cached = loadCachedAIEvents();
  const available = cached.filter(
    e => !recentTitles.includes(e.title) && !firedEventIds.has(e.id),
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
