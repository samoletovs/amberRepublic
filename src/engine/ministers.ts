import type { GameEvent, EventCategory } from './types';
import type { Rng } from './random';
import type { FactionId } from './factions';

/**
 * Cabinet ministers — persistent NPCs with biases.
 *
 * Suzerain-style: ministers have agendas, sometimes give bad advice that
 * serves their interests. Reading their bias becomes a meta-skill.
 *
 * Each minister belongs to a faction (so they "represent" that bloc in
 * cabinet) and has a primary domain. When an event is `highStakes`, the
 * Advisor Debate panel pulls 2-3 ministers whose domains best match the
 * category and shows their character-voiced one-liners.
 */

export type MinisterPortfolio =
  | 'finance'
  | 'foreign'
  | 'defense'
  | 'health'
  | 'interior'
  | 'education';

export interface MinisterDef {
  id: string;
  name: string;
  initials: string;
  portfolio: MinisterPortfolio;
  title: string;
  factionId: FactionId;
  /** Short ideological bias label shown next to their name. */
  biasLabel: string;
  /** Color (inherits faction color in UI). */
  // Lines per event category — picked at random for variety.
  lines: Partial<Record<EventCategory | 'default', string[]>>;
}

export const MINISTERS: MinisterDef[] = [
  {
    id: 'finance-kalnins',
    name: 'Andris Kalniņš',
    initials: 'AK',
    portfolio: 'finance',
    title: 'Minister of Finance',
    factionId: 'entrepreneurs',
    biasLabel: 'Fiscally Conservative',
    lines: {
      economy: [
        '"We can afford this. We always can — by cutting elsewhere."',
        '"The deficit is a feeling, not a number. Mostly."',
        '"Brussels will frown. Brussels frowns at oxygen. Proceed."',
      ],
      society: [
        '"Social spending? Tell me which envelope we are robbing this time."',
        '"Healthcare is a cost centre. I have said this before."',
      ],
      crisis: [
        '"Open the rainy-day fund. This is the rainy day. Probably."',
      ],
      diplomacy: [
        '"Trade with anyone. Money is agnostic about borders."',
      ],
      petition: [
        '"Pensioners voting once is cheaper than pensioners voting twice."',
      ],
      default: [
        '"Has anyone modelled the second-order fiscal impact? No? Of course."',
      ],
    },
  },
  {
    id: 'foreign-lazdins',
    name: 'Pēteris Lazdiņš',
    initials: 'PL',
    portfolio: 'foreign',
    title: 'Minister of Foreign Affairs',
    factionId: 'reformBloc',
    biasLabel: 'Brussels-Aligned',
    lines: {
      diplomacy: [
        '"Brussels has views. They are usually right, and always loud."',
        '"Estonia did this last year. We can do it badly, or do it after them."',
      ],
      security: [
        '"NATO partners are watching. They are always watching."',
        '"A measured response is, by definition, a measured response."',
      ],
      economy: [
        '"This will play well in Berlin. Less well in Warsaw."',
      ],
      crisis: [
        '"Crisis communication first. Substance later."',
      ],
      default: [
        '"It depends entirely on how this lands in the European Council."',
      ],
    },
  },
  {
    id: 'defense-ozolins',
    name: 'Gen. Jānis Ozoliņš (ret.)',
    initials: 'JO',
    portfolio: 'defense',
    title: 'Minister of Defence',
    factionId: 'natoBloc',
    biasLabel: 'NATO Hawk',
    lines: {
      security: [
        '"We trained for this. The exercise scripts also said \'unprecedented\'."',
        '"Three per cent of GDP. That is the floor."',
      ],
      diplomacy: [
        '"Talk if you like. The eastern brigade stays on alert either way."',
      ],
      crisis: [
        '"Calm panic, Premier. We rehearsed this. The press did not."',
      ],
      economy: [
        '"Defence procurement is also industrial policy. Look at Finland."',
      ],
      default: [
        '"Strategic depth, Premier. Always strategic depth."',
      ],
    },
  },
  {
    id: 'health-krumina',
    name: 'Dr. Anna Krūmiņa',
    initials: 'AK',
    portfolio: 'health',
    title: 'Minister of Health & Social Affairs',
    factionId: 'socialDems',
    biasLabel: 'Centre-Left',
    lines: {
      society: [
        '"We are last in the EU. Again. Words stopped helping."',
        '"If we cut transfers we lose half of Latgale by Q4. Please."',
      ],
      economy: [
        '"A healthy workforce is also a workforce. Try and remember that."',
      ],
      crisis: [
        '"The hospital is the first place people look at a government."',
      ],
      petition: [
        '"They are not signing for fun. They are tired."',
      ],
      default: [
        '"Whatever you decide, the queue at Stradiņš grew during this meeting."',
      ],
    },
  },
  {
    id: 'interior-berzins',
    name: 'Māris Bērziņš',
    initials: 'MB',
    portfolio: 'interior',
    title: 'Minister of the Interior',
    factionId: 'identity',
    biasLabel: 'Nationalist-Conservative',
    lines: {
      security: [
        '"Border integrity is identity. The two cannot be separated."',
      ],
      society: [
        '"What we tolerate, we eventually become."',
      ],
      diplomacy: [
        '"Negotiate with Moscow if you must. Do not call it dialogue."',
      ],
      culture: [
        '"The song festival starts at sunrise. We rehearse the country, too."',
      ],
      crisis: [
        '"Order first, Premier. Sympathy after."',
      ],
      default: [
        '"There is a Latvian way to do this. It is usually slower and tidier."',
      ],
    },
  },
  {
    id: 'education-vitola',
    name: 'Dr. Liene Vītola',
    initials: 'LV',
    portfolio: 'education',
    title: 'Minister of Education, Science & Culture',
    factionId: 'reformBloc',
    biasLabel: 'Reform Liberal',
    lines: {
      society: [
        '"Education compounds. So does its neglect."',
      ],
      science: [
        '"R&D is patient money. Patience is in short supply."',
        '"MikroTīkls did not happen by accident. Or by ministry."',
      ],
      economy: [
        '"This will work if the universities are still here in 2032."',
      ],
      culture: [
        '"Culture is also industry. The Estonians figured this out faster."',
      ],
      default: [
        '"A footnote: the constitution requires us to mention universities."',
      ],
    },
  },
];

