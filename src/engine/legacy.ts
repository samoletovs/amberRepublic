import type { GameState } from './types';
import { getTrait } from './traits';

/**
 * Legacy Report — Suzerain/Frostpunk-style "Was it worth it?" verdict.
 *
 * Pure function. Reads the final state, assigns an archetype label, and
 * generates a multi-paragraph historian's verdict.
 *
 * Tone: a historian writing 30 years after the player's term ended.
 * Latvian deadpan, EU memo formality, no judgement — just patterns.
 */

export interface ArchetypeDef {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
  /** Score function — higher means a better fit. Tie-broken alphabetically. */
  fit: (s: GameState) => number;
}

const ind = (s: GameState, k: string) => s.indicators[k] ?? 50;

export const ARCHETYPES: ArchetypeDef[] = [
  {
    id: 'balticTiger',
    label: 'The Baltic Tiger',
    emoji: '🐯',
    blurb: 'A Premier remembered for sustained growth, healthy budgets, and the smell of new construction. Economists love you. Children may have studied your tenure in school.',
    fit: (s) =>
      (ind(s, 'gdp') > 60 ? 30 : 0) +
      (ind(s, 'gdpGrowth') > 3 ? 20 : 0) +
      (ind(s, 'foreignInvestment') > 60 ? 15 : 0) +
      (ind(s, 'techSector') > 55 ? 10 : 0) -
      (ind(s, 'publicDebt') > 80 ? 25 : 0),
  },
  {
    id: 'brusselsTechnocrat',
    label: 'The Brussels Technocrat',
    emoji: '🇪🇺',
    blurb: 'Quietly competent. Predictably compliant. The country was governed the way an actuarial table is read: line by line. Brussels approved.',
    fit: (s) =>
      (ind(s, 'euStanding') > 65 ? 25 : 0) +
      (ind(s, 'corruptionLevel') < 35 ? 15 : 0) +
      (ind(s, 'foreignInvestment') > 55 ? 10 : 0) +
      (ind(s, 'mediaTrust') > 55 ? 5 : 0) -
      (ind(s, 'publicConfidence') < 40 ? 10 : 0),
  },
  {
    id: 'populistGambler',
    label: 'The Populist Gambler',
    emoji: '🎰',
    blurb: 'A premiership of grand gestures and louder press conferences. Whether it worked depends on which decade you ask, and which voter.',
    fit: (s) =>
      (ind(s, 'publicConfidence') > 60 ? 20 : 0) +
      (ind(s, 'publicDebt') > 70 ? 15 : 0) +
      (ind(s, 'foreignInvestment') < 45 ? 10 : 0) +
      (s.traits.includes('populist') ? 15 : 0),
  },
  {
    id: 'cautiousKeeper',
    label: 'The Cautious Keeper',
    emoji: '🪙',
    blurb: 'A safe pair of hands. Nothing collapsed. Nothing soared. The state apparatus is grateful. So is the bond market.',
    fit: (s) =>
      (Math.abs(ind(s, 'gdpGrowth') - 2.5) < 1.5 ? 20 : 0) +
      (ind(s, 'publicDebt') < 50 ? 15 : 0) +
      (ind(s, 'socialStrain') < 50 ? 10 : 0) +
      (ind(s, 'corruptionLevel') < 45 ? 5 : 0) -
      (ind(s, 'foreignInvestment') > 75 ? 10 : 0),
  },
  {
    id: 'forgottenSteward',
    label: 'The Forgotten Steward',
    emoji: '🍃',
    blurb: 'A Premier whose tenure produced few headlines and fewer regrets. History books require a footnote to find you. The footnote is polite.',
    fit: (s) =>
      (Math.abs(ind(s, 'gdpGrowth') - 1.5) < 1 ? 15 : 0) +
      (ind(s, 'publicConfidence') < 55 && ind(s, 'publicConfidence') > 35 ? 10 : 0) +
      (ind(s, 'socialStrain') < 60 && ind(s, 'socialStrain') > 30 ? 10 : 0),
  },
  {
    id: 'reformer',
    label: 'The Quiet Reformer',
    emoji: '⚖️',
    blurb: 'Institutional change rarely makes the news the day it happens. But the courts, the schools, and the hospitals carry your fingerprints — and citizens, eventually, noticed.',
    fit: (s) =>
      (ind(s, 'corruptionLevel') < 30 ? 20 : 0) +
      (ind(s, 'educationQuality') > 65 ? 15 : 0) +
      (ind(s, 'healthcareQuality') > 60 ? 15 : 0) +
      (ind(s, 'mediaTrust') > 55 ? 5 : 0),
  },
  {
    id: 'natoFortress',
    label: 'The Fortress Builder',
    emoji: '🛡️',
    blurb: 'A Premier who treated the eastern border as a permanent fixture of foreign policy — and budgeted accordingly. Allies took note. So did the General Staff.',
    fit: (s) =>
      (ind(s, 'militaryReadiness') > 70 ? 20 : 0) +
      (ind(s, 'natoRelations') > 80 ? 15 : 0) +
      (ind(s, 'borderSecurity') > 70 ? 10 : 0) +
      (ind(s, 'cyberDefense') > 65 ? 10 : 0) +
      (s.traits.includes('natoHawk') ? 10 : 0),
  },
  {
    id: 'greenPivot',
    label: 'The Green Pivot',
    emoji: '🌿',
    blurb: 'Wind turbines on the Kurzeme coast outlived your government. So did the rebates. So did the gentle EU compliments.',
    fit: (s) =>
      (ind(s, 'greenTransition') > 65 ? 25 : 0) +
      (ind(s, 'energyIndependence') > 60 ? 15 : 0) +
      (ind(s, 'euStanding') > 60 ? 5 : 0),
  },
  {
    id: 'tigerToCub',
    label: 'The Tiger Cub',
    emoji: '🐅',
    blurb: 'The promise was there. The numbers… less so. Tech founders praise you on podcasts. Pensioners praise the previous government.',
    fit: (s) =>
      (ind(s, 'techSector') > 60 && ind(s, 'gdp') < 55 ? 25 : 0) +
      (ind(s, 'foreignInvestment') > 60 ? 10 : 0) -
      (ind(s, 'healthcareQuality') < 40 ? 10 : 0),
  },
  {
    id: 'lostDecade',
    label: 'The Lost Decade',
    emoji: '💀',
    blurb: 'When the country looks back, it does so unwillingly. Your name appears next to a chapter titled, by consensus, "The Mistake."',
    fit: (s) =>
      (ind(s, 'gdp') < 30 ? 30 : 0) +
      (ind(s, 'population') < 1.6 ? 20 : 0) +
      (ind(s, 'publicDebt') > 100 ? 15 : 0) +
      (ind(s, 'publicConfidence') < 25 ? 15 : 0),
  },
  {
    id: 'kingOfTheCoalitions',
    label: 'The Coalition Whisperer',
    emoji: '🤝',
    blurb: 'Your enduring achievement was that the government continued to function. This is not a small thing. It is the only thing seven Latvian Premiers ever managed.',
    fit: (s) =>
      (s.parliament.electionHistory.length >= 2 ? 25 : 0) +
      (s.turn >= 32 ? 15 : 0) +
      (ind(s, 'publicConfidence') > 50 ? 5 : 0),
  },
];

