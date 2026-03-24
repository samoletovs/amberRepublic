import type { GameState, GameEvent, Effect } from './types';

const API_BASE = '/api';

export interface AIModel {
  id: string;
  label: string;
  provider: string;
}

export interface AIEvaluation {
  label: string;
  description: string;
  effects: Effect[];
  humor?: string;
  narrative?: string;
  _model?: string;
}

export async function getAvailableModels(): Promise<{ models: AIModel[]; available: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) return { models: [], available: false };
    return await res.json();
  } catch {
    return { models: [], available: false };
  }
}

export async function generateAIEvent(
  state: GameState,
  modelId?: string,
): Promise<(GameEvent & { _model?: string }) | null> {
  try {
    const recentTitles = state.history
      .slice(-5)
      .flatMap(h => h.events.map(e => e.event.title));

    const res = await fetch(`${API_BASE}/generate-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        indicators: state.indicators,
        turn: state.turn,
        year: state.year,
        quarter: state.quarter,
        recentEventTitles: recentTitles,
        model: modelId,
      }),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function evaluateCustomChoice(
  eventTitle: string,
  eventDescription: string,
  customResponse: string,
  indicators: Record<string, number>,
  modelId?: string,
): Promise<AIEvaluation | null> {
  try {
    const res = await fetch(`${API_BASE}/evaluate-choice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventTitle,
        eventDescription,
        customResponse,
        indicators,
        model: modelId,
      }),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