export function getMinister(id: string): MinisterDef | undefined {
  return MINISTERS.find(m => m.id === id);
}

const CATEGORY_PORTFOLIOS: Record<EventCategory, MinisterPortfolio[]> = {
  economy: ['finance', 'foreign', 'education'],
  security: ['defense', 'foreign', 'interior'],
  society: ['health', 'education', 'interior'],
  diplomacy: ['foreign', 'defense', 'finance'],
  science: ['education', 'finance'],
  crisis: ['defense', 'health', 'interior'],
  environment: ['education', 'finance', 'interior'],
  culture: ['interior', 'education'],
  petition: ['health', 'interior', 'finance'],
};

/**
 * Pick 2-3 ministers for the advisor debate, biased toward event category.
 * Stable for a given (seed, eventId, turn).
 */
export function pickDebatePanel(event: GameEvent, rng: Rng): MinisterDef[] {
  const preferred = CATEGORY_PORTFOLIOS[event.category] ?? ['finance', 'foreign', 'health'];
  const chosen: MinisterDef[] = [];
  for (const port of preferred) {
    const m = MINISTERS.find(x => x.portfolio === port);
    if (m && !chosen.includes(m)) chosen.push(m);
    if (chosen.length >= 3) break;
  }
  // Backfill with random ministers
  if (chosen.length < 2) {
    const remaining = MINISTERS.filter(m => !chosen.includes(m));
    rng.shuffle(remaining);
    for (const m of remaining) {
      chosen.push(m);
      if (chosen.length >= 2) break;
    }
  }
  return chosen.slice(0, 3);
}

/** Pick an in-character line from a minister for the given event. */
export function ministerLineFor(m: MinisterDef, event: GameEvent, rng: Rng): string {
  const pool = m.lines[event.category] ?? m.lines.default ?? ['"No comment."'];
  return rng.pick(pool);
}
