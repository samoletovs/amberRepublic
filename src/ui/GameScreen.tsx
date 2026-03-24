import { useState } from 'react';
import { GameState, GameEvent } from '../engine/types';
import { INDICATORS, getIndicatorMeta } from '../engine/indicators';
import type { AIModel } from '../engine/ai';
import IndicatorPanel from './IndicatorPanel';
import EventCard from './EventCard';
import FeedbackButton from './FeedbackButton';
import RatingsBar from './RatingsBar';
import CoalitionBar from './CoalitionBar';

interface Props {
  state: GameState;
  events: GameEvent[];
  decisions: Map<string, number>;
  onMakeChoice: (eventId: string, choiceIndex: number) => void;
  onEndTurn: () => void;
  aiMode: boolean;
  onToggleAI: () => void;
  aiModels: AIModel[];
  selectedModel?: string;
  onSelectModel: (id: string) => void;
  onCustomResponse: (eventId: string, text: string) => void;
  aiLoading: boolean;
}

const QUARTER_NAMES = ['Q1 Jan-Mar', 'Q2 Apr-Jun', 'Q3 Jul-Sep', 'Q4 Oct-Dec'];

export default function GameScreen({ state, events, decisions, onMakeChoice, onEndTurn, aiMode, onToggleAI, aiModels, selectedModel, onSelectModel, onCustomResponse, aiLoading }: Props) {
  const allDecisionsMade = events.every(e => decisions.has(e.id));
  const lastRecord = state.history[state.history.length - 1];
  const [showIndicators, setShowIndicators] = useState(false);

  return (
    <div className="min-h-screen p-2 sm:p-3 md:p-6 pb-24">
      {/* Header Bar */}
      <header className="glass-card px-3 sm:px-4 py-2 sm:py-3 mb-3 sm:mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xl sm:text-2xl">🏛️</span>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold truncate" style={{ color: '#9E3039' }}>Amber Republic</h1>
              <p className="text-[10px] sm:text-xs" style={{ color: '#78716C' }}>
                {QUARTER_NAMES[state.quarter - 1]} {state.year} • Turn {state.turn + 1}/40
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-sm shrink-0">
            <div className="text-center">
              <div className="font-data font-bold text-sm sm:text-lg" style={{ color: '#B8860B' }}>{state.score}</div>
              <div className="text-[9px] sm:text-xs" style={{ color: '#78716C' }}>Score</div>
            </div>
            <div className="text-center hidden xs:block">
              <div className="font-data font-bold text-sm sm:text-lg" style={{ color: '#1C1917' }}>{state.indicators.population.toFixed(2)}M</div>
              <div className="text-[9px] sm:text-xs" style={{ color: '#78716C' }}>Pop</div>
            </div>
            <div className="text-center hidden sm:block">
              <div className="font-data font-bold text-lg" style={{ color: '#1C1917' }}>€{state.indicators.gdp.toFixed(1)}B</div>
              <div className="text-xs" style={{ color: '#78716C' }}>GDP</div>
            </div>
            <div className="w-16 sm:w-32 h-1.5 sm:h-2 rounded-full overflow-hidden" style={{ background: 'rgba(28,25,23,0.08)' }} title="Turns remaining">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${((40 - state.turn) / 40) * 100}%`,
                  background: state.turn > 30 ? '#DC2626' : '#9E3039',
                }}
              />
            </div>
          </div>
        </div>
        {/* AI Mode Controls */}
        {aiModels.length > 0 && (
          <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid rgba(28,25,23,0.06)' }}>
            <button
              onClick={onToggleAI}
              className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all"
              style={{
                background: aiMode ? 'rgba(184,134,11,0.15)' : 'rgba(28,25,23,0.05)',
                color: aiMode ? '#B8860B' : '#78716C',
                border: `1px solid ${aiMode ? 'rgba(184,134,11,0.3)' : 'rgba(28,25,23,0.1)'}`,
              }}
            >
              {aiMode ? '✨ AI On' : '🎲 Classic'}
            </button>
            {aiMode && (
              <select
                value={selectedModel}
                onChange={e => onSelectModel(e.target.value)}
                className="px-2 py-1 rounded-lg text-[10px] sm:text-xs border"
                style={{ background: 'rgba(28,25,23,0.03)', borderColor: 'rgba(28,25,23,0.1)', color: '#3D3731' }}
              >
                {aiModels.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            )}
            {aiMode && aiLoading && (
              <span className="text-[10px] sm:text-xs" style={{ color: '#B8860B' }}>⏳ AI thinking...</span>
            )}
          </div>
        )}
      </header>

      {/* Mobile indicators toggle */}
      <button
        onClick={() => setShowIndicators(!showIndicators)}
        className="lg:hidden glass-card px-4 py-2 mb-3 w-full text-left flex items-center justify-between text-sm"
      >
        <span style={{ color: '#3D3731' }}>📊 State of the Republic</span>
        <span className="text-xs" style={{ color: '#78716C' }}>{showIndicators ? '▲ Hide' : '▼ Show'}</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        {/* Left: Indicators */}
        <aside className={`lg:w-80 shrink-0 ${showIndicators ? 'block' : 'hidden lg:block'}`}>
          <IndicatorPanel state={state} />
        </aside>

        {/* Center: Events & Decisions */}
        <main className="flex-1 space-y-3">
          {/* Coalition & Ratings */}
          <CoalitionBar parliament={state.parliament} />
          <RatingsBar ratings={state.ratings} />

          {/* Previous turn narrative */}
          {lastRecord && (
            <div className="glass-card p-4 fade-in">
              <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: '#B8860B' }}>📜 Last Quarter</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#3D3731' }}>{lastRecord.narrative}</p>
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
                      isGood ? 'bg-green-500/10 text-green-600' : 
                      meta.goodDirection === 'neutral' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-red-500/10 text-red-500'
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
            <h2 className="text-xl font-bold mb-3" style={{ color: '#1C1917' }}>
              🗓️ Decisions for {QUARTER_NAMES[state.quarter - 1]} {state.year}
            </h2>
            {events.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                index={i}
                selectedChoice={decisions.get(event.id)}
                onChoose={(choiceIndex) => onMakeChoice(event.id, choiceIndex)}
                aiMode={aiMode}
                onCustomResponse={(text) => onCustomResponse(event.id, text)}
                customResponseLoading={aiLoading}
              />
            ))}
          </div>

          {/* End Turn Button — sticky on mobile */}
          <div className="text-center py-4" />
        </main>
      </div>

      {/* Fixed bottom bar on mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 backdrop-blur-md z-40 flex items-center justify-center gap-3" style={{ background: 'rgba(245,240,232,0.92)', borderTop: '1px solid rgba(28,25,23,0.08)' }}>
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
              ? '#9E3039' 
              : 'rgba(28, 25, 23, 0.06)',
            color: allDecisionsMade ? '#FFFFFF' : '#78716C',
          }}
        >
          {allDecisionsMade ? '⏭️ End Quarter' : `📋 ${events.length - decisions.size} left`}
        </button>
      </div>
    </div>
  );
}
