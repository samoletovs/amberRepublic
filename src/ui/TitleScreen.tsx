import { useState } from 'react';
import type { HistoricalScenario } from '../engine/latviaData';

interface Props {
  onStart: (scenario?: HistoricalScenario) => void;
  onQuiz: () => void;
  onReality: () => void;
  scenarios: HistoricalScenario[];
}

export default function TitleScreen({ onStart, onQuiz, onReality, scenarios }: Props) {
  const [showScenarios, setShowScenarios] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="text-center max-w-xl w-full fade-in">
        {/* Flag stripe accent */}
        <div className="flex justify-center gap-0 mb-8">
          <div className="w-16 h-1 rounded-full" style={{ background: '#9E3039' }} />
          <div className="w-8 h-1 rounded-full mx-1" style={{ background: '#FFFFFF' }} />
          <div className="w-16 h-1 rounded-full" style={{ background: '#9E3039' }} />
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-3 leading-tight" style={{ color: '#1C1917' }}>
          Amber Republic
        </h1>

        <p className="text-base sm:text-lg mb-1 font-light tracking-wide uppercase" style={{ color: '#9E3039', fontFamily: 'Source Sans 3, sans-serif', letterSpacing: '0.15em' }}>
          A Political Simulation
        </p>
        <p className="text-sm mb-8" style={{ color: '#78716C' }}>Latvia, 2025 — Win elections to stay in power</p>

        {/* Briefing card */}
        <div className="glass-card p-5 sm:p-6 mb-8 text-left">
          <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(28,25,23,0.08)' }}>
            <span className="text-lg">📋</span>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#B8860B', fontFamily: 'Source Sans 3' }}>
              Situation Briefing — Q1 2025
            </h3>
          </div>
          <p className="text-sm leading-relaxed mb-5" style={{ color: '#3D3731' }}>
            Your coalition has just won the Saeima elections. Latvia faces depopulation,
            a frozen border with Russia, crumbling healthcare, and young people leaving
            for Dublin. Win elections every 4 years to stay in power — lose the people's trust and it's game over.
            Every quarter brings new crises and choices.
            International agencies are watching. Your coalition partners are demanding.
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {[
              ['👥', '1.86M', 'Population (declining)'],
              ['💰', '€45B', 'GDP (growing slowly)'],
              ['✈️', '20K/yr', 'Brain drain'],
              ['🏥', '#27/27', 'EU healthcare rank'],
              ['🛡️', '2.5%', 'NATO defense spend'],
              ['🗳️', '52/100', 'Coalition seats'],
            ].map(([emoji, val, label]) => (
              <div key={label} className="flex items-baseline gap-1.5 py-0.5">
                <span>{emoji}</span>
                <span className="font-data font-medium" style={{ color: '#1C1917' }}>{val}</span>
                <span className="text-xs" style={{ color: '#78716C' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onStart()}
          className="w-full sm:w-auto px-10 py-3.5 rounded-lg text-base font-semibold transition-all duration-200 pulse-amber"
          style={{ background: '#9E3039', color: '#FFFFFF' }}
        >
          Begin Your Term in Office
        </button>

        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-3">
          <button
            onClick={onQuiz}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: 'rgba(184,134,11,0.1)', color: '#B8860B', border: '1px solid rgba(184,134,11,0.25)' }}
            aria-label="Play Latvia statistics quiz"
          >
            📊 Viktorīna — Test Your Knowledge
          </button>
          <button
            onClick={onReality}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: 'rgba(45,106,79,0.1)', color: '#2d6a4f', border: '1px solid rgba(45,106,79,0.25)' }}
            aria-label="View live Latvia data dashboard"
          >
            🇱🇻 Latvia Right Now
          </button>
          <button
            onClick={() => setShowScenarios(!showScenarios)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: 'rgba(158,48,57,0.08)', color: '#9E3039', border: '1px solid rgba(158,48,57,0.2)' }}
            aria-label="Historical crisis scenarios"
          >
            ⏳ Historical Crisis Mode
          </button>
        </div>

        {/* Historical Scenarios */}
        {showScenarios && (
          <div className="mt-4 fade-in">
            <div className="glass-card p-4 text-left">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9E3039' }}>
                ⏳ What If You Were PM in...
              </h3>
              <div className="space-y-2">
                {scenarios.map(s => (
                  <button
                    key={s.id}
                    onClick={() => onStart(s)}
                    className="w-full text-left p-3 rounded-lg transition-all duration-200 hover:shadow-sm"
                    style={{ background: 'rgba(28,25,23,0.03)', border: '1px solid rgba(28,25,23,0.06)' }}
                    aria-label={`Start ${s.name} scenario`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{s.emoji}</span>
                      <span className="text-sm font-semibold" style={{ color: '#1C1917' }}>{s.year} — {s.name}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#78716C' }}>{s.challenge}</p>
                  </button>
                ))}
              </div>
              <p className="text-[10px] mt-2 text-center" style={{ color: '#A8A29E' }}>
                Starting conditions from real CSP data for the selected year
              </p>
            </div>
          </div>
        )}

        <p className="text-xs mt-5" style={{ color: '#A8A29E' }}>
          Each turn = 1 quarter · Elections every 4 years · Win to continue, lose = game over
        </p>
      </div>
    </div>
  );
}
