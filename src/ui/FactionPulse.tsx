import { useState } from 'react';
import { FACTIONS, type FactionId, factionMood, factionMoodQuote } from '../engine/factions';

interface Props {
  approval: Record<FactionId, number>;
  /** Optional reactions to a hovered choice — preview overlay. */
  preview?: Partial<Record<FactionId, { delta: number; level: string; symbol: string }>>;
}

const MOOD_COLOR: Record<string, string> = {
  love: '#16A34A',
  happy: '#65A30D',
  neutral: '#B8860B',
  unhappy: '#EA580C',
  crisis: '#DC2626',
};

export default function FactionPulse({ approval, preview }: Props) {
  const [expandedId, setExpandedId] = useState<FactionId | null>(null);

  return (
    <div className="glass-card p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9E3039' }}>
          🎭 Faction Pulse
        </h3>
        <span className="text-[10px]" style={{ color: '#A8A29E' }}>tap a face to read the room</span>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {FACTIONS.map(f => {
          const value = approval[f.id] ?? 50;
          const previewEntry = preview?.[f.id];
          const previewValue = previewEntry ? Math.max(0, Math.min(100, value + previewEntry.delta)) : null;
          const mood = factionMood(value);
          const moodColor = MOOD_COLOR[mood];
          const isExpanded = expandedId === f.id;

          return (
            <button
              key={f.id}
              onClick={() => setExpandedId(isExpanded ? null : f.id)}
              className="flex flex-col items-center group focus:outline-none"
              aria-label={`${f.name}, led by ${f.leader}, ${mood}`}
              title={`${f.name} — ${f.leader}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold mb-1 transition-all ${
                  mood === 'crisis' ? 'faction-shake' : ''
                } ${mood === 'love' ? 'faction-glow' : ''}`}
                style={{
                  background: f.color,
                  color: '#FFFFFF',
                  boxShadow: mood === 'crisis' ? '0 0 0 2px #DC2626' : mood === 'love' ? undefined : 'none',
                  transform: previewEntry ? 'scale(1.05)' : undefined,
                }}
              >
                {f.leaderInitials}
              </div>
              {/* Vertical bar */}
              <div className="relative w-1.5 h-10 sm:h-12 rounded-full overflow-hidden" style={{ background: 'rgba(28,25,23,0.08)' }}>
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all"
                  style={{
                    height: `${value}%`,
                    background: moodColor,
                  }}
                />
                {previewValue !== null && (
                  <div
                    className="absolute left-0 right-0 transition-all"
                    style={{
                      bottom: `${Math.min(value, previewValue)}%`,
                      height: `${Math.abs(previewValue - value)}%`,
                      background: previewEntry!.delta > 0 ? 'rgba(34,197,94,0.7)' : 'rgba(220,38,38,0.7)',
                    }}
                  />
                )}
              </div>
              {previewEntry && (
                <span className="text-xs mt-0.5">{previewEntry.symbol}</span>
              )}
              <span className="text-[9px] mt-0.5 font-mono tabular-nums" style={{ color: '#78716C' }}>
                {Math.round(value)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded panel */}
      {expandedId && (() => {
        const f = FACTIONS.find(x => x.id === expandedId);
        if (!f) return null;
        const value = approval[f.id] ?? 50;
        return (
          <div className="mt-3 pt-3 fade-in" style={{ borderTop: '1px solid rgba(28,25,23,0.08)' }}>
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: f.color, color: '#FFFFFF' }}
              >
                {f.leaderInitials}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold" style={{ color: '#1C1917' }}>{f.name}</h4>
                <p className="text-[11px]" style={{ color: '#78716C' }}>{f.leader} · {f.ideology}</p>
                <p className="text-xs italic mt-1.5" style={{ color: '#3D3731' }}>
                  {factionMoodQuote(f, value)}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
