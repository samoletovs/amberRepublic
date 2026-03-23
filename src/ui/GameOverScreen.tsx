import { GameState } from '../engine/types';
import { INDICATORS, getIndicatorMeta } from '../engine/indicators';
import { createInitialState } from '../engine/state';
import FeedbackButton from './FeedbackButton';

interface Props {
  state: GameState;
  onRestart: () => void;
}

function getGrade(score: number): { grade: string; title: string; description: string; emoji: string } {
  if (score > 180) return { grade: 'S', title: 'Legendary Leader', description: 'Latvia has never been stronger. Songs will be written about your leadership.', emoji: '🏆' };
  if (score > 150) return { grade: 'A', title: 'Excellent Steward', description: 'You left Latvia better than you found it. The dainas will mention your name kindly.', emoji: '🌟' };
  if (score > 120) return { grade: 'B', title: 'Competent Manager', description: 'Not flashy, but solid. Latvia survived your tenure, which is more than most can say.', emoji: '👍' };
  if (score > 90) return { grade: 'C', title: 'Mediocre Performance', description: 'Latvia endured. That\'s about the best thing we can say. The people are... patient.', emoji: '😐' };
  if (score > 60) return { grade: 'D', title: 'Poor Leadership', description: 'Latvia suffered under your watch. The Saeima breathes a collective sigh of relief at your departure.', emoji: '😬' };
  return { grade: 'F', title: 'Catastrophic', description: 'Historians will debate whether you were incompetent or malicious. Either way, Latvia will need time to recover.', emoji: '💀' };
}

