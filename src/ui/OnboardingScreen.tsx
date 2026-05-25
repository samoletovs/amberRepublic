import { useState } from 'react';
import { TRAIT_DEFS, type TraitId } from '../engine/traits';

interface Props {
  onConfirm: (traits: TraitId[]) => void;
  onBack: () => void;
}

const MAX_PICKS = 2;

export default function OnboardingScreen({ onConfirm, onBack }: Props) {
  const [picked, setPicked] = useState<TraitId[]>([]);

  const toggle = (id: TraitId) => {
    setPicked(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_PICKS) return prev;
      return [...prev, id];
    });
  };

  const canConfirm = picked.length === MAX_PICKS;

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-3xl mx-auto fade-in">
        <div className="text-center mb-6">
          <div className="flex justify-center gap-0 mb-4">
            <div className="w-12 h-1 rounded-full" style={{ background: '#9E3039' }} />
            <div className="w-6 h-1 rounded-full mx-1" style={{ background: '#FFFFFF' }} />
            <div className="w-12 h-1 rounded-full" style={{ background: '#9E3039' }} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#1C1917' }}>
            Who Are You, <span style={{ color: '#9E3039' }}>Premier?</span>
          </h1>
          <p className="text-sm sm:text-base" style={{ color: '#78716C' }}>
            Pick two traits. They tilt your starting hand — and your reputation in Brussels, Moscow, and the Saeima cafeteria.
          </p>
          <p className="text-xs mt-2" style={{ color: '#A8A29E' }}>
            {picked.length}/{MAX_PICKS} selected
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {TRAIT_DEFS.map(t => {
            const isPicked = picked.includes(t.id);
            const isDisabled = !isPicked && picked.length >= MAX_PICKS;
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                disabled={isDisabled}
                aria-pressed={isPicked}
                className={`glass-card p-4 text-left transition-all ${
                  isPicked ? 'ring-2' : ''
                } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
                style={{
                  background: isPicked ? 'rgba(184,134,11,0.08)' : undefined,
                  boxShadow: isPicked ? '0 0 0 2px rgba(184,134,11,0.5)' : undefined,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{t.emoji}</span>
                  <h3 className="text-lg font-bold" style={{ color: '#1C1917' }}>{t.name}</h3>
                  {isPicked && (
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: '#B8860B', color: '#FFFFFF' }}>
                      Picked
                    </span>
                  )}
                </div>
                <p className="text-xs italic mb-2" style={{ color: '#B8860B' }}>{t.tagline}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#3D3731' }}>{t.description}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'rgba(28,25,23,0.05)', color: '#78716C', border: '1px solid rgba(28,25,23,0.1)' }}
          >
            ← Back
          </button>
          <button
            onClick={() => canConfirm && onConfirm(picked)}
            disabled={!canConfirm}
            className={`w-full sm:w-auto px-10 py-3 rounded-lg font-semibold text-base transition-all duration-200 ${
              canConfirm ? 'pulse-amber' : 'opacity-40 cursor-not-allowed'
            }`}
            style={{
              background: canConfirm ? '#9E3039' : 'rgba(28,25,23,0.08)',
              color: canConfirm ? '#FFFFFF' : '#78716C',
            }}
          >
            {canConfirm ? 'Take the Oath →' : `Pick ${MAX_PICKS - picked.length} more`}
          </button>
        </div>

        <p className="text-center text-[11px] mt-6 max-w-md mx-auto" style={{ color: '#A8A29E' }}>
          Traits are permanent for this run. You can pick a different combination next time —
          and every combination unlocks slightly different paths through the quarters ahead.
        </p>
      </div>
    </div>
  );
}
