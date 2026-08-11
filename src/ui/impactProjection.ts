import type { Effect, IndicatorMeta } from '../engine/types';
import { getIndicatorMeta } from '../engine/indicators';

export type ImpactTone = 'helpful' | 'harmful' | 'neutral';

export interface ImpactProjection {
  currentValue: number;
  projectedValue: number;
  currentPct: number;
  projectedPct: number;
  barStartPct: number;
  barWidthPct: number;
  isClamped: boolean;
}

export interface ImpactSummary {
  helpful: number;
  harmful: number;
  neutral: number;
  immediate: number;
  delayed: number;
  temporary: number;
}

export function toneForEffect(meta: IndicatorMeta, delta: number): ImpactTone {
  if (delta === 0 || meta.goodDirection === 'neutral') return 'neutral';
  const isHelpful = (meta.goodDirection === 'up' && delta > 0) || (meta.goodDirection === 'down' && delta < 0);
  return isHelpful ? 'helpful' : 'harmful';
}

export function formatIndicatorValue(meta: IndicatorMeta, value: number): string {
  switch (meta.format) {
    case 'billions':
      // Match the top-bar GDP precision already used in GameScreen.
      return `€${value.toFixed(1)}B`;
    case 'millions':
      // Population is displayed at two decimals elsewhere to preserve small shifts.
      return `${value.toFixed(2)}M`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'index':
    case 'number':
      return `${Math.round(value)}`;
    default:
      return `${Math.round(value)}`;
  }
}

export function projectEffect(effect: Effect, currentIndicators?: Record<string, number>): ImpactProjection | null {
  const meta = getIndicatorMeta(effect.indicator);
  const currentValue = currentIndicators?.[effect.indicator];
  if (!meta || currentValue === undefined) return null;

  const range = meta.max - meta.min;
  if (range <= 0) return null;

  const unclampedProjected = currentValue + effect.delta;
  const projectedValue = Math.max(meta.min, Math.min(meta.max, unclampedProjected));
  const currentPct = Math.max(0, Math.min(100, ((currentValue - meta.min) / range) * 100));
  const projectedPct = Math.max(0, Math.min(100, ((projectedValue - meta.min) / range) * 100));

  return {
    currentValue,
    projectedValue,
    currentPct,
    projectedPct,
    barStartPct: Math.min(currentPct, projectedPct),
    barWidthPct: effect.delta === 0 ? 0 : Math.max(1, Math.abs(projectedPct - currentPct)),
    isClamped: projectedValue !== unclampedProjected,
  };
}

export function summarizeEffects(effects: Effect[]): ImpactSummary {
  return effects.reduce<ImpactSummary>(
    (summary, effect) => {
      const meta = getIndicatorMeta(effect.indicator);
      if (meta) {
        summary[toneForEffect(meta, effect.delta)] += 1;
        if (effect.delay > 0) {
          summary.delayed += 1;
        } else {
          summary.immediate += 1;
        }
        if (effect.duration > 0) {
          summary.temporary += 1;
        }
      }
      return summary;
    },
    { helpful: 0, harmful: 0, neutral: 0, immediate: 0, delayed: 0, temporary: 0 }
  );
}
