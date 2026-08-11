import { Effect } from '../engine/types';
import { getIndicatorMeta } from '../engine/indicators';
import { magnitudeOf, delayLabelOf, durationLabelOf } from '../engine/magnitudes';
import { formatIndicatorValue, projectEffect, summarizeEffects, toneForEffect, type ImpactTone } from './impactProjection';

interface Props {
  effects: Effect[];
  /** Current indicator values — enables before/after bar visualization. */
  currentIndicators?: Record<string, number>;
}

function toneColor(tone: ImpactTone): string {
  switch (tone) {
    case 'helpful': return '#16A34A';
    case 'harmful': return '#DC2626';
    case 'neutral': return '#78716C';
  }
}

function EffectRow({ eff, currentIndicators }: { eff: Effect; currentIndicators?: Record<string, number> }) {
  const meta = getIndicatorMeta(eff.indicator);
  if (!meta) return null;

  const tone = toneForEffect(meta, eff.delta);
  const mag = magnitudeOf(eff.indicator, eff.delta);
  const delayLabel = delayLabelOf(eff.delay);
  const deltaColor = toneColor(tone);
  const projection = projectEffect(eff, currentIndicators);
  const timing = durationLabelOf(eff.duration);
  const isDelayed = eff.delay > 0;
  const timingColor = isDelayed ? '#B8860B' : '#78716C';
  const timingText = isDelayed
    ? eff.duration > 0
      ? `⏳ ${delayLabel} · ${timing}`
      : `⏳ ${delayLabel}`
    : timing ? `⏱ ${timing}` : '';
  const directionSymbol = eff.delta === 0 ? '→' : eff.delta > 0 ? '↑' : '↓';
  const magnitudeText = eff.delta === 0 ? 'No change' : `${directionSymbol} ${mag}`;

  return (
    <div className="grid grid-cols-[1rem_minmax(0,1fr)_auto] sm:grid-cols-[1rem_minmax(0,1fr)_4rem_auto] items-center gap-2 py-1.5">
      <span className="w-4 text-center shrink-0 text-sm">{meta.emoji}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[11px] font-semibold" style={{ color: '#3D3731' }}>{meta.name}</span>
          {projection?.isClamped && (
            <span className="text-[9px] font-bold uppercase" style={{ color: '#B8860B' }}>capped</span>
          )}
        </div>
        {projection && (
          <div className="text-[10px] font-data" style={{ color: '#78716C' }}>
            {formatIndicatorValue(meta, projection.currentValue)} → {formatIndicatorValue(meta, projection.projectedValue)}
          </div>
        )}
      </div>

      {/* Mini before/after bar */}
      {projection ? (
        <div
          className="relative hidden sm:block w-16 h-1.5 rounded-full overflow-hidden shrink-0"
          style={{ background: 'rgba(28,25,23,0.1)' }}
          title={`${formatIndicatorValue(meta, projection.currentValue)} → ${formatIndicatorValue(meta, projection.projectedValue)}`}
        >
          {/* Current fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${projection.currentPct}%`, background: 'rgba(28,25,23,0.25)' }}
          />
          {/* Delta segment */}
          <div
            className="absolute inset-y-0 rounded-full"
            style={{ left: `${projection.barStartPct}%`, width: `${projection.barWidthPct}%`, background: deltaColor }}
          />
          {/* Current position marker */}
          <div
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${projection.currentPct}%`, background: 'rgba(28,25,23,0.6)' }}
          />
        </div>
      ) : (
        <div className="hidden sm:block w-16 shrink-0" />
      )}

      <div className="text-right">
        <span
          className="block text-[10px] font-semibold font-data"
          style={{ color: deltaColor }}
        >
          {magnitudeText}
        </span>
        {timingText && (
          <span className="block text-[9px]" style={{ color: timingColor }}>
            {timingText}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Expanded impact breakdown panel shown per choice.
 * Groups effects into Immediate and Delayed sections and renders
 * each with a mini before/after bar when current indicator values are available.
 */
export default function ImpactBreakdown({ effects, currentIndicators }: Props) {
  const immediate = effects.filter(e => e.delay <= 0);
  const delayed = effects.filter(e => e.delay > 0);
  const summary = summarizeEffects(effects);
  const summaryItems = [
    summary.helpful > 0 ? { label: `${summary.helpful} helpful`, color: toneColor('helpful') } : null,
    summary.harmful > 0 ? { label: `${summary.harmful} risky`, color: toneColor('harmful') } : null,
    summary.neutral > 0 ? { label: `${summary.neutral} neutral`, color: toneColor('neutral') } : null,
    summary.delayed > 0 ? { label: `${summary.delayed} delayed`, color: '#B8860B' } : null,
    summary.temporary > 0 ? { label: `${summary.temporary} temporary`, color: '#78716C' } : null,
  ].filter((item): item is { label: string; color: string } => item !== null);

  return (
    <div
      className="mt-2 rounded-lg px-2.5 py-2 fade-in"
      style={{ background: 'rgba(28,25,23,0.025)', border: '1px solid rgba(28,25,23,0.07)' }}
    >
      {summaryItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-2" style={{ borderBottom: '1px dashed rgba(28,25,23,0.08)' }}>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#3D3731' }}>
            Projected impact
          </span>
          {summaryItems.map(item => (
            <span
              key={item.label}
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
              style={{ color: item.color, background: `${item.color}14` }}
            >
              {item.label}
            </span>
          ))}
        </div>
      )}

      {immediate.length > 0 && (
        <section>
          <div
            className="text-[9px] font-bold uppercase tracking-widest mb-1"
            style={{ color: '#9E3039' }}
          >
            Immediate
          </div>
          {immediate.map((eff, i) => (
            <EffectRow key={i} eff={eff} currentIndicators={currentIndicators} />
          ))}
        </section>
      )}

      {delayed.length > 0 && (
        <section className={immediate.length > 0 ? 'mt-2 pt-2' : ''} style={immediate.length > 0 ? { borderTop: '1px dashed rgba(28,25,23,0.08)' } : {}}>
          <div
            className="text-[9px] font-bold uppercase tracking-widest mb-1"
            style={{ color: '#B8860B' }}
          >
            ⏳ Delayed
          </div>
          {delayed.map((eff, i) => (
            <EffectRow key={i} eff={eff} currentIndicators={currentIndicators} />
          ))}
        </section>
      )}
    </div>
  );
}
