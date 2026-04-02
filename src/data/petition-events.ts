import type { GameEvent } from '../engine/types';

/**
 * Citizen petition events — seeded from real data.gov.lv petitions.
 * Real petition data: https://data.gov.lv/dati/lv/dataset/parakstisanas-par-veletaju-iniciativam
 *
 * In Latvia, citizen initiatives need 154,241 signatures (1/10 of electorate)
 * to trigger a national referendum. Collection period is 12 months.
 */
export const petitionEvents: GameEvent[] = [
  {
    id: 'petition_family_definition',
    title: '📜 Petition: Redefine "Family" in Constitution',
    description: 'A citizen initiative to amend the Satversme (Constitution) with a specific definition of family has gathered momentum. Conservative groups are enthusiastically collecting signatures, while progressive organizations call it exclusionary.',
    preconditions: [],
    category: 'petition',
    weight: 10,
    oneTime: true,
    flavor: 'Half the cabinet quietly checks which side their voters are on before forming an opinion.',
    choices: [
      {
        label: 'Support the petition publicly',
        description: 'Endorse the conservative definition. Rally your base but alienate progressive coalition partners and draw EU criticism.',
        effects: [
          { indicator: 'nationalIdentity', delta: 6, delay: 0, duration: 0 },
          { indicator: 'socialCohesion', delta: -5, delay: 1, duration: 4 },
          { indicator: 'euStanding', delta: -3, delay: 2, duration: 0 },
          { indicator: 'publicHappiness', delta: 2, delay: 0, duration: 0 },
        ],
        humor: 'The EU sends a "concerned" letter. Latvia files it next to the other 47.',
      },
      {
        label: 'Oppose the petition',
        description: 'Take a progressive stance against the amendment. Win EU approval but risk conservative backlash.',
        effects: [
          { indicator: 'euStanding', delta: 4, delay: 1, duration: 0 },
          { indicator: 'socialCohesion', delta: 3, delay: 2, duration: 0 },
          { indicator: 'nationalIdentity', delta: -3, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: -2, delay: 0, duration: 0 },
        ],
        humor: 'Conservative talk shows discover a new favorite topic for the next six months.',
      },
      {
        label: 'Stay neutral — "let the people decide"',
        description: 'Acknowledge the democratic process without taking a position. Safe but seen as weak leadership.',
        effects: [
          { indicator: 'mediaTrust', delta: -2, delay: 1, duration: 0 },
          { indicator: 'corruptionLevel', delta: 1, delay: 0, duration: 0 },
        ],
        humor: '"No comment" becomes the government\'s most-used phrase. Journalists start a drinking game.',
      },
    ],
  },

  {
    id: 'petition_saeima_recall',
    title: '📜 Petition: Dissolve the Saeima!',
    description: 'Citizens have launched an initiative to recall the Parliament. Over 10,000 signatures collected so far, but 154,241 are needed. Public frustration with the political establishment is boiling over — this petition is a thermometer of democratic discontent.',
    preconditions: [{ indicator: 'publicHappiness', op: '<', value: 45 }],
    category: 'petition',
    weight: 9,
    oneTime: false,
    flavor: 'The Saeima cafeteria reports a sudden drop in appetite among MPs.',
    choices: [
      {
        label: 'Address the grievances head-on',
        description: 'Announce emergency reforms: anti-corruption measures, transparency laws, town halls. Show the government is listening.',
        effects: [
          { indicator: 'publicHappiness', delta: 6, delay: 1, duration: 4 },
          { indicator: 'corruptionLevel', delta: -4, delay: 2, duration: 0 },
          { indicator: 'mediaTrust', delta: 3, delay: 1, duration: 0 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
        ],
        humor: 'The PM does a "listening tour." First stop: a bar in Liepāja that\'s been complaining since 1991.',
      },
      {
        label: 'Dismiss the petition publicly',
        description: 'Call it populism and defend the parliamentary system. Risks looking out of touch.',
        effects: [
          { indicator: 'publicHappiness', delta: -4, delay: 0, duration: 0 },
          { indicator: 'mediaTrust', delta: -3, delay: 0, duration: 0 },
          { indicator: 'nationalIdentity', delta: 2, delay: 0, duration: 0 },
        ],
        humor: '"The system works perfectly," says the PM, while approval ratings suggest otherwise.',
      },
      {
        label: 'Propose constitutional reform instead',
        description: 'Channel the energy into constructive reform — lower the referendum threshold, introduce citizen assemblies. Co-opt the movement.',
        effects: [
          { indicator: 'publicHappiness', delta: 3, delay: 2, duration: 0 },
          { indicator: 'socialCohesion', delta: 4, delay: 3, duration: 6 },
          { indicator: 'mediaTrust', delta: 4, delay: 2, duration: 0 },
          { indicator: 'corruptionLevel', delta: -2, delay: 4, duration: 0 },
        ],
        humor: 'The petition organizers are confused that someone actually listened. They need a moment.',
      },
    ],
  },

  {
    id: 'petition_referendum_law',
    title: '📜 Petition: Restore Referendum Rights',
    description: 'A citizen initiative demands repealing the 2012 changes that made it harder to trigger referendums. Only 60 signatures collected so far — but the principle of direct democracy has strong supporters across the political spectrum.',
    preconditions: [],
    category: 'petition',
    weight: 9,
    oneTime: true,
    flavor: 'The irony of needing 154,241 signatures to make it easier to collect signatures is not lost on anyone.',
    choices: [
      {
        label: 'Champion direct democracy',
        description: 'Support lowering thresholds. Makes government more accountable but creates instability risk from frequent referendums.',
        effects: [
          { indicator: 'publicHappiness', delta: 5, delay: 1, duration: 0 },
          { indicator: 'socialCohesion', delta: 3, delay: 2, duration: 0 },
          { indicator: 'mediaTrust', delta: 3, delay: 1, duration: 0 },
          { indicator: 'foreignInvestment', delta: -2, delay: 3, duration: 4 },
        ],
        humor: 'Switzerland sends a congratulatory card. And a warning.',
      },
      {
        label: 'Defend the current system',
        description: 'Argue the 2012 changes prevent populist abuse. Stable but reinforces the perception of an elite-controlled system.',
        effects: [
          { indicator: 'foreignInvestment', delta: 2, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: -2, delay: 0, duration: 0 },
          { indicator: 'corruptionLevel', delta: 1, delay: 0, duration: 0 },
        ],
        humor: '"We must protect democracy from too much democracy," explains a spokesman, without irony.',
      },
      {
        label: 'Propose a compromise: digital referendums',
        description: 'Keep the high threshold but make signing and voting digital. Modernize the process. Tech sector loves it.',
        effects: [
          { indicator: 'digitalInfra', delta: 4, delay: 2, duration: 0 },
          { indicator: 'techSector', delta: 3, delay: 3, duration: 0 },
          { indicator: 'publicHappiness', delta: 3, delay: 2, duration: 0 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
        ],
        humor: 'Estonia calls: "Welcome to 2007. We\'ve been waiting."',
      },
    ],
  },

  {
    id: 'petition_property_rights',
    title: '📜 Petition: Constitutional Property Protections',
    description: 'Over 2,200 citizens have signed an initiative to amend the Satversme regarding property objects. The debate centers on forced land sales, historical property restitution, and the balance between individual and public interest.',
    preconditions: [],
    category: 'petition',
    weight: 9,
    oneTime: true,
    flavor: 'Latvian property law is so complex, even the lawyers who wrote it need lawyers to explain it.',
    choices: [
      {
        label: 'Support stronger property rights',
        description: 'Back constitutional property protections. Boost investor confidence and address citizen concerns, but limit government flexibility.',
        effects: [
          { indicator: 'foreignInvestment', delta: 5, delay: 2, duration: 6 },
          { indicator: 'publicHappiness', delta: 4, delay: 1, duration: 0 },
          { indicator: 'socialCohesion', delta: 2, delay: 2, duration: 0 },
          { indicator: 'taxBurden', delta: -1, delay: 3, duration: 0 },
        ],
        humor: 'Real estate agents spontaneously start humming the national anthem.',
      },
      {
        label: 'Oppose — government needs flexibility',
        description: 'Argue that rigid property rules would prevent infrastructure projects and urban development. Pragmatic but unpopular.',
        effects: [
          { indicator: 'publicHappiness', delta: -3, delay: 0, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.3, delay: 2, duration: 4 },
          { indicator: 'foreignInvestment', delta: -2, delay: 1, duration: 0 },
        ],
        humor: '"Trust us with your property," says the government. Citizens check their deed paperwork.',
      },
      {
        label: 'Commission an expert review',
        description: 'Delay with a thorough constitutional review. Buys time, seems responsible, but frustrated petitioners may escalate.',
        effects: [
          { indicator: 'mediaTrust', delta: -1, delay: 1, duration: 0 },
          { indicator: 'corruptionLevel', delta: -1, delay: 3, duration: 0 },
          { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 0 },
        ],
        humor: 'The review committee schedules its first meeting for "sometime next year, probably."',
      },
    ],
  },

  {
    id: 'petition_climate_action',
    title: '📜 Petition: Declare Climate Emergency',
    description: 'Environmental activists have launched a citizen initiative demanding Latvia declare a climate emergency and commit to carbon neutrality by 2035 — five years ahead of the EU target. Young voters are energized, but industry lobbies are alarmed.',
    preconditions: [],
    category: 'petition',
    weight: 8,
    oneTime: true,
    flavor: 'The petition was submitted digitally, printed on recycled paper, and delivered by bike. Then someone flew to Brussels to present it.',
    choices: [
      {
        label: 'Declare the climate emergency',
        description: 'Bold leadership. Massive green investment, but economic disruption for traditional industries.',
        effects: [
          { indicator: 'greenTransition', delta: 10, delay: 1, duration: 0 },
          { indicator: 'euStanding', delta: 5, delay: 2, duration: 0 },
          { indicator: 'gdpGrowth', delta: -0.5, delay: 1, duration: 4 },
          { indicator: 'foreignInvestment', delta: 4, delay: 3, duration: 6 },
          { indicator: 'publicHappiness', delta: 2, delay: 0, duration: 0 },
          { indicator: 'energyIndependence', delta: 5, delay: 4, duration: 0 },
        ],
        humor: 'Latvia becomes the greenest country in the Baltics. Estonia is visibly annoyed.',
      },
      {
        label: 'Stick to the EU 2040 timeline',
        description: 'Pragmatic approach. Meet existing commitments without overcommitting. Boring but responsible.',
        effects: [
          { indicator: 'gdpGrowth', delta: 0.2, delay: 0, duration: 0 },
          { indicator: 'publicHappiness', delta: -2, delay: 1, duration: 0 },
          { indicator: 'greenTransition', delta: 2, delay: 2, duration: 0 },
        ],
        humor: '"We\'re ambitious, just not THAT ambitious," the environment minister clarifies.',
      },
      {
        label: 'Counter-propose: Green Innovation Fund',
        description: 'Instead of declaring emergency, create a €500M fund for green tech startups. Capture the energy without the panic.',
        effects: [
          { indicator: 'techSector', delta: 5, delay: 2, duration: 6 },
          { indicator: 'greenTransition', delta: 5, delay: 3, duration: 0 },
          { indicator: 'rdSpending', delta: 4, delay: 1, duration: 0 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
          { indicator: 'foreignInvestment', delta: 3, delay: 3, duration: 0 },
        ],
        humor: 'Every startup in Riga adds "green" to their pitch deck overnight.',
      },
    ],
  },

  {
    id: 'petition_russian_schools',
    title: '📜 Petition: Preserve Minority Language Education',
    description: 'Following the 2025 transition to Latvian-only public education, Russian-speaking communities have launched a petition demanding exceptions for minority schools. The initiative touches the deepest nerve in Latvian politics — language, identity, and integration.',
    preconditions: [{ indicator: 'russianMinorityIntegration', op: '<', value: 60 }],
    category: 'petition',
    weight: 10,
    oneTime: true,
    flavor: 'This topic has been "resolved" by every government since 1991. It has never actually been resolved.',
    choices: [
      {
        label: 'Maintain the Latvian-only policy',
        description: 'Stay the course on full integration. Strengthens national identity but deepens the divide with Russian-speaking communities.',
        effects: [
          { indicator: 'nationalIdentity', delta: 5, delay: 0, duration: 0 },
          { indicator: 'russianMinorityIntegration', delta: -6, delay: 1, duration: 6 },
          { indicator: 'socialCohesion', delta: -4, delay: 1, duration: 4 },
          { indicator: 'euStanding', delta: -2, delay: 2, duration: 0 },
          { indicator: 'educationQuality', delta: 2, delay: 3, duration: 0 },
        ],
        humor: 'Google Translate usage in Daugavpils hits an all-time high.',
      },
      {
        label: 'Allow transitional bilingual support',
        description: 'Compromise: Latvian as primary language but permit supplementary minority-language materials for 5 years.',
        effects: [
          { indicator: 'russianMinorityIntegration', delta: 5, delay: 2, duration: 0 },
          { indicator: 'socialCohesion', delta: 4, delay: 2, duration: 0 },
          { indicator: 'nationalIdentity', delta: -3, delay: 1, duration: 0 },
          { indicator: 'educationQuality', delta: 3, delay: 3, duration: 0 },
        ],
        humor: 'Both sides are equally unhappy, which in Latvia counts as a successful compromise.',
      },
      {
        label: 'Invest in intensive Latvian language programs',
        description: 'Keep the policy but massively fund Latvian language courses, tutoring, and integration programs. Expensive but addresses the root cause.',
        effects: [
          { indicator: 'russianMinorityIntegration', delta: 7, delay: 4, duration: 8 },
          { indicator: 'educationQuality', delta: 5, delay: 3, duration: 0 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
          { indicator: 'workforceSkill', delta: 3, delay: 5, duration: 0 },
          { indicator: 'socialCohesion', delta: 2, delay: 4, duration: 0 },
        ],
        humor: '"Sveiki!" becomes the most-enrolled course in Latgale since "How to Grow Potatoes."',
      },
    ],
  },
];
