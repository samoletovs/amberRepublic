import type { Rng } from './random';
import { clamp } from './random';

// ─── Latvian Political Parties (based on real 2022 Saeima) ───────
export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
  ideology: string;
  seats: number;
  approval: number;     // 0-100 — public approval
  loyaltyToYou: number; // 0-100 — coalition loyalty (only for coalition partners)
  isPlayer: boolean;
  priorities: string[]; // indicator keys they care about
}

export interface Parliament {
  parties: Party[];
  coalitionPartyIds: string[];
  totalSeats: number;
  nextElectionTurn: number; // turn number when next election happens
  electionHistory: ElectionResult[];
}

export interface ElectionResult {
  turn: number;
  year: number;
  parties: { id: string; name: string; seats: number; pctVote: number }[];
  coalitionFormed: string[];
  won: boolean;
}

// ─── International Ratings ───────────────────────────────────────
export interface InternationalRatings {
  spRating: string;
  moodysRating: string;
  freedomHouse: number;     // 0-100
  transparencyIndex: number; // 0-100 (CPI)
  hdi: number;              // 0-1.000
  pressFredomRank: number;  // 1-180
  doingBusinessRank: number; // 1-190
}

export function createInitialParliament(): Parliament {
  return {
    parties: [
      {
        id: 'jv', name: 'New Unity', shortName: 'JV', color: '#1B75BB',
        ideology: 'Centre-right', seats: 26, approval: 32, loyaltyToYou: 75,
        isPlayer: true, priorities: ['gdpGrowth', 'euStanding', 'foreignInvestment'],
      },
      {
        id: 'zzs', name: 'Greens & Farmers', shortName: 'ZZS', color: '#4CAF50',
        ideology: 'Centre / Agrarian', seats: 16, approval: 22, loyaltyToYou: 60,
        isPlayer: false, priorities: ['greenTransition', 'birthRate', 'healthcareQuality'],
      },
      {
        id: 'pro', name: 'The Progressives', shortName: 'PRO', color: '#9C27B0',
        ideology: 'Social-democratic', seats: 10, approval: 18, loyaltyToYou: 55,
        isPlayer: false, priorities: ['healthcareQuality', 'educationQuality', 'socialCohesion'],
      },
      {
        id: 'na', name: 'National Alliance', shortName: 'NA', color: '#8B0000',
        ideology: 'Right / Nationalist', seats: 13, approval: 16, loyaltyToYou: 30,
        isPlayer: false, priorities: ['nationalIdentity', 'militaryReadiness', 'borderSecurity'],
      },
      {
        id: 'lra', name: 'Latvia First', shortName: 'LPV', color: '#FF5722',
        ideology: 'Populist', seats: 9, approval: 14, loyaltyToYou: 20,
        isPlayer: false, priorities: ['publicHappiness', 'unemployment', 'corruptionLevel'],
      },
      {
        id: 'stab', name: 'Stability!', shortName: 'S!', color: '#607D8B',
        ideology: 'Centre / Pro-Russian', seats: 11, approval: 12, loyaltyToYou: 10,
        isPlayer: false, priorities: ['russianMinorityIntegration', 'socialCohesion', 'russiaRelations'],
      },
      {
        id: 'other', name: 'Others & Independents', shortName: 'Ind', color: '#9E9E9E',
        ideology: 'Mixed', seats: 15, approval: 10, loyaltyToYou: 35,
        isPlayer: false, priorities: ['publicHappiness', 'corruptionLevel'],
      },
    ],
    coalitionPartyIds: ['jv', 'zzs', 'pro'], // Starting coalition: JV+ZZS+PRO = 52 seats
    totalSeats: 100,
    nextElectionTurn: 16, // Election after 4 years (16 quarters)
    electionHistory: [],
  };
}

/** Get total coalition seats */
export function getCoalitionSeats(parliament: Parliament): number {
  return parliament.parties
    .filter(p => parliament.coalitionPartyIds.includes(p.id))
    .reduce((sum, p) => sum + p.seats, 0);
}

/** Get average coalition loyalty */
export function getCoalitionLoyalty(parliament: Parliament): number {
  const partners = parliament.parties.filter(
    p => parliament.coalitionPartyIds.includes(p.id) && !p.isPlayer
  );
  if (partners.length === 0) return 100;
  return Math.round(partners.reduce((s, p) => s + p.loyaltyToYou, 0) / partners.length);
}