export interface Legacy {
  archetype: ArchetypeDef;
  paragraphs: string[];
  highlights: { label: string; value: string; tone: 'good' | 'bad' | 'neutral' }[];
}

function paragraphOpener(s: GameState): string {
  const startYear = new Date().getFullYear();
  const yrs = s.year - startYear;
  if (yrs <= 1) return `Your tenure was brief — ${yrs <= 0 ? 'less than a year' : 'one short year'}, but historians have made a small industry of asking what went wrong.`;
  if (yrs <= 4) return `Your single term — ${yrs} years — sits in the records as a self-contained episode. The pundits still argue about whether it was a beginning, an interruption, or a warning.`;
  if (yrs <= 8) return `Two terms in office. Long enough to set a direction. Short enough that the next government could change it. They did.`;
  return `${yrs} years at the helm — an unusual longevity in modern Latvian politics. Whether the country grew tired of you, or simply could not imagine an alternative, is a question for the campaign biographers.`;
}

function paragraphTraitFlavor(s: GameState): string {
  const traits = s.traits.map(t => getTrait(t)?.name).filter(Boolean);
  if (traits.length === 0) return '';
  if (traits.length === 1) return `You governed as a ${traits[0]} would: with the strengths and the weaknesses of that disposition.`;
  return `You came to office as a ${traits[0]} and a ${traits[1]}. Cabinet minutes from later years suggest the second label was the more accurate one.`;
}

