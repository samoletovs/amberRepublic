import type { Echo, GameEvent, Choice } from './types';
import type { Rng } from './random';
import { getIndicatorMeta } from './indicators';

const QUARTER_SHORT = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

function quarterLabel(year: number, quarter: number): string {
  return `${QUARTER_SHORT[quarter - 1]} ${year}`;
}

const ECHO_OPENERS = [
  'Three quarters on,',
  'It turns out,',
  'A small ministry footnote reveals that',
  'Buried in the latest CSP bulletin:',
  "Now we know what the {{source}} actually meant —",
  'A delayed consequence has surfaced —',
  'The accountants finally finished the math:',
];

const ECHO_FRAMES_POS = [
  'the {{source}} you signed in {{quarter}} has quietly paid off: {{indicator}} is doing better than the briefings predicted.',
  '{{indicator}} climbed faster than the experts forecast after the {{source}} — even Brussels noticed.',
  'someone in {{quarter}} did the maths right: {{indicator}} responded exactly the way the optimists hoped.',
];

const ECHO_FRAMES_NEG = [
  'the {{source}} from {{quarter}} produced an unwelcome surprise — {{indicator}} slid more than anyone forecast.',
  '{{indicator}} did not respond well to the {{source}}. A footnote in this quarter\'s memo: "as predicted by Ministry critics."',
  'a slow-burning side-effect of the {{source}} has landed: {{indicator}} took the hit, three quarters late.',
];

const ECHO_FRAMES_NEUTRAL = [
  'the {{source}} from {{quarter}} has had ambiguous results. {{indicator}} moved — economists disagree on whether that\'s good news.',
  '{{indicator}} drifted in the direction the {{source}} pushed it. The {{quarter}} pundits feel vindicated. Everyone else moved on.',
];

function pickTemplate(frames: string[], rng: Rng): string {
  return rng.pick(frames);
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

/**
 * Generate an Echo for a hasEcho-flagged choice, scheduled 2-4 turns from now.
 * Pure function — caller appends the result to state.pendingEchoes.
 */
export function scheduleEcho(
  event: GameEvent,
  choice: Choice,
  currentTurn: number,
  year: number,
  quarter: number,
  rng: Rng,
): Echo | null {
  const dominantEffect = [...choice.effects]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
  if (!dominantEffect) return null;

  const meta = getIndicatorMeta(dominantEffect.indicator);
  if (!meta) return null;

  const delay = rng.int(2, 4);
  const sourceLabel = event.title.replace(/^[^\s]+\s/, ''); // strip leading emoji
  const opener = fill(rng.pick(ECHO_OPENERS), { source: sourceLabel });

  let frame: string;
  if (meta.goodDirection === 'neutral') {
    frame = pickTemplate(ECHO_FRAMES_NEUTRAL, rng);
  } else {
    const isGood =
      (meta.goodDirection === 'up' && dominantEffect.delta > 0) ||
      (meta.goodDirection === 'down' && dominantEffect.delta < 0);
    frame = pickTemplate(isGood ? ECHO_FRAMES_POS : ECHO_FRAMES_NEG, rng);
  }

  const narrative = `${opener} ${fill(frame, {
    source: sourceLabel,
    quarter: quarterLabel(year, quarter),
    indicator: meta.name,
  })}`;

  // Use choice.echoTemplate if provided (overrides procedural)
  const finalNarrative = choice.echoTemplate
    ? fill(choice.echoTemplate, {
        source: sourceLabel,
        quarter: quarterLabel(year, quarter),
        indicator: meta.name,
      })
    : narrative;

  return {
    id: `echo_${event.id}_${currentTurn}`,
    sourceEventTitle: event.title,
    sourceQuarterLabel: quarterLabel(year, quarter),
    fireTurn: currentTurn + delay,
    narrative: finalNarrative,
  };
}

/**
 * Pull echoes that fire on the given turn out of the pending list.
 * Returns [echoes-firing-now, echoes-still-pending].
 */
export function dueEchoes(pending: Echo[], turn: number): { fired: Echo[]; remaining: Echo[] } {
  const fired: Echo[] = [];
  const remaining: Echo[] = [];
  for (const e of pending) {
    if (e.fireTurn <= turn) fired.push(e);
    else remaining.push(e);
  }
  return { fired, remaining };
}
