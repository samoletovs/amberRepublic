import { GameEvent } from '../engine/types';

export const securityEvents: GameEvent[] = [
  {
    id: 'belarus_border_crisis',
    title: '🚧 Belarus Border Crisis 2.0',
    description: 'Lukashenko is again weaponizing migrants at the Latvia-Belarus border. Hundreds of people from the Middle East are being pushed toward the border. EU demands a united response. Media attention is intense.',
    preconditions: [{ indicator: 'russiaRelations', op: '<', value: 30 }],
    category: 'security',
    weight: 7,
    oneTime: false,
    choices: [
      {
        label: 'Reinforce the border wall',
        description: 'Deploy troops, build barriers, enforce strict pushbacks. Effective but draws human rights criticism.',
        effects: [
          { indicator: 'borderSecurity', delta: 12, delay: 0, duration: 0 },
          { indicator: 'militaryReadiness', delta: 3, delay: 0, duration: 0 },
          { indicator: 'euStanding', delta: -3, delay: 1, duration: 4 },
          { indicator: 'publicHappiness', delta: 2, delay: 0, duration: 0 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
        ],
        humor: 'The border wall is now the most photographed location in Latgale. Instagram influencers are confused.',
      },
      {
        label: 'Humanitarian approach',
        description: 'Set up processing centers. Accept some refugees. Maintain moral high ground but risk domestic backlash.',
        effects: [
          { indicator: 'euStanding', delta: 6, delay: 1, duration: 0 },
          { indicator: 'socialCohesion', delta: -5, delay: 1, duration: 4 },
          { indicator: 'publicHappiness', delta: -4, delay: 0, duration: 4 },
          { indicator: 'natoRelations', delta: 2, delay: 1, duration: 0 },
        ],
        humor: 'Latvia is suddenly trending on Reddit. The comments section is exactly what you\'d expect.',
      },
      {
        label: 'Call for EU-wide response',
        description: 'Refuse to act alone. Demand EU solidarity, shared burden, and collective sanctions on Belarus.',
        effects: [
          { indicator: 'euStanding', delta: 4, delay: 1, duration: 0 },
          { indicator: 'natoRelations', delta: 3, delay: 1, duration: 0 },
          { indicator: 'borderSecurity', delta: 5, delay: 2, duration: 0 },
          { indicator: 'russiaRelations', delta: -3, delay: 1, duration: 0 },
        ],
        humor: '"This is a European problem!" declares Latvia. Western Europe nods sympathetically from behind their existing border fences.',
      },
    ],
  },

  {
    id: 'russian_cyber_attack',
    title: '🔒 Massive Cyber Attack on Government Systems',
    description: 'A sophisticated cyber attack, attributed to Russian state hackers, has compromised government databases. Citizen data, tax records, and military communications have been targeted. The NATO Cyber Defence Centre in Tallinn is offering help.',
    preconditions: [{ indicator: 'cyberDefense', op: '<', value: 65 }],
    category: 'security',
    weight: 6,
    oneTime: false,
    choices: [
      {
        label: 'Launch joint NATO cyber response',
        description: 'Invoke Article 5 consultation. Coordinate with allies. Strong signal but escalatory.',
        effects: [
          { indicator: 'cyberDefense', delta: 10, delay: 1, duration: 0 },
          { indicator: 'natoRelations', delta: 8, delay: 0, duration: 0 },
          { indicator: 'russiaRelations', delta: -5, delay: 0, duration: 0 },
          { indicator: 'mediaTrust', delta: -3, delay: 0, duration: 4 },
        ],
        humor: 'NATO cybersecurity experts arrive in Riga. They bring coffee, laptops, and the quiet confidence of people who write code in four languages.',
      },
      {
        label: 'Invest massively in domestic cyber defense',
        description: 'Build a national cyber command. Recruit from universities. Latvia will defend itself.',
        effects: [
          { indicator: 'cyberDefense', delta: 15, delay: 3, duration: 0 },
          { indicator: 'techSector', delta: 5, delay: 2, duration: 0 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
          { indicator: 'workforceSkill', delta: 3, delay: 3, duration: 0 },
        ],
        humor: 'RTU students discover that "ethical hacking" is suddenly a viable career path with government health insurance.',
      },
      {
        label: 'Quietly patch and don\'t publicize',
        description: 'Fix the vulnerabilities, improve security, but don\'t make it a diplomatic incident.',
        effects: [
          { indicator: 'cyberDefense', delta: 5, delay: 1, duration: 0 },
          { indicator: 'mediaTrust', delta: -5, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: -2, delay: 2, duration: 4 },
        ],
        humor: 'The official statement reads: "There was a minor IT incident." The minor IT incident involved 2 million records.',
      },
    ],
  },

  {
    id: 'nato_spending',
    title: '🪖 NATO Wants More',
    description: 'NATO allies are pushing all members to spend 3% of GDP on defense (up from the 2% target). Latvia currently spends 2.5%. Increasing further means cuts elsewhere or more debt.',
    preconditions: [],
    category: 'security',
    weight: 6,
    oneTime: false,
    choices: [
      {
        label: 'Increase to 3% GDP',
        description: 'Latvia leads by example. Buy new equipment, expand the National Guard, build bunkers.',
        effects: [
          { indicator: 'militaryReadiness', delta: 12, delay: 1, duration: 0 },
          { indicator: 'natoRelations', delta: 8, delay: 0, duration: 0 },
          { indicator: 'publicDebt', delta: 4, delay: 0, duration: 0 },
          { indicator: 'healthcareQuality', delta: -3, delay: 1, duration: 0 },
          { indicator: 'educationQuality', delta: -2, delay: 1, duration: 0 },
        ],
        humor: 'Every soldier gets a new helmet. Every hospital loses a doctor. Security is expensive.',
      },
      {
        label: 'Smart defense: invest in cyber & drones',
        description: 'Don\'t buy tanks, buy technology. Asymmetric defense is cheaper and arguably more effective.',
        effects: [
          { indicator: 'militaryReadiness', delta: 5, delay: 2, duration: 0 },
          { indicator: 'cyberDefense', delta: 10, delay: 1, duration: 0 },
          { indicator: 'techSector', delta: 5, delay: 2, duration: 0 },
          { indicator: 'natoRelations', delta: 3, delay: 1, duration: 0 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
        ],
        humor: 'Latvia\'s drone army is smaller than Estonia\'s. But at least the drones have Latvian language packs.',
      },
      {
        label: 'Maintain current 2.5%',
        description: 'Latvia already contributes more than most. Enough is enough.',
        effects: [
          { indicator: 'natoRelations', delta: -4, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: 2, delay: 0, duration: 0 },
          { indicator: 'healthcareQuality', delta: 2, delay: 1, duration: 0 },
        ],
        humor: 'The US Defense Secretary raises an eyebrow. Just one eyebrow. That\'s enough.',
      },
    ],
  },

  {
    id: 'russian_propaganda',
    title: '📺 Russian Media Influence Campaign',
    description: 'Despite banning Russian TV channels, social media algorithms are flooding Latvian Russian-speakers with Kremlin propaganda. Disinformation about NATO, EU, and Latvian government is rampant.',
    preconditions: [{ indicator: 'russianMinorityIntegration', op: '<', value: 55 }],
    category: 'security',
    weight: 7,
    oneTime: false,
    choices: [
      {
        label: 'Create Latvian Russian-language media',
        description: 'Fund high-quality Russian-language news, entertainment, and culture produced in Latvia. Fight propaganda with better content.',
        effects: [
          { indicator: 'russianMinorityIntegration', delta: 8, delay: 2, duration: 0 },
          { indicator: 'mediaTrust', delta: 6, delay: 2, duration: 0 },
          { indicator: 'socialCohesion', delta: 5, delay: 3, duration: 0 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
        ],
        humor: 'The new Russian-language morning show features a Latvian grandmother teaching Russian-speakers how to make grey peas. Ratings are unexpectedly high.',
      },
      {
        label: 'Block social media platforms',
        description: 'Restrict access to Telegram channels, VK, and other Russian platforms spreading disinformation.',
        effects: [
          { indicator: 'mediaTrust', delta: -3, delay: 0, duration: 0 },
          { indicator: 'socialCohesion', delta: -5, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: -4, delay: 0, duration: 0 },
          { indicator: 'euStanding', delta: -3, delay: 1, duration: 0 },
          { indicator: 'russianMinorityIntegration', delta: -4, delay: 1, duration: 0 },
        ],
        humor: 'VPN downloads in Latvia increase by 4000%. Privacy advocates and Russian grandmothers unite in unexpected solidarity.',
      },
      {
        label: 'Digital literacy campaign',
        description: 'Teach critical thinking about media. Slower but more sustainable. Partner with schools and libraries.',
        effects: [
          { indicator: 'mediaTrust', delta: 5, delay: 4, duration: 0 },
          { indicator: 'russianMinorityIntegration', delta: 4, delay: 4, duration: 0 },
          { indicator: 'educationQuality', delta: 3, delay: 2, duration: 0 },
        ],
        humor: 'Latvian babushkas learn the term "fact-checking." They have been doing it for decades, just without the internet.',
      },
    ],
  },

  {
    id: 'ukraine_refugees',
    title: '🇺🇦 Ukraine War: Year 4+',
    description: 'The war in Ukraine continues. Latvia has taken in refugees proportional to its population size — more than most EU countries. Costs are mounting. But solidarity with Ukraine is a core value.',
    preconditions: [],
    category: 'security',
    weight: 5,
    oneTime: false,
    choices: [
      {
        label: 'Double down on Ukraine support',
        description: 'Increase military aid, take more refugees, push EU for stronger sanctions. Latvia leads the moral charge.',
        effects: [
          { indicator: 'natoRelations', delta: 6, delay: 0, duration: 0 },
          { indicator: 'euStanding', delta: 5, delay: 0, duration: 0 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
          { indicator: 'russiaRelations', delta: -3, delay: 0, duration: 0 },
          { indicator: 'publicHappiness', delta: -2, delay: 1, duration: 4 },
          { indicator: 'socialCohesion', delta: -2, delay: 1, duration: 4 },
        ],
        humor: 'Latvia sends the 42nd shipment of military equipment. "We don\'t have much," says the Defence Minister, "but we know what it\'s like to have a big neighbor."',
      },
      {
        label: 'Maintain current level, shift to integration',
        description: 'Focus on integrating Ukrainian refugees already here. Jobs, language, housing. Make them Latvian.',
        effects: [
          { indicator: 'population', delta: 0.02, delay: 1, duration: 0 },
          { indicator: 'workforceSkill', delta: 3, delay: 2, duration: 0 },
          { indicator: 'publicHappiness', delta: 2, delay: 2, duration: 0 },
          { indicator: 'socialCohesion', delta: 3, delay: 3, duration: 0 },
        ],
        humor: 'A Ukrainian software developer in Riga discovers that Latvians and Ukrainians share a love of borshch and a deep suspicion of Moscow.',
      },
    ],
  },
];
