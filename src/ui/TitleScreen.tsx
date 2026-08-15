import { useMemo, useState } from 'react';
import type { HistoricalScenario } from '../engine/latviaData';
import { INDICATORS } from '../engine/indicators';
import type { IndicatorMeta } from '../engine/types';
import { createInitialState } from '../engine/state';
import {
  buildCustomScenarioUrl,
  encodeCustomScenario,
  type CustomScenario,
} from '../engine/scenarioBuilder';

interface Props {
  onStart: (scenario?: HistoricalScenario) => void;
  onStartCustomScenario: (scenario: CustomScenario) => void;
  onQuiz: () => void;
  onTutorial: () => void;
  onReality: () => void;
  onWorkshop: () => void;
  scenarios: HistoricalScenario[];
}

const BUILDER_INDICATORS = [
  'gdpGrowth',
  'unemployment',
  'inflation',
  'publicConfidence',
  'healthcareQuality',
  'corruptionLevel',
  'natoRelations',
  'socialCohesion',
] as const;

const indicatorMeta = BUILDER_INDICATORS
  .map(key => INDICATORS.find(i => i.key === key))
  .filter((meta): meta is IndicatorMeta => Boolean(meta));

export default function TitleScreen({ onStart, onStartCustomScenario, onQuiz, onTutorial, onReality, onWorkshop, scenarios }: Props) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
  const defaultValues = useMemo(() => {
    const initialStateIndicators = createInitialState().indicators;
    return Object.fromEntries(
      indicatorMeta.map(meta => {
        const current = initialStateIndicators[meta.key];
        const fallback = (meta.min + meta.max) / 2;
        const value = typeof current === 'number' ? current : fallback;
        return [meta.key, Number(Math.min(meta.max, Math.max(meta.min, value)).toFixed(1))];
      })
    );
  }, []);

  const [showScenarios, setShowScenarios] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [scenarioName, setScenarioName] = useState('Coalition Experiment');
  const [scenarioYear, setScenarioYear] = useState(currentYear);
  const [scenarioValues, setScenarioValues] = useState<Record<string, number>>(() => defaultValues);
  const [copied, setCopied] = useState(false);

  const indicatorOverrides = useMemo(() => Object.fromEntries(
    Object.entries(scenarioValues)
      .filter(([key, value]) => Math.abs(value - (defaultValues[key] ?? value)) > 0.05)
  ), [scenarioValues, defaultValues]);

  const customScenario: CustomScenario = {
    name: scenarioName.trim() || 'Custom Scenario',
    year: Math.round(scenarioYear),
    indicatorOverrides,
  };

  const encodedScenario = encodeCustomScenario(customScenario);

  const handleCopyShareLink = async () => {
    if (!encodedScenario || !navigator.clipboard) return;
    await navigator.clipboard.writeText(buildCustomScenarioUrl(encodedScenario));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

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
          amber<span style={{ color: '#9E3039' }}>Republic</span>
        </h1>

        <p className="text-base sm:text-lg mb-1 font-light tracking-wide uppercase" style={{ color: '#9E3039', fontFamily: 'Source Sans 3, sans-serif', letterSpacing: '0.15em' }}>
          A Political Simulation
        </p>
        <p className="text-sm mb-8" style={{ color: '#78716C' }}>Latvia, {currentYear} — Win elections to stay in power</p>

        {/* Briefing card */}
        <div className="glass-card p-5 sm:p-6 mb-8 text-left">
          <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(28,25,23,0.08)' }}>
            <span className="text-lg">📋</span>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#B8860B', fontFamily: 'Source Sans 3' }}>
              Situation Briefing — Q{currentQuarter} {currentYear}
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
            onClick={onTutorial}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: 'rgba(184,134,11,0.1)', color: '#B8860B', border: '1px solid rgba(184,134,11,0.25)' }}
            aria-label="Play with interactive tutorial"
          >
            🎓 Play the Tutorial
          </button>
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
            onClick={onWorkshop}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: 'rgba(184,134,11,0.08)', color: '#B8860B', border: '1px solid rgba(184,134,11,0.25)' }}
            aria-label="Decision-Making Workshops"
          >
            🏛️ Policy Workshops
          </button>
          <button
            onClick={() => setShowScenarios(!showScenarios)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: 'rgba(158,48,57,0.08)', color: '#9E3039', border: '1px solid rgba(158,48,57,0.2)' }}
            aria-label="Historical crisis scenarios"
          >
            ⏳ Historical Crisis Mode
          </button>
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: 'rgba(45,106,79,0.1)', color: '#2d6a4f', border: '1px solid rgba(45,106,79,0.25)' }}
            aria-label="Open custom scenario builder"
          >
            🛠️ Interactive Scenario Builder
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

        {showBuilder && (
          <div className="mt-4 fade-in">
            <div className="glass-card p-4 text-left">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#2d6a4f' }}>
                🛠️ Build your own scenario (real data baseline)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <input
                  value={scenarioName}
                  onChange={e => setScenarioName(e.target.value)}
                  className="px-3 py-2 rounded-md text-sm"
                  style={{ background: 'rgba(28,25,23,0.03)', border: '1px solid rgba(28,25,23,0.08)', color: '#1C1917' }}
                  placeholder="Scenario name"
                  maxLength={80}
                  aria-label="Custom scenario name"
                />
                <input
                  type="number"
                  value={scenarioYear}
                  min={1991}
                  max={2100}
                  onChange={e => {
                    const parsed = Number(e.target.value);
                    if (!Number.isFinite(parsed)) {
                      setScenarioYear(currentYear);
                      return;
                    }
                    setScenarioYear(Math.max(1991, Math.min(2100, Math.round(parsed))));
                  }}
                  className="px-3 py-2 rounded-md text-sm"
                  style={{ background: 'rgba(28,25,23,0.03)', border: '1px solid rgba(28,25,23,0.08)', color: '#1C1917' }}
                  aria-label="Custom scenario year"
                />
              </div>

              <div className="space-y-2 mb-4">
                {indicatorMeta.map(meta => (
                  <div key={meta.key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: '#3D3731' }}>{meta.emoji} {meta.name}</span>
                      <span className="font-data" style={{ color: '#1C1917' }}>
                      {scenarioValues[meta.key].toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={meta.min}
                      max={meta.max}
                      step={(meta.max - meta.min) <= 5 ? 0.1 : 1}
                      value={scenarioValues[meta.key]}
                      onChange={e => setScenarioValues(prev => ({
                        ...prev,
                        [meta.key]: Number(e.target.value),
                      }))}
                      className="w-full"
                      aria-label={`Scenario ${meta.name}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => onStartCustomScenario(customScenario)}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: '#2d6a4f', color: '#FFFFFF' }}
                >
                  ▶️ Start this Scenario
                </button>
                <button
                  onClick={handleCopyShareLink}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'rgba(45,106,79,0.1)', color: '#2d6a4f', border: '1px solid rgba(45,106,79,0.25)' }}
                >
                  {copied ? '✅ Copied' : '🔗 Copy Share Link'}
                </button>
              </div>
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
