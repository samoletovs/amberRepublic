import { GameEvent } from '../engine/types';

export const societyEvents: GameEvent[] = [
  {
    id: 'brain_drain',
    title: '✈️ The Brain Drain Accelerates',
    description: 'Another 15,000 young Latvians left this year, mostly to Germany, Ireland, and the Nordics. Hospitals need doctors, schools need teachers, and companies need engineers. The ones who leave are the ones you can least afford to lose.',
    preconditions: [{ indicator: 'emigrationRate', op: '>', value: 45 }],
    category: 'society',
    weight: 9,
    oneTime: false,
    choices: [
      {
        label: 'Diaspora return program',
        description: 'Offer tax breaks, housing subsidies, and guaranteed jobs for Latvians who come home. Actively recruit from Dublin, London, and Berlin.',
        effects: [
          { indicator: 'emigrationRate', delta: -8, delay: 2, duration: 0 },
          { indicator: 'population', delta: 0.01, delay: 3, duration: 0 },
          { indicator: 'workforceSkill', delta: 5, delay: 2, duration: 0 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
          { indicator: 'publicHappiness', delta: 3, delay: 2, duration: 0 },
        ],
        humor: 'The "Come Home" campaign goes viral. A Latvian barista in Melbourne sees the ad and feels a single tear rolling down his cheek. He books a flight.',
      },
      {
        label: 'Raise minimum wage dramatically',
        description: 'If people leave for higher wages, make Latvian wages competitive. €1,200/month minimum.',
        effects: [
          { indicator: 'emigrationRate', delta: -5, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: 5, delay: 1, duration: 0 },
          { indicator: 'inflation', delta: 2, delay: 1, duration: 4 },
          { indicator: 'foreignInvestment', delta: -4, delay: 1, duration: 0 },
          { indicator: 'unemployment', delta: 1.5, delay: 1, duration: 4 },
        ],
        humor: 'McDonald\'s Riga now pays more than a junior doctor. Something has gone very right, or very wrong.',
      },
      {
        label: 'Accept the reality, automate',
        description: 'If the people won\'t stay, invest in automation, AI, and robotics. Latvia can lead in efficiency.',
        effects: [
          { indicator: 'techSector', delta: 8, delay: 2, duration: 0 },
          { indicator: 'workforceSkill', delta: 4, delay: 3, duration: 0 },
          { indicator: 'unemployment', delta: 2, delay: 2, duration: 6 },
          { indicator: 'gdpGrowth', delta: 0.5, delay: 3, duration: 8 },
        ],
        humor: 'Latvian robots don\'t emigrate. They also don\'t complain about the weather. Or sing folk songs. Hmm.',
      },
    ],
  },

  {
    id: 'language_policy',
    title: '🗣️ The Language Question',
    description: 'The transition from Russian-language to Latvian-only education is causing protests among Russian-speaking parents. The EU is watching. Integration vs. assimilation is the question.',
    preconditions: [{ indicator: 'russianMinorityIntegration', op: '<', value: 60 }],
    category: 'society',
    weight: 8,
    oneTime: false,
    choices: [
      {
        label: 'Full transition to Latvian',
        description: 'Accelerate the switch. All schools fully Latvian within 2 years. National unity at the cost of minority discomfort.',
        effects: [
          { indicator: 'nationalIdentity', delta: 8, delay: 2, duration: 0 },
          { indicator: 'russianMinorityIntegration', delta: -5, delay: 1, duration: 4 },
          { indicator: 'socialCohesion', delta: -6, delay: 1, duration: 4 },
          { indicator: 'publicHappiness', delta: -3, delay: 0, duration: 4 },
          { indicator: 'euStanding', delta: -2, delay: 2, duration: 0 },
        ],
        humor: 'Plot twist: Russian-speaking kids in Daugavpils already speak better Latvian than Latvian kids speak English.',
      },
      {
        label: 'Bilingual compromise',
        description: 'Keep Latvian as the primary language but allow Russian-minority culture classes. Bridge-building over bulldozing.',
        effects: [
          { indicator: 'russianMinorityIntegration', delta: 6, delay: 2, duration: 0 },
          { indicator: 'socialCohesion', delta: 5, delay: 2, duration: 0 },
          { indicator: 'nationalIdentity', delta: -3, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: 3, delay: 1, duration: 0 },
        ],
        humor: 'Children in Riga code-switch between three languages before lunch. Adults can barely manage two.',
      },
      {
        label: 'Innovative immersion program',
        description: 'Use technology, cultural exchange, and incentives to make learning Latvian cool and useful. Gamify integration.',
        effects: [
          { indicator: 'russianMinorityIntegration', delta: 8, delay: 3, duration: 0 },
          { indicator: 'educationQuality', delta: 4, delay: 2, duration: 0 },
          { indicator: 'socialCohesion', delta: 4, delay: 3, duration: 0 },
          { indicator: 'techSector', delta: 2, delay: 2, duration: 0 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
        ],
        humor: 'Duolingo introduces a Latvian course. The owl threatens you in both Latvian and Russian.',
      },
    ],
  },

  {
    id: 'healthcare_exodus',
    title: '🏥 Doctors Leaving, Patients Waiting',
    description: 'Latvia has one of the lowest doctor-to-patient ratios in the EU. Wait times for specialists average 6 months. Nurses earn less than supermarket cashiers. Something must change.',
    preconditions: [{ indicator: 'healthcareQuality', op: '<', value: 50 }],
    category: 'society',
    weight: 8,
    oneTime: false,
    choices: [
      {
        label: 'Double healthcare spending',
        description: 'Massive funding increase. Build new hospitals, raise medical salaries to EU average. Expensive but necessary.',
        effects: [
          { indicator: 'healthcareQuality', delta: 12, delay: 2, duration: 0 },
          { indicator: 'publicHappiness', delta: 6, delay: 2, duration: 0 },
          { indicator: 'publicDebt', delta: 5, delay: 0, duration: 0 },
          { indicator: 'emigrationRate', delta: -3, delay: 3, duration: 0 },
          { indicator: 'birthRate', delta: 3, delay: 3, duration: 0 },
        ],
        humor: 'A nurse at Stradiņš Hospital checks her new payslip. She blinks. Checks again. Cancels her flight to Norway.',
      },
      {
        label: 'Telemedicine revolution',
        description: 'Digital-first healthcare. AI diagnostics, remote consultations, automated pharmacies. Cheaper than building hospitals.',
        effects: [
          { indicator: 'healthcareQuality', delta: 7, delay: 2, duration: 0 },
          { indicator: 'digitalInfra', delta: 5, delay: 1, duration: 0 },
          { indicator: 'techSector', delta: 4, delay: 2, duration: 0 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
        ],
        humor: 'Your grandmother in Latgale video-calls a doctor in Riga. She shows him her knee. He prescribes black bread and fresh air. Some things don\'t change.',
      },
      {
        label: 'Recruit foreign doctors',
        description: 'Fast-track medical license recognition for doctors from Ukraine, India, and the Philippines.',
        effects: [
          { indicator: 'healthcareQuality', delta: 6, delay: 1, duration: 0 },
          { indicator: 'socialCohesion', delta: -2, delay: 1, duration: 4 },
          { indicator: 'russianMinorityIntegration', delta: 2, delay: 2, duration: 0 },
          { indicator: 'population', delta: 0.005, delay: 1, duration: 0 },
        ],
        humor: 'A Ukrainian cardiologist in Liepāja discovers that Latvian patients describe all pain as "not that bad." Diagnosis becomes more challenging.',
      },
    ],
  },

  {
    id: 'song_festival',
    title: '🎵 Latvian Song and Dance Festival',
    description: 'The quinquennial Song and Dance Festival unites 40,000 performers and 300,000 spectators. It\'s a UNESCO masterpiece, a national treasure, and a logistical nightmare. But this year\'s funding is tight.',
    preconditions: [],
    category: 'culture',
    weight: 5,
    oneTime: false,
    choices: [
      {
        label: 'Fund it lavishly',
        description: 'Spare no expense. This is Latvia\'s soul — you don\'t put a price on that. International broadcast, new stages, artist housing.',
        effects: [
          { indicator: 'nationalIdentity', delta: 8, delay: 0, duration: 0 },
          { indicator: 'publicHappiness', delta: 6, delay: 0, duration: 4 },
          { indicator: 'socialCohesion', delta: 5, delay: 0, duration: 0 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
          { indicator: 'foreignInvestment', delta: 2, delay: 1, duration: 0 },
        ],
        humor: '300,000 people singing "Pūt, vējiņi" in unison. The sound carries across the Baltic. Estonians pretend not to be moved.',
      },
      {
        label: 'Modernize and monetize',
        description: 'Livestream globally, sell merchandise, partner with sponsors. Make it self-funding and cool for younger generations.',
        effects: [
          { indicator: 'nationalIdentity', delta: 4, delay: 0, duration: 0 },
          { indicator: 'publicHappiness', delta: 4, delay: 0, duration: 4 },
          { indicator: 'techSector', delta: 2, delay: 1, duration: 0 },
          { indicator: 'foreignInvestment', delta: 3, delay: 1, duration: 0 },
        ],
        humor: 'The Song Festival TikTok gets 50 million views. Latvian folk music is ironically trending among Gen Z in Tokyo.',
      },
      {
        label: 'Scale it down this year',
        description: 'Save money, smaller event. Cultural purists will be furious but the budget needs it.',
        effects: [
          { indicator: 'nationalIdentity', delta: -5, delay: 0, duration: 0 },
          { indicator: 'publicHappiness', delta: -4, delay: 0, duration: 4 },
          { indicator: 'socialCohesion', delta: -3, delay: 0, duration: 0 },
          { indicator: 'publicDebt', delta: -0.5, delay: 0, duration: 0 },
        ],
        humor: 'Only 10,000 singers this year. The choir sounds noticeably thinner. Latvia\'s soul takes a budget cut.',
      },
    ],
  },

  {
    id: 'housing_soviet_blocks',
    title: '🏗️ Soviet Housing Blocks: Ruin or Renovation?',
    description: '60% of Latvians live in Soviet-era apartment blocks. Many are crumbling, energy-inefficient, and frankly depressing. Renovation would cost billions. But doing nothing risks structural failures.',
    preconditions: [],
    category: 'society',
    weight: 6,
    oneTime: true,
    choices: [
      {
        label: 'Massive EU-funded renovation',
        description: 'Apply for EU Green Deal funds. Insulate, modernize, add solar panels. Turn Soviet blocks into green housing.',
        effects: [
          { indicator: 'greenTransition', delta: 8, delay: 2, duration: 0 },
          { indicator: 'energyIndependence', delta: 5, delay: 3, duration: 0 },
          { indicator: 'publicHappiness', delta: 6, delay: 3, duration: 0 },
          { indicator: 'euStanding', delta: 4, delay: 2, duration: 0 },
          { indicator: 'publicDebt', delta: 3, delay: 0, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.4, delay: 1, duration: 6 },
        ],
        humor: 'Architects discover that behind every Soviet panel building is... another Soviet panel building. Renovation is more complex than anticipated.',
      },
      {
        label: 'Demolish and rebuild',
        description: 'Tear down the worst blocks. Build modern, efficient housing. Displacement is temporary; improvement is permanent.',
        effects: [
          { indicator: 'publicHappiness', delta: -3, delay: 0, duration: 4 },
          { indicator: 'publicHappiness', delta: 8, delay: 4, duration: 0 },
          { indicator: 'publicDebt', delta: 6, delay: 0, duration: 0 },
          { indicator: 'gdpGrowth', delta: 0.6, delay: 1, duration: 8 },
        ],
        humor: 'Nostalgic Latvians collect pieces of Soviet concrete as souvenirs. A piece of Khrushchyovka sells for €50 on Etsy.',
      },
      {
        label: 'Minimal maintenance only',
        description: 'Patch the worst problems, keep costs down. Hope the buildings last another 30 years.',
        effects: [
          { indicator: 'publicHappiness', delta: -2, delay: 1, duration: 0 },
          { indicator: 'energyIndependence', delta: -2, delay: 1, duration: 0 },
        ],
        humor: 'The buildings were designed to last 50 years. It\'s been 65. What could possibly go wrong?',
      },
    ],
  },

  {
    id: 'mental_health_crisis',
    title: '🧠 Silent Crisis: Mental Health',
    description: 'Latvia has one of the highest suicide rates in the EU. Depression and anxiety are widespread, especially among young people and the elderly. Mental health services are almost nonexistent outside Riga.',
    preconditions: [],
    category: 'society',
    weight: 7,
    oneTime: true,
    choices: [
      {
        label: 'National mental health program',
        description: 'Fund 500 new psychologist positions. Free therapy for under-25s. Anti-stigma campaign.',
        effects: [
          { indicator: 'healthcareQuality', delta: 6, delay: 2, duration: 0 },
          { indicator: 'publicHappiness', delta: 5, delay: 2, duration: 0 },
          { indicator: 'emigrationRate', delta: -3, delay: 3, duration: 0 },
          { indicator: 'publicDebt', delta: 2, delay: 0, duration: 0 },
          { indicator: 'birthRate', delta: 2, delay: 4, duration: 0 },
        ],
        humor: 'Latvian stoicism meets modern therapy. "How does that make you feel?" "...Latvian."',
      },
      {
        label: 'Digital mental health platform',
        description: 'AI-assisted therapy chatbots, online counseling, crisis hotlines. Scalable and anonymous.',
        effects: [
          { indicator: 'healthcareQuality', delta: 4, delay: 1, duration: 0 },
          { indicator: 'publicHappiness', delta: 3, delay: 1, duration: 0 },
          { indicator: 'digitalInfra', delta: 3, delay: 1, duration: 0 },
          { indicator: 'publicDebt', delta: 1, delay: 0, duration: 0 },
        ],
        humor: 'A therapy chatbot asks: "What brings you joy?" A Latvian answers: "Mushroom picking in autumn." The bot recommends more mushroom picking.',
      },
    ],
  },
];
