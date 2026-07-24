import { Effect } from '../engine/types';
import { getIndicatorMeta } from '../engine/indicators';
import { magnitudeOf, delayLabelOf } from '../engine/magnitudes';

interface Props {
  effects: Effect[];
  /** Current indicator values — enables before/after bar visualization. */
  currentIndicators?: Record<string, number>;
}

function EffectRow({ eff, currentIndicators }: { eff: Effect; currentIndicators?: Record<string, number> }) {
  const meta = getIndicatorMeta(eff.indicator);
  if (!meta) return null;

  const isPositive = (meta.goodDirection === 'up' && eff.delta > 0) ||
                     (meta.goodDirection === 'down' && eff.delta < 0);
  const isNeutral = meta.goodDirection === 'neutral';
  const mag = magnitudeOf(eff.indicator, eff.delta);
  const delayLabel = delayLabelOf(eff.delay);

  const deltaColor = isNeutral ? '#2563EB' : isPositive ? '#16A34A' : '#DC2626';

  const currentVal = currentIndicators?.[eff.indicator];
  const range = meta.max - meta.min;
  let currentPct: number | null = null;
  let barStart: number | null = null;
  let barWidth: number | null = null;

  if (currentVal !== undefined) {
    currentPct = Math.max(0, Math.min(100, ((currentVal - meta.min) / range) * 100));
    const newVal = Math.max(meta.min, Math.min(meta.max, currentVal + eff.delta));
    const newPct = Math.max(0, Math.min(100, ((newVal - meta.min) / range) * 100));
    barStart = Math.min(currentPct, newPct);
    barWidth = Math.max(1, Math.abs(newPct - currentPct));
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-4 text-center shrink-0 text-sm">{meta.emoji}</span>
      <span className="flex-1 truncate text-[11px]" style={{ color: '#3D3731' }}>{meta.name}</span>

      {/* Mini before/after bar */}
      {currentPct !== null && barStart !== null && barWidth !== null ? (
        <div
          className="relative w-16 h-1.5 rounded-full overflow-hidden shrink-0"
          style={{ background: 'rgba(28,25,23,0.1)' }}
          title={`Current: ${currentVal?.toFixed(1)} → projected change`}
        >
          {/* Current fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${currentPct}%`, background: 'rgba(28,25,23,0.25)' }}
          />
          {/* Delta segment */}
          <div
            className="absolute inset-y-0 rounded-full"
            style={{ left: `${barStart}%`, width: `${barWidth}%`, background: deltaColor }}
          />
          {/* Current position marker */}
          <div
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${currentPct}%`, background: 'rgba(28,25,23,0.6)' }}
          />
        </div>
      ) : (
        <div className="w-16 shrink-0" />
      )}

      <span
        className="text-[10px] font-semibold font-data w-16 text-right shrink-0"
        style={{ color: deltaColor }}
      >
        {eff.delta > 0 ? '↑' : '↓'} {mag}
      </span>

      {delayLabel !== 'Now' && (
        <span className="text-[9px] shrink-0 w-14 text-right" style={{ color: '#B8860B' }}>
          ⏳ {delayLabel}
        </span>
      )}
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

  return (
    <div
      className="mt-2 rounded-lg px-2.5 py-2 fade-in"
      style={{ background: 'rgba(28,25,23,0.025)', border: '1px solid rgba(28,25,23,0.07)' }}
    >
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
