import { useState, useEffect } from 'react';
import type { GameState, RealityComparison } from '../engine/types';
import { getRealityComparisons, formatComparisonValue } from '../engine/realdata';

interface Props {
  state: GameState;
}

export default function RealityCheck({ state }: Props) {
  const [comparisons, setComparisons] = useState<RealityComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getRealityComparisons(state)
      .then(data => {
        if (!cancelled) {
          setComparisons(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [state.turn]);

  if (loading) {
    return (
      <div className="glass-card p-4 fade-in">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#B8860B' }}>
          📊 Reality Check
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-pulse" style={{ height: 36, borderRadius: 8 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || comparisons.length === 0) {
    return (
      <div className="glass-card p-4 fade-in">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#B8860B' }}>
          📊 Reality Check
        </h3>
        <p className="text-xs" style={{ color: '#78716C' }}>
          {error ? 'Could not load real data.' : 'No comparable data available.'}
        </p>
      </div>
    );
  }

  const divergenceColor = {
    close: '#16A34A',
    moderate: '#B8860B',
    far: '#DC2626',
  } as const;

  const divergenceLabel = {
    close: 'On track',
    moderate: 'Diverging',
    far: 'Alternate reality',
  } as const;

  return (
    <div className="glass-card p-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8860B' }}>
          📊 Reality Check
        </h3>
        <span className="text-[10px]" style={{ color: '#A8A29E' }}>
          vs. Real Latvia
        </span>
      </div>

      <div className="space-y-3">
        {comparisons.map(c => (
          <div
            key={c.indicatorKey}
            className="flex items-center gap-3 p-2 rounded-lg"
            style={{ background: 'rgba(28,25,23,0.02)' }}
          >
            <span className="text-lg" aria-hidden="true">{c.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <span className="text-xs font-medium truncate" style={{ color: '#3D3731' }}>
                  {c.indicatorName}
                </span>
                <span
                  className="text-[10px] font-medium shrink-0 px-1.5 py-0.5 rounded-full"
                  style={{
                    color: divergenceColor[c.divergence],
                    background: `${divergenceColor[c.divergence]}15`,
                  }}
                >
                  {divergenceLabel[c.divergence]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-data" style={{ color: '#1C1917' }}>
                  🎮 {formatComparisonValue(c.gameValue, c.unit)}
                </span>
                <span style={{ color: '#A8A29E' }}>vs</span>
                <span className="font-data" style={{ color: '#78716C' }}>
                  🇱🇻 {formatComparisonValue(c.realValue, c.unit)}
                </span>
                <span className="text-[10px]" style={{ color: '#A8A29E' }}>
                  ({c.period})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] mt-3 text-center" style={{ color: '#A8A29E' }}>
        Real data: Centrālā statistikas pārvalde (CSP)
      </p>
    </div>
  );
}
