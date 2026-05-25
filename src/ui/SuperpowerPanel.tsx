import { useState } from 'react';
import type { GameState } from '../engine/types';
import { SUPERPOWERS, getSuperpower, relationLabel, type Demand } from '../engine/superpowers';

interface Props {
  state: GameState;
  onResolve: (demandId: string, optionIdx: number) => void;
}

export default function SuperpowerPanel({ state, onResolve }: Props) {
  const [openDemandId, setOpenDemandId] = useState<string | null>(null);
  const sp = state.superpowers;

  return (
    <div className="glass-card p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9E3039' }}>
          🌍 The Powers
        </h3>
        {sp.active.length > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#9E3039', color: '#FFFFFF' }}>
            {sp.active.length} active
          </span>
        )}
      </div>

      {/* Standing row */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {SUPERPOWERS.map(p => {
          const value = sp.standing[p.id];
          const label = relationLabel(value);
          return (
            <div key={p.id} className="rounded-lg p-1.5 text-center" style={{ background: 'rgba(28,25,23,0.03)' }}>
              <div className="text-lg leading-none">{p.emoji}</div>
              <div className="text-[10px] font-bold" style={{ color: p.color }}>{p.name}</div>
              <div className="font-data text-[10px]" style={{ color: '#1C1917' }}>{Math.round(value)} · {label}</div>
            </div>
          );
        })}
      </div>

      {/* Active demands */}
      {sp.active.length > 0 && (
        <div className="space-y-1.5 mt-2">
          {sp.active.map((d: Demand) => {
            const isOpen = openDemandId === d.id;
            const power = getSuperpower(d.power);
            const turnsLeft = d.deadlineTurn - state.turn;
            return (
              <div key={d.id} className="rounded-lg" style={{ background: 'rgba(28,25,23,0.04)' }}>
                <button
                  onClick={() => setOpenDemandId(isOpen ? null : d.id)}
                  className="w-full p-2 flex items-start gap-2 text-left"
                >
                  <span className="text-base">{power?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold" style={{ color: '#1C1917' }}>{d.title}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: turnsLeft <= 1 ? '#DC2626' : '#78716C' }}>
                      {turnsLeft <= 0 ? 'Deadline NOW' : `${turnsLeft} quarter${turnsLeft === 1 ? '' : 's'} to respond`}
                    </div>
                  </div>
                  <span className="text-[10px]" style={{ color: '#A8A29E' }}>{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="px-2 pb-2 fade-in">
                    <p className="text-xs leading-relaxed mb-2" style={{ color: '#3D3731' }}>{d.body}</p>
                    <div className="space-y-1">
                      {d.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => onResolve(d.id, i)}
                          className="w-full text-left p-2 rounded-lg transition-all"
                          style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(28,25,23,0.06)' }}
                        >
                          <div className="text-[11px] font-semibold" style={{ color: '#1C1917' }}>{opt.label}</div>
                          <div className="text-[10px]" style={{ color: '#78716C' }}>{opt.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
