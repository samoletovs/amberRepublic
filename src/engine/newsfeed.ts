import type { GameState, GameEvent } from './types';
import type { Rng } from './random';

/**
 * Procedural Tropico-style newsfeed.
 *
 * Pure function: given the post-resolution state and the decisions, return
 * 3-5 short headlines that comment on the quarter. Zero engine impact —
 * purely flavour, but it transforms the *feel* of every turn.
 *
 * Voice rules (per Tone Bible):
 * - Latvian deadpan + Soviet bureaucratic absurdism + EU memo formality.
 * - Civil servants speak jargon. Citizens speak plainly and grumpily.
 * - Pick on every faction equally.
 * - References: Dublin, Riga, Daugavpils, Liepāja, Latgale, amber, song festivals, "the eternal weather".
 */

interface HeadlineTemplate {
  outlet: string;
  text: string;
}

// Outlet voices — each has a distinct character.
const OUTLET_VOICES = {
  delfi: 'DELFI.lv',
  dienasBizness: 'Dienas Bizness',
  lsm: 'LSM.lv',
  tvnetComment: 'TVNET comments',
  radioJuris: 'Radio 3 — "Juris on the Hour"',
  brusselsMemo: 'Brussels memo',
  diaspora: 'Latvians in Dublin (group chat)',
  rigaCab: 'Riga taxi driver (overheard)',
  pensioner: 'Letter to LR1',
} as const;

type OutletKey = keyof typeof OUTLET_VOICES;

