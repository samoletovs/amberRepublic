import { useState } from 'react';
import { GameState, GameEvent } from '../engine/types';
import { INDICATORS, getIndicatorMeta } from '../engine/indicators';
import IndicatorPanel from './IndicatorPanel';
import EventCard from './EventCard';
import FeedbackButton from './FeedbackButton';

interface Props {
  state: GameState;
  events: GameEvent[];
  decisions: Map<string, number>;
  onMakeChoice: (eventId: string, choiceIndex: number) => void;
  onEndTurn: () => void;
}

const QUARTER_NAMES = ['Q1 Jan-Mar', 'Q2 Apr-Jun', 'Q3 Jul-Sep', 'Q4 Oct-Dec'];

export default function GameScreen({ state, events, decisions, onMakeChoice, onEndTurn }: Props) {
  const allDecisionsMade = events.every(e => decisions.has(e.id));
  const lastRecord = state.history[state.history.length - 1];
  const [showIndicators, setShowIndicators] = useState(false);

  return (
    <div className="min-h-screen p-2 sm:p-3 md:p-6 pb-20">
      {/* Header Bar */}
      <header className="glass-card px-3 sm:px-4 py-2 sm:py-3 mb-3 sm:mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xl sm:text-2xl">🏛️</span>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold truncate" style={{ color: '#D4A843' }}>Amber Republic</h1>
              <p className="text-[10px] sm:text-xs text-slate-400">
                {QUARTER_NAMES[state.quarter - 1]} {state.year} • Turn {state.turn + 1}/40
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-sm shrink-0">
            <div className="text-center">
              <div className="text-amber-gold font-bold text-sm sm:text-lg">{state.score}</div>
              <div className="text-[9px] sm:text-xs text-slate-500">Score</div>
            </div>
            <div className="text-center hidden xs:block">
              <div className="text-slate-200 font-bold text-sm sm:text-lg">{state.indicators.population.toFixed(2)}M</div>
              <div className="text-[9px] sm:text-xs text-slate-500">Pop</div>
            </div>
            <div className="text-center hidden sm:block">
              <div className="text-slate-200 font-bold text-lg">€{state.indicators.gdp.toFixed(1)}B</div>
              <div className="text-xs text-slate-500">GDP</div>
            </div>
            <div className="w-16 sm:w-32 h-1.5 sm:h-2 bg-slate-700 rounded-full overflow-hidden" title="Turns remaining">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${((40 - state.turn) / 40) * 100}%`,
                  background: state.turn > 30 ? '#ef4444' : 'linear-gradient(90deg, #D4A843, #8B6914)',
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile indicators toggle */}
      <button
        onClick={() => setShowIndicators(!showIndicators)}
        className="lg:hidden glass-card px-4 py-2 mb-3 w-full text-left flex items-center justify-between text-sm"
      >
        <span className="text-slate-300">📊 State of the Republic</span>
        <span className="text-slate-500 text-xs">{showIndicators ? '▲ Hide' : '▼ Show'}</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        {/* Left: Indicators */}
        <aside className={`lg:w-80 shrink-0 ${showIndicators ? 'block' : 'hidden lg:block'}`}>
          <IndicatorPanel state={state} />
        </aside>

        {/* Center: Events & Decisions */}
        <main className="flex-1 space-y-4">
          {/* Previous turn narrative */}
          {lastRecord && (
            <div className="glass-card p-4 fade-in">
              <h3 className="text-sm font-semibold text-amber-gold mb-2 uppercase tracking-wider">📜 Last Quarter</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{lastRecord.narrative}</p>
              {/* Show indicator changes */}
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(lastRecord.indicatorsAfter).map(([key, val]) => {
                  const before = lastRecord.indicatorsBefore[key];
                  if (before === undefined) return null;
                  const diff = val - before;
                  if (Math.abs(diff) < 0.01) return null;
                  const meta = getIndicatorMeta(key);
                  if (!meta) return null;
                  const isGood = (meta.goodDirection === 'up' && diff > 0) || 
                                 (meta.goodDirection === 'down' && diff < 0);
                  return (
                    <span key={key} className={`text-xs px-2 py-1 rounded-full ${
                      isGood ? 'bg-green-500/20 text-green-400' : 
                      meta.goodDirection === 'neutral' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {meta.emoji} {meta.name} {diff > 0 ? '↑' : '↓'}{Math.abs(diff).toFixed(1)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current events */}
          <div>
            <h2 className="text-xl font-bold mb-3 text-slate-200">
              🗓️ Decisions for {QUARTER_NAMES[state.quarter - 1]} {state.year}
            </h2>
            {events.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                index={i}
                selectedChoice={decisions.get(event.id)}
                onChoose={(choiceIndex) => onMakeChoice(event.id, choiceIndex)}
              />
            ))}
          </div>

          {/* End Turn Button — sticky on mobile */}
          <div className="text-center py-4" />
        </main>
      </div>

      {/* Fixed bottom bar on mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 z-40 flex items-center justify-center gap-3">
        <FeedbackButton />
        <button
          onClick={onEndTurn}
          disabled={!allDecisionsMade}
          className={`flex-1 max-w-md px-6 py-3 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 ${
            allDecisionsMade 
              ? 'cursor-pointer pulse-amber' 
              : 'opacity-40 cursor-not-allowed'
          }`}
          style={{
            background: allDecisionsMade 
              ? 'linear-gradient(135deg, #D4A843, #8B6914)' 
              : 'rgba(148, 163, 184, 0.2)',
            color: allDecisionsMade ? '#0f172a' : '#94a3b8',
          }}
        >
          {allDecisionsMade ? '⏭️ End Quarter' : `📋 ${events.length - decisions.size} left`}
        </button>
      </div>
    </div>
  );
}
