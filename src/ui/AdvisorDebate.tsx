import { useMemo, useState } from 'react';
import type { GameEvent } from '../engine/types';
import { FACTIONS } from '../engine/factions';
import { pickDebatePanel, ministerLineFor } from '../engine/ministers';
import { createRng } from '../engine/random';

interface Props {
  event: GameEvent;
  /** Seed for deterministic line selection — pass turn number. */
  seed: number;
}

export default function AdvisorDebate({ event, seed }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const debate = useMemo(() => {
    const rng = createRng(seed + event.id.length * 31);
    const ministers = pickDebatePanel(event, rng);
    return ministers.map(m => ({
      minister: m,
      line: ministerLineFor(m, event, rng),
      faction: FACTIONS.find(f => f.id === m.factionId),
    }));
  }, [event, seed]);

  return (
    <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(184,134,11,0.06)', border: '1px solid rgba(184,134,11,0.2)' }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#B8860B' }}>
          ⚡ Cabinet Briefing — High Stakes
        </h4>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-[10px]"
          style={{ color: '#78716C' }}
        >
          {collapsed ? '▼ Show' : '▲ Hide'}
        </button>
      </div>
      {!collapsed && (
        <div className="space-y-2">
          {debate.map(({ minister, line, faction }, i) => (
            <div key={minister.id} className="flex items-start gap-2 fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ background: faction?.color ?? '#78716C', color: '#FFFFFF' }}
              >
                {minister.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xs font-semibold" style={{ color: '#1C1917' }}>{minister.name}</span>
                  <span className="text-[10px]" style={{ color: '#78716C' }}>{minister.title}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(28,25,23,0.05)', color: '#78716C' }}
                  >
                    {minister.biasLabel}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#3D3731' }}>{line}</p>
              </div>
            </div>
          ))}
          <p className="text-[10px] italic pt-1.5 mt-2" style={{ color: '#A8A29E', borderTop: '1px dashed rgba(28,25,23,0.08)' }}>
            Ministers have biases. Read them like you would a newspaper editorial — with one eyebrow raised.
          </p>
        </div>
      )}
    </div>
  );
}
