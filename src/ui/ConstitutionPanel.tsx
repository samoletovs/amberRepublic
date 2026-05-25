import { useState } from 'react';
import type { GameState } from '../engine/types';
import { PILLARS, canAdvancePillar, type PillarId } from '../engine/constitution';

interface Props {
  state: GameState;
  onAdvance: (pillar: PillarId, direction: 1 | -1) => void;
}

const POSITION_LABEL = ['Hard Left', 'Left-leaning', 'Centre', 'Right-leaning', 'Hard Right'];

export default function ConstitutionPanel({ state, onAdvance }: Props) {
  const [openPillar, setOpenPillar] = useState<PillarId | null>(null);
  const c = state.constitution;

  return (
    <div className="glass-card p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9E3039' }}>
          📜 The Constitution
        </h3>
        <span className="text-[10px] font-data px-2 py-0.5 rounded-full" style={{ background: 'rgba(184,134,11,0.12)', color: '#B8860B' }} title="Political Capital">
          PC: {c.politicalCapital}
        </span>
      </div>
      <div className="space-y-2">
        {PILLARS.map(p => {
          const pos = c.positions[p.id];
          const idx = pos + 2; // 0..4
          const isOpen = openPillar === p.id;
          return (
            <div key={p.id}>
              <button
                onClick={() => setOpenPillar(isOpen ? null : p.id)}
                className="w-full flex items-center gap-2 text-left text-xs py-1"
              >
                <span>{p.emoji}</span>
                <span className="font-semibold" style={{ color: '#1C1917' }}>{p.name}</span>
                <span className="ml-auto" style={{ color: '#78716C' }}>{POSITION_LABEL[idx]}</span>
                <span className="text-[10px]" style={{ color: '#A8A29E' }}>{isOpen ? '▲' : '▼'}</span>
              </button>
              <div className="relative h-1.5 mx-1 rounded-full" style={{ background: 'rgba(28,25,23,0.08)' }}>
                <div
                  className="absolute top-1/2 w-3 h-3 rounded-full -translate-y-1/2 transition-all"
                  style={{ left: `calc(${(idx / 4) * 100}% - 6px)`, background: '#B8860B' }}
                />
              </div>
              <div className="flex justify-between text-[9px] mt-0.5 px-1" style={{ color: '#A8A29E' }}>
                <span>{p.axisLeft}</span>
                <span>{p.axisRight}</span>
              </div>
              {isOpen && (() => {
                const leftCheck = canAdvancePillar(c, p.id, -1);
                const rightCheck = canAdvancePillar(c, p.id, 1);
                const leftStep = p.steps[pos - 1];
                const rightStep = p.steps[pos + 1];
                return (
                  <div className="mt-2 pt-2 grid grid-cols-2 gap-2 fade-in" style={{ borderTop: '1px dashed rgba(28,25,23,0.08)' }}>
                    <button
                      onClick={() => leftCheck.ok && onAdvance(p.id, -1)}
                      disabled={!leftCheck.ok}
                      className="text-left p-2 rounded-lg transition-all"
                      style={{
                        background: leftCheck.ok ? 'rgba(184,134,11,0.05)' : 'rgba(28,25,23,0.03)',
                        cursor: leftCheck.ok ? 'pointer' : 'not-allowed',
                        opacity: leftCheck.ok ? 1 : 0.45,
                      }}
                      title={leftCheck.reason}
                    >
                      <div className="text-[10px] font-bold" style={{ color: '#9E3039' }}>← Move Left</div>
                      <div className="text-[10px] font-semibold" style={{ color: '#1C1917' }}>{leftStep?.label ?? '—'}</div>
                      <div className="text-[9px]" style={{ color: '#78716C' }}>{leftStep?.description ?? leftCheck.reason}</div>
                      {leftStep && <div className="text-[9px] font-data mt-0.5" style={{ color: '#B8860B' }}>−{leftStep.cost} PC</div>}
                    </button>
                    <button
                      onClick={() => rightCheck.ok && onAdvance(p.id, 1)}
                      disabled={!rightCheck.ok}
                      className="text-right p-2 rounded-lg transition-all"
                      style={{
                        background: rightCheck.ok ? 'rgba(184,134,11,0.05)' : 'rgba(28,25,23,0.03)',
                        cursor: rightCheck.ok ? 'pointer' : 'not-allowed',
                        opacity: rightCheck.ok ? 1 : 0.45,
                      }}
                      title={rightCheck.reason}
                    >
                      <div className="text-[10px] font-bold" style={{ color: '#9E3039' }}>Move Right →</div>
                      <div className="text-[10px] font-semibold" style={{ color: '#1C1917' }}>{rightStep?.label ?? '—'}</div>
                      <div className="text-[9px]" style={{ color: '#78716C' }}>{rightStep?.description ?? rightCheck.reason}</div>
                      {rightStep && <div className="text-[9px] font-data mt-0.5" style={{ color: '#B8860B' }}>−{rightStep.cost} PC</div>}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] mt-2 pt-2" style={{ color: '#A8A29E', borderTop: '1px solid rgba(28,25,23,0.06)' }}>
        Once you amend a pillar, you cannot reverse it. Choose your republic carefully.
      </p>
    </div>
  );
}
