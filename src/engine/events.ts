import { GameState, GameEvent } from './types';
import { checkCondition } from './effects';
import type { Rng } from './random';

/** Select events for this turn based on preconditions and weights */
export function selectEvents(state: GameState, allEvents: GameEvent[], rng: Rng, count: number = 2): GameEvent[] {
  // Filter eligible events
  const eligible = allEvents.filter(event => {
    if (event.oneTime && state.firedOneTimeEvents.has(event.id)) return false;
    return event.preconditions.every(cond => checkCondition(state, cond));
  });

  if (eligible.length === 0) return [];

  // Weighted random selection without replacement
  const selected: GameEvent[] = [];
  const pool = [...eligible];

  // Ensure category diversity — try to pick from different categories
  const categories = [...new Set(pool.map(e => e.category))];
  rng.shuffle(categories);

  for (const cat of categories) {
    if (selected.length >= count) break;
    const catEvents = pool.filter(e => e.category === cat);
    if (catEvents.length > 0) {
      const picked = weightedPick(catEvents, rng);
      selected.push(picked);
      const idx = pool.indexOf(picked);
      if (idx >= 0) pool.splice(idx, 1);
    }
  }

  // Fill remaining slots if needed
  while (selected.length < count && pool.length > 0) {
    const picked = weightedPick(pool, rng);
    selected.push(picked);
    const idx = pool.indexOf(picked);
    if (idx >= 0) pool.splice(idx, 1);
  }

  return selected;
}

function weightedPick(events: GameEvent[], rng: Rng): GameEvent {
  const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
  let roll = rng.float(0, totalWeight);
  for (const event of events) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return events[events.length - 1];
}

/** Generate a narrative summary for the turn */
export function generateNarrative(state: GameState, events: { event: GameEvent; choiceIndex: number }[]): string {
  const q = ['January-March', 'April-June', 'July-September', 'October-December'][state.quarter - 1];
  const parts: string[] = [`${q} ${state.year}.`];

  for (const { event, choiceIndex } of events) {
    const choice = event.choices[choiceIndex];
    parts.push(`${event.title}: You chose to "${choice.label}". ${choice.humor || ''}`);
  }

  // Add flavor based on state
  const ind = state.indicators;
  if (ind.publicHappiness > 70) parts.push('Citizens are content. Song festivals are well-attended.');
  else if (ind.publicHappiness < 30) parts.push('Grumbling in the streets of Riga grows louder.');
  
  if (ind.emigrationRate > 70) parts.push('Another flight to Dublin departs fully booked.');
  if (ind.population < 1.5) parts.push('Schools in the countryside struggle to fill classrooms.');
  if (ind.techSector > 70) parts.push('Riga\'s startup scene draws international attention.');
  if (ind.russiaRelations < 15) parts.push('The eastern border remains tense.');
  if (ind.greenTransition > 70) parts.push('Wind turbines dot the Kurzeme coastline.');

  return parts.join(' ');
}
