import type { GameEvent } from '../engine/types';

/** Events triggered by regional inequality — real disparities between Riga and Latgale */
export const regionalEvents: GameEvent[] = [
  {
    id: 'regional_latgale_unemployment',
    title: 'Latgale Unemployment Crisis',
    description: 'Latgale\'s unemployment rate is nearly triple Riga\'s. Regional protests erupt as factories close and youth flee to the capital. The Daugavpils mayor demands emergency funding.',
    preconditions: [{ indicator: 'unemployment', op: '>', value: 8 }],
    choices: [
      {
        label: 'Emergency Regional Fund',
        description: 'Redirect €200M to Latgale infrastructure and job programs',
        effects: [
          { indicator: 'unemployment', delta: -2, delay: 2, duration: 3 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 1 },
          { indicator: 'socialCohesion', delta: 4, delay: 1, duration: 2 },
          { indicator: 'publicHappiness', delta: 2, delay: 1, duration: 2 },
        ],
        humor: 'Latgale finally gets a new road. Critics note it leads straight to Riga.',
      },
      {
        label: 'Market Forces',
        description: 'Let the free market sort it out — mobility is the answer',
        effects: [
          { indicator: 'emigrationRate', delta: 5, delay: 1, duration: 3 },
          { indicator: 'population', delta: -0.02, delay: 2, duration: 2 },
          { indicator: 'socialCohesion', delta: -5, delay: 1, duration: 2 },
        ],
        humor: 'The market\'s answer: move to Riga. Or Dublin.',
      },
      {
        label: 'Special Economic Zone',
        description: 'Create tax-free zones in Daugavpils and Rēzekne to attract investment',
        effects: [
          { indicator: 'foreignInvestment', delta: 3, delay: 2, duration: 4 },
          { indicator: 'unemployment', delta: -1, delay: 3, duration: 3 },
          { indicator: 'taxBurden', delta: -1, delay: 0, duration: 1 },
          { indicator: 'russianMinorityIntegration', delta: 3, delay: 2, duration: 2 },
        ],
        humor: 'Chinese investors arrive. They\'re confused by the pelmeņi menu being in three languages.',
      },
    ],
    category: 'economy',
    weight: 1.2,
    oneTime: false,
    flavor: 'Latvia\'s east-west divide grows wider every year.',
  },
  {
    id: 'regional_riga_housing',
    title: 'Riga Housing Bubble',
    description: 'Property prices in Riga surge 25% as young professionals crowd the capital. Meanwhile, houses in Kurzeme sell for €10,000. The regional divide threatens social cohesion.',
    preconditions: [{ indicator: 'gdpGrowth', op: '>', value: 3 }],
    choices: [
      {
        label: 'Rent Controls',
        description: 'Cap rent increases in Riga at 5% per year',
        effects: [
          { indicator: 'publicHappiness', delta: 3, delay: 0, duration: 2 },
          { indicator: 'foreignInvestment', delta: -3, delay: 1, duration: 2 },
          { indicator: 'socialCohesion', delta: 2, delay: 0, duration: 1 },
        ],
        humor: 'Landlords discover a sudden passion for "renovations" that require tenants to leave.',
      },
      {
        label: 'Regional Incentives',
        description: 'Tax breaks for companies hiring outside Riga',
        effects: [
          { indicator: 'socialCohesion', delta: 3, delay: 2, duration: 3 },
          { indicator: 'taxBurden', delta: -1, delay: 0, duration: 1 },
          { indicator: 'emigrationRate', delta: -2, delay: 2, duration: 2 },
        ],
        humor: 'IT companies discover that Sigulda has good WiFi AND better air quality.',
      },
    ],
    category: 'economy',
    weight: 0.9,
    oneTime: true,
  },
  {
    id: 'regional_kurzeme_ports',
    title: 'Kurzeme Port Revival',
    description: 'With Russian transit gone, Ventspils and Liepāja ports are struggling. But there\'s an opportunity — green energy terminals and LNG storage could transform the coast.',
    preconditions: [{ indicator: 'portActivity', op: '<', value: 50 }],
    choices: [
      {
        label: 'Green Energy Hub',
        description: 'Convert port infrastructure for offshore wind servicing and LNG',
        effects: [
          { indicator: 'portActivity', delta: 8, delay: 3, duration: 4 },
          { indicator: 'greenTransition', delta: 5, delay: 2, duration: 3 },
          { indicator: 'energyIndependence', delta: 4, delay: 3, duration: 3 },
          { indicator: 'publicDebt', delta: 3, delay: 0, duration: 1 },
        ],
        humor: 'Ventspils now exports wind instead of importing oil. The irony is not lost on the mayor.',
      },
      {
        label: 'Tourist Marina',
        description: 'Convert to cruise ship terminals and yacht marinas',
        effects: [
          { indicator: 'portActivity', delta: 4, delay: 2, duration: 3 },
          { indicator: 'publicHappiness', delta: 2, delay: 2, duration: 2 },
          { indicator: 'foreignInvestment', delta: 2, delay: 1, duration: 2 },
        ],
        humor: 'German yachts arrive. They\'re very particular about the dock alignment.',
      },
    ],
    category: 'economy',
    weight: 1.0,
    oneTime: true,
    flavor: 'Real CSP data shows Kurzeme ports lost 60% of cargo since 2022 Russian sanctions.',
  },
];

