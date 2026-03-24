import type { Parliament } from '../engine/politics';
import { getCoalitionSeats, getCoalitionLoyalty } from '../engine/politics';

interface Props {
  parliament: Parliament;
}

export default function CoalitionBar({ parliament }: Props) {
  const coalitionSeats = getCoalitionSeats(parliament);
  const loyalty = getCoalitionLoyalty(parliament);
  const isStable = coalitionSeats >= 51 && loyalty > 30;

  return (
    <div className="glass-card p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9E3039', fontFamily: 'Source Sans 3' }}>
          🗳️ Saeima — {coalitionSeats}/100 seats
        </h3>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          isStable ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-600'
        }`}>
          {isStable ? 'Stable' : coalitionSeats < 51 ? 'Minority!' : 'Fragile'}
        </span>
      </div>

      {/* Parliament bar */}
      <div className="flex h-4 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(28,25,23,0.04)' }}>
        {parliament.parties
          .filter(p => p.seats > 0)
          .sort((a, b) => {
            const aCoal = parliament.coalitionPartyIds.includes(a.id) ? 0 : 1;
            const bCoal = parliament.coalitionPartyIds.includes(b.id) ? 0 : 1;
            return aCoal - bCoal || b.seats - a.seats;
          })
          .map(party => (
            <div
              key={party.id}
              className="h-full relative group transition-all"
              style={{
                width: `${party.seats}%`,
                background: party.color,
                opacity: parliament.coalitionPartyIds.includes(party.id) ? 1 : 0.35,
              }}
              title={`${party.name}: ${party.seats} seats (${party.approval.toFixed(0)}% approval)`}
            />
          ))}
      </div>

      {/* Majority line — inline with the bar */}
      <div className="relative -mt-4 mb-3 h-0" style={{ pointerEvents: 'none' }}>
        <div className="absolute left-1/2 -top-0.5 flex flex-col items-center" style={{ transform: 'translateX(-50%)' }}>
          <div className="w-px h-3" style={{ background: '#1C1917' }} />
          <span className="text-[8px] font-data mt-0.5" style={{ color: '#78716C' }}>51</span>
        </div>
      </div>

      {/* Coalition parties */}
      <div className="flex flex-wrap gap-1.5">
        {parliament.parties.filter(p => p.seats > 0).map(party => {
          const inCoalition = parliament.coalitionPartyIds.includes(party.id);
          return (
            <div key={party.id} className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
              style={{
                background: inCoalition ? `${party.color}15` : 'rgba(28,25,23,0.03)',
                border: inCoalition ? `1px solid ${party.color}40` : '1px solid transparent',
                color: inCoalition ? party.color : '#78716C',
              }}>
              <span className="font-semibold">{party.shortName}</span>
              <span className="font-data">{party.seats}</span>
              {inCoalition && !party.isPlayer && (
                <span className="ml-0.5" style={{ color: party.loyaltyToYou > 50 ? '#16A34A' : party.loyaltyToYou > 25 ? '#B8860B' : '#DC2626' }}>
                  {party.loyaltyToYou > 50 ? '♥' : party.loyaltyToYou > 25 ? '~' : '⚠'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Next election */}
      {parliament.nextElectionTurn > 0 && (
        <p className="text-[10px] mt-2" style={{ color: '#A8A29E' }}>
          Next election: Q{((parliament.nextElectionTurn % 4) || 4)} {2025 + Math.floor(parliament.nextElectionTurn / 4)}
        </p>
      )}
    </div>
  );
}
