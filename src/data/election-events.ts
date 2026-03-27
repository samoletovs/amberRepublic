import { GameEvent } from '../engine/types';

/**
 * Election-cycle events — fire during campaign season (3 quarters before election)
 * and during coalition negotiations. Based on real Latvian electoral patterns.
 *
 * These events use the 'campaign' precondition hack: they require indicators
 * that are only true during campaign season (checked via the engine).
 * We use a special `campaignSeason` virtual indicator set by the turn engine.
 */

export const electionCampaignEvents: GameEvent[] = [
  // ── PRE-CAMPAIGN (3 quarters before election) ────────────
  {
    id: 'election_poll_shock',
    title: '📊 Election Polls: Shock Numbers',
    description: 'The latest SKDS poll drops like a bomb. Your party has slipped — opposition parties are surging on anti-establishment sentiment. Campaign strategists are panicking. Do you change course or stay steady?',
    preconditions: [{ indicator: 'campaignSeason', op: '>=', value: 1 }],
    category: 'society', weight: 12, oneTime: false,
    choices: [
      {
        label: 'Populist pivot — promise tax cuts',
        description: 'Abandon fiscal discipline. Promise lower taxes before the election.',
        effects: [
          { indicator: 'publicHappiness', delta: 5, delay: 0, duration: 4 },
          { indicator: 'publicDebt', delta: 2, delay: 1, duration: 0 },
          { indicator: 'euStanding', delta: -2, delay: 1, duration: 0 },
        ],
        humor: 'Your finance minister just aged fifteen years.',
      },
      {
        label: 'Stay the course — trust your record',
        description: 'Campaign on your achievements. Let the results speak for themselves.',
        effects: [
          { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 2 },
          { indicator: 'foreignInvestment', delta: 2, delay: 1, duration: 0 },
        ],
        humor: '"Steady leadership" sounds noble. Polling teams call it "boring."',
      },
      {
        label: 'Attack the opposition — negative campaign',
        description: 'Dig up dirt on opposition leaders. Latvian politics gets ugly.',
        effects: [
          { indicator: 'mediaTrust', delta: -3, delay: 0, duration: 4 },
          { indicator: 'socialCohesion', delta: -2, delay: 0, duration: 4 },
          { indicator: 'publicHappiness', delta: 2, delay: 0, duration: 2 },
        ],
        humor: 'The tabloid headlines write themselves. Your mother is disappointed.',
      },
    ],
  },
  {
    id: 'election_coalition_demand',
    title: '🤝 Coalition Partner Demands',
    description: 'Your coalition partners sense the election approaching and are making demands. The Greens & Farmers want massive agricultural subsidies. The Progressives want a healthcare overhaul. Both threaten to break the coalition if ignored.',
    preconditions: [{ indicator: 'campaignSeason', op: '>=', value: 1 }],
    category: 'economy', weight: 10, oneTime: false,
    choices: [
      {
        label: 'Satisfy the Greens — rural subsidies',
        description: 'Redirect EU structural funds to agriculture. Rural voters matter.',
        effects: [
          { indicator: 'publicHappiness', delta: 3, delay: 0, duration: 3 },
          { indicator: 'greenTransition', delta: 3, delay: 1, duration: 0 },
          { indicator: 'publicDebt', delta: 1.5, delay: 0, duration: 0 },
          { indicator: 'healthcareQuality', delta: -2, delay: 1, duration: 0 },
        ],
        humor: 'Latvian cows are once again a political constituency.',
      },
      {
        label: 'Satisfy the Progressives — healthcare reform',
        description: 'Launch an emergency healthcare modernization program.',
        effects: [
          { indicator: 'healthcareQuality', delta: 5, delay: 1, duration: 0 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
          { indicator: 'publicHappiness', delta: 2, delay: 1, duration: 3 },
        ],
        humor: 'Waiting times at hospitals drop. Doctors are suspicious this won\'t last past the election.',
      },
      {
        label: 'Refuse both — assert leadership',
        description: 'Tell partners to respect the coalition agreement. Risk a split.',
        effects: [
          { indicator: 'publicHappiness', delta: -2, delay: 0, duration: 3 },
          { indicator: 'foreignInvestment', delta: 2, delay: 1, duration: 0 },
        ],
        humor: 'Your coalition partners are posting passive-aggressive tweets.',
      },
    ],
  },
  {
    id: 'election_media_debate',
    title: '📺 The Great TV Debate',
    description: 'LTV is hosting the pre-election leaders\' debate. Every party leader will be on stage. Your preparation team says you need a strategy: play safe, or go for a memorable moment?',
    preconditions: [{ indicator: 'campaignSeason', op: '>=', value: 2 }],
    category: 'society', weight: 15, oneTime: true,
    choices: [
      {
        label: 'Statesmanlike performance',
        description: 'Focus on data, achievements, and vision. Be the adult in the room.',
        effects: [
          { indicator: 'mediaTrust', delta: 2, delay: 0, duration: 3 },
          { indicator: 'euStanding', delta: 1, delay: 0, duration: 0 },
          { indicator: 'foreignInvestment', delta: 1, delay: 0, duration: 0 },
        ],
        humor: 'Political analysts praise your composure. Twitter calls you a robot.',
      },
      {
        label: 'Emotional appeal — invoke Latvian identity',
        description: 'Talk about your grandmother, the Song Festival, and birch forests.',
        effects: [
          { indicator: 'nationalIdentity', delta: 3, delay: 0, duration: 3 },
          { indicator: 'publicHappiness', delta: 3, delay: 0, duration: 2 },
          { indicator: 'russianMinorityIntegration', delta: -1, delay: 0, duration: 0 },
        ],
        humor: 'You shed a single tear talking about midsummer. It goes viral.',
      },
      {
        label: 'Bold promise — "Latvia in EU Top 15 by 2035"',
        description: 'Set an ambitious national target. Risky if you can\'t deliver.',
        effects: [
          { indicator: 'publicHappiness', delta: 4, delay: 0, duration: 3 },
          { indicator: 'euStanding', delta: 2, delay: 0, duration: 0 },
          { indicator: 'foreignInvestment', delta: 3, delay: 1, duration: 4 },
        ],
        humor: 'The promise is trending. Your economic advisors are stress-eating.',
      },
    ],
  },
  {
    id: 'election_diaspora_vote',
    title: '✈️ Diaspora Voting Drive',
    description: 'Over 300,000 Latvians live abroad — mostly in the UK, Ireland, and Germany. Their votes could swing the election. Should you court them with promises of return incentives?',
    preconditions: [
      { indicator: 'campaignSeason', op: '>=', value: 1 },
      { indicator: 'emigrationRate', op: '>', value: 40 },
    ],
    category: 'society', weight: 8, oneTime: true,
    choices: [
      {
        label: 'Return incentive program',
        description: 'Tax breaks, housing support, and job guarantees for returning Latvians.',
        effects: [
          { indicator: 'emigrationRate', delta: -4, delay: 2, duration: 6 },
          { indicator: 'workforceSkill', delta: 3, delay: 2, duration: 0 },
          { indicator: 'publicDebt', delta: 1, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: 2, delay: 0, duration: 3 },
        ],
        humor: 'Latvians in Dublin are googling "Riga apartment prices" for the first time in years.',
      },
      {
        label: 'Digital voting expansion',
        description: 'Make it easier to vote from abroad. More democratic, costs less.',
        effects: [
          { indicator: 'digitalInfra', delta: 3, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: 1, delay: 0, duration: 0 },
        ],
        humor: 'Estonia is annoyed you\'re copying their homework.',
      },
      {
        label: 'Ignore the diaspora',
        description: 'Focus on voters who are actually here. Resources are limited.',
        effects: [
          { indicator: 'emigrationRate', delta: 2, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 2 },
        ],
        humor: 'The "Latvians Abroad" Facebook group is not happy.',
      },
    ],
  },
  {
    id: 'election_russian_language',
    title: '🗣️ The Language Question Returns',
    description: 'As elections approach, the language debate resurfaces. National Alliance demands stricter Latvian-only policies in schools and government. The Russian-speaking community pushes back. It\'s the ticking time bomb of every Latvian election.',
    preconditions: [{ indicator: 'campaignSeason', op: '>=', value: 1 }],
    category: 'society', weight: 10, oneTime: true,
    choices: [
      {
        label: 'Support stricter language laws',
        description: 'All public services in Latvian only. National Alliance will back you.',
        effects: [
          { indicator: 'nationalIdentity', delta: 5, delay: 0, duration: 0 },
          { indicator: 'russianMinorityIntegration', delta: -6, delay: 0, duration: 0 },
          { indicator: 'socialCohesion', delta: -4, delay: 0, duration: 4 },
          { indicator: 'euStanding', delta: -2, delay: 1, duration: 0 },
        ],
        humor: 'The Saeima debate lasts 14 hours. Coffee consumption hits a national record.',
      },
      {
        label: 'Bilingual transition program',
        description: 'Gradual shift to Latvian with funded language courses. Bridge-building.',
        effects: [
          { indicator: 'russianMinorityIntegration', delta: 4, delay: 2, duration: 0 },
          { indicator: 'socialCohesion', delta: 3, delay: 1, duration: 4 },
          { indicator: 'nationalIdentity', delta: -2, delay: 0, duration: 0 },
          { indicator: 'educationQuality', delta: 2, delay: 2, duration: 0 },
        ],
        humor: 'Nationalists call you soft. Russians call you patronizing. Centrism is lonely.',
      },
      {
        label: 'Deflect — "not the time for this debate"',
        description: 'Refuse to engage. Focus on economic issues instead.',
        effects: [
          { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 2 },
        ],
        humor: 'Both sides are angry at you. At least they agree on something.',
      },
    ],
  },
  {
    id: 'election_youth_protest',
    title: '🎓 Students March on the Saeima',
    description: 'University students are organizing the largest youth protest in a decade. They want climate action, affordable housing, and education funding. With elections approaching, their energy could be an asset — or a liability.',
    preconditions: [
      { indicator: 'campaignSeason', op: '>=', value: 2 },
      { indicator: 'publicHappiness', op: '<', value: 50 },
    ],
    category: 'society', weight: 8, oneTime: true,
    choices: [
      {
        label: 'Meet the student leaders publicly',
        description: 'A photo op with young voters. Promise to act on their demands.',
        effects: [
          { indicator: 'publicHappiness', delta: 4, delay: 0, duration: 3 },
          { indicator: 'greenTransition', delta: 2, delay: 1, duration: 0 },
          { indicator: 'publicDebt', delta: 1, delay: 1, duration: 0 },
        ],
        humor: 'The students post selfies with you. Your approval among under-30s doubles — from 8% to 16%.',
      },
      {
        label: 'Support from a distance',
        description: 'Express sympathy without specific commitments. Classic politician move.',
        effects: [
          { indicator: 'publicHappiness', delta: 1, delay: 0, duration: 2 },
        ],
        humor: 'Your tweet of support gets 12 likes. The students had 12,000 marchers.',
      },
      {
        label: 'Critique the protest',
        description: 'Call for "constructive engagement through institutions, not the streets."',
        effects: [
          { indicator: 'publicHappiness', delta: -3, delay: 0, duration: 3 },
          { indicator: 'emigrationRate', delta: 2, delay: 1, duration: 4 },
        ],
        humor: 'The memes are brutal. A student dressed as you becomes a viral costume.',
      },
    ],
  },
];

/**
 * Historical Latvian election flavor text for election results.
 * Based on real Saeima election outcomes 1993-2022.
 */
export const ELECTION_FLAVOR: Record<number, string> = {
  1: 'Your first re-election. Like the 7th Saeima (1998), the establishment survives — but the margin is thinner than expected.',
  2: 'A second consecutive victory. Latvia hasn\'t seen this stability since the Kalvītis years (2002-2007).',
  3: 'Three terms! You\'re entering uncharted territory. Latvia\'s longest-serving democratic leaders didn\'t reach this far.',
  4: 'Four terms. This is unprecedented in modern Latvia. The Saeima is practically your living room now.',
  5: 'Five terms — the constitutional maximum. Your reign is the stuff of Latvian political legend.',
};