/** Trade-related events based on real Latvia trade patterns */
export const tradeEvents: GameEvent[] = [
  {
    id: 'trade_baltic_corridor',
    title: 'Baltic Rail Freight Corridor',
    description: 'Lithuania and Estonia propose a joint Baltic logistics corridor — standardized rail, shared ports, unified customs. Rail Baltica could finally make the Baltics a single market.',
    preconditions: [{ indicator: 'euStanding', op: '>', value: 40 }],
    choices: [
      {
        label: 'Full Integration',
        description: 'Commit to the trilateral agreement with shared investment',
        effects: [
          { indicator: 'portActivity', delta: 6, delay: 3, duration: 4 },
          { indicator: 'gdpGrowth', delta: 0.5, delay: 3, duration: 3 },
          { indicator: 'euStanding', delta: 4, delay: 1, duration: 2 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 1 },
        ],
        humor: 'The three Baltic PMs shake hands. Finland watches jealously from across the sea.',
      },
      {
        label: 'Wait and Negotiate',
        description: 'Demand better terms — Latvia\'s ports are the most valuable',
        effects: [
          { indicator: 'portActivity', delta: 2, delay: 2, duration: 2 },
          { indicator: 'euStanding', delta: -2, delay: 1, duration: 1 },
        ],
        humor: 'Lithuania sighs. "We\'ll call you when you\'re ready."',
      },
    ],
    category: 'diplomacy',
    weight: 1.1,
    oneTime: true,
  },
  {
    id: 'trade_china_investment',
    title: 'Chinese Investment Offer',
    description: 'A Chinese consortium offers €500M to develop Riga\'s free port zone. The investment would create 2,000 jobs, but NATO allies are concerned about strategic infrastructure.',
    preconditions: [{ indicator: 'natoRelations', op: '>', value: 30 }],
    choices: [
      {
        label: 'Accept with Conditions',
        description: 'Allow investment but restrict access to sensitive port areas',
        effects: [
          { indicator: 'foreignInvestment', delta: 6, delay: 1, duration: 3 },
          { indicator: 'portActivity', delta: 4, delay: 2, duration: 3 },
          { indicator: 'natoRelations', delta: -4, delay: 1, duration: 2 },
          { indicator: 'gdpGrowth', delta: 0.3, delay: 2, duration: 2 },
        ],
        humor: 'The US ambassador files a "concerned memo." The Latvian ambassador files it under "collection growing."',
      },
      {
        label: 'Decline Politely',
        description: 'Thank China but prioritize NATO alignment',
        effects: [
          { indicator: 'natoRelations', delta: 3, delay: 0, duration: 1 },
          { indicator: 'foreignInvestment', delta: -2, delay: 0, duration: 1 },
          { indicator: 'euStanding', delta: 2, delay: 0, duration: 1 },
        ],
        humor: 'China understands. They invest in the neighbor. The neighbor is now richer.',
      },
    ],
    category: 'diplomacy',
    weight: 0.9,
    oneTime: true,
    flavor: 'Latvia\'s top trade partners: Lithuania, Estonia, Germany, Sweden, Poland.',
  },
];