function paragraphIndicators(s: GameState): string {
  const items: string[] = [];
  if (ind(s, 'gdp') > 60) items.push('the economy grew, in fits and starts, into something modestly proud of itself');
  else if (ind(s, 'gdp') < 30) items.push('the economy did not grow, and the bond markets noticed');
  if (ind(s, 'population') < 1.6) items.push('the demographic curve continued downward, despite three press conferences and a hashtag');
  if (ind(s, 'population') > 1.95) items.push('the demographic decline was, against all forecasts, arrested');
  if (ind(s, 'natoRelations') > 80) items.push('NATO partners listed Latvia as "exemplary" — a word used sparingly in Brussels');
  if (ind(s, 'russiaRelations') < 10) items.push('the eastern border remained, by official terminology, "active"');
  if (ind(s, 'corruptionLevel') < 30) items.push('KNAB earned a reputation for actually catching people');
  if (ind(s, 'corruptionLevel') > 60) items.push('KNAB earned a reputation for opening "preliminary inquiries" that never quite finished');
  if (ind(s, 'techSector') > 60) items.push('Riga\'s startup scene held its own against Tallinn — and on the right Wednesday, beat it');
  if (ind(s, 'greenTransition') > 60) items.push('the wind turbines outlasted the government, as wind turbines tend to');
  if (ind(s, 'healthcareQuality') > 60) items.push('hospitals stopped appearing at the bottom of EU rankings — a generational achievement');
  if (items.length === 0) return 'The indicators moved within tolerances. The country, in the language of the briefings, "trended sideways".';
  return `Under your watch, ${items.slice(0, 4).join('; ')}.`;
}

function paragraphReason(s: GameState): string {
  if (!s.gameOverReason) return 'You left office on your own terms, which is itself a kind of victory in Latvian politics.';
  return `The exit, when it came, was unmistakable: ${s.gameOverReason}`;
}

function paragraphLast(s: GameState, a: ArchetypeDef): string {
  return `History, in its slow way, has settled on a label. ${a.blurb}`;
}

export function generateLegacy(state: GameState): Legacy {
  // Pick best-fitting archetype, deterministically
  const ranked = [...ARCHETYPES]
    .map(a => ({ a, score: a.fit(state) }))
    .sort((x, y) => y.score - x.score || x.a.id.localeCompare(y.a.id));
  const archetype = ranked[0].a;

  const paragraphs = [
    paragraphOpener(state),
    paragraphTraitFlavor(state),
    paragraphIndicators(state),
    paragraphReason(state),
    paragraphLast(state, archetype),
  ].filter(Boolean);

  const i = (k: string) => state.indicators[k] ?? 0;
  const highlights: Legacy['highlights'] = [
    { label: 'Final GDP', value: `€${i('gdp').toFixed(0)}B`, tone: i('gdp') > 60 ? 'good' : i('gdp') < 30 ? 'bad' : 'neutral' },
    { label: 'Population', value: `${i('population').toFixed(2)}M`, tone: i('population') > 1.9 ? 'good' : i('population') < 1.5 ? 'bad' : 'neutral' },
    { label: 'Public Debt', value: `${i('publicDebt').toFixed(0)}%`, tone: i('publicDebt') < 50 ? 'good' : i('publicDebt') > 90 ? 'bad' : 'neutral' },
    { label: 'NATO ties', value: `${i('natoRelations').toFixed(0)}`, tone: i('natoRelations') > 70 ? 'good' : i('natoRelations') < 40 ? 'bad' : 'neutral' },
    { label: 'Confidence', value: `${i('publicConfidence').toFixed(0)}`, tone: i('publicConfidence') > 60 ? 'good' : i('publicConfidence') < 35 ? 'bad' : 'neutral' },
    { label: 'Strain', value: `${i('socialStrain').toFixed(0)}`, tone: i('socialStrain') < 40 ? 'good' : i('socialStrain') > 65 ? 'bad' : 'neutral' },
  ];

  return { archetype, paragraphs, highlights };
}
