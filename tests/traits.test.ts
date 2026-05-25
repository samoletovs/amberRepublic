import { describe, it, expect } from 'vitest';
import { applyTraitStartBias, applyTraitEffectModifiers, TRAIT_DEFS } from '../src/engine/traits';

describe('traits — president onboarding picks', () => {
  it('defines exactly 6 traits', () => {
    expect(TRAIT_DEFS.length).toBe(6);
  });

  it('every trait has tagline + description', () => {
    for (const t of TRAIT_DEFS) {
      expect(t.tagline.length).toBeGreaterThan(5);
      expect(t.description.length).toBeGreaterThan(20);
    }
  });

  it('applyTraitStartBias shifts indicators for known trait', () => {
    const ind = { euStanding: 50, natoRelations: 50, nationalIdentity: 50, russiaRelations: 50 };
    const next = applyTraitStartBias(ind, ['euroatlanticist']);
    expect(next.euStanding).toBeGreaterThan(ind.euStanding);
    expect(next.natoRelations).toBeGreaterThan(ind.natoRelations);
  });

  it('applyTraitEffectModifiers amplifies economy effects for Technocrat', () => {
    const effect = { indicator: 'gdpGrowth', delta: 1, delay: 0, duration: 0 };
    const modified = applyTraitEffectModifiers(effect, ['technocrat']);
    expect(modified.delta).toBeGreaterThan(effect.delta);
  });

  it('applyTraitEffectModifiers stacks across multiple traits', () => {
    const effect = { indicator: 'militaryReadiness', delta: 1, delay: 0, duration: 0 };
    const onlyNato = applyTraitEffectModifiers(effect, ['natoHawk']);
    const both = applyTraitEffectModifiers(effect, ['natoHawk', 'crisisManager']);
    // Both should at least match NATO multiplier; crisisManager doesn't attenuate non-social
    expect(both.delta).toBeGreaterThanOrEqual(onlyNato.delta * 0.999);
  });
});
