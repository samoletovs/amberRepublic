import { GameState } from '../engine/types';
import { INDICATORS } from '../engine/indicators';

interface Props {
  state: GameState;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  economy: { label: 'Economy', emoji: '💰' },
  demographics: { label: 'Demographics', emoji: '👥' },
  society: { label: 'Society', emoji: '🏛️' },
  security: { label: 'Security & Foreign Policy', emoji: '🛡️' },
  innovation: { label: 'Innovation', emoji: '🔬' },
};

export default function IndicatorPanel({ state }: Props) {
  const categories = ['economy', 'demographics', 'society', 'security', 'innovation'];
  const lastRecord = state.history[state.history.length - 1];

  return (
    <div className="glass-card p-4 space-y-4 max-h-[calc(100vh-100px)] lg:max-h-[calc(100vh-100px)] overflow-y-auto pb-16 lg:pb-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#9E3039' }}>
        📊 State of the Republic
      </h3>

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
                
                // Calculate percentage for bar
                const range = ind.max - ind.min;
                const pct = Math.max(0, Math.min(100, ((value - ind.min) / range) * 100));
                
                // Color based on value and direction
                let barColor = '#3b82f6';
                if (ind.goodDirection === 'up') {
                  barColor = pct > 60 ? '#22c55e' : pct > 30 ? '#eab308' : '#ef4444';
                } else if (ind.goodDirection === 'down') {
                  barColor = pct < 40 ? '#22c55e' : pct < 70 ? '#eab308' : '#ef4444';
                }

                const formatVal = () => {
                  if (ind.format === 'billions') return `€${value.toFixed(1)}B`;
                  if (ind.format === 'millions') return `${value.toFixed(2)}M`;
                  if (ind.format === 'percent') return `${value.toFixed(1)}%`;
                  return value.toFixed(0);
                };

                return (
                  <div key={ind.key} className="group" title={ind.description}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="truncate" style={{ color: '#78716C' }}>
                        {ind.emoji} {ind.name}
                      </span>
                      <span className="flex items-center gap-1 font-data text-xs" style={{ color: '#3D3731' }}>
                        {formatVal()}
                        {Math.abs(diff) > 0.05 && (
                          <span className={`text-[10px] ${diff > 0 
                            ? (ind.goodDirection === 'down' ? 'text-red-400' : 'text-green-400') 
                            : (ind.goodDirection === 'up' ? 'text-red-400' : 'text-green-400')
                          }`}>
                            {diff > 0 ? '▲' : '▼'}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="indicator-bar">
                      <div 
                        className="indicator-fill" 
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
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