/** Crime and safety events */
export const crimeEvents: GameEvent[] = [
  {
    id: 'crime_cybercrime_wave',
    title: 'Cybercrime Wave Hits Latvia',
    description: 'Phishing attacks and ransomware incidents doubled this year. Banks report €50M in fraud losses. CERT.LV warns that Latvia\'s digital infrastructure is a target for Russian-linked hackers.',
    preconditions: [{ indicator: 'cyberDefense', op: '<', value: 60 }],
    choices: [
      {
        label: 'National Cyber Shield',
        description: 'Fund a dedicated cybersecurity center and mandatory training',
        effects: [
          { indicator: 'cyberDefense', delta: 8, delay: 2, duration: 3 },
          { indicator: 'digitalInfra', delta: 3, delay: 2, duration: 2 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 1 },
          { indicator: 'techSector', delta: 3, delay: 2, duration: 2 },
        ],
        humor: 'The IT security curriculum starts with: "Don\'t click links from your ex."',
      },
      {
        label: 'NATO Cooperation',
        description: 'Lean on NATO\'s Cooperative Cyber Defence Centre in Tallinn',
        effects: [
          { indicator: 'cyberDefense', delta: 5, delay: 1, duration: 2 },
          { indicator: 'natoRelations', delta: 3, delay: 0, duration: 1 },
        ],
        humor: 'Estonia helps. They\'ve been doing this since 2007. They\'re very patient about it.',
      },
    ],
    category: 'security',
    weight: 1.0,
    oneTime: false,
    flavor: 'CSP data: 37,000+ registered crimes in Latvia annually. Cybercrime is the fastest-growing category.',
  },
  {
    id: 'crime_corruption_scandal',
    title: 'Corruption Scandal in Procurement',
    description: 'KNAB (anti-corruption bureau) uncovers a €30M procurement fraud in road construction. Several officials are implicated. Public trust in government plummets.',
    preconditions: [{ indicator: 'corruptionLevel', op: '>', value: 30 }],
    choices: [
      {
        label: 'Full Investigation',
        description: 'Give KNAB expanded powers and prosecute aggressively',
        effects: [
          { indicator: 'corruptionLevel', delta: -6, delay: 2, duration: 3 },
          { indicator: 'mediaTrust', delta: 3, delay: 1, duration: 2 },
          { indicator: 'publicHappiness', delta: 2, delay: 2, duration: 2 },
          { indicator: 'foreignInvestment', delta: 3, delay: 3, duration: 2 },
        ],
        humor: 'The accused claim it was all a misunderstanding. The €30M just fell into their accounts.',
      },
      {
        label: 'Quiet Resignation',
        description: 'Accept resignations and move on — avoid destabilizing the coalition',
        effects: [
          { indicator: 'corruptionLevel', delta: 2, delay: 0, duration: 1 },
          { indicator: 'mediaTrust', delta: -4, delay: 0, duration: 2 },
          { indicator: 'publicHappiness', delta: -3, delay: 0, duration: 1 },
        ],
        humor: 'The officials retire to their suspiciously nice countryside properties.',
      },
    ],
    category: 'society',
    weight: 1.0,
    oneTime: false,
  },
  {
    id: 'crime_drug_trafficking',
    title: 'Drug Trafficking Ring Exposed',
    description: 'State Police dismantle a major drug ring operating through Riga port. International connections run through Lithuania and Scandinavia. The trial will be Latvia\'s largest drug case.',
    preconditions: [{ indicator: 'borderSecurity', op: '<', value: 65 }],
    choices: [
      {
        label: 'Strengthen Border Control',
        description: 'Invest in port scanning technology and border police',
        effects: [
          { indicator: 'borderSecurity', delta: 5, delay: 1, duration: 3 },
          { indicator: 'portActivity', delta: -2, delay: 0, duration: 1 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 1 },
        ],
        humor: 'Every container gets scanned. Customs agents are now the fittest people in Latvia.',
      },
      {
        label: 'International Task Force',
        description: 'Join an EU anti-trafficking cooperation with Nordic countries',
        effects: [
          { indicator: 'euStanding', delta: 3, delay: 0, duration: 2 },
          { indicator: 'borderSecurity', delta: 3, delay: 2, duration: 2 },
          { indicator: 'natoRelations', delta: 2, delay: 0, duration: 1 },
        ],
        humor: 'The Swedish police are very organized about their drug raids.',
      },
    ],
    category: 'security',
    weight: 0.8,
    oneTime: true,
  },
];