// Decision-reactive headlines. Triggered by indicator deltas.
const REACTIVE_HEADLINES: Array<{
  when: (delta: number, key: string) => boolean;
  templates: Array<[OutletKey, string]>;
}> = [
  // Strong positive economy
  {
    when: (d, k) => k === 'gdp' && d > 0.5,
    templates: [
      ['dienasBizness', 'GDP ticks up again. Cautiously optimistic editorial follows.'],
      ['rigaCab', 'They say the economy is growing. Then why my fare to Mežaparks is the same as Berlin?'],
    ],
  },
  {
    when: (d, k) => k === 'gdp' && d < -0.5,
    templates: [
      ['dienasBizness', 'Quarterly GDP slip prompts the usual ministry statement about "structural headwinds".'],
      ['radioJuris', 'GDP down again. Juris: "I have no idea what GDP is, but it sounds worse than last week."'],
    ],
  },
  // Unemployment
  {
    when: (d, k) => k === 'unemployment' && d < -0.5,
    templates: [
      ['lsm', 'Unemployment falls. Three op-eds debate whether this is real or "definitional".'],
      ['pensioner', '"Finally my grandson got a job. Even if it is in a call centre."'],
    ],
  },
  {
    when: (d, k) => k === 'unemployment' && d > 0.5,
    templates: [
      ['delfi', 'Joblessness rises. State Employment Agency promises "active measures".'],
      ['diaspora', 'New arrivals in Dublin this week. Welcome group chat now at 4,891.'],
    ],
  },
  // Healthcare
  {
    when: (d, k) => k === 'healthcareQuality' && d > 0.5,
    templates: [
      ['lsm', 'Health Ministry announces hospital wait times "improving in pilot regions".'],
      ['pensioner', '"Got a doctor appointment in three weeks instead of three months. Progress!"'],
    ],
  },
  {
    when: (d, k) => k === 'healthcareQuality' && d < -0.5,
    templates: [
      ['delfi', 'Latvia ranks last in EU healthcare again. Health Minister: "We are aware of this."'],
      ['tvnetComment', '"At this rate we will be importing Estonian doctors. Imagine."'],
    ],
  },
  // Emigration
  {
    when: (d, k) => k === 'emigrationRate' && d > 0.5,
    templates: [
      ['diaspora', 'Dublin Latvian community welcomes another shift. Pierogi night at the Liberties pub on Friday.'],
      ['rigaCab', '"My nephew is gone. To Hamburg this time. They keep finding new cities."'],
    ],
  },
  {
    when: (d, k) => k === 'emigrationRate' && d < -0.5,
    templates: [
      ['lsm', 'Return migration numbers tick up. Demographers urge "measured optimism".'],
      ['delfi', 'For the first time in years, more Latvians moved back than left. Cautious champagne in the ministries.'],
    ],
  },
  // Russia relations very low
  {
    when: (d, k) => k === 'russiaRelations' && d < -0.5,
    templates: [
      ['brusselsMemo', 'Council notes "renewed concerns" on the eastern frontier. Translation: more meetings.'],
      ['radioJuris', 'Juris: "Russia is angry. In other news, the sun rose."'],
    ],
  },
  // NATO relations strong
  {
    when: (d, k) => k === 'natoRelations' && d > 0.5,
    templates: [
      ['brusselsMemo', 'Latvia "remains a model member-state on burden-sharing." Polite applause in Brussels.'],
      ['dienasBizness', 'Defence contractors raise quarterly guidance. Coincidence, surely.'],
    ],
  },
  // Tech sector growth
  {
    when: (d, k) => k === 'techSector' && d > 0.5,
    templates: [
      ['dienasBizness', 'Riga startup raises Series B. The founder is 24. We are all the founder is 24.'],
      ['delfi', 'MikroTīkls-adjacent fintech announces 200 jobs. CV pile already at 4,000.'],
    ],
  },
  // Corruption rising
  {
    when: (d, k) => k === 'corruptionLevel' && d > 0.5,
    templates: [
      ['delfi', 'KNAB opens "preliminary inquiries". Translation: a procurement file disappeared again.'],
      ['tvnetComment', '"I am shocked. SHOCKED. To find gambling on these premises."'],
    ],
  },
  // Birth rate moving
  {
    when: (d, k) => k === 'birthRate' && d > 0.5,
    templates: [
      ['pensioner', '"I saw three prams in Vērmanes today. Three! Could be a sign."'],
      ['lsm', 'Birth rate inches up. Demographers: "Statistically irrelevant, but spiritually encouraging."'],
    ],
  },
  // Green transition
  {
    when: (d, k) => k === 'greenTransition' && d > 0.5,
    templates: [
      ['brusselsMemo', 'Latvia "broadly on track" for 2030 targets. The word "broadly" is doing heavy lifting.'],
      ['delfi', 'Another wind farm in Kurzeme. The locals are split: "noise" vs. "income".'],
    ],
  },
  // Public confidence up
  {
    when: (d, k) => k === 'publicConfidence' && d > 1,
    templates: [
      ['radioJuris', '"People feel hopeful," says vox-pop. The cameraman finds three more who disagree."'],
      ['pensioner', '"For once, my newspaper does not make me angry over breakfast."'],
    ],
  },
  // Social strain up
  {
    when: (d, k) => k === 'socialStrain' && d > 1,
    templates: [
      ['tvnetComment', '"500 likes on a meme about the price of milk. Times are not great."'],
      ['rigaCab', '"Everyone is tired. I am tired. The traffic light is tired."'],
    ],
  },
];

// Ambient headlines — fire when state matches but unrelated to deltas.
const AMBIENT_HEADLINES: Array<{
  when: (s: GameState) => boolean;
  templates: Array<[OutletKey, string]>;
}> = [
  {
    when: (s) => s.indicators.publicConfidence > 65 && s.indicators.socialStrain < 35,
    templates: [
      ['lsm', 'A government that survives a full quarter without scandal. Political historians take notes.'],
      ['radioJuris', '"Everyone seems… fine? Suspicious."'],
    ],
  },
  {
    when: (s) => s.indicators.population < 1.6,
    templates: [
      ['delfi', 'Census update: village of Mērsrags now smaller than its WhatsApp group.'],
      ['diaspora', 'Dublin Latvian football tournament: 14 teams. Riga league: 9.'],
    ],
  },
  {
    when: (s) => s.indicators.gdpGrowth > 4,
    templates: [
      ['dienasBizness', 'Economists revise growth forecast upward. They will revise it back down by Q3.'],
    ],
  },
  {
    when: (s) => s.indicators.gdpGrowth < -1,
    templates: [
      ['dienasBizness', 'Recession word now used in headlines. Government prefers "growth correction".'],
    ],
  },
  {
    when: (s) => s.indicators.foreignInvestment > 70,
    templates: [
      ['brusselsMemo', 'Latvia "increasingly attractive to capital." Estonia adds an asterisk.'],
    ],
  },
  {
    when: (s) => s.indicators.corruptionLevel > 60,
    templates: [
      ['delfi', 'KNAB raids three ministries on the same morning. "Coincidence", says spokesperson.'],
    ],
  },
];

