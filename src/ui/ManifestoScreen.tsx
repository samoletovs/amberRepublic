import { useState } from 'react';
import { PROMISES, type PromiseDef } from '../engine/manifesto';

interface Props {
  onConfirm: (promiseIds: string[]) => void;
  /** Term number — purely for display ("Promises for Term 1"). */
  termNumber: number;
  /** Optional: pre-selected promises from previous term to highlight as still-relevant. */
  highlight?: string[];
}

const MAX_PROMISES = 3;

export default function ManifestoScreen({ onConfirm, termNumber, highlight = [] }: Props) {
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (id: string) => {
    setPicked(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_PROMISES) return prev;
      return [...prev, id];
    });
  };

  const canConfirm = picked.length === MAX_PROMISES;

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-3xl mx-auto fade-in">
        <div className="text-center mb-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: '#B8860B' }}>
            ── Campaign Promises · Term {termNumber} ──
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#1C1917' }}>
            What Will You <span style={{ color: '#9E3039' }}>Commit</span> To?
          </h1>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: '#78716C' }}>
            Pick three. Break them, and voters remember — permanently. Keep them, and even your opposition will look briefly impressed.
          </p>
          <p className="text-xs mt-2" style={{ color: '#A8A29E' }}>
            {picked.length}/{MAX_PROMISES} selected
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {PROMISES.map((p: PromiseDef) => {
            const isPicked = picked.includes(p.id);
            const isDisabled = !isPicked && picked.length >= MAX_PROMISES;
            const isPrior = highlight.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                disabled={isDisabled}
                aria-pressed={isPicked}
                className={`glass-card p-3 sm:p-4 text-left transition-all ${
                  isPicked ? 'ring-2' : ''
                } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
                style={{
                  background: isPicked ? 'rgba(184,134,11,0.08)' : isPrior ? 'rgba(158,48,57,0.04)' : undefined,
                  boxShadow: isPicked ? '0 0 0 2px rgba(184,134,11,0.5)' : undefined,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="text-sm font-bold flex-1" style={{ color: '#1C1917' }}>{p.title}</h3>
                  {isPicked && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: '#B8860B', color: '#FFFFFF' }}>
                      Promised
                    </span>
                  )}
                  {isPrior && !isPicked && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'rgba(158,48,57,0.1)', color: '#9E3039' }}>
                      Last term
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#78716C' }}>{p.description}</p>
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => canConfirm && onConfirm(picked)}
            disabled={!canConfirm}
            className={`px-10 py-3 rounded-lg font-semibold text-base transition-all duration-200 ${
              canConfirm ? 'pulse-amber' : 'opacity-40 cursor-not-allowed'
            }`}
            style={{
              background: canConfirm ? '#9E3039' : 'rgba(28,25,23,0.08)',
              color: canConfirm ? '#FFFFFF' : '#78716C',
            }}
          >
            {canConfirm ? 'Sign the Manifesto →' : `Choose ${MAX_PROMISES - picked.length} more`}
          </button>
          <p className="text-[11px] mt-4 max-w-md mx-auto" style={{ color: '#A8A29E' }}>
            Broken promises raise voter cynicism — a permanent malus on faction approval that grows with every term.
          </p>
        </div>
      </div>
    </div>
  );
}
