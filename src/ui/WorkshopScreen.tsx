import { useState } from 'react';
import {
  WORKSHOP_SCENARIOS,
  buildWorkshopResult,
  type WorkshopScenario,
  type WorkshopResult,
} from '../engine/workshop';

interface Props {
  onBack: () => void;
  /** When provided, workshop results apply small indicator effects to the game. */
  indicators?: Record<string, number>;
  /** Called with indicator deltas when the player completes a workshop from inside a game. */
  onApplyEffects?: (effects: Array<{ indicator: string; delta: number }>) => void;
}

type Phase = 'menu' | 'briefing' | 'deliberation' | 'vote' | 'result';

export default function WorkshopScreen({ onBack, indicators, onApplyEffects }: Props) {
  const [phase, setPhase] = useState<Phase>('menu');
  const [scenario, setScenario] = useState<WorkshopScenario | null>(null);
  const [activeStakeholder, setActiveStakeholder] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<WorkshopResult | null>(null);
  const [effectsApplied, setEffectsApplied] = useState(false);

  function startScenario(s: WorkshopScenario) {
    setScenario(s);
    setActiveStakeholder(0);
    setSelectedOption(null);
    setResult(null);
    setEffectsApplied(false);
    setPhase('briefing');
  }

  function handleVote() {
    if (!scenario || !selectedOption) return;
    const baseIndicators: Record<string, number> = indicators ?? {
      healthcareQuality: 35,
      socialCohesion: 40,
      digitalInfra: 55,
      publicDebt: 44,
      techSector: 42,
      cyberDefense: 50,
    };
    const res = buildWorkshopResult(scenario, selectedOption, baseIndicators);
    setResult(res);
    setPhase('result');
  }

  function handleApplyEffects() {
    if (!scenario || !selectedOption || !onApplyEffects || effectsApplied) return;
    const option = scenario.options.find(o => o.id === selectedOption);
    if (!option) return;
    onApplyEffects(option.effects);
    setEffectsApplied(true);
  }

  const GRADE_CONFIG: Record<
    WorkshopResult['grade'],
    { emoji: string; color: string }
  > = {
    'Expert Policy Architect': { emoji: '🏛️', color: '#16A34A' },
    'Senior Adviser': { emoji: '📋', color: '#B8860B' },
    'Junior Analyst': { emoji: '📊', color: '#2563EB' },
    Intern: { emoji: '📝', color: '#9E3039' },
  };

  // ─── Menu ────────────────────────────────────────────────────────────────────
  if (phase === 'menu') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full fade-in">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={onBack}
              className="text-sm px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(28,25,23,0.06)', color: '#78716C' }}
              aria-label="Back to menu"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#1C1917' }}>
                🏛️ Decision-Making Workshops
              </h1>
              <p className="text-sm" style={{ color: '#78716C' }}>
                Deliberate real governance dilemmas — competing stakeholders, real trade-offs
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {WORKSHOP_SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => startScenario(s)}
                className="w-full text-left glass-card p-4 transition-all duration-200 hover:shadow-sm"
                style={{ border: '1px solid rgba(28,25,23,0.06)' }}
                aria-label={`Start workshop: ${s.title}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl shrink-0">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold" style={{ color: '#1C1917' }}>
                        {s.title}
                      </h3>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                        style={{ background: 'rgba(184,134,11,0.1)', color: '#B8860B' }}
                      >
                        {s.category}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5 leading-relaxed" style={{ color: '#78716C' }}>
                      {s.subtitle}
                    </p>
                    <p className="text-xs mt-1.5" style={{ color: '#A8A29E' }}>
                      {s.stakeholders.length} stakeholders · {s.options.length} policy options
                    </p>
                  </div>
                  <span className="text-xl shrink-0 mt-0.5" style={{ color: '#9E3039' }}>›</span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-center mt-6" style={{ color: '#A8A29E' }}>
            Each workshop takes ~3 minutes · Your score depends on how well your choice fits the current situation
          </p>
        </div>
      </div>
    );
  }

  if (!scenario) return null;

  // ─── Briefing ────────────────────────────────────────────────────────────────
  if (phase === 'briefing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-xl w-full fade-in">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setPhase('menu')}
              className="text-sm px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(28,25,23,0.06)', color: '#78716C' }}
              aria-label="Back to workshop menu"
            >
              ← Workshops
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{scenario.emoji}</span>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#B8860B' }}>
                  Workshop Briefing
                </p>
                <h2 className="text-base font-bold leading-tight" style={{ color: '#1C1917' }}>
                  {scenario.title}
                </h2>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 mb-4">
            <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid rgba(28,25,23,0.06)' }}>
              <span className="text-lg">📋</span>
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#B8860B' }}>
                Situation Briefing
              </h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#3D3731' }}>
              {scenario.briefing}
            </p>
            <p className="text-xs mt-3 pt-3" style={{ color: '#A8A29E', borderTop: '1px dashed rgba(28,25,23,0.08)' }}>
              Source: {scenario.source}
            </p>
          </div>

          <div className="glass-card p-4 mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9E3039' }}>
              👥 Stakeholders in the room
            </h3>
            <div className="space-y-2">
              {scenario.stakeholders.map(st => (
                <div key={st.id} className="flex items-center gap-2 text-sm">
                  <span className="text-lg shrink-0">{st.emoji}</span>
                  <div>
                    <span className="font-medium" style={{ color: '#1C1917' }}>{st.name}</span>
                    <span className="text-xs ml-1.5" style={{ color: '#78716C' }}>— {st.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setPhase('deliberation')}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#9E3039', color: '#fff' }}
            aria-label="Begin stakeholder deliberation"
          >
            Begin Deliberation →
          </button>
        </div>
      </div>
    );
  }

  // ─── Deliberation ────────────────────────────────────────────────────────────
  if (phase === 'deliberation') {
    const st = scenario.stakeholders[activeStakeholder];
    const isLast = activeStakeholder === scenario.stakeholders.length - 1;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full fade-in" key={activeStakeholder}>
          {/* Progress */}
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setPhase('briefing')}
              className="text-sm px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(28,25,23,0.06)', color: '#78716C' }}
              aria-label="Back to briefing"
            >
              ← Briefing
            </button>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(28,25,23,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((activeStakeholder + 1) / scenario.stakeholders.length) * 100}%`,
                  background: '#9E3039',
                }}
              />
            </div>
            <span className="text-xs font-data shrink-0" style={{ color: '#78716C' }}>
              {activeStakeholder + 1}/{scenario.stakeholders.length}
            </span>
          </div>

          <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: '#B8860B' }}>
            ⚡ Stakeholder Argument
          </div>

          {/* Stakeholder card */}
          <div className="glass-card p-5 mb-4">
            <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(28,25,23,0.06)' }}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                style={{ background: 'rgba(184,134,11,0.1)' }}
              >
                {st.emoji}
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: '#1C1917' }}>{st.name}</div>
                <div className="text-xs" style={{ color: '#78716C' }}>{st.role}</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#3D3731' }}>
              "{st.argument}"
            </p>
          </div>

          {/* Which option they favour */}
          <div
            className="glass-card p-3 mb-4 flex items-center gap-2 text-xs"
            style={{ background: 'rgba(184,134,11,0.04)', border: '1px solid rgba(184,134,11,0.15)' }}
          >
            <span>🗳️</span>
            <span style={{ color: '#78716C' }}>
              Advocates for:{' '}
              <span className="font-semibold" style={{ color: '#B8860B' }}>
                {scenario.options[st.advocatesOption]?.label}
              </span>
            </span>
          </div>

          <button
            onClick={() => {
              if (isLast) {
                setPhase('vote');
              } else {
                setActiveStakeholder(i => i + 1);
              }
            }}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#9E3039', color: '#fff' }}
            aria-label={isLast ? 'Proceed to vote' : 'Hear next stakeholder'}
          >
            {isLast ? 'Proceed to Vote →' : 'Next Stakeholder →'}
          </button>

          {/* Jump to all */}
          {!isLast && (
            <button
              onClick={() => setPhase('vote')}
              className="w-full mt-2 py-2 rounded-xl text-xs transition-all"
              style={{ color: '#A8A29E' }}
              aria-label="Skip remaining stakeholders and vote"
            >
              Skip remaining — go straight to vote
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Vote ─────────────────────────────────────────────────────────────────────
  if (phase === 'vote') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-xl w-full fade-in">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => { setActiveStakeholder(0); setPhase('deliberation'); }}
              className="text-sm px-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'rgba(28,25,23,0.06)', color: '#78716C' }}
              aria-label="Return to stakeholder arguments"
            >
              ← Arguments
            </button>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#9E3039' }}>
                🗳️ Your Policy Vote
              </p>
              <h2 className="text-base font-bold" style={{ color: '#1C1917' }}>{scenario.title}</h2>
            </div>
          </div>

          <p className="text-sm mb-4" style={{ color: '#78716C' }}>
            You have heard the arguments. Choose your policy direction:
          </p>

          <div className="space-y-3 mb-5">
            {scenario.options.map(opt => {
              const isSelected = selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className="w-full text-left p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: isSelected ? 'rgba(158,48,57,0.08)' : 'rgba(255,255,255,0.5)',
                    border: `1.5px solid ${isSelected ? '#9E3039' : 'rgba(28,25,23,0.08)'}`,
                  }}
                  aria-label={`Select policy: ${opt.label}`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center"
                      style={{
                        borderColor: isSelected ? '#9E3039' : 'rgba(28,25,23,0.2)',
                        background: isSelected ? '#9E3039' : 'transparent',
                      }}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-0.5" style={{ color: '#1C1917' }}>
                        {opt.label}
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: '#78716C' }}>
                        {opt.description}
                      </p>
                      {isSelected && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {opt.effects.map(eff => (
                            <span
                              key={eff.indicator}
                              className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{
                                background: eff.delta >= 0 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)',
                                color: eff.delta >= 0 ? '#15803D' : '#DC2626',
                              }}
                            >
                              {eff.indicator} {eff.delta >= 0 ? '↑' : '↓'}{Math.abs(eff.delta)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleVote}
            disabled={!selectedOption}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: selectedOption ? '#9E3039' : 'rgba(28,25,23,0.06)',
              color: selectedOption ? '#fff' : '#78716C',
              cursor: selectedOption ? 'pointer' : 'not-allowed',
            }}
            aria-label="Submit policy vote"
          >
            {selectedOption ? 'Submit Decision →' : 'Select a policy above'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Result ───────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const gradeConf = GRADE_CONFIG[result.grade];
    const chosenOption = scenario.options.find(o => o.id === result.optionId);

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-xl w-full fade-in">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">{gradeConf.emoji}</div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#1C1917' }}>
              {result.grade}
            </h2>
            <p className="font-data text-lg font-bold mb-1" style={{ color: gradeConf.color }}>
              Score: {result.score}/100
            </p>
            <p className="text-sm" style={{ color: '#78716C' }}>{result.feedback}</p>
          </div>

          {/* Chosen policy outcome */}
          {chosenOption && (
            <div className="glass-card p-4 mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#B8860B' }}>
                📜 Projected Outcome — {chosenOption.label}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#3D3731' }}>
                {chosenOption.outcome}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {chosenOption.effects.map(eff => (
                  <span
                    key={eff.indicator}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: eff.delta >= 0 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)',
                      color: eff.delta >= 0 ? '#15803D' : '#DC2626',
                    }}
                  >
                    {eff.indicator} {eff.delta >= 0 ? '+' : ''}{eff.delta}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Compare all options */}
          <div className="glass-card p-4 mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9E3039' }}>
              📊 All Options Compared
            </h3>
            <div className="space-y-2">
              {scenario.options.map(opt => {
                const isChosen = opt.id === result.optionId;
                return (
                  <div
                    key={opt.id}
                    className="flex items-center gap-2 text-xs py-1"
                    style={{ borderBottom: '1px solid rgba(28,25,23,0.05)' }}
                  >
                    <span>{isChosen ? '✅' : '○'}</span>
                    <span
                      className="flex-1 truncate"
                      style={{ color: isChosen ? '#1C1917' : '#78716C', fontWeight: isChosen ? 600 : 400 }}
                    >
                      {opt.label}
                    </span>
                    <span
                      className="font-data shrink-0"
                      style={{ color: isChosen ? gradeConf.color : '#A8A29E' }}
                    >
                      {opt.baseScore}pts base
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Apply effects to game (if in-game) */}
          {onApplyEffects && !effectsApplied && chosenOption && (
            <button
              onClick={handleApplyEffects}
              className="w-full py-2.5 rounded-xl text-sm font-semibold mb-3 transition-all"
              style={{ background: 'rgba(184,134,11,0.12)', color: '#B8860B', border: '1px solid rgba(184,134,11,0.3)' }}
              aria-label="Apply workshop effects to game state"
            >
              ✨ Apply Policy Effects to Game
            </button>
          )}
          {effectsApplied && (
            <div
              className="w-full py-2.5 rounded-xl text-sm text-center mb-3"
              style={{ background: 'rgba(22,163,74,0.08)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.2)' }}
            >
              ✅ Effects applied to your game
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setPhase('menu')}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(28,25,23,0.06)', color: '#3D3731' }}
              aria-label="Back to workshop menu"
            >
              More Workshops
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#9E3039', color: '#fff' }}
              aria-label="Back to main menu"
            >
              ← Back to Game
            </button>
          </div>

          <p className="text-xs text-center mt-4" style={{ color: '#A8A29E' }}>
            Score reflects fit with current Latvia indicators
          </p>
        </div>
      </div>
    );
  }

  return null;
}
