import type { Parliament, InternationalRatings, ElectionResult } from './politics';

// ─── Core Game Types ─────────────────────────────────────────────
export interface GameState {
  turn: number;
  year: number;
  quarter: number;
  indicators: Record<string, number>;
  scheduledEffects: ScheduledEffect[];
  history: TurnRecord[];
  gameOver: boolean;
  gameOverReason?: string;
  score: number;
  seed: number;
  firedOneTimeEvents: Set<string>;
  parliament: Parliament;
  ratings: InternationalRatings;
  electionPending?: boolean;
  lastElectionResult?: ElectionResult;
}

export interface ScheduledEffect {
  indicator: string;
  delta: number;
  turnsRemaining: number;
  duration: number;
  source: string;
  condition?: Condition;
}

export interface Condition {
  indicator: string;
  op: '<' | '>' | '<=' | '>=' | '==' | '!=';
  value: number;
}

export interface Effect {
  indicator: string;
  delta: number;
  delay: number;
  duration: number;
  condition?: Condition;
}

export interface Choice {
  label: string;
  description: string;
  effects: Effect[];
  humor?: string;
}

export type EventCategory = 'economy' | 'security' | 'society' | 'diplomacy' | 'science' | 'crisis' | 'environment' | 'culture';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  preconditions: Condition[];
  choices: Choice[];
  category: EventCategory;
  weight: number;
  oneTime: boolean;
  flavor?: string;
}

export interface TurnRecord {
  turn: number;
  year: number;
  quarter: number;
  events: { event: GameEvent; choiceIndex: number }[];
  indicatorsBefore: Record<string, number>;
  indicatorsAfter: Record<string, number>;
  narrative: string;
}

export interface IndicatorMeta {
  key: string;
  name: string;
  description: string;
  emoji: string;
  category: 'economy' | 'demographics' | 'society' | 'security' | 'innovation';
  format: 'percent' | 'number' | 'billions' | 'millions' | 'index';
  min: number;
  max: number;
  goodDirection: 'up' | 'down' | 'neutral';
}
