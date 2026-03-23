import { GameEvent } from '../engine/types';
import { getIndicatorMeta } from '../engine/indicators';

interface Props {
  event: GameEvent;
  index: number;
  selectedChoice?: number;
  onChoose: (choiceIndex: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  economy: '#D4A843',
  security: '#ef4444',
  society: '#8b5cf6',
  diplomacy: '#3b82f6',
  science: '#22c55e',
  crisis: '#f97316',
  environment: '#10b981',
  culture: '#ec4899',
};

export default function EventCard({ event, index, selectedChoice, onChoose }: Props) {
  const catColor = CATEGORY_COLORS[event.category] || '#94a3b8';

  return (
    <div className="glass-card p-5 mb-4 fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
      {/* Event header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${catColor}20`, color: catColor }}
            >
              {event.category}
            </span>
            {event.oneTime && (
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">One-time</span>
            )}
          </div>
          <h3 className="text-lg font-bold" style={{ color: '#1C1917' }}>{event.title}</h3>
        </div>
      </div>
      
      <p className="text-sm leading-relaxed mb-1" style={{ color: '#3D3731' }}>{event.description}</p>
      {event.flavor && (
        <p className="text-xs italic mb-4" style={{ color: '#78716C' }}>{event.flavor}</p>
      )}

      {/* Choices */}
      <div className="space-y-3 mt-4">
        {event.choices.map((choice, ci) => {
          const isSelected = selectedChoice === ci;
          
          return (
            <div
              key={ci}
              onClick={() => onChoose(ci)}
              className={`choice-card p-4 ${isSelected ? 'ring-2 ring-amber/40' : ''}`}
              style={isSelected ? { background: 'rgba(184,134,11,0.06)' } : undefined}
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                  isSelected ? 'border-amber bg-amber' : 'border-stone-300'
                }`}>
                  {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1" style={{ color: '#1C1917' }}>{choice.label}</h4>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: '#78716C' }}>{choice.description}</p>
                  
                  {/* Effect preview */}
                  <div className="flex flex-wrap gap-1.5">
                    {choice.effects.slice(0, 5).map((eff, ei) => {
                      const meta = getIndicatorMeta(eff.indicator);
                      if (!meta) return null;
                      const isPositive = (meta.goodDirection === 'up' && eff.delta > 0) ||
                                        (meta.goodDirection === 'down' && eff.delta < 0);
                      const isNeutral = meta.goodDirection === 'neutral';
                      return (
                        <span 
                          key={ei} 
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isNeutral ? 'bg-blue-500/10 text-blue-600' :
                            isPositive ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-600'
                          }`}
                          title={`${meta.name}: ${eff.delta > 0 ? '+' : ''}${eff.delta}${eff.delay > 0 ? ` (in ${eff.delay} turns)` : ''}`}
                        >
                          {meta.emoji} {eff.delta > 0 ? '↑' : '↓'}
                          {eff.delay > 0 && <span className="opacity-60 ml-0.5">⏳{eff.delay}t</span>}
                        </span>
                      );
                    })}
                    {choice.effects.length > 5 && (
                      <span className="text-[10px] text-slate-500">+{choice.effects.length - 5} more</span>
                    )}
                  </div>

                  {/* Humor */}
                  {isSelected && choice.humor && (
                    <p className="text-xs italic mt-2 border-l-2 pl-2" style={{ color: '#B8860B', borderColor: 'rgba(184,134,11,0.3)' }}>
                      {choice.humor}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
