import { getScenarioProgress } from '../engine/arcs';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
}

/**
 * Shows the branching decision-making scenarios the player is currently living
 * through: which chapter they are on and which path they committed to earlier.
 */
export default function ScenarioTracker({ state }: Props) {
  const scenarios = getScenarioProgress(state.activeArcs ?? []);
  if (scenarios.length === 0) return null;

  return (
    <div className="glass-card p-4 mb-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9E3039', fontFamily: 'Source Sans 3' }}>
        🧭 Ongoing Scenarios
      </h3>
      <div className="space-y-2">
        {scenarios.map(s => (
          <div key={s.arcId} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#1C1917' }}>{s.title}</p>
              {s.branchLabel && (
                <p className="text-[11px]" style={{ color: '#78716C' }}>
                  Path taken: <span style={{ color: '#B8860B' }}>{s.branchLabel}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-data text-[11px]" style={{ color: '#78716C' }}>
                {s.chapter}/{s.totalChapters}
              </span>
              <div className="flex items-center gap-0.5" aria-label={`Chapter ${s.chapter} of ${s.totalChapters}`}>
                {Array.from({ length: s.totalChapters }, (_, i) => (
                  <span
                    key={i}
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: i < s.chapter ? '#B8860B' : 'rgba(28,25,23,0.15)' }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] mt-3" style={{ color: '#78716C' }}>
        Choices here echo across later chapters — some consequences arrive quarters later.
      </p>
    </div>
  );
}
