import { GameEvent } from '../engine/types';

export const economyEvents: GameEvent[] = [
  {
    id: 'rail_baltica',
    title: '🚄 Rail Baltica: The Never-Ending Railway',
    description: 'The Rail Baltica project connecting Helsinki-Tallinn-Riga-Warsaw is behind schedule (again). The EU offers additional funding, but Latvia must commit more co-financing. Estonia and Lithuania are getting impatient.',
    preconditions: [],
    category: 'economy',
    weight: 8,
    oneTime: true,
    flavor: 'The Estonians are already designing their station\'s gift shop. Lithuania has started selling tickets. Latvia is still debating the route.',
    choices: [
      {
        label: 'Go all-in on Rail Baltica',
        description: 'Commit maximum co-financing. Fast-track construction. Latvia will be the connection hub of the Baltics.',
        effects: [
          { indicator: 'publicDebt', delta: 4, delay: 0, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.8, delay: 3, duration: 8 },
          { indicator: 'foreignInvestment', delta: 8, delay: 4, duration: 0 },
          { indicator: 'euStanding', delta: 5, delay: 2, duration: 0 },
          { indicator: 'portActivity', delta: 6, delay: 4, duration: 0 },
        ],
        humor: 'The infrastructure minister starts wearing a conductor\'s hat to cabinet meetings.',
      },
      {
        label: 'Minimize Latvia\'s contribution',
        description: 'Do the bare minimum. Save money now. Let the Estonians and Lithuanians carry the burden.',
        effects: [
          { indicator: 'publicDebt', delta: -1, delay: 0, duration: 0 },
          { indicator: 'euStanding', delta: -4, delay: 1, duration: 0 },
          { indicator: 'foreignInvestment', delta: -3, delay: 2, duration: 0 },
        ],
        humor: 'The train will have a station in Latvia. It just won\'t stop there very often.',
      },
      {
        label: 'Renegotiate for a Riga hub',
        description: 'Use diplomatic leverage to make Riga the central hub with a major logistics center. More investment now, but Latvia controls the chokepoint.',
        effects: [
          { indicator: 'publicDebt', delta: 6, delay: 0, duration: 0 },
          { indicator: 'gdpGrowth', delta: 1.2, delay: 5, duration: 12 },
          { indicator: 'portActivity', delta: 12, delay: 5, duration: 0 },
          { indicator: 'euStanding', delta: 3, delay: 3, duration: 0 },
          { indicator: 'foreignInvestment', delta: 12, delay: 5, duration: 0 },
        ],
        humor: 'Latvia: "We meant to put the station in our country." Estonia: "...yes, that\'s how railways work."',
      },
    ],
  },

  {
    id: 'flat_tax_debate',
    title: '💸 The Great Tax Debate',
    description: 'The progressive tax experiment (introduced in 2018) is being questioned. Business groups want a return to flat tax to attract investment. Social democrats want even more progressive rates to fund healthcare.',
    preconditions: [],
    category: 'economy',
    weight: 7,
    oneTime: false,
    choices: [
      {
        label: 'Return to flat tax',
        description: 'A simple 20% flat rate. Business-friendly, attractive to investors, but reduces revenue for social programs.',
        effects: [
          { indicator: 'foreignInvestment', delta: 8, delay: 1, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.5, delay: 2, duration: 4 },
          { indicator: 'healthcareQuality', delta: -4, delay: 2, duration: 0 },
          { indicator: 'publicHappiness', delta: -3, delay: 1, duration: 0 },
          { indicator: 'taxBurden', delta: -5, delay: 0, duration: 0 },
        ],
        humor: 'Oligarchs in Jūrmala celebrate with champagne. Hospital queues grow slightly longer.',
      },
      {
        label: 'Steepen the progressive tax',
        description: 'Higher rates on the wealthy. More funding for healthcare and education. But some businesses may relocate to Estonia.',
        effects: [
          { indicator: 'healthcareQuality', delta: 5, delay: 2, duration: 0 },
          { indicator: 'educationQuality', delta: 3, delay: 2, duration: 0 },
          { indicator: 'foreignInvestment', delta: -5, delay: 1, duration: 0 },
          { indicator: 'emigrationRate', delta: 3, delay: 2, duration: 4 },
          { indicator: 'publicHappiness', delta: 2, delay: 1, duration: 0 },
          { indicator: 'taxBurden', delta: 5, delay: 0, duration: 0 },
        ],
        humor: 'A prominent businessman tweets from his new Tallinn office: "Estonia is beautiful this time of year."',
      },
      {
        label: 'Keep the current system',
        description: 'If it ain\'t broke, don\'t fix it. The current progressive system is a compromise.',
        effects: [
          { indicator: 'publicHappiness', delta: 1, delay: 0, duration: 0 },
        ],
        humor: 'The most Latvian decision possible: do nothing and hope for the best.',
      },
    ],
  },

  {
    id: 'airbaltic_crisis',
    title: '✈️ airBaltic: Fly Me to the Bailout',
    description: 'National carrier airBaltic is losing money again. The airline connects Latvia to 80+ destinations and is crucial for tourism and business — but it\'s bleeding cash. The CEO wants a €200M injection.',
    preconditions: [{ indicator: 'gdpGrowth', op: '<', value: 4 }],
    category: 'economy',
    weight: 6,
    oneTime: true,
    choices: [
      {
        label: 'Bail out airBaltic',
        description: 'Inject public funds. Latvia needs a national airline for connectivity and pride.',
        effects: [
          { indicator: 'publicDebt', delta: 3, delay: 0, duration: 0 },
          { indicator: 'foreignInvestment', delta: 3, delay: 2, duration: 0 },
          { indicator: 'nationalIdentity', delta: 2, delay: 0, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.3, delay: 2, duration: 4 },
        ],
        humor: 'At least the in-flight magazine will continue to feature Riga\'s top 10 hipster cafes.',
      },
      {
        label: 'Let the market decide',
        description: 'No more bailouts. Either airBaltic survives on its own or Ryanair takes over the routes.',
        effects: [
          { indicator: 'foreignInvestment', delta: -2, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: -3, delay: 1, duration: 4 },
          { indicator: 'portActivity', delta: -3, delay: 2, duration: 0 },
        ],
        humor: 'Ryanair: "Did someone say abandoned routes?" *rubs hands excitedly*',
      },
      {
        label: 'Partial privatization via IPO',
        description: 'Sell 49% to private investors. Keep control but get fresh capital. The IPO could attract global interest.',
        effects: [
          { indicator: 'foreignInvestment', delta: 6, delay: 2, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.4, delay: 3, duration: 6 },
          { indicator: 'publicDebt', delta: -1, delay: 1, duration: 0 },
        ],
        humor: 'Shares in airBaltic: the perfect gift for the person who has everything except a return on investment.',
      },
    ],
  },

  {
    id: 'port_pivot',
    title: '🚢 Port of Ventspils: Looking for New Friends',
    description: 'After sanctions cut off Russian transit trade, the ports of Ventspils and Riga are running at 40% capacity. The infrastructure is world-class but the cargo has vanished. New trade routes must be found.',
    preconditions: [{ indicator: 'portActivity', op: '<', value: 55 }],
    category: 'economy',
    weight: 7,
    oneTime: true,
    choices: [
      {
        label: 'Pivot to Asian logistics hub',
        description: 'Court Chinese and Central Asian trade via the Middle Corridor. Massive marketing push at international shipping conferences.',
        effects: [
          { indicator: 'portActivity', delta: 15, delay: 4, duration: 0 },
          { indicator: 'foreignInvestment', delta: 8, delay: 3, duration: 0 },
          { indicator: 'natoRelations', delta: -3, delay: 2, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.6, delay: 4, duration: 8 },
        ],
        humor: 'Latvia: "We\'re a gateway to Europe!" China: "Which one were you again?"',
      },
      {
        label: 'Focus on Nordic-Baltic trade',
        description: 'Strengthen ties with Sweden, Finland, Denmark. Smaller volume but politically safe.',
        effects: [
          { indicator: 'portActivity', delta: 8, delay: 2, duration: 0 },
          { indicator: 'euStanding', delta: 4, delay: 1, duration: 0 },
          { indicator: 'natoRelations', delta: 2, delay: 1, duration: 0 },
        ],
        humor: 'Swedish cargo ships arrive with IKEA furniture. Latvia re-exports it to Lithuania at a markup. Peak Baltic economics.',
      },
      {
        label: 'Convert ports to green energy hubs',
        description: 'Transform Ventspils port infrastructure into offshore wind farm support base and hydrogen production facility.',
        effects: [
          { indicator: 'portActivity', delta: 5, delay: 3, duration: 0 },
          { indicator: 'greenTransition', delta: 12, delay: 3, duration: 0 },
          { indicator: 'energyIndependence', delta: 8, delay: 4, duration: 0 },
          { indicator: 'euStanding', delta: 6, delay: 3, duration: 0 },
          { indicator: 'publicDebt', delta: 3, delay: 0, duration: 0 },
        ],
        humor: 'Where oil tankers once docked, wind turbine blades now wait to be mounted. Progress looks different than expected.',
      },
    ],
  },

  {
    id: 'housing_crisis',
    title: '🏠 Housing Crisis Hits Riga',
    description: 'Housing prices in Riga have surged 40% while wages grew only 15%. Young Latvians can\'t afford to buy. Many are choosing to rent... in Berlin.',
    preconditions: [{ indicator: 'gdpGrowth', op: '>', value: 1 }],
    category: 'economy',
    weight: 6,
    oneTime: false,
    choices: [
      {
        label: 'Build 10,000 public housing units',
        description: 'Major government construction program. Affordable housing for young families.',
        effects: [
          { indicator: 'publicDebt', delta: 5, delay: 0, duration: 0 },
          { indicator: 'emigrationRate', delta: -6, delay: 2, duration: 0 },
          { indicator: 'birthRate', delta: 4, delay: 3, duration: 0 },
          { indicator: 'publicHappiness', delta: 5, delay: 2, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.4, delay: 1, duration: 4 },
        ],
        humor: 'The apartments are small, but the sense of actually owning something in Latvia? Priceless.',
      },
      {
        label: 'Tax foreign property buyers',
        description: 'Limit speculation by taxing non-resident purchases heavily.',
        effects: [
          { indicator: 'foreignInvestment', delta: -4, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: 3, delay: 1, duration: 0 },
          { indicator: 'emigrationRate', delta: -2, delay: 2, duration: 0 },
        ],
        humor: 'Golden Visa holders in Jūrmala suddenly discover their love for... Tallinn.',
      },
      {
        label: 'Deregulate zoning laws',
        description: 'Let the market build more. Fewer regulations, faster construction. Some ugly buildings will result.',
        effects: [
          { indicator: 'gdpGrowth', delta: 0.3, delay: 1, duration: 4 },
          { indicator: 'publicHappiness', delta: -2, delay: 2, duration: 0 },
          { indicator: 'nationalIdentity', delta: -2, delay: 3, duration: 0 },
          { indicator: 'emigrationRate', delta: -3, delay: 3, duration: 0 },
        ],
        humor: 'Art Nouveau Riga meets Soviet Brutalism meets...whatever this new thing is. Architects weep.',
      },
    ],
  },

  {
    id: 'eu_funds_deadline',
    title: '🇪🇺 EU Funds: Use It or Lose It',
    description: 'Latvia has €5.6 billion in EU structural funds but has only absorbed 62%. The deadline approaches. Billions could go unspent and return to Brussels.',
    preconditions: [],
    category: 'economy',
    weight: 8,
    oneTime: true,
    choices: [
      {
        label: 'Rush to spend on infrastructure',
        description: 'Fast-track approved projects: roads, bridges, broadband. Not glamorous, but effective.',
        effects: [
          { indicator: 'digitalInfra', delta: 8, delay: 2, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.7, delay: 1, duration: 4 },
          { indicator: 'corruptionLevel', delta: 3, delay: 1, duration: 4 },
          { indicator: 'euStanding', delta: 2, delay: 0, duration: 0 },
        ],
        humor: 'Roads are being paved that lead to villages where three people and a cat live. But those three people are very happy.',
      },
      {
        label: 'Invest in human capital',
        description: 'Redirect funds to education, retraining programs, and digital skills. Higher long-term return.',
        effects: [
          { indicator: 'educationQuality', delta: 8, delay: 2, duration: 0 },
          { indicator: 'workforceSkill', delta: 10, delay: 3, duration: 0 },
          { indicator: 'techSector', delta: 5, delay: 3, duration: 0 },
          { indicator: 'euStanding', delta: 3, delay: 1, duration: 0 },
        ],
        humor: 'Every Latvian grandmother now has a LinkedIn profile. The future is here.',
      },
      {
        label: 'Return the funds, negotiate for next cycle',
        description: 'Accept the loss. Focus on getting a better deal in the next EU budget cycle.',
        effects: [
          { indicator: 'euStanding', delta: -6, delay: 0, duration: 0 },
          { indicator: 'publicHappiness', delta: -4, delay: 1, duration: 0 },
        ],
        humor: 'Latvia returns €2 billion to the EU. Brussels is confused. "That has literally never happened before."',
      },
    ],
  },

  {
    id: 'timber_boom',
    title: '🌲 The Forest Question',
    description: 'Latvia\'s state forests (56% of territory) are a goldmine. Global timber prices are soaring. But environmental groups demand stricter protections. Latvia\'s forests absorb carbon and shelter biodiversity.',
    preconditions: [],
    category: 'economy',
    weight: 5,
    oneTime: false,
    choices: [
      {
        label: 'Increase sustainable logging',
        description: 'Boost production 20% with certified sustainable practices. Good for revenue, acceptable for environment.',
        effects: [
          { indicator: 'gdpGrowth', delta: 0.4, delay: 1, duration: 6 },
          { indicator: 'greenTransition', delta: -3, delay: 1, duration: 0 },
          { indicator: 'euStanding', delta: -2, delay: 2, duration: 0 },
          { indicator: 'publicDebt', delta: -2, delay: 1, duration: 0 },
        ],
        humor: 'Every Latvian oak has a story. Some of those stories now end at IKEA.',
      },
      {
        label: 'Create carbon credit marketplace',
        description: 'Keep forests standing. Sell carbon credits to European companies. Latvia becomes Europe\'s "green lung".',
        effects: [
          { indicator: 'greenTransition', delta: 10, delay: 2, duration: 0 },
          { indicator: 'euStanding', delta: 6, delay: 2, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.3, delay: 3, duration: 8 },
          { indicator: 'foreignInvestment', delta: 4, delay: 3, duration: 0 },
        ],
        humor: 'German companies pay Latvia to not cut trees. Latvia nods wisely. This is peak 21st-century economics.',
      },
      {
        label: 'Protect forests, ban commercial logging',
        description: 'Full environmental protection. Great for global image, bad for the timber industry and rural jobs.',
        effects: [
          { indicator: 'greenTransition', delta: 15, delay: 1, duration: 0 },
          { indicator: 'gdpGrowth', delta: -0.3, delay: 1, duration: 4 },
          { indicator: 'unemployment', delta: 2, delay: 1, duration: 6 },
          { indicator: 'euStanding', delta: 4, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: -3, delay: 1, duration: 4 },
        ],
        humor: 'The moose are thrilled. The lumberjacks are updating their CVs.',
      },
    ],
  },
];
