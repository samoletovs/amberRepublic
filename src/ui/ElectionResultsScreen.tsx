import type { GameState } from '../engine/types';
import type { ElectionResult } from '../engine/politics';
import { getCoalitionSeats } from '../engine/politics';
import { ELECTION_FLAVOR } from '../data';

interface Props {
  state: GameState;
  result: ElectionResult;
  onContinue: () => void;
}

export default function ElectionResultsScreen({ state, result, onContinue }: Props) {
  const coalitionSeats = getCoalitionSeats(state.parliament);
  const termNumber = state.parliament.electionHistory.length;
  const flavor = ELECTION_FLAVOR[termNumber] ?? '';
  const sortedParties = [...result.parties].sort((a, b) => b.seats - a.seats);
  const playerPartyResult = sortedParties.find(p => p.id === 'jv');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full fade-in">
        <div className="glass-card p-6 sm:p-8 text-center">
          {/* Victory header */}
          <div className="text-5xl mb-4">🗳️</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#9E3039' }}>
            Election Results — {result.year}
          </h1>
          <p className="text-sm mb-6" style={{ color: '#78716C' }}>
            {termNumber === 1 ? 'Your first re-election!' : `Term ${termNumber} secured!`}
          </p>

          {/* Results table */}
          <div className="glass-card p-4 mb-4 text-left">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#B8860B' }}>
              Saeima Election Results
            </h3>
            <div className="space-y-2">
              {sortedParties.filter(p => p.seats > 0).map(p => {
                const party = state.parliament.parties.find(pp => pp.id === p.id);
                const isCoalition = result.coalitionFormed.includes(p.id);
                const isPlayer = p.id === 'jv';
                return (
                  <div key={p.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: party?.color ?? '#9E9E9E' }}
                    />
                    <span className="text-sm flex-1 truncate" style={{ color: isPlayer ? '#9E3039' : '#3D3731', fontWeight: isPlayer ? 600 : 400 }}>
                      {p.name}
                      {isCoalition && <span className="text-[10px] ml-1" style={{ color: '#B8860B' }}>coalition</span>}
                    </span>
                    <span className="text-sm font-data font-semibold shrink-0" style={{ color: '#1C1917' }}>
                      {p.seats}
                    </span>
                    <span className="text-xs font-data shrink-0" style={{ color: '#A8A29E' }}>
                      {p.pctVote}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coalition summary */}
          <div className="glass-card p-4 mb-6 text-left">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#B8860B' }}>
              New Coalition
            </h3>
            <p className="text-sm" style={{ color: '#3D3731' }}>
              <span className="font-semibold" style={{ color: '#9E3039' }}>{playerPartyResult?.name ?? 'New Unity'}</span>
              {' leads with '}
              <span className="font-semibold font-data">{coalitionSeats}</span>
              {' coalition seats.'}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {result.coalitionFormed.map(id => {
                const party = state.parliament.parties.find(p => p.id === id);
                return party ? (
                  <span
                    key={id}
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${party.color}15`,
                      border: `1px solid ${party.color}40`,
                      color: party.color,
                    }}
                  >
                    {party.shortName} {party.seats}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Historical flavor */}
          {flavor && (
            <p className="text-sm italic mb-6" style={{ color: '#78716C' }}>
              {flavor}
            </p>
          )}

          {/* Continue button */}
          <button
            onClick={onContinue}
            className="w-full px-6 py-3 rounded-xl font-semibold text-lg transition-all cursor-pointer"
            style={{ background: '#9E3039', color: '#FFFFFF' }}
            aria-label="Continue to next term"
          >
            🏛️ Begin Term {termNumber + 1}
          </button>
        </div>
      </div>
    </div>
  );
}