// Seasonal flavour — keyed to quarter.
const SEASONAL: Record<number, Array<[OutletKey, string]>> = {
  1: [
    ['rigaCab', '"Winter again. The eternal winter."'],
    ['radioJuris', 'Snowfall report: yes.'],
  ],
  2: [
    ['lsm', 'Song festival rehearsals begin. National identity index rises automatically.'],
    ['delfi', '"Five degrees and the parks are full." — every Latvian, in May.'],
  ],
  3: [
    ['pensioner', '"Mushroom season was good. Politics — less so."'],
    ['radioJuris', 'July traffic on the Jūrmala road: still bad. Some traditions endure.'],
  ],
  4: [
    ['brusselsMemo', 'End-of-year fiscal review. Latvia "comfortably median."'],
    ['rigaCab', '"Dark by 4pm. Spirits low. Coffee strong."'],
  ],
};

function fmt(outlet: OutletKey, text: string): HeadlineTemplate {
  return { outlet: OUTLET_VOICES[outlet], text };
}

/**
 * Generate 3-5 headlines for the quarter. Stable for a given (seed, turn).
 */
export function generateHeadlines(
  state: GameState,
  _decisions: { event: GameEvent; choiceIndex: number }[],
  indicatorsBefore: Record<string, number>,
  rng: Rng,
): string[] {
  const pool: HeadlineTemplate[] = [];

  // 1. Reactive headlines from biggest indicator moves
  const deltas = Object.keys(state.indicators)
    .map(k => ({ key: k, delta: state.indicators[k] - (indicatorsBefore[k] ?? state.indicators[k]) }))
    .filter(d => Math.abs(d.delta) > 0.1)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 6);

  for (const { key, delta } of deltas) {
    for (const rule of REACTIVE_HEADLINES) {
      if (rule.when(delta, key)) {
        const [outlet, text] = rng.pick(rule.templates);
        pool.push(fmt(outlet, text));
        break;
      }
    }
  }

  // 2. Ambient headlines if applicable
  for (const rule of AMBIENT_HEADLINES) {
    if (rule.when(state) && rng.next() < 0.4) {
      const [outlet, text] = rng.pick(rule.templates);
      pool.push(fmt(outlet, text));
    }
  }

  // 3. Seasonal flavour — one per quarter, 50% chance
  const seasonalSet = SEASONAL[state.quarter] ?? [];
  if (seasonalSet.length > 0 && rng.next() < 0.5) {
    const [outlet, text] = rng.pick(seasonalSet);
    pool.push(fmt(outlet, text));
  }

  // 4. Catch-all if pool is empty
  if (pool.length === 0) {
    pool.push(fmt('radioJuris', 'A quiet quarter. Juris: "I do not trust quiet quarters."'));
    pool.push(fmt('rigaCab', '"Everything is fine. That is what worries me."'));
  }

  // Dedupe + cap at 5
  const seen = new Set<string>();
  const final: string[] = [];
  for (const h of pool) {
    const key = `${h.outlet}|${h.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    final.push(`${h.outlet}: ${h.text}`);
    if (final.length >= 5) break;
  }

  // Ensure we always return at least 3 headlines — pad with a deterministic
  // ambient line from the radio commentator.
  const FALLBACKS = [
    'Latvia: still here.',
    'The trams ran. Mostly.',
    'A pothole on Brīvības iela has its own Twitter account now.',
    'A statement is forthcoming. The statement will be measured.',
    'The trade balance moved. Economists nodded.',
    'No protests today. Pundits suspect this is itself suspicious.',
  ];
  let fallbackIdx = 0;
  while (final.length < 3) {
    const text = FALLBACKS[fallbackIdx % FALLBACKS.length];
    fallbackIdx++;
    const line = `${OUTLET_VOICES.radioJuris}: ${text}`;
    if (!seen.has(line)) {
      seen.add(line);
      final.push(line);
    }
    if (fallbackIdx > FALLBACKS.length * 2) break;
  }

  return final;
}
