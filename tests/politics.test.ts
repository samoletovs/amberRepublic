import { describe, it, expect } from 'vitest';
import { createInitialParliament, getCoalitionSeats, getCoalitionLoyalty, checkCoalitionStability } from '../src/engine/politics';
import { INDICATORS, getIndicatorMeta } from '../src/engine/indicators';
import { createRng } from '../src/engine/random';

describe('politics — parliament', () => {
  it('creates parliament with 100 total seats', () => {
    const parliament = createInitialParliament();
    const totalSeats = parliament.parties.reduce((sum, p) => sum + p.seats, 0);
    expect(totalSeats).toBe(parliament.totalSeats);
  });

  it('starting coalition has majority (>50 seats)', () => {
    const parliament = createInitialParliament();
    const seats = getCoalitionSeats(parliament);
    expect(seats).toBeGreaterThan(50);
  });

  it('coalition loyalty is reasonable at start', () => {
    const parliament = createInitialParliament();
    const loyalty = getCoalitionLoyalty(parliament);
    expect(loyalty).toBeGreaterThan(40);
    expect(loyalty).toBeLessThan(80);
  });

  it('has one player party', () => {
    const parliament = createInitialParliament();
    const playerParties = parliament.parties.filter(p => p.isPlayer);
    expect(playerParties).toHaveLength(1);
    expect(playerParties[0].id).toBe('jv');
  });

  it('next election is scheduled', () => {
    const parliament = createInitialParliament();
    expect(parliament.nextElectionTurn).toBe(16);
  });
});

describe('indicators — metadata', () => {
  it('all indicators have valid metadata', () => {
    for (const ind of INDICATORS) {
      expect(ind.key).toBeTruthy();
      expect(ind.name).toBeTruthy();
      expect(ind.min).toBeLessThan(ind.max);
      expect(['economy', 'demographics', 'society', 'security', 'innovation']).toContain(ind.category);
      expect(['percent', 'number', 'billions', 'millions', 'index']).toContain(ind.format);
      expect(['up', 'down', 'neutral']).toContain(ind.goodDirection);
    }
  });

  it('getIndicatorMeta returns correct indicator', () => {
    const meta = getIndicatorMeta('gdp');
    expect(meta).toBeDefined();
    expect(meta!.name).toBe('GDP');
  });

  it('getIndicatorMeta returns undefined for unknown key', () => {
    expect(getIndicatorMeta('nonexistent')).toBeUndefined();
  });

  it('has at least 30 indicators', () => {
    expect(INDICATORS.length).toBeGreaterThanOrEqual(30);
  });
});

describe('politics — coalition stability', () => {
  it('stable coalition produces no crises', () => {
    const parliament = createInitialParliament();
    const rng = createRng(42);
    const { crises } = checkCoalitionStability(parliament, rng);
    expect(crises).toHaveLength(0);
  });

  it('partner with loyalty < 10 leaves the coalition', () => {
    const parliament = createInitialParliament();
    // Set one partner's loyalty to very low
    parliament.parties = parliament.parties.map(p =>
      p.id === 'zzs' ? { ...p, loyaltyToYou: 5 } : p
    );
    const rng = createRng(42);
    const { parliament: newParl, crises } = checkCoalitionStability(parliament, rng);
    const leftCrisis = crises.find(c => c.partyId === 'zzs');
    expect(leftCrisis).toBeDefined();
    expect(leftCrisis!.type).toBe('partner_left');
    expect(newParl.coalitionPartyIds).not.toContain('zzs');
  });

  it('coalition collapse when majority cannot be recovered', () => {
    const parliament = createInitialParliament();
    // Set ALL coalition partners' loyalty to near-zero — they all leave
    parliament.parties = parliament.parties.map(p =>
      !p.isPlayer && parliament.coalitionPartyIds.includes(p.id)
        ? { ...p, loyaltyToYou: 3 }
        : { ...p, loyaltyToYou: 5 } // opposition also has no loyalty to recruit from
    );
    const rng = createRng(42);
    const { crises } = checkCoalitionStability(parliament, rng);
    const collapse = crises.find(c => c.type === 'coalition_collapsed');
    expect(collapse).toBeDefined();
  });

  it('player party never leaves the coalition', () => {
    const parliament = createInitialParliament();
    // Player party loyalty is irrelevant — they ARE the player
    const rng = createRng(42);
    const { parliament: newParl } = checkCoalitionStability(parliament, rng);
    expect(newParl.coalitionPartyIds).toContain('jv');
  });
});
