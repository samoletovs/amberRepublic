import { GameEvent } from '../engine/types';

/** Additional events to increase variety and reduce repetition */
export const extraEvents: GameEvent[] = [
  // ── ECONOMY ──────────────────────────────────────────────
  {
    id: 'crypto_hub',
    title: '🪙 Crypto Firms Want Riga',
    description: 'Several cryptocurrency exchanges, fleeing regulation in the EU, want to set up headquarters in Riga. They promise 2,000 jobs and €500M in investment. The ECB is watching nervously.',
    preconditions: [{ indicator: 'techSector', op: '>', value: 35 }],
    category: 'economy', weight: 5, oneTime: true,
    choices: [
      { label: 'Welcome them with open arms', description: 'Light-touch regulation. Latvia becomes the crypto capital of Europe.', effects: [
        { indicator: 'techSector', delta: 8, delay: 1, duration: 0 },
        { indicator: 'foreignInvestment', delta: 10, delay: 1, duration: 0 },
        { indicator: 'euStanding', delta: -6, delay: 2, duration: 0 },
        { indicator: 'corruptionLevel', delta: 4, delay: 2, duration: 6 },
      ], humor: 'Riga Old Town cafes now accept Bitcoin. Grandmothers are confused but intrigued.' },
      { label: 'Strict regulatory framework', description: 'Welcome innovation, but with full AML compliance and EU coordination.', effects: [
        { indicator: 'techSector', delta: 4, delay: 2, duration: 0 },
        { indicator: 'foreignInvestment', delta: 4, delay: 2, duration: 0 },
        { indicator: 'euStanding', delta: 3, delay: 1, duration: 0 },
      ], humor: 'The regulation is 400 pages. Crypto bros discover Latvian bureaucracy is no joke.' },
      { label: 'Decline — too risky', description: 'The ABLV banking scandal still haunts Latvia. No more dodgy finance.', effects: [
        { indicator: 'euStanding', delta: 3, delay: 1, duration: 0 },
        { indicator: 'corruptionLevel', delta: -2, delay: 1, duration: 0 },
      ], humor: 'The crypto firms move to Lithuania. Lithuania is smiling. As usual.' },
    ],
  },
  {
    id: 'dairy_war',
    title: '🥛 The Great Dairy War',
    description: 'Latvian dairy farmers are blockading roads around Jelgava. EU milk quotas and Lithuanian imports are killing their margins. They want subsidies or they\'ll vote for the opposition.',
    preconditions: [], category: 'economy', weight: 5, oneTime: false,
    choices: [
      { label: 'Subsidize Latvian dairy', description: 'Direct payments to farmers. Rural votes secured.', effects: [
        { indicator: 'publicHappiness', delta: 3, delay: 0, duration: 4 },
        { indicator: 'publicDebt', delta: 1.5, delay: 0, duration: 0 },
        { indicator: 'euStanding', delta: -2, delay: 1, duration: 0 },
      ], humor: 'Latvian cows are now technically on the government payroll.' },
      { label: 'Help farmers modernize', description: 'Technology grants, organic certification support, export marketing.', effects: [
        { indicator: 'gdpGrowth', delta: 0.2, delay: 3, duration: 6 },
        { indicator: 'greenTransition', delta: 3, delay: 2, duration: 0 },
        { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 3 },
      ], humor: 'A Latvian farmer discovers Instagram marketing. His cheese goes viral in Japan.' },
      { label: 'Let the market work', description: 'No intervention. Some farms will close. That\'s capitalism.', effects: [
        { indicator: 'unemployment', delta: 0.5, delay: 1, duration: 4 },
        { indicator: 'emigrationRate', delta: 2, delay: 1, duration: 0 },
        { indicator: 'publicHappiness', delta: -4, delay: 0, duration: 4 },
      ], humor: 'The cows are fine. The farmers are updating their CVs.' },
    ],
  },
  {
    id: 'startup_visa',
    title: '💼 Startup Visa Program',
    description: 'Latvia can introduce a "Startup Visa" — fast-track residency for entrepreneurs who create companies in Latvia. 30 countries have similar programs, but Latvia could be more aggressive.',
    preconditions: [{ indicator: 'techSector', op: '>', value: 30 }],
    category: 'economy', weight: 6, oneTime: true,
    choices: [
      { label: 'Launch aggressive startup visa', description: '3-day visa processing, zero tax first year, free co-working space.', effects: [
        { indicator: 'techSector', delta: 8, delay: 2, duration: 0 },
        { indicator: 'population', delta: 0.005, delay: 2, duration: 0 },
        { indicator: 'foreignInvestment', delta: 5, delay: 2, duration: 0 },
        { indicator: 'socialCohesion', delta: -2, delay: 2, duration: 4 },
      ], humor: 'A Ukrainian, an Indian, and a Brazilian walk into a Riga co-working space. This isn\'t a joke — it\'s Tuesday.' },
      { label: 'Conservative pilot program', description: 'Small-scale test with 200 visas per year. Evaluate results first.', effects: [
        { indicator: 'techSector', delta: 3, delay: 3, duration: 0 },
        { indicator: 'population', delta: 0.002, delay: 3, duration: 0 },
      ], humor: 'The pilot is so cautious it could be mistaken for regular immigration bureaucracy.' },
    ],
  },

  // ── SOCIETY ──────────────────────────────────────────────
  {
    id: 'riga_car_free',
    title: '🚲 Riga Goes Car-Free?',
    description: 'Riga\'s new urban planner proposes closing the Old Town and major boulevards to cars. Copenhagen did it, Vilnius did it. Riga\'s car owners are furious. Cyclists are ecstatic.',
    preconditions: [], category: 'society', weight: 5, oneTime: true,
    choices: [
      { label: 'Full pedestrianization', description: 'Close Old Town + Brīvības bulvāris to cars. Invest in trams and bike lanes.', effects: [
        { indicator: 'greenTransition', delta: 6, delay: 1, duration: 0 },
        { indicator: 'publicHappiness', delta: -3, delay: 0, duration: 6 },
        { indicator: 'publicHappiness', delta: 5, delay: 4, duration: 0 },
        { indicator: 'foreignInvestment', delta: 3, delay: 2, duration: 0 },
        { indicator: 'euStanding', delta: 3, delay: 1, duration: 0 },
      ], humor: 'Riga\'s taxi drivers form a protest convoy. Ironically, they\'re stuck in the traffic they created.' },
      { label: 'Congestion charge only', description: 'Keep cars but make them expensive to drive downtown. Revenue funds public transport.', effects: [
        { indicator: 'greenTransition', delta: 3, delay: 1, duration: 0 },
        { indicator: 'gdpGrowth', delta: 0.1, delay: 1, duration: 4 },
        { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 4 },
      ], humor: 'The congestion charge is €5. Latvian drivers treat it as a personal insult.' },
      { label: 'Leave it as is', description: 'Riga works fine. Don\'t fix what isn\'t broken. (It is broken.)', effects: [
        { indicator: 'greenTransition', delta: -1, delay: 0, duration: 0 },
        { indicator: 'publicHappiness', delta: 1, delay: 0, duration: 0 },
      ], humor: 'Riga remains one of the few European capitals where you can park on the sidewalk. Traditions matter.' },
    ],
  },
  {
    id: 'jani_controversy',
    title: '🌿 Jāņi Festival: Tradition vs. Modernity',
    description: 'Jāņi (midsummer) celebrations are Latvia\'s most beloved tradition. But this year, a corporate sponsor wants to turn it into a branded festival. Traditionalists are outraged. Young people want the concert stage.',
    preconditions: [], category: 'culture', weight: 4, oneTime: false,
    choices: [
      { label: 'Keep Jāņi pure and traditional', description: 'Government funds community celebrations. No corporate sponsors. Cheese, beer, and bonfires.', effects: [
        { indicator: 'nationalIdentity', delta: 5, delay: 0, duration: 0 },
        { indicator: 'publicHappiness', delta: 3, delay: 0, duration: 0 },
        { indicator: 'publicDebt', delta: 0.3, delay: 0, duration: 0 },
      ], humor: 'The sound of a thousand "Līgo" songs echoes across Latvia. Estonians close their windows.' },
      { label: 'Allow corporate sponsorship', description: 'Let brands participate. Generate revenue. Bigger event, wider reach, more tourist€.', effects: [
        { indicator: 'gdpGrowth', delta: 0.1, delay: 0, duration: 4 },
        { indicator: 'nationalIdentity', delta: -3, delay: 0, duration: 0 },
        { indicator: 'foreignInvestment', delta: 1, delay: 1, duration: 0 },
      ], humor: '"This bonfire is brought to you by Latvijas Balzams." Somehow it works.' },
    ],
  },
  {
    id: 'rural_internet',
    title: '📡 Rural Digital Desert',
    description: 'Latgale and rural Vidzeme have internet speeds from 2005. Remote workers can\'t work remotely. Schools can\'t teach digitally. The digital divide is widening.',
    preconditions: [{ indicator: 'digitalInfra', op: '<', value: 65 }],
    category: 'science', weight: 6, oneTime: true,
    choices: [
      { label: 'National fiber rollout', description: 'EU-funded fiber to every village. Expensive but transformative.', effects: [
        { indicator: 'digitalInfra', delta: 15, delay: 3, duration: 0 },
        { indicator: 'emigrationRate', delta: -3, delay: 4, duration: 0 },
        { indicator: 'techSector', delta: 4, delay: 3, duration: 0 },
        { indicator: 'publicDebt', delta: 3, delay: 0, duration: 0 },
        { indicator: 'educationQuality', delta: 4, delay: 3, duration: 0 },
      ], humor: 'A farmer in Latgale downloads a PDF for the first time. His life changes. (It was a subsidy form.)' },
      { label: 'Starlink partnership', description: 'Satellite internet partnership. Faster to deploy, less infrastructure cost.', effects: [
        { indicator: 'digitalInfra', delta: 10, delay: 1, duration: 0 },
        { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
        { indicator: 'natoRelations', delta: 1, delay: 0, duration: 0 },
      ], humor: 'Elon Musk tweets about Latvia. Population: confused but flattered.' },
    ],
  },

  // ── CRISIS ──────────────────────────────────────────────
  {
    id: 'flood_riga',
    title: '🌊 Daugava Flooding Threatens Riga',
    description: 'Unprecedented spring floods hit the Daugava river basin. Parts of Riga\'s Pārdaugava district are underwater. Climate change is making this more frequent. Emergency response is overwhelmed.',
    preconditions: [], category: 'crisis', weight: 4, oneTime: false,
    choices: [
      { label: 'Emergency fund + flood barriers', description: 'Immediate relief plus long-term infrastructure investment.', effects: [
        { indicator: 'publicHappiness', delta: 3, delay: 0, duration: 0 },
        { indicator: 'publicDebt', delta: 3, delay: 0, duration: 0 },
        { indicator: 'greenTransition', delta: 3, delay: 1, duration: 0 },
      ], humor: 'The Minister of Infrastructure in rubber boots becomes an unlikely meme. Approval rating: up.' },
      { label: 'Minimal response, blame climate', description: 'Provide basic assistance. Call it a climate emergency. Request EU solidarity funds.', effects: [
        { indicator: 'publicHappiness', delta: -4, delay: 0, duration: 4 },
        { indicator: 'euStanding', delta: 2, delay: 1, duration: 0 },
      ], humor: 'Climate change is real. So is the water in your living room.' },
    ],
  },
  {
    id: 'corruption_minister',
    title: '🕵️ Minister Caught in Corruption Scandal',
    description: 'A coalition partner\'s minister is caught accepting bribes from a construction company. Evidence includes recorded phone calls. The minister denies everything. Your coalition partner backs their minister.',
    preconditions: [{ indicator: 'corruptionLevel', op: '>', value: 30 }],
    category: 'crisis', weight: 6, oneTime: false,
    choices: [
      { label: 'Force the minister out', description: 'Demand resignation. Risk coalition stability. Show zero tolerance.', effects: [
        { indicator: 'corruptionLevel', delta: -6, delay: 0, duration: 0 },
        { indicator: 'mediaTrust', delta: 5, delay: 0, duration: 0 },
        { indicator: 'socialCohesion', delta: 2, delay: 1, duration: 0 },
      ], humor: 'The minister\'s farewell speech is 47 seconds long. It includes no apology.' },
      { label: 'Internal investigation first', description: 'Calm, procedural approach. Let institutions work. Less dramatic.', effects: [
        { indicator: 'corruptionLevel', delta: -2, delay: 2, duration: 0 },
        { indicator: 'mediaTrust', delta: -4, delay: 0, duration: 0 },
        { indicator: 'publicHappiness', delta: -3, delay: 0, duration: 4 },
      ], humor: 'The investigation takes 18 months. The minister retires quietly. Latvia shrugs.' },
      { label: 'Cover it up', description: 'Suppress the story. Protect the coalition at all costs.', effects: [
        { indicator: 'corruptionLevel', delta: 5, delay: 0, duration: 0 },
        { indicator: 'mediaTrust', delta: -8, delay: 0, duration: 0 },
        { indicator: 'publicHappiness', delta: -5, delay: 1, duration: 4 },
        { indicator: 'euStanding', delta: -3, delay: 2, duration: 0 },
      ], humor: 'The cover-up lasts exactly 3 weeks before a journalist at LSM breaks the story anyway.' },
    ],
  },

  // ── DIPLOMACY ────────────────────────────────────────────
  {
    id: 'nordic_council_bid',
    title: '🇳🇴 Join the Nordic Council?',
    description: 'Nordic countries invite the Baltic states as observer members of the Nordic Council. It\'s symbolic but politically powerful — access to Nordic soft power, cooperation frameworks, and prestige.',
    preconditions: [{ indicator: 'euStanding', op: '>', value: 50 }],
    category: 'diplomacy', weight: 4, oneTime: true,
    choices: [
      { label: 'Accept with enthusiasm', description: 'Latvia as a Nordic country! Well, Nordic-adjacent. Close enough.', effects: [
        { indicator: 'natoRelations', delta: 3, delay: 1, duration: 0 },
        { indicator: 'euStanding', delta: 4, delay: 1, duration: 0 },
        { indicator: 'foreignInvestment', delta: 3, delay: 2, duration: 0 },
        { indicator: 'nationalIdentity', delta: 2, delay: 0, duration: 0 },
      ], humor: 'Latvia is Nordic now. Take that, every geography textbook published since 1991.' },
      { label: 'Politely observe', description: 'Join as observer but maintain Baltic identity separately.', effects: [
        { indicator: 'euStanding', delta: 2, delay: 1, duration: 0 },
        { indicator: 'nationalIdentity', delta: 3, delay: 0, duration: 0 },
      ], humor: 'Latvia watches the Nordics from a distance. Like always.' },
    ],
  },
  {
    id: 'eu_migration_quota',
    title: '🇪🇺 EU Mandatory Migration Quotas',
    description: 'The EU proposes mandatory redistribution of asylum seekers. Latvia would need to accept 3,000 per year. Central European countries are refusing. Latvia must pick a side.',
    preconditions: [], category: 'diplomacy', weight: 6, oneTime: true,
    choices: [
      { label: 'Accept the quotas', description: 'Show EU solidarity. Accept 3,000 asylum seekers per year. Fund integration.', effects: [
        { indicator: 'euStanding', delta: 8, delay: 0, duration: 0 },
        { indicator: 'population', delta: 0.005, delay: 1, duration: 0 },
        { indicator: 'socialCohesion', delta: -5, delay: 1, duration: 4 },
        { indicator: 'publicHappiness', delta: -4, delay: 0, duration: 4 },
      ], humor: '3,000 people discover that Latvian winters are worse than advertised. Some stay anyway.' },
      { label: 'Push for financial alternative', description: 'Pay €15,000 per person not accepted. Less disruptive domestically.', effects: [
        { indicator: 'euStanding', delta: 2, delay: 0, duration: 0 },
        { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
        { indicator: 'publicHappiness', delta: 2, delay: 0, duration: 0 },
      ], humor: 'Latvia pays to not have immigrants. This is peak Eastern European problem-solving.' },
      { label: 'Join the Visegrád resistance', description: 'Side with Poland and Hungary. Block the quotas. Burn bridges with Western EU.', effects: [
        { indicator: 'euStanding', delta: -8, delay: 0, duration: 0 },
        { indicator: 'natoRelations', delta: -3, delay: 1, duration: 0 },
        { indicator: 'publicHappiness', delta: 3, delay: 0, duration: 4 },
        { indicator: 'nationalIdentity', delta: 4, delay: 0, duration: 0 },
      ], humor: 'Latvia, population 1.86 million, blocks an EU directive. Brussels is mildly inconvenienced.' },
    ],
  },

  // ── COALITION POLITICS ───────────────────────────────────
  {
    id: 'coalition_budget_row',
    title: '🤝 Coalition Budget Showdown',
    description: 'Budget season has arrived and your coalition partners cannot agree. The Greens & Farmers want more rural spending; The Progressives demand healthcare investment. You must broker a deal — or face a fracturing coalition.',
    preconditions: [],
    category: 'economy', weight: 7, oneTime: false,
    choices: [
      { label: 'Side with Greens & Farmers', description: 'Prioritise rural development and agriculture subsidies. ZZS is satisfied. PRO is furious.', effects: [
        { indicator: 'greenTransition', delta: 3, delay: 1, duration: 0 },
        { indicator: 'birthRate', delta: 2, delay: 2, duration: 0 },
        { indicator: 'healthcareQuality', delta: -2, delay: 1, duration: 0 },
        { indicator: 'publicDebt', delta: 1.5, delay: 0, duration: 0 },
      ], humor: 'Latvian cows are pleased. Latvian hospital waiting lists, less so.' },
      { label: 'Side with The Progressives', description: 'Boost healthcare and social spending. PRO stays. ZZS threatens to leave.', effects: [
        { indicator: 'healthcareQuality', delta: 4, delay: 2, duration: 0 },
        { indicator: 'socialCohesion', delta: 2, delay: 1, duration: 0 },
        { indicator: 'greenTransition', delta: -2, delay: 1, duration: 0 },
        { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
      ], humor: 'The Progressives celebrate. The farmers go home and mutter things about city folk.' },
      { label: 'Split the difference', description: 'Half to rural, half to healthcare. Everyone is mildly unhappy — but still in the coalition.', effects: [
        { indicator: 'healthcareQuality', delta: 2, delay: 2, duration: 0 },
        { indicator: 'greenTransition', delta: 1, delay: 1, duration: 0 },
        { indicator: 'publicDebt', delta: 2.5, delay: 0, duration: 0 },
        { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 0 },
      ], humor: 'The compromise takes 11 hours to negotiate. Nobody leaves happy. The coalition survives anyway.' },
    ],
  },
  {
    id: 'coalition_junior_ultimatum',
    title: '⚠️ Junior Partner Issues Ultimatum',
    description: 'A junior coalition partner is threatening to withdraw unless you adopt one of their flagship policies. Their minister has drafted a resignation letter. The coalition\'s survival hangs on your response.',
    preconditions: [{ indicator: '_coalitionLoyalty', op: '<', value: 45 }],
    category: 'crisis', weight: 8, oneTime: false,
    choices: [
      { label: 'Accept their flagship policy', description: 'Swallow the concession. Keep the coalition alive. Pay the political cost later.', effects: [
        { indicator: 'socialCohesion', delta: 3, delay: 1, duration: 0 },
        { indicator: 'publicHappiness', delta: 2, delay: 1, duration: 0 },
        { indicator: 'euStanding', delta: -1, delay: 2, duration: 0 },
      ], humor: 'The junior partner declares victory in a 40-minute press conference. You are not invited.' },
      { label: 'Negotiate a watered-down version', description: 'Adopt the spirit of the policy, not the letter. Might satisfy no one.', effects: [
        { indicator: 'socialCohesion', delta: 1, delay: 1, duration: 0 },
        { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 4 },
      ], humor: 'The compromise bill runs to 200 pages. Journalists spend three days finding out what it actually does.' },
      { label: 'Call their bluff — refuse', description: 'They won\'t actually leave. Probably. Demonstrate who leads this coalition.', effects: [
        { indicator: 'publicHappiness', delta: -3, delay: 1, duration: 4 },
        { indicator: 'mediaTrust', delta: -3, delay: 0, duration: 0 },
        { indicator: 'socialCohesion', delta: -4, delay: 1, duration: 0 },
      ], humor: 'They actually leave. You stare at your phone for a very long minute.' },
    ],
  },
  {
    id: 'coalition_confidence_vote',
    title: '🗳️ Vote of No Confidence Tabled',
    description: 'The opposition has tabled a vote of no confidence. With your coalition loyalty shaky, there\'s a real chance of defections. You have one week to shore up support.',
    preconditions: [{ indicator: '_coalitionLoyalty', op: '<', value: 35 }],
    category: 'crisis', weight: 9, oneTime: false,
    choices: [
      { label: 'Offer coalition partners key concessions', description: 'Promises, promises. Give up something dear to survive the vote.', effects: [
        { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
        { indicator: 'publicHappiness', delta: 2, delay: 1, duration: 0 },
        { indicator: 'socialCohesion', delta: 3, delay: 1, duration: 0 },
      ], humor: 'You survive the vote 52-48. The margin is so thin that one MP had to be rushed in from hospital.' },
      { label: 'Rally public opinion against the opposition', description: 'Go over parliament\'s head. Make it a public fight.', effects: [
        { indicator: 'mediaTrust', delta: -3, delay: 0, duration: 0 },
        { indicator: 'publicHappiness', delta: -2, delay: 0, duration: 4 },
        { indicator: 'socialCohesion', delta: -3, delay: 1, duration: 0 },
      ], humor: 'The press conference is tense. Riga\'s pundits have not slept in 36 hours. Neither have you.' },
      { label: 'Request a snap election', description: 'If you\'re going down, go down fighting. Let the people decide.', effects: [
        { indicator: 'publicHappiness', delta: -5, delay: 0, duration: 4 },
        { indicator: 'socialCohesion', delta: -2, delay: 0, duration: 0 },
        { indicator: 'gdpGrowth', delta: -0.3, delay: 1, duration: 4 },
      ], humor: 'You call a snap election. The stock market dips. The opposition is delighted. This was their plan.' },
    ],
  },
  {
    id: 'coalition_new_partner',
    title: '🤝 Opportunity: Recruit a New Coalition Partner',
    description: 'A previously opposition party signals it might be willing to join the coalition if you can accommodate a few of their demands. This could strengthen your majority — or complicate governance.',
    preconditions: [],
    category: 'economy', weight: 4, oneTime: false,
    choices: [
      { label: 'Welcome them in — broaden the coalition', description: 'More seats, more stability. Also more negotiating headaches.', effects: [
        { indicator: 'socialCohesion', delta: -2, delay: 1, duration: 4 },
        { indicator: 'publicHappiness', delta: 2, delay: 1, duration: 0 },
        { indicator: 'corruptionLevel', delta: 2, delay: 2, duration: 0 },
      ], humor: 'Your cabinet now has 17 ministers. Finding meeting rooms is a logistical challenge.' },
      { label: 'Decline — keep the coalition tight', description: 'A smaller coalition is simpler to manage. Trust is already established.', effects: [
        { indicator: 'socialCohesion', delta: 2, delay: 1, duration: 0 },
        { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 0 },
      ], humor: 'The rejected party goes back to the opposition benches and plots loudly.' },
      { label: 'Negotiate their entry with strict conditions', description: 'They join, but with a limited mandate. Coalition agreement is updated.', effects: [
        { indicator: 'socialCohesion', delta: 1, delay: 1, duration: 0 },
        { indicator: 'publicHappiness', delta: 1, delay: 1, duration: 0 },
        { indicator: 'mediaTrust', delta: 2, delay: 1, duration: 0 },
      ], humor: 'The coalition agreement becomes 94 pages longer. The new partner claims victory on every page.' },
    ],
  },

  // ── SCIENCE & INNOVATION ─────────────────────────────────
  {
    id: 'quantum_lab',
    title: '⚛️ Quantum Computing Lab Proposal',
    description: 'The University of Latvia wants to establish a quantum computing research lab. Cost: €50M. Potential: enormous. Risk: it might not produce results for 15 years.',
    preconditions: [{ indicator: 'rdSpending', op: '>', value: 0.6 }],
    category: 'science', weight: 4, oneTime: true,
    choices: [
      { label: 'Fund the quantum lab', description: 'Bet on the future. Latvia could lead in a niche field.', effects: [
        { indicator: 'rdSpending', delta: 0.3, delay: 1, duration: 0 },
        { indicator: 'educationQuality', delta: 5, delay: 2, duration: 0 },
        { indicator: 'techSector', delta: 4, delay: 4, duration: 0 },
        { indicator: 'publicDebt', delta: 1.5, delay: 0, duration: 0 },
        { indicator: 'emigrationRate', delta: -2, delay: 3, duration: 0 },
      ], humor: 'The lab is built. Nobody outside the lab understands what happens inside. Including the Finance Minister.' },
      { label: 'Fund applied research instead', description: 'Practical R&D: biotech, materials science, IT. Faster returns.', effects: [
        { indicator: 'rdSpending', delta: 0.2, delay: 0, duration: 0 },
        { indicator: 'techSector', delta: 5, delay: 2, duration: 0 },
        { indicator: 'gdpGrowth', delta: 0.2, delay: 2, duration: 6 },
      ], humor: 'Applied research discovers 17 new uses for Latvian birch wood. Forest industry rejoices.' },
    ],
  },
  {
    id: 'ev_factory',
    title: '🔋 EV Battery Factory Offer',
    description: 'A Swedish-Korean consortium wants to build a €1.2B electric vehicle battery factory in Liepāja. 3,000 jobs. But they want tax breaks, free land, and guaranteed green energy supply.',
    preconditions: [{ indicator: 'greenTransition', op: '>', value: 35 }],
    category: 'economy', weight: 7, oneTime: true,
    choices: [
      { label: 'Roll out the red carpet', description: 'Give them everything. This would transform Liepāja.', effects: [
        { indicator: 'gdpGrowth', delta: 0.8, delay: 3, duration: 8 },
        { indicator: 'unemployment', delta: -2, delay: 3, duration: 0 },
        { indicator: 'foreignInvestment', delta: 10, delay: 2, duration: 0 },
        { indicator: 'greenTransition', delta: 5, delay: 3, duration: 0 },
        { indicator: 'publicDebt', delta: 4, delay: 0, duration: 0 },
        { indicator: 'emigrationRate', delta: -4, delay: 3, duration: 0 },
      ], humor: 'Liepāja, once known for submarines and wind, becomes "Battery City." Urban planners cry happy tears.' },
      { label: 'Negotiate harder terms', description: 'Yes, but with local content requirements, training programs, and limited tax breaks.', effects: [
        { indicator: 'gdpGrowth', delta: 0.5, delay: 4, duration: 6 },
        { indicator: 'unemployment', delta: -1, delay: 4, duration: 0 },
        { indicator: 'foreignInvestment', delta: 5, delay: 3, duration: 0 },
        { indicator: 'workforceSkill', delta: 4, delay: 3, duration: 0 },
      ], humor: 'The negotiation takes 8 months. Both sides call it "productive." Both sides are exhausted.' },
      { label: 'Decline — too risky', description: 'What if the EV market crashes? Latvia can\'t afford a €1.2B white elephant.', effects: [
        { indicator: 'publicHappiness', delta: -2, delay: 1, duration: 0 },
      ], humor: 'The consortium moves to Poland. Liepāja gets a new coffee shop instead.' },
    ],
  },
];