export default function GameOverScreen({ state, onRestart }: Props) {
  const grade = getGrade(state.score);
  const initial = createInitialState(state.seed);

  // Calculate key changes
  const changes = INDICATORS.map(ind => ({
    ...ind,
    before: initial.indicators[ind.key] ?? 0,
    after: state.indicators[ind.key] ?? 0,
    diff: (state.indicators[ind.key] ?? 0) - (initial.indicators[ind.key] ?? 0),
  })).filter(c => Math.abs(c.diff) > 0.1)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full fade-in">
        <div className="glass-card p-8 text-center mb-6">
          <div className="text-6xl mb-4">{grade.emoji}</div>
          
          <div className="inline-block px-6 py-2 rounded-xl mb-4" style={{
            background: '#9E3039',
          }}>
            <span className="text-4xl font-black text-white">{grade.grade}</span>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1C1917' }}>{grade.title}</h1>
          <p className="mb-4" style={{ color: '#78716C' }}>{grade.description}</p>
          
          {state.gameOverReason && (
            <div className="glass-card p-4 text-left mb-6" style={{ borderColor: 'rgba(158,48,57,0.15)' }}>
              <p className="text-sm italic leading-relaxed" style={{ color: '#3D3731' }}>{state.gameOverReason}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            <div className="glass-card p-2 sm:p-3">
              <div className="font-data text-xl sm:text-2xl font-bold" style={{ color: '#B8860B' }}>{state.score}</div>
              <div className="text-[10px] sm:text-xs" style={{ color: '#78716C' }}>Final Score</div>
            </div>
            <div className="glass-card p-2 sm:p-3">
              <div className="font-data text-xl sm:text-2xl font-bold" style={{ color: '#1C1917' }}>{state.turn}</div>
              <div className="text-[10px] sm:text-xs" style={{ color: '#78716C' }}>Turns Played</div>
            </div>
            <div className="glass-card p-2 sm:p-3">
              <div className="font-data text-xl sm:text-2xl font-bold" style={{ color: '#1C1917' }}>{state.indicators.population.toFixed(2)}M</div>
              <div className="text-[10px] sm:text-xs" style={{ color: '#78716C' }}>Final Pop</div>
            </div>
          </div>
        </div>

        {/* Key changes */}
        <div className="glass-card p-6 mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#9E3039' }}>
            📊 Your Legacy — Key Changes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {changes.slice(0, 12).map(c => {
              const meta = getIndicatorMeta(c.key);
              if (!meta) return null;
              const isGood = (meta.goodDirection === 'up' && c.diff > 0) || 
                             (meta.goodDirection === 'down' && c.diff < 0);
              const isNeutral = meta.goodDirection === 'neutral';
              return (
                <div key={c.key} className="flex items-center justify-between text-sm p-2 rounded-lg" style={{ background: 'rgba(28,25,23,0.03)' }}>
                  <span className="truncate" style={{ color: '#78716C' }}>{c.emoji} {c.name}</span>
                  <span className={`font-data font-semibold ${
                    isNeutral ? 'text-blue-500' : isGood ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {c.diff > 0 ? '+' : ''}{c.diff.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fun epilogue */}
        <div className="glass-card p-6 mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#9E3039' }}>
            📰 The Headlines
          </h3>
          <div className="space-y-2 text-sm" style={{ color: '#3D3731' }}>
            {state.indicators.population > 1.9 && <p>📰 <i>"Latvia Defies Demographic Doom — Population Actually Growing!"</i></p>}
            {state.indicators.population < 1.5 && <p>📰 <i>"Latvia's Last Citizen: 'Someone Has to Turn Off the Lights'"</i></p>}
            {state.indicators.techSector > 70 && <p>📰 <i>"Silicon Baltic: How Latvia Became Europe's Startup Capital"</i></p>}
            {state.indicators.corruptionLevel < 20 && <p>📰 <i>"Transparency International: Latvia Ranked Cleanest in Eastern Europe"</i></p>}
            {state.indicators.publicHappiness > 75 && <p>📰 <i>"World Happiness Report: Latvia Surprisingly Happy — Experts Baffled"</i></p>}
            {state.indicators.russiaRelations < 10 && <p>📰 <i>"Russian Embassy in Latvia Now Just a Really Nice Building Nobody Visits"</i></p>}
            {state.indicators.greenTransition > 70 && <p>📰 <i>"Latvia: From Soviet Industry to Europe's Green Heart"</i></p>}
            {state.indicators.healthcareQuality > 70 && <p>📰 <i>"Doctors RETURNING to Latvia — A First in Modern History"</i></p>}
            {state.indicators.emigrationRate > 75 && <p>📰 <i>"Dublin, Ireland Now Has More Latvians Than Liepāja"</i></p>}
            {state.indicators.nationalIdentity > 80 && <p>📰 <i>"Latvian Song Festival Breaks Records — 500,000 Attend"</i></p>}
            {state.indicators.gdp > 70 && <p>📰 <i>"Baltic Tiger Roars: Latvia's GDP Nearly Doubles in a Decade"</i></p>}
            {state.indicators.publicDebt > 100 && <p>📰 <i>"IMF Returns to Riga: 'We've Been Here Before,' Says Tired Official"</i></p>}
          </div>
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
            <button
              onClick={onRestart}
              className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 pulse-amber"
              style={{ background: '#9E3039', color: '#FFFFFF' }}
            >
              🔄 Try Again — Latvia Needs You
            </button>
            <FeedbackButton />
          </div>

          <p className="text-xs mt-4" style={{ color: '#A8A29E' }}>
            Every game is different. Can you find a path to the S rank?
          </p>

          <div className="mt-8 text-xs max-w-md mx-auto leading-relaxed" style={{ color: '#78716C' }}>
            <p className="mb-2 font-semibold" style={{ color: '#3D3731' }}>🎯 What This Game Teaches</p>
            <p>Real governance is about trade-offs. There are no perfect choices — only trade-offs 
            between competing goods. The effects of your decisions take quarters or years to manifest. 
            Today's popular choice might be tomorrow's crisis. Latvia's challenges are real: 
            depopulation, brain drain, security threats, and the eternal question of how to be 
            a small country in a world of giants.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
