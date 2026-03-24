import { GameState } from '../engine/types';
import type { ElectionResult } from '../engine/politics';

interface Props {
  state: GameState;
  onContinue: () => void;
}

// Historical Latvian election flavor based on term number
const ELECTION_FLAVOR: Record<number, { headline: string; context: string }> = {
  1: {
    headline: 'Saeima Elections',
    context: 'Latvia holds elections every four years. Turnout and coalition arithmetic will determine who governs the next term.',
  },
  2: {
    headline: 'Saeima Elections — Second Term',
    context: 'Governing parties historically face headwinds at re-election. Latvian voters are known for punishing poor economic performance.',
  },
};

export default function ElectionScreen({ state, onContinue }: Props) {
  const result: ElectionResult = state.lastElectionResult!;
  const parliament = state.parliament;
  const termNumber = parliament.electionHistory.length; // already recorded
  const flavor = ELECTION_FLAVOR[termNumber] ?? ELECTION_FLAVOR[1];

  // Sort parties by seats desc for display
  const sortedParties = [...result.parties].sort((a, b) => b.seats - a.seats);

  // Get party colors from parliament state
  const partyColors: Record<string, string> = {};
  for (const p of parliament.parties) {
    partyColors[p.id] = p.color;
  }

  const isVictory = result.won;
  const isFinalVictory = isVictory && state.gameOver;
  const newCoalitionSeats = result.coalitionFormed.reduce((sum, id) => {
    const p = result.parties.find(r => r.id === id);
    return sum + (p?.seats ?? 0);
  }, 0);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-xl w-full fade-in space-y-4">
        {/* Header */}
        <div className="glass-card p-6 text-center">
          <div className="text-4xl mb-3">🗳️</div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#9E3039' }}>
            {result.year} {flavor.headline}
          </h1>
          <p className="text-sm" style={{ color: '#78716C' }}>{flavor.context}</p>
        </div>

        {/* Party Results */}
        <div className="glass-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#B8860B' }}>
            📊 Election Results — 100 Saeima Seats
          </h2>
          <div className="space-y-2">
            {sortedParties.filter(p => p.seats > 0).map(party => {
              const inCoalition = result.coalitionFormed.includes(party.id);
              const color = partyColors[party.id] ?? '#9E9E9E';
              return (
                <div key={party.id} className="flex items-center gap-3">
                  <div className="w-8 text-right font-data text-xs shrink-0" style={{ color: '#78716C' }}>
                    {party.seats}
                  </div>
                  <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: 'rgba(28,25,23,0.06)' }}>
                    <div
                      className="h-full rounded transition-all duration-700"
                      style={{
                        width: `${party.seats}%`,
                        background: color,
                        opacity: inCoalition ? 1 : 0.4,
                      }}
                    />
                  </div>
                  <div className="w-32 flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-medium truncate" style={{ color: inCoalition ? color : '#78716C' }}>
                      {party.name}
                    </span>
                    {inCoalition && (
                      <span className="text-[10px] px-1 rounded" style={{ background: `${color}20`, color }}>✓</span>
                    )}
                  </div>
                  <div className="w-10 text-right font-data text-[11px] shrink-0" style={{ color: '#A8A29E' }}>
                    {party.pctVote.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Majority line legend */}
          <p className="text-[10px] mt-3" style={{ color: '#A8A29E' }}>
            Majority threshold: 51 seats · Coalition highlighted
          </p>
        </div>

        {/* Coalition Result */}
        <div className={`glass-card p-5 ${isVictory ? 'border border-green-500/20' : 'border border-red-500/20'}`}>
          {isVictory ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{isFinalVictory ? '🏆' : '🤝'}</span>
                <h2 className="font-semibold" style={{ color: '#16A34A' }}>
                  {isFinalVictory ? 'Two Terms Complete — Latvia Endures!' : 'Coalition Formed!'}
                </h2>
              </div>
              <p className="text-sm" style={{ color: '#3D3731' }}>
                Your coalition secured <strong>{newCoalitionSeats} seats</strong> — enough to govern for another term.{' '}
                {isFinalVictory
                  ? 'You have successfully led Latvia through two full terms in government.'
                  : 'The next election is in four years. Govern well.'}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">❌</span>
                <h2 className="font-semibold" style={{ color: '#DC2626' }}>Coalition Collapsed</h2>
              </div>
              <p className="text-sm" style={{ color: '#3D3731' }}>
                You could not assemble a working majority. The opposition will form the next government.
              </p>
            </>
          )}
        </div>

        {/* Election history note */}
        {parliament.electionHistory.length > 1 && (
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#B8860B' }}>
              📜 Your Election History
            </h3>
            <div className="space-y-1">
              {parliament.electionHistory.map((hist, i) => (
                <div key={i} className="flex items-center justify-between text-xs" style={{ color: '#78716C' }}>
                  <span>{hist.year} Saeima Elections</span>
                  <span style={{ color: hist.won ? '#16A34A' : '#DC2626' }}>
                    {hist.won ? '✓ Coalition formed' : '✗ Defeated'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center pb-4">
          <button
            onClick={onContinue}
            className="px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 pulse-amber"
            style={{ background: '#9E3039', color: '#FFFFFF' }}
          >
            {isFinalVictory ? '🏁 See Your Legacy' : isVictory ? '▶ Continue to Next Term' : '📋 See Final Results'}
          </button>
        </div>
      </div>
    </div>
  );
}
