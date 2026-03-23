import { GameState } from './types';
import { INDICATORS } from './indicators';

/** Latvia 2025 baseline starting state */
export function createInitialState(seed?: number): GameState {
  const s = seed ?? Math.floor(Math.random() * 2147483647);
  const indicators: Record<string, number> = {
    // Economy — based on real 2024-2025 data
    gdp: 45,             // ~€45B nominal GDP (2024)
    gdpGrowth: 2.4,      // IMF 2025 forecast
    unemployment: 6.8,    // Dec 2024
    inflation: 2.2,       // 2025 forecast
    publicDebt: 44,       // ~44% of GDP
    taxBurden: 38,        // ~38% overall
    foreignInvestment: 48, // Moderate
    energyIndependence: 40, // Still importing gas, but improving w/ wind
    portActivity: 45,     // Reduced after Russia sanctions

    // Demographics — real data
    population: 1.86,     // 1.86M (2025)
    emigrationRate: 55,   // High emigration continues
    birthRate: 25,        // TFR ~1.16, very low
    russianMinorityIntegration: 38, // Ongoing tensions, language shift
    workforceSkill: 52,   // Decent but brain drain hurts

    // Society
    publicHappiness: 45,  // Mid-range
    healthcareQuality: 35, // Worst-ranked in EU historically
    educationQuality: 58, // University system decent
    corruptionLevel: 42,  // CPI 59/100 → inverted
    mediaTrust: 42,       // Mixed, Russian media influence
    nationalIdentity: 62, // Strong but challenged
    socialCohesion: 40,   // Ethnic divide persists

    // Security & Foreign Policy
    natoRelations: 72,    // Strong NATO member, 2.5% GDP defence
    euStanding: 58,       // Solid member, held presidency 2015
    russiaRelations: 12,  // Near-frozen since 2022
    militaryReadiness: 55, // Increasing to 2.5% GDP
    cyberDefense: 50,     // NATO cyber centre cooperation
    borderSecurity: 55,   // Enhanced after Belarus crisis

    // Innovation
    techSector: 42,       // Growing fintech, MikroTik
    rdSpending: 0.7,      // Very low, target 1.5%
    digitalInfra: 55,     // Good e-government
    greenTransition: 40,  // Wind farms planned, hydro base
  };

  // Ensure all indicator keys from metadata exist
  for (const ind of INDICATORS) {
    if (!(ind.key in indicators)) {
      indicators[ind.key] = (ind.min + ind.max) / 2;
    }
  }

  return {
    turn: 0,
    year: 2025,
    quarter: 1,
    indicators,
    scheduledEffects: [],
    history: [],
    gameOver: false,
    score: 0,
    seed: s,
    firedOneTimeEvents: new Set(),
  };
}
