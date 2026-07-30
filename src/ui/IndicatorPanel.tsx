import { GameState } from '../engine/types';
import { INDICATORS } from '../engine/indicators';

interface Props {
  state: GameState;
  /** Optional preview deltas to overlay on top of current values (e.g. from a hovered choice). */
  previewDeltas?: Record<string, number>;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  economy: { label: 'Economy', emoji: '💰' },
  demographics: { label: 'Demographics', emoji: '👥' },
  society: { label: 'Society', emoji: '🏛️' },
  security: { label: 'Security & Foreign Policy', emoji: '🛡️' },
  innovation: { label: 'Innovation', emoji: '🔬' },
};

export default function IndicatorPanel({ state, previewDeltas }: Props) {
  const categories = ['economy', 'demographics', 'society', 'security', 'innovation'];
  const lastRecord = state.history[state.history.length - 1];

  return (
    <div className="glass-card p-4 space-y-4 max-h-[calc(100vh-100px)] lg:max-h-[calc(100vh-100px)] overflow-y-auto pb-16 lg:pb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#9E3039' }}>
          📊 State of the Republic
        </h3>
        {previewDeltas && Object.keys(previewDeltas).length > 0 && (
          <span
            className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse"
            style={{ background: 'rgba(184,134,11,0.15)', color: '#B8860B' }}
          >
            👆 Previewing
          </span>
        )}
      </div>

      {categories.map(cat => {
        const catMeta = CATEGORY_LABELS[cat];
        const indicators = INDICATORS.filter(i => i.category === cat);
        
        return (
          <div key={cat}>
            <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              {catMeta.emoji} {catMeta.label}
            </h4>
            <div className="space-y-2">
              {indicators.map(ind => {
                const value = state.indicators[ind.key] ?? 0;
                const prevValue = lastRecord?.indicatorsBefore[ind.key];
                const diff = prevValue !== undefined ? value - prevValue : 0;

                // Preview delta from hovered choice
                const previewDelta = previewDeltas?.[ind.key];
                const previewVal = previewDelta !== undefined
                  ? Math.max(ind.min, Math.min(ind.max, value + previewDelta))
                  : null;

                // Calculate percentage for bar
                const range = ind.max - ind.min;
                const pct = Math.max(0, Math.min(100, ((value - ind.min) / range) * 100));
                const previewPct = previewVal !== null
                  ? Math.max(0, Math.min(100, ((previewVal - ind.min) / range) * 100))
                  : null;

                // Color based on value and direction
                let barColor = '#3b82f6';
                if (ind.goodDirection === 'up') {
                  barColor = pct > 60 ? '#22c55e' : pct > 30 ? '#eab308' : '#ef4444';
                } else if (ind.goodDirection === 'down') {
                  barColor = pct < 40 ? '#22c55e' : pct < 70 ? '#eab308' : '#ef4444';
                }

                // Preview delta color
                const isPreviewGood = previewDelta !== undefined && (
                  (ind.goodDirection === 'up' && previewDelta > 0) ||
                  (ind.goodDirection === 'down' && previewDelta < 0)
                );
                const previewColor = ind.goodDirection === 'neutral' ? '#2563EB'
                  : isPreviewGood ? '#16A34A' : '#DC2626';

                const formatVal = () => {
                  if (ind.format === 'billions') return `€${value.toFixed(1)}B`;
                  if (ind.format === 'millions') return `${value.toFixed(2)}M`;
                  if (ind.format === 'percent') return `${value.toFixed(1)}%`;
                  return value.toFixed(0);
                };

                return (
                  <div
                    key={ind.key}
                    className="group"
                    title={ind.description}
                    style={previewDelta !== undefined ? { transition: 'opacity 0.2s' } : {}}
                  >
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="truncate" style={{ color: '#78716C' }}>
                        {ind.emoji} {ind.name}
                      </span>
                      <span className="flex items-center gap-1 font-data text-xs" style={{ color: '#3D3731' }}>
                        {formatVal()}
                        {/* Turn-over-turn change arrow */}
                        {Math.abs(diff) > 0.05 && previewDelta === undefined && (
                          <span className={`text-[10px] ${diff > 0
                            ? (ind.goodDirection === 'down' ? 'text-red-400' : 'text-green-400')
                            : (ind.goodDirection === 'up' ? 'text-red-400' : 'text-green-400')
                          }`}>
                            {diff > 0 ? '▲' : '▼'}
                          </span>
                        )}
                        {/* Preview change arrow */}
                        {previewDelta !== undefined && Math.abs(previewDelta) > 0.001 && (
                          <span
                            className="text-[10px] font-semibold animate-pulse"
                            style={{ color: previewColor }}
                            title={`Projected: ${previewDelta > 0 ? '+' : ''}${previewDelta.toFixed(1)}`}
                          >
                            {previewDelta > 0 ? '▲' : '▼'}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="indicator-bar relative">
                      <div
                        className="indicator-fill"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                      {/* Preview overlay segment */}
                      {previewPct !== null && previewDelta !== undefined && Math.abs(previewDelta) > 0.001 && (
                        <div
                          className="absolute inset-y-0 rounded-full opacity-60 animate-pulse"
                          style={{
                            left: `${Math.min(pct, previewPct)}%`,
                            width: `${Math.max(1, Math.abs(previewPct - pct))}%`,
                            backgroundColor: previewColor,
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