/** Update party approval based on indicators */
export function updatePartyApprovals(parliament: Parliament, indicators: Record<string, number>, rng: Rng): Parliament {
  const parties = parliament.parties.map(party => {
    // Each party gains approval when their priority indicators improve
    let approvalDelta = 0;
    
    // General mood affects everyone
    const happiness = indicators.publicHappiness ?? 50;
    approvalDelta += (happiness - 50) * 0.05;
    
    // Coalition parties lose approval when governing (natural fatigue)
    if (parliament.coalitionPartyIds.includes(party.id)) {
      approvalDelta -= 0.3;
    } else {
      // Opposition gains from discontent
      approvalDelta += (50 - happiness) * 0.03;
    }

    // Party-specific priority scoring
    for (const key of party.priorities) {
      const val = indicators[key] ?? 50;
      if (key === 'corruptionLevel') {
        approvalDelta += (50 - val) * 0.02; // Lower corruption = better
      } else {
        approvalDelta += (val - 50) * 0.02;
      }
    }

    approvalDelta = rng.vary(approvalDelta, 0.2);

    // Player party get a small governance bonus
    if (party.isPlayer) {
      approvalDelta += 0.1;
    }

    return {
      ...party,
      approval: clamp(party.approval + approvalDelta, 3, 65),
    };
  });

  return { ...parliament, parties };
}

/** Update coalition loyalty based on whether their priorities are being addressed */
export function updateCoalitionLoyalty(parliament: Parliament, indicators: Record<string, number>, rng: Rng): Parliament {
  const parties = parliament.parties.map(party => {
    if (!parliament.coalitionPartyIds.includes(party.id) || party.isPlayer) return party;

    let loyaltyDelta = 0;
    
    // Check if their priorities are being met
    for (const key of party.priorities) {
      const val = indicators[key] ?? 50;
      if (key === 'corruptionLevel') {
        loyaltyDelta += val < 40 ? 0.5 : -0.5;
      } else {
        loyaltyDelta += val > 50 ? 0.3 : -0.4;
      }
    }

    loyaltyDelta = rng.vary(loyaltyDelta, 0.3);

    return {
      ...party,
      loyaltyToYou: clamp(party.loyaltyToYou + loyaltyDelta, 5, 95),
    };
  });

  return { ...parliament, parties };
}

/** Run an election — returns new parliament configuration */
export function runElection(parliament: Parliament, indicators: Record<string, number>, turn: number, year: number, rng: Rng): { parliament: Parliament; result: ElectionResult } {
  // Calculate vote share based on approval + randomness
  const totalApproval = parliament.parties.reduce((s, p) => s + p.approval, 0);
  
  const results = parliament.parties.map(party => {
    let basePct = (party.approval / totalApproval) * 100;
    basePct = rng.vary(basePct, 0.2);
    basePct = Math.max(2, basePct); // Minimum 2%
    return { id: party.id, name: party.name, pctVote: basePct, seats: 0 };
  });

  // Normalize to 100%
  const totalPct = results.reduce((s, r) => s + r.pctVote, 0);
  results.forEach(r => r.pctVote = (r.pctVote / totalPct) * 100);

  // D'Hondt method (simplified) — convert % to seats
  results.forEach(r => {
    r.seats = r.pctVote >= 5 ? Math.round(r.pctVote) : 0; // 5% threshold
  });
  
  // Ensure total = 100
  const totalSeats = results.reduce((s, r) => s + r.seats, 0);
  if (totalSeats !== 100) {
    const diff = 100 - totalSeats;
    const largest = results.reduce((a, b) => a.pctVote > b.pctVote ? a : b);
    largest.seats += diff;
  }

  // Update party seats
  const newParties = parliament.parties.map(p => {
    const result = results.find(r => r.id === p.id)!;
    return { ...p, seats: result.seats };
  });

  // Can player form a coalition? Try to get to 51+ seats
  const playerParty = newParties.find(p => p.isPlayer)!;
  let coalitionIds = [playerParty.id];
  let coalitionSeats = playerParty.seats;
  
  // Try to form coalition with parties that have loyalty > 30
  const potentialPartners = newParties
    .filter(p => !p.isPlayer && p.loyaltyToYou > 25 && p.seats > 0)
    .sort((a, b) => b.loyaltyToYou - a.loyaltyToYou);

  for (const partner of potentialPartners) {
    if (coalitionSeats >= 51) break;
    coalitionIds.push(partner.id);
    coalitionSeats += partner.seats;
  }

  const won = coalitionSeats >= 51;

  // If can't form coalition, check if still largest and try harder
  if (!won) {
    coalitionIds = [playerParty.id];
    coalitionSeats = playerParty.seats;
    const allPartners = newParties
      .filter(p => !p.isPlayer && p.id !== 'stab' && p.seats > 0) // exclude pro-Russian
      .sort((a, b) => b.seats - a.seats);
    for (const p of allPartners) {
      if (coalitionSeats >= 51) break;
      coalitionIds.push(p.id);
      coalitionSeats += p.seats;
    }
  }

  const finalWon = coalitionSeats >= 51;

  const electionResult: ElectionResult = {
    turn,
    year,
    parties: results.map(r => ({ ...r, pctVote: Math.round(r.pctVote * 10) / 10 })),
    coalitionFormed: finalWon ? coalitionIds : [],
    won: finalWon,
  };

  const newParliament: Parliament = {
    ...parliament,
    parties: newParties,
    coalitionPartyIds: finalWon ? coalitionIds : [],
    nextElectionTurn: turn + 16,
    electionHistory: [...parliament.electionHistory, electionResult],
  };

  return { parliament: newParliament, result: electionResult };
}

