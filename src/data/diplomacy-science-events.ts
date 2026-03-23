import { GameEvent } from '../engine/types';

export const diplomacyEvents: GameEvent[] = [
  {
    id: 'baltic_federation',
    title: '🤝 Baltic Federation Proposal',
    description: 'An Estonian think-tank proposes that Estonia, Latvia, and Lithuania form a closer political and economic union — a "Baltic Federation" with shared defense, foreign policy, and a common digital ID. The idea gains traction.',
    preconditions: [{ indicator: 'euStanding', op: '>', value: 45 }],
    category: 'diplomacy',
    weight: 5,
    oneTime: true,
    choices: [
      {
        label: 'Embrace deeper Baltic integration',
        description: 'Support the proposal. Three small countries are stronger together. Begin negotiations.',
        effects: [
          { indicator: 'euStanding', delta: 6, delay: 2, duration: 0 },
          { indicator: 'natoRelations', delta: 4, delay: 2, duration: 0 },
          { indicator: 'foreignInvestment', delta: 5, delay: 3, duration: 0 },
          { indicator: 'nationalIdentity', delta: -4, delay: 1, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.3, delay: 3, duration: 8 },
        ],
        humor: 'Three countries that have spent centuries being occupied by others finally choose to unite. By themselves. History is written by those who show up.',
      },
      {
        label: 'Economic cooperation only',
        description: 'Yes to shared markets and infrastructure. No to political union. Latvia keeps its sovereignty.',
        effects: [
          { indicator: 'gdpGrowth', delta: 0.2, delay: 2, duration: 6 },
          { indicator: 'foreignInvestment', delta: 3, delay: 2, duration: 0 },
          { indicator: 'nationalIdentity', delta: 2, delay: 0, duration: 0 },
        ],
        humor: 'Latvia to Estonia: "We\'ll share a railway, but not a parliament. We know how these things end."',
      },
      {
        label: 'Politely decline',
        description: 'Latvia values its hard-won independence. No political unions with anyone. We\'ll cooperate but not merge.',
        effects: [
          { indicator: 'nationalIdentity', delta: 5, delay: 0, duration: 0 },
          { indicator: 'euStanding', delta: -2, delay: 1, duration: 0 },
          { indicator: 'foreignInvestment', delta: -2, delay: 2, duration: 0 },
        ],
        humor: 'Latvia gained independence twice. Three times if you count that one time in 1991 with the barricades. Not giving it up for a think-tank paper.',
      },
    ],
  },

  {
    id: 'china_investment',
    title: '🇨🇳 China Offers: Free Port or Free Trap?',
    description: 'A Chinese state-backed consortium offers to invest €2 billion in Ventspils port, building a major logistics hub. Great for jobs and GDP. But NATO allies are deeply suspicious. This is Belt and Road with extra steps.',
    preconditions: [{ indicator: 'portActivity', op: '<', value: 60 }],
    category: 'diplomacy',
    weight: 6,
    oneTime: true,
    choices: [
      {
        label: 'Accept Chinese investment',
        description: 'Jobs, money, port activity. Latvia can manage the security risks. Set up oversight committees.',
        effects: [
          { indicator: 'portActivity', delta: 18, delay: 3, duration: 0 },
          { indicator: 'foreignInvestment', delta: 12, delay: 2, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.8, delay: 2, duration: 6 },
          { indicator: 'natoRelations', delta: -10, delay: 1, duration: 0 },
          { indicator: 'euStanding', delta: -6, delay: 1, duration: 0 },
          { indicator: 'cyberDefense', delta: -5, delay: 2, duration: 0 },
        ],
        humor: 'A Chinese container ship enters Ventspils harbor. The American ambassador starts writing a very long email.',
      },
      {
        label: 'Decline firmly, align with allies',
        description: 'No question. Latvia is a NATO and EU country. Chinese infrastructure investment is a security risk.',
        effects: [
          { indicator: 'natoRelations', delta: 6, delay: 0, duration: 0 },
          { indicator: 'euStanding', delta: 4, delay: 0, duration: 0 },
          { indicator: 'portActivity', delta: -2, delay: 1, duration: 0 },
        ],
        humor: 'Latvia says no to €2 billion. The Finance Minister needs a moment alone.',
      },
      {
        label: 'Accept with severe restrictions',
        description: 'Allow investment but maintain 51% Latvian ownership, full security audits, and no access to critical infrastructure.',
        effects: [
          { indicator: 'portActivity', delta: 8, delay: 3, duration: 0 },
          { indicator: 'foreignInvestment', delta: 6, delay: 2, duration: 0 },
          { indicator: 'natoRelations', delta: -4, delay: 1, duration: 0 },
          { indicator: 'euStanding', delta: -2, delay: 1, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.4, delay: 3, duration: 6 },
        ],
        humor: 'The investment agreement is 2,347 pages long. The first page says "friendship." The rest says "no."',
      },
    ],
  },

  {
    id: 'eu_presidency_bid',
    title: '🇪🇺 Latvia Eyes EU Council Presidency Again',
    description: 'Latvia can push for the next rotating EU Council Presidency. It would put Latvia at the center of European decision-making, but the cost and logistics are immense for a small country.',
    preconditions: [{ indicator: 'euStanding', op: '>', value: 50 }],
    category: 'diplomacy',
    weight: 4,
    oneTime: true,
    choices: [
      {
        label: 'Go for the Presidency',
        description: 'Maximum diplomatic effort. Latvia shapes EU agenda on defense, digital, and Baltic priorities.',
        effects: [
          { indicator: 'euStanding', delta: 12, delay: 1, duration: 0 },
          { indicator: 'natoRelations', delta: 4, delay: 1, duration: 0 },
          { indicator: 'foreignInvestment', delta: 5, delay: 2, duration: 0 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
          { indicator: 'nationalIdentity', delta: 4, delay: 1, duration: 0 },
        ],
        humor: 'For six months, EU bureaucrats learn to pronounce "Rīga" correctly. Then immediately forget.',
      },
      {
        label: 'Skip it, focus domestically',
        description: 'The prestige isn\'t worth the cost. Spend the money at home.',
        effects: [
          { indicator: 'publicHappiness', delta: 2, delay: 0, duration: 0 },
          { indicator: 'euStanding', delta: -3, delay: 1, duration: 0 },
        ],
        humor: '"We\'re taking this round off," says the PM. Europe barely notices.',
      },
    ],
  },

  {
    id: 'arctic_council',
    title: '🧊 Climate & The Arctic: Latvia\'s Role',
    description: 'Climate change is reshaping the Arctic. New shipping routes, resource access, and geopolitical tensions are emerging. The Baltic states are directly affected by changing seas. Latvia can position itself as a voice for small northern nations.',
    preconditions: [{ indicator: 'greenTransition', op: '>', value: 30 }],
    category: 'diplomacy',
    weight: 4,
    oneTime: true,
    choices: [
      {
        label: 'Lead a Baltic climate coalition',
        description: 'Unite Baltic and Nordic states around aggressive climate targets. Position Latvia as a green pioneer.',
        effects: [
          { indicator: 'greenTransition', delta: 8, delay: 2, duration: 0 },
          { indicator: 'euStanding', delta: 5, delay: 1, duration: 0 },
          { indicator: 'foreignInvestment', delta: 3, delay: 3, duration: 0 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
        ],
        humor: 'Latvia: "We must save the planet!" Also Latvia: "But can we finish heating season first?"',
      },
      {
        label: 'Focus on adaptation, not ambition',
        description: 'Climate change is coming regardless. Invest in coastal protection, flood management, and agricultural adaptation.',
        effects: [
          { indicator: 'greenTransition', delta: 3, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: 2, delay: 2, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.2, delay: 2, duration: 6 },
        ],
        humor: 'Jūrmala receives its first flood protection barrier. Beach-goers are mildly inconvenienced.',
      },
    ],
  },
];

export const scienceEvents: GameEvent[] = [
  {
    id: 'mikrotik_unicorn',
    title: '💻 MikroTīkls Goes Global',
    description: 'Latvia\'s biggest tech success story, MikroTīkls (the networking equipment maker), is considering an IPO. If it lists in Riga, it could spark a tech boom. If it lists in New York, the money flows elsewhere.',
    preconditions: [{ indicator: 'techSector', op: '>', value: 35 }],
    category: 'science',
    weight: 6,
    oneTime: true,
    choices: [
      {
        label: 'Incentivize a Riga IPO',
        description: 'Offer tax breaks and regulatory fast-track for a local listing. Signal that Latvia supports its champions.',
        effects: [
          { indicator: 'techSector', delta: 12, delay: 1, duration: 0 },
          { indicator: 'foreignInvestment', delta: 8, delay: 2, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.5, delay: 2, duration: 6 },
          { indicator: 'workforceSkill', delta: 3, delay: 2, duration: 0 },
          { indicator: 'nationalIdentity', delta: 3, delay: 0, duration: 0 },
        ],
        humor: 'MikroTīkls IPOs on Nasdaq Riga. Estonia is jealous. Lithuania is proud. This is the Baltic way.',
      },
      {
        label: 'Let them choose freely',
        description: 'Government shouldn\'t interfere with business decisions. If they choose New York, that\'s capitalism.',
        effects: [
          { indicator: 'techSector', delta: 5, delay: 1, duration: 0 },
          { indicator: 'foreignInvestment', delta: 3, delay: 2, duration: 0 },
        ],
        humor: 'They list in New York. The Wall Street Journal misspells "Latvia" as "Lithuania." Some things never change.',
      },
    ],
  },

  {
    id: 'ai_strategy',
    title: '🤖 Latvia\'s AI Strategy',
    description: 'The EU AI Act is in effect. Latvia needs a national AI strategy. With a small population, Latvia can be nimble — but must it choose between regulation-heavy (EU path) or innovation-first (startup-friendly)?',
    preconditions: [],
    category: 'science',
    weight: 7,
    oneTime: true,
    choices: [
      {
        label: 'AI sandbox: startup paradise',
        description: 'Create regulatory sandboxes, AI development grants, tax-free zones for AI companies. Latvia becomes the "AI lab of Europe."',
        effects: [
          { indicator: 'techSector', delta: 12, delay: 2, duration: 0 },
          { indicator: 'foreignInvestment', delta: 8, delay: 2, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.6, delay: 3, duration: 8 },
          { indicator: 'workforceSkill', delta: 5, delay: 3, duration: 0 },
          { indicator: 'euStanding', delta: -2, delay: 2, duration: 0 },
          { indicator: 'emigrationRate', delta: -3, delay: 3, duration: 0 },
        ],
        humor: 'Riga joins Tallinn and Vilnius in the "Silicon Baltic" race. Three countries, 6 million people, more startups per capita than you\'d believe.',
      },
      {
        label: 'AI for government efficiency',
        description: 'Use AI to fix Latvia\'s own problems: healthcare diagnostics, tax fraud detection, education personalization.',
        effects: [
          { indicator: 'digitalInfra', delta: 8, delay: 2, duration: 0 },
          { indicator: 'healthcareQuality', delta: 4, delay: 3, duration: 0 },
          { indicator: 'corruptionLevel', delta: -5, delay: 3, duration: 0 },
          { indicator: 'educationQuality', delta: 4, delay: 3, duration: 0 },
        ],
        humor: 'An AI detects that 47% of government forms could be eliminated. The bureaucrats resist. The AI is more persistent.',
      },
      {
        label: 'Follow EU regulations strictly',
        description: 'Safety first. Full compliance with EU AI Act. No risks, no scandals, no competitive advantage.',
        effects: [
          { indicator: 'euStanding', delta: 4, delay: 1, duration: 0 },
          { indicator: 'techSector', delta: 2, delay: 2, duration: 0 },
        ],
        humor: 'Latvia\'s AI sector: fully compliant, thoroughly documented, and slightly slower than Estonia\'s. As is tradition.',
      },
    ],
  },

  {
    id: 'biotech_breakthrough',
    title: '🧬 Latvian Biotech Breakthrough',
    description: 'Researchers at the Latvian Institute of Organic Synthesis (the team behind Mildronate/Meldonium) announce a promising new drug for neurodegenerative diseases. International pharma companies are interested.',
    preconditions: [{ indicator: 'rdSpending', op: '>', value: 0.5 }],
    category: 'science',
    weight: 5,
    oneTime: true,
    choices: [
      {
        label: 'Keep the IP in Latvia',
        description: 'Fund clinical trials domestically. Build a pharma cluster in Riga. Latvia owns the patent.',
        effects: [
          { indicator: 'rdSpending', delta: 0.3, delay: 1, duration: 0 },
          { indicator: 'techSector', delta: 6, delay: 2, duration: 0 },
          { indicator: 'foreignInvestment', delta: 5, delay: 3, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.4, delay: 4, duration: 8 },
          { indicator: 'publicDebt', delta: 3, delay: 0, duration: 0 },
          { indicator: 'nationalIdentity', delta: 3, delay: 1, duration: 0 },
        ],
        humor: 'Latvia: "We made Meldonium AND a cure for dementia. You\'re welcome, world."',
      },
      {
        label: 'License to Big Pharma',
        description: 'Sell the rights; fast cash for Latvia\'s budget. The drug reaches patients faster through a global company.',
        effects: [
          { indicator: 'gdpGrowth', delta: 0.3, delay: 1, duration: 4 },
          { indicator: 'publicDebt', delta: -2, delay: 1, duration: 0 },
          { indicator: 'healthcareQuality', delta: 3, delay: 2, duration: 0 },
        ],
        humor: 'Pfizer pays €800M for the rights. The lead researcher buys a nice apartment in Jūrmala. And then continues working.',
      },
    ],
  },

  {
    id: 'university_reform',
    title: '🎓 University of Latvia: Reform or Decline',
    description: 'The University of Latvia is losing rankings. Riga Technical University is decent but not competitive globally. Meanwhile, Tartu (Estonia) climbs world rankings. Brain drain means fewer professors and students.',
    preconditions: [{ indicator: 'educationQuality', op: '<', value: 65 }],
    category: 'science',
    weight: 6,
    oneTime: false,
    choices: [
      {
        label: 'Merge universities, create a mega-university',
        description: 'Combine Latvia\'s fragmented small universities into one world-class institution. Critical mass matters.',
        effects: [
          { indicator: 'educationQuality', delta: 10, delay: 3, duration: 0 },
          { indicator: 'rdSpending', delta: 0.2, delay: 2, duration: 0 },
          { indicator: 'workforceSkill', delta: 5, delay: 3, duration: 0 },
          { indicator: 'publicHappiness', delta: -3, delay: 0, duration: 4 },
          { indicator: 'emigrationRate', delta: -2, delay: 4, duration: 0 },
        ],
        humor: 'Latvia: "We have 30 universities for 1.8 million people." Estonia: "We have 6. But they\'re really good." Point taken.',
      },
      {
        label: 'Attract international talent',
        description: 'Offer competitive salaries, English-language programs, fast visa processing for foreign academics.',
        effects: [
          { indicator: 'educationQuality', delta: 7, delay: 2, duration: 0 },
          { indicator: 'foreignInvestment', delta: 3, delay: 2, duration: 0 },
          { indicator: 'population', delta: 0.005, delay: 2, duration: 0 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
        ],
        humor: 'A British professor moves to Riga. Discovers the rent is 1/4 of London. Discovers the winter is 4x as long. Trade-offs.',
      },
      {
        label: 'Double down on technical education',
        description: 'Focus on what works: IT, engineering, biotech. Not every country needs a top-50 liberal arts school.',
        effects: [
          { indicator: 'workforceSkill', delta: 6, delay: 2, duration: 0 },
          { indicator: 'techSector', delta: 5, delay: 2, duration: 0 },
          { indicator: 'educationQuality', delta: 5, delay: 2, duration: 0 },
          { indicator: 'rdSpending', delta: 0.15, delay: 1, duration: 0 },
        ],
        humor: 'RTU students: coding by day, singing folk songs by night. The modern Latvian renaissance.',
      },
    ],
  },
];

export const crisisEvents: GameEvent[] = [
  {
    id: 'energy_crisis',
    title: '⚡ Energy Price Shock',
    description: 'European gas prices spike again. Latvia\'s households face 50% higher heating bills this winter. The Inčukalns gas storage facility is only 60% full. People are scared.',
    preconditions: [{ indicator: 'energyIndependence', op: '<', value: 55 }],
    category: 'crisis',
    weight: 7,
    oneTime: false,
    choices: [
      {
        label: 'Emergency energy subsidies',
        description: 'Cap prices for households, subsidize heating. Expensive but prevents a humanitarian crisis.',
        effects: [
          { indicator: 'publicHappiness', delta: 6, delay: 0, duration: 0 },
          { indicator: 'publicDebt', delta: 4, delay: 0, duration: 0 },
          { indicator: 'gdpGrowth', delta: -0.3, delay: 0, duration: 4 },
        ],
        humor: 'Every Latvian grandmother already owns five wool sweaters. Government subsidies are merely a formality.',
      },
      {
        label: 'Accelerate renewable energy',
        description: 'Fast-track wind farm approvals, solar panel subsidies, biomass heating. Short-term pain, long-term independence.',
        effects: [
          { indicator: 'greenTransition', delta: 10, delay: 2, duration: 0 },
          { indicator: 'energyIndependence', delta: 8, delay: 3, duration: 0 },
          { indicator: 'publicHappiness', delta: -3, delay: 0, duration: 4 },
          { indicator: 'publicDebt', delta: 3, delay: 0, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.3, delay: 3, duration: 8 },
        ],
        humor: 'Latvia installs more wind turbines in one year than in the previous decade. The wind cooperates. For once.',
      },
      {
        label: 'Ask EU for emergency solidarity',
        description: 'Invoke EU energy solidarity clause. Request emergency gas from Germany and Norway.',
        effects: [
          { indicator: 'euStanding', delta: -2, delay: 0, duration: 0 },
          { indicator: 'natoRelations', delta: 2, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: 3, delay: 1, duration: 0 },
          { indicator: 'energyIndependence', delta: -3, delay: 0, duration: 0 },
        ],
        humor: 'Norway sends gas. Germany sends a strongly-worded letter of support. Same difference.',
      },
    ],
  },

  {
    id: 'banking_scandal',
    title: '🏦 Financial Scandal Rocks Riga',
    description: 'A major Latvian bank is caught facilitating money laundering for sanctioned entities. International media picks up the story. Shades of the ABLV and Parex bank scandals return.',
    preconditions: [{ indicator: 'corruptionLevel', op: '>', value: 35 }],
    category: 'crisis',
    weight: 5,
    oneTime: true,
    choices: [
      {
        label: 'Shut down the bank immediately',
        description: 'Zero tolerance. Close the bank, prosecute executives, cooperate fully with international investigators.',
        effects: [
          { indicator: 'corruptionLevel', delta: -8, delay: 1, duration: 0 },
          { indicator: 'foreignInvestment', delta: 5, delay: 2, duration: 0 },
          { indicator: 'euStanding', delta: 5, delay: 1, duration: 0 },
          { indicator: 'gdpGrowth', delta: -0.4, delay: 0, duration: 4 },
          { indicator: 'unemployment', delta: 1, delay: 1, duration: 4 },
        ],
        humor: 'The bank\'s CEO is last seen boarding a plane to... actually, he\'s arrested at the gate. Justice works occasionally.',
      },
      {
        label: 'Investigate quietly',
        description: 'Handle it behind closed doors. Reform the bank, tighten regulations, avoid a public panic.',
        effects: [
          { indicator: 'corruptionLevel', delta: -2, delay: 2, duration: 0 },
          { indicator: 'mediaTrust', delta: -5, delay: 1, duration: 0 },
          { indicator: 'euStanding', delta: -3, delay: 1, duration: 0 },
        ],
        humor: 'The investigation takes 3 years. The report is 800 pages. Nobody reads it. The bank rebrands.',
      },
    ],
  },

  {
    id: 'pandemic_preparedness',
    title: '🦠 New Pandemic Threat',
    description: 'WHO issues a pandemic preparedness alert. A new respiratory virus is spreading in Southeast Asia. Latvia\'s healthcare system, already stretched thin, must prepare. Memories of COVID are fresh.',
    preconditions: [],
    category: 'crisis',
    weight: 4,
    oneTime: true,
    choices: [
      {
        label: 'Proactive: stockpile and prepare',
        description: 'Buy medical supplies, prepare hospital capacity, fund vaccine research. Be ready this time.',
        effects: [
          { indicator: 'healthcareQuality', delta: 6, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: 3, delay: 1, duration: 0 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
        ],
        humor: 'Latvia has learned from COVID: this time, the mask stockpile actually fits human faces.',
      },
      {
        label: 'Wait and see',
        description: 'Most pandemic scares fizzle out. Don\'t waste money on a threat that might not materialize.',
        effects: [
          { indicator: 'publicHappiness', delta: -2, delay: 3, duration: 4 },
          { indicator: 'healthcareQuality', delta: -3, delay: 3, duration: 4 },
        ],
        humor: '"It\'ll be fine," says the Health Minister, crossing fingers behind their back.',
      },
    ],
  },

  {
    id: 'demographic_tipping_point',
    title: '📉 Demographic Emergency',
    description: 'The Central Statistical Bureau releases devastating numbers: population projected to fall below 1.5M by 2040. More Latvians live abroad than in Latgale. The alarm bells are deafening.',
    preconditions: [{ indicator: 'population', op: '<', value: 1.7 }],
    category: 'crisis',
    weight: 9,
    oneTime: true,
    choices: [
      {
        label: 'Baby Bonus: radical family support',
        description: '€5,000 per child, 2 years paid parental leave, free childcare. Make having kids in Latvia irresistible.',
        effects: [
          { indicator: 'birthRate', delta: 10, delay: 2, duration: 0 },
          { indicator: 'emigrationRate', delta: -5, delay: 2, duration: 0 },
          { indicator: 'publicHappiness', delta: 5, delay: 1, duration: 0 },
          { indicator: 'publicDebt', delta: 5, delay: 0, duration: 0 },
          { indicator: 'population', delta: 0.02, delay: 4, duration: 0 },
        ],
        humor: 'Latvia\'s birth rate needs to hit 2.1 to stabilize. Current: 1.16. The gap is... significant. But €5,000 helps.',
      },
      {
        label: 'Open immigration policy',
        description: 'Welcome skilled workers from anywhere: Ukraine, India, Philippines, Brazil. Latvia needs people, period.',
        effects: [
          { indicator: 'population', delta: 0.04, delay: 2, duration: 0 },
          { indicator: 'workforceSkill', delta: 5, delay: 2, duration: 0 },
          { indicator: 'socialCohesion', delta: -6, delay: 2, duration: 4 },
          { indicator: 'gdpGrowth', delta: 0.4, delay: 2, duration: 6 },
          { indicator: 'nationalIdentity', delta: -5, delay: 2, duration: 0 },
        ],
        humor: '"Latvia: land of opportunity!" reads the ad in Mumbai. Several people Google where Latvia is.',
      },
      {
        label: 'Embrace being small',
        description: 'Small can be beautiful. Focus on quality of life, high-value economy, and making Latvia the best place for 1.5 million people.',
        effects: [
          { indicator: 'publicHappiness', delta: 4, delay: 1, duration: 0 },
          { indicator: 'techSector', delta: 4, delay: 2, duration: 0 },
          { indicator: 'educationQuality', delta: 3, delay: 2, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.2, delay: 2, duration: 8 },
        ],
        humor: 'Iceland has 380,000 people and nobody calls it a failed state. Latvia will be the Iceland of the Baltics. But with forests.',
      },
    ],
  },
];
