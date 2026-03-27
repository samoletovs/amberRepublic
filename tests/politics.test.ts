import { describe, it, expect } from 'vitest';
import { createInitialParliament, getCoalitionSeats, getCoalitionLoyalty } from '../src/engine/politics';
import { INDICATORS, getIndicatorMeta } from '../src/engine/indicators';

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