/** Calculate international ratings from indicators */
export function calculateRatings(indicators: Record<string, number>): InternationalRatings {
  const { gdp, gdpGrowth, publicDebt, unemployment, _inflation, foreignInvestment,
    corruptionLevel, publicHappiness, educationQuality, healthcareQuality,
    mediaTrust, socialCohesion, population } = indicators;
  void _inflation; // extracted from indicators for potential future use

  // S&P-style: based on debt, growth, investment
  const creditScore = (100 - publicDebt) * 0.3 + gdpGrowth * 5 + foreignInvestment * 0.2 + (100 - unemployment) * 0.1;
  const spRating = creditScore > 75 ? 'A+' : creditScore > 65 ? 'A' : creditScore > 55 ? 'A-' :
    creditScore > 45 ? 'BBB+' : creditScore > 35 ? 'BBB' : creditScore > 25 ? 'BBB-' :
    creditScore > 18 ? 'BB+' : creditScore > 12 ? 'BB' : 'BB-';

  // Moody's equivalent
  const moodysMap: Record<string, string> = { 'A+': 'Aa3', 'A': 'A1', 'A-': 'A3', 'BBB+': 'Baa1', 'BBB': 'Baa2', 'BBB-': 'Baa3', 'BB+': 'Ba1', 'BB': 'Ba2', 'BB-': 'Ba3' };
  const moodysRating = moodysMap[spRating] || 'Ba2';

  // Freedom House: democracy/freedom (0-100)
  const freedomHouse = clamp(
    Math.round(mediaTrust * 0.25 + socialCohesion * 0.2 + (100 - corruptionLevel) * 0.3 + publicHappiness * 0.15 + educationQuality * 0.1),
    20, 95
  );

  // Transparency International CPI (0-100)
  const transparencyIndex = clamp(Math.round(100 - corruptionLevel + (mediaTrust - 50) * 0.2), 15, 90);

  // HDI (0-1)
  const hdi = clamp(
    0.5 + (healthcareQuality / 100) * 0.15 + (educationQuality / 100) * 0.15 + (gdp / (population * 100)) * 0.15 + 0.05,
    0.7, 0.95
  );

  // Press Freedom (rank 1=best, 180=worst)
  const pressFredomRank = clamp(Math.round(180 - mediaTrust * 1.6 - (100 - corruptionLevel) * 0.3), 5, 160);

  // Doing Business (rank 1=best)
  const doingBusinessRank = clamp(Math.round(190 - foreignInvestment * 1.2 - (100 - corruptionLevel) * 0.4 - gdpGrowth * 2), 5, 180);

  return { spRating, moodysRating, freedomHouse, transparencyIndex, hdi: Math.round(hdi * 1000) / 1000, pressFredomRank, doingBusinessRank };
}
