/**
 * Interactive tutorial — pure step definitions plus localStorage persistence.
 * The engine knows nothing about React; the UI drives it via the helpers below.
 */

export interface TutorialStep {
  id: string;
  title: string;
  body: string;
  /** Optional `data-tutorial` value of the element this step points at. */
  anchor?: string;
}

const STORAGE_KEY = 'amberRepublic_tutorialDone';

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Cabinet Room',
    body: 'You are Premier of Latvia. Each quarter you face crises, choose a response, and live with the consequences. This walkthrough takes about a minute.',
  },
  {
    id: 'indicators',
    title: 'State of the Republic',
    body: 'These indicators — population, GDP, healthcare, trust — are the whole game. Every choice nudges them up or down, and nothing improves for free.',
    anchor: 'indicators',
  },
  {
    id: 'coalition',
    title: 'Your Coalition',
    body: 'You govern only while your coalition holds a majority. Anger your partners and seats drain away; lose the majority and your government falls.',
    anchor: 'coalition',
  },
  {
    id: 'factions',
    title: 'Factions Are Watching',
    body: 'Business, pensioners, farmers, the Russian-speaking minority and others react to every decision. Hover a choice to preview who cheers and who rages.',
    anchor: 'factions',
  },
  {
    id: 'events',
    title: 'Decisions and Trade-offs',
    body: 'There is no free option. Each choice lists its effects — some arrive immediately, others are delayed and echo back quarters later.',
    anchor: 'events',
  },
  {
    id: 'endturn',
    title: 'End the Quarter',
    body: 'Once every decision is made, end the quarter to resolve effects, read the headlines, and face the next set of crises. Elections come every four years.',
    anchor: 'endturn',
  },
];

/** Clamp an index into the valid step range. */
export function clampStep(index: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(TUTORIAL_STEPS.length - 1, Math.floor(index)));
}

/** Step at the given index, clamped. */
export function stepAt(index: number): TutorialStep {
  return TUTORIAL_STEPS[clampStep(index)];
}

export function isLastStep(index: number): boolean {
  return clampStep(index) === TUTORIAL_STEPS.length - 1;
}

/** Has the player already finished (or skipped) the tutorial? */
export function isTutorialCompleted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markTutorialCompleted(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Storage unavailable (private mode) — tutorial simply shows again.
  }
}

export function resetTutorial(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