/** Seasonal events that fire based on quarter */
export const seasonalEvents: GameEvent[] = [
  {
    id: 'seasonal_song_festival',
    title: 'Latvian Song and Dance Festival',
    description: 'The quinquennial Song Festival approaches. 40,000 singers will gather in Mežaparks. It\'s the largest choral event in the world and a pillar of Latvian identity. But it costs millions to organize.',
    preconditions: [{ indicator: 'nationalIdentity', op: '>', value: 30 }],
    choices: [
      {
        label: 'Grand Festival',
        description: 'Full funding — make it the biggest yet',
        effects: [
          { indicator: 'nationalIdentity', delta: 8, delay: 0, duration: 2 },
          { indicator: 'publicHappiness', delta: 5, delay: 0, duration: 1 },
          { indicator: 'socialCohesion', delta: 4, delay: 0, duration: 2 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 1 },
        ],
        humor: '"Pūt, vējiņi" echoes across Riga. Even the pigeons seem moved.',
      },
      {
        label: 'Scaled Down',
        description: 'Reduced budget — focus on the ceremony, skip the extras',
        effects: [
          { indicator: 'nationalIdentity', delta: 3, delay: 0, duration: 1 },
          { indicator: 'publicHappiness', delta: 1, delay: 0, duration: 1 },
        ],
        humor: 'The singers perform beautifully. The porta-potty situation is less beautiful.',
      },
    ],
    category: 'culture',
    weight: 0.7,
    oneTime: false,
    flavor: 'The Song Festival is a UNESCO Masterpiece of Intangible Heritage.',
  },
  {
    id: 'seasonal_winter_energy',
    title: 'Winter Energy Demand Spike',
    description: 'December temperatures drop to -20°C. Energy demand surges. District heating systems strain under load. Electricity prices spike 40%. The elderly and poor are most vulnerable.',
    preconditions: [{ indicator: 'energyIndependence', op: '<', value: 70 }],
    choices: [
      {
        label: 'Emergency Subsidies',
        description: 'Subsidize heating for vulnerable households',
        effects: [
          { indicator: 'publicHappiness', delta: 3, delay: 0, duration: 1 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 1 },
          { indicator: 'socialCohesion', delta: 2, delay: 0, duration: 1 },
        ],
        humor: 'The subsidies keep grandmas warm. The budget gets a cold shoulder.',
      },
      {
        label: 'Accelerate Renewables',
        description: 'Announce a crash program for wind and solar capacity',
        effects: [
          { indicator: 'greenTransition', delta: 5, delay: 2, duration: 4 },
          { indicator: 'energyIndependence', delta: 4, delay: 3, duration: 3 },
          { indicator: 'publicDebt', delta: 3, delay: 0, duration: 1 },
        ],
        humor: 'By the time the wind farms are built, it\'s summer. Timing is not Latvia\'s strength.',
      },
    ],
    category: 'economy',
    weight: 1.0,
    oneTime: false,
    flavor: 'Latvia\'s winters test more than patience — they test energy policy.',
  },
  {
    id: 'seasonal_tourism_boom',
    title: 'Summer Tourism Season',
    description: 'Jūrmala beaches are packed. Riga Old Town buzzes with tourists. The tourism sector accounts for 5% of GDP and desperately needs the summer revenue after years of COVID disruption.',
    preconditions: [{ indicator: 'publicHappiness', op: '>', value: 25 }],
    choices: [
      {
        label: 'Promote Globally',
        description: 'Launch a major marketing campaign — "Baltic Pearl" branding',
        effects: [
          { indicator: 'foreignInvestment', delta: 2, delay: 0, duration: 1 },
          { indicator: 'gdpGrowth', delta: 0.3, delay: 0, duration: 1 },
          { indicator: 'publicHappiness', delta: 2, delay: 0, duration: 1 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 1 },
        ],
        humor: 'The campaign works. British stag parties discover Riga. Locals have mixed feelings.',
      },
      {
        label: 'Eco-Tourism Focus',
        description: 'Promote nature tourism — Gauja Valley, Kemeri bogs, cycling trails',
        effects: [
          { indicator: 'greenTransition', delta: 2, delay: 0, duration: 1 },
          { indicator: 'publicHappiness', delta: 2, delay: 0, duration: 1 },
          { indicator: 'nationalIdentity', delta: 2, delay: 0, duration: 1 },
        ],
        humor: 'German birdwatchers arrive. They\'re very quiet. And very thorough.',
      },
    ],
    category: 'economy',
    weight: 0.8,
    oneTime: false,
  },
  {
    id: 'seasonal_harvest',
    title: 'Agricultural Season Results',
    description: 'The harvest is in. Latvia\'s grain exports are significant, and this year\'s yield will affect rural livelihoods and food prices. Climate change is making weather patterns unpredictable.',
    preconditions: [],
    choices: [
      {
        label: 'Support Farmers',
        description: 'Maintain EU CAP subsidies and add national top-up',
        effects: [
          { indicator: 'publicHappiness', delta: 2, delay: 0, duration: 1 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 1 },
          { indicator: 'socialCohesion', delta: 1, delay: 0, duration: 1 },
        ],
        humor: 'Farmers are happy. The subsidy form, however, is 47 pages long.',
      },
      {
        label: 'Green Agriculture Push',
        description: 'Tie subsidies to organic and sustainable farming practices',
        effects: [
          { indicator: 'greenTransition', delta: 3, delay: 1, duration: 2 },
          { indicator: 'publicHappiness', delta: -1, delay: 0, duration: 1 },
          { indicator: 'euStanding', delta: 2, delay: 1, duration: 1 },
        ],
        humor: 'Converting to organic takes 3 years. Farmers note they still need to eat during those 3 years.',
      },
    ],
    category: 'economy',
    weight: 0.7,
    oneTime: false,
  },
];
