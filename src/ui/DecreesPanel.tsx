import { useState } from 'react';
import type { GameState } from '../engine/types';
import { DECREES, canEnact } from '../engine/decrees';

interface Props {
  state: GameState;
  onEnact: (decreeId: string) => void;
  onRevoke: (decreeId: string) => void;
}

export default function DecreesPanel({ state, onEnact, onRevoke }: Props) {
  const [showAll, setShowAll] = useState(false);
  const active = new Set(state.decrees.active);
  const pc = state.constitution.politicalCapital;

  return (
    <div className="glass-card p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9E3039' }}>
          📜 Standing Decrees
        </h3>
        <span className="text-[10px] font-data px-2 py-0.5 rounded-full" style={{ background: 'rgba(184,134,11,0.12)', color: '#B8860B' }}>
          {state.decrees.active.length} active
        </span>
      </div>

      {/* Active decrees */}
      {state.decrees.active.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {state.decrees.active.map(did => {
            const d = DECREES.find(x => x.id === did);
            if (!d) return null;
            const canRevoke = pc >= d.revokeCost;
            return (
              <div key={did} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(184,134,11,0.06)' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{d.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold truncate" style={{ color: '#1C1917' }}>{d.name}</div>
                    <div className="text-[9px]" style={{ color: '#78716C' }}>active</div>
                  </div>
                </div>
                <button
                  onClick={() => canRevoke && onRevoke(did)}
                  disabled={!canRevoke}
                  className="text-[10px] px-2 py-0.5 rounded font-medium"
                  style={{
                    background: canRevoke ? '#9E3039' : 'rgba(28,25,23,0.05)',
                    color: canRevoke ? '#FFFFFF' : '#78716C',
                    cursor: canRevoke ? 'pointer' : 'not-allowed',
                  }}
                  title={canRevoke ? '' : `Needs ${d.revokeCost} PC`}
                >
                  Revoke −{d.revokeCost}PC
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Toggle to show available */}
      <button
        onClick={() => setShowAll(s => !s)}
        className="text-[11px] w-full text-left py-1"
        style={{ color: '#9E3039' }}
      >
        {showAll ? '▲ Hide library' : '▼ Show decree library'}
      </button>

      {showAll && (
        <div className="space-y-1.5 mt-1 fade-in">
          {DECREES.filter(d => !active.has(d.id)).map(d => {
            const check = canEnact(state.decrees, d.id, pc);
            return (
              <button
                key={d.id}
                onClick={() => check.ok && onEnact(d.id)}
                disabled={!check.ok}
                className="w-full text-left p-2 rounded-lg transition-all"
                style={{
                  background: check.ok ? 'rgba(255,255,255,0.6)' : 'rgba(28,25,23,0.03)',
                  border: '1px solid rgba(28,25,23,0.06)',
                  opacity: check.ok ? 1 : 0.55,
                  cursor: check.ok ? 'pointer' : 'not-allowed',
                }}
                title={check.reason ?? ''}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{d.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold truncate" style={{ color: '#1C1917' }}>{d.name}</div>
                      <div className="text-[10px] line-clamp-2" style={{ color: '#78716C' }}>{d.description}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-data shrink-0 px-2 py-0.5 rounded" style={{ background: 'rgba(184,134,11,0.12)', color: '#B8860B' }}>
                    {d.enactCost} PC
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
