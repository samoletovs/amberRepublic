import { useState, useEffect } from 'react';
import type { GameState } from '../engine/types';
import { fetchRealTrajectory } from '../engine/latviaData';

interface Props {
  state: GameState;
}

interface TrajectoryPoint {
  year: number;
  population?: number;
  gdp?: number;
  unemployment?: number;
}

export default function BeatReality({ state }: Props) {
  const [realData, setRealData] = useState<TrajectoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchRealTrajectory(2025, 2035).then(data => {
      if (!cancelled) {
        setRealData(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 mb-6 fade-in">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#9E3039' }}>
          🇱🇻 Beat Reality?
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-pulse" style={{ height: 24, borderRadius: 6 }} />
          ))}
        </div>
      </div>
    );
  }

  if (realData.length === 0) return null;

  // Build game trajectory from history
  const gameTrajectory: TrajectoryPoint[] = state.history
    .filter((h, i) => i % 4 === 0 || i === state.history.length - 1) // yearly snapshots
    .map(h => ({
      year: h.year,
      population: h.indicatorsAfter.population,
      gdp: h.indicatorsAfter.gdp,
      unemployment: h.indicatorsAfter.unemployment,
    }));

  // Compare final values
  const latestReal = realData[realData.length - 1];
  const finalGame = gameTrajectory[gameTrajectory.length - 1];
  if (!latestReal || !finalGame) return null;

  const comparisons = [
    {
      name: 'Population',
      emoji: '👥',
      unit: 'M',
      game: finalGame.population,
      real: latestReal.population,
      better: (g: number, r: number) => g > r,
    },
    {
      name: 'GDP',
      emoji: '💰',
      unit: '€B',
      game: finalGame.gdp,
      real: latestReal.gdp,
      better: (g: number, r: number) => g > r,
    },
    {
      name: 'Unemployment',
      emoji: '👷',
      unit: '%',
      game: finalGame.unemployment,
      real: latestReal.unemployment,
      better: (g: number, r: number) => g < r,
    },
  ].filter(c => c.game != null && c.real != null);

  const wins = comparisons.filter(c => c.better(c.game!, c.real!)).length;
  const verdict = wins >= 2 ? { text: 'You beat reality!', color: '#16A34A', emoji: '🏆' }
    : wins === 1 ? { text: 'Mixed results', color: '#B8860B', emoji: '⚖️' }
    : { text: 'Reality wins this round', color: '#DC2626', emoji: '📉' };

  return (
    <div className="glass-card p-6 mb-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#9E3039' }}>
          🇱🇻 Beat Reality?
        </h3>
        <span className="text-sm font-medium" style={{ color: verdict.color }}>
          {verdict.emoji} {verdict.text}
        </span>
      </div>

      <p className="text-xs mb-4" style={{ color: '#78716C' }}>
        Your Latvia vs. what actually happened (real CSP data through {latestReal.year}).
      </p>

      <div className="space-y-3">
        {comparisons.map(c => {
          const gv = c.game!;
          const rv = c.real!;
          const won = c.better(gv, rv);
          const diff = gv - rv;

          return (
            <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'rgba(28,25,23,0.03)' }}>
              <span className="text-xl">{c.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium" style={{ color: '#3D3731' }}>{c.name}</div>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                  <span className="font-data" style={{ color: '#1C1917' }}>
                    🎮 {c.unit === '%' ? `${gv.toFixed(1)}${c.unit}` : `${gv.toFixed(c.unit === 'M' ? 2 : 1)}${c.unit}`}
                  </span>
                  <span style={{ color: '#A8A29E' }}>vs</span>
                  <span className="font-data" style={{ color: '#78716C' }}>
                    🇱🇻 {c.unit === '%' ? `${rv.toFixed(1)}${c.unit}` : `${rv.toFixed(c.unit === 'M' ? 2 : 1)}${c.unit}`}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-data font-bold" style={{ color: won ? '#16A34A' : '#DC2626' }}>
                  {won ? '✅' : '❌'}
                </span>
                <div className="text-[10px] font-data" style={{ color: won ? '#16A34A' : '#DC2626' }}>
                  {diff > 0 ? '+' : ''}{c.unit === '%' ? diff.toFixed(1) : diff.toFixed(c.unit === 'M' ? 2 : 1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] mt-3 text-center" style={{ color: '#A8A29E' }}>
        Real data: Centrālā statistikas pārvalde (CSP) · Updated as new data becomes available
      </p>
    </div>
  );
}
