import { INDICATORS } from './indicators';

/**
 * Reigns-style qualitative magnitude labels.
 * Numbers stay in the engine — players only see direction + size word.
 *
 * Magnitude is computed relative to the indicator's full range so a +3 GDP
 * (range 15-120, ~3% of range) is "Notable", while +3 to a 0-100 index
 * (3% of range) is also "Notable". This keeps the language calibrated.
 */
export type Magnitude = 'Slight' | 'Notable' | 'Major' | 'Severe';

export function magnitudeOf(indicatorKey: string, delta: number): Magnitude {
  const abs = Math.abs(delta);
  const meta = INDICATORS.find(i => i.key === indicatorKey);
  const range = meta ? meta.max - meta.min : 100;
  const pct = (abs / range) * 100;
  if (pct < 1.2) return 'Slight';
  if (pct < 5) return 'Notable';
  if (pct < 12) return 'Major';
  return 'Severe';
}

/** Short qualitative delay label — "Now", "Soon", "Later", "Long-term". */
export type DelayLabel = 'Now' | 'Soon' | 'Later' | 'Long-term';

export function delayLabelOf(delayTurns: number): DelayLabel {
  if (delayTurns <= 0) return 'Now';
  if (delayTurns <= 2) return 'Soon';
  if (delayTurns <= 5) return 'Later';
  return 'Long-term';
}

/**
 * Colour tier for a magnitude — used by the UI to scale visual weight.
 * Slight = whisper, Severe = shout.
 */
export function magnitudeWeight(m: Magnitude): number {
  switch (m) {
    case 'Slight': return 1;
    case 'Notable': return 2;
    case 'Major': return 3;
    case 'Severe': return 4;
  }
}
