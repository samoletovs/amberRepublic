/**
 * Interactive Decision-Making Workshops
 *
 * Standalone governance scenarios that let players deliberate competing
 * stakeholder positions and pick a policy direction. Each workshop includes:
 *  - A real-world-grounded scenario briefing
 *  - 3–4 stakeholder groups with competing viewpoints
 *  - 3–4 policy options, each with indicator effects and a justification
 *  - Scoring based on how well the chosen policy fits current game state
 */

export interface WorkshopStakeholder {
  id: string;
  name: string;
  emoji: string;
  /** Political / institutional identity */
  role: string;
  /** Their opening argument */
  argument: string;
  /** Index of the option they advocate for */
  advocatesOption: number;
}

export interface WorkshopOption {
  id: string;
  label: string;
  description: string;
  /** Narrative of consequences 1–2 quarters later */
  outcome: string;
  /** Indicator deltas applied if this option is chosen from the game screen */
  effects: Array<{ indicator: string; delta: number }>;
  /** 0–100: how "optimal" this is for Latvia's structural challenges */
  baseScore: number;
  /** Additional score when specific game state conditions are met */
  contextBonus?: { indicator: string; op: '<' | '>'; threshold: number; bonus: number };
}

export interface WorkshopScenario {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  briefing: string;
  category: 'economy' | 'society' | 'security' | 'diplomacy' | 'innovation';
  stakeholders: WorkshopStakeholder[];
  options: WorkshopOption[];
  /** Real-world reference for the policy dilemma */
  source: string;
}

export interface WorkshopResult {
  scenarioId: string;
  optionId: string;
  score: number;
  /** 0–100 percentile label */
  grade: 'Expert Policy Architect' | 'Senior Adviser' | 'Junior Analyst' | 'Intern';
  feedback: string;
}

// ─── Scenario Definitions ─────────────────────────────────────────────────────

export const WORKSHOP_SCENARIOS: WorkshopScenario[] = [
  {
    id: 'healthcare-crisis',
    title: 'Healthcare Funding Crisis',
    subtitle: 'Latvia ranks last in the EU for healthcare quality. Something must change.',
    emoji: '🏥',
    category: 'society',
    briefing:
      'Latvia spends only ~5% of GDP on healthcare — among the lowest in the EU. ' +
      'Wait times exceed 18 months for specialists. Nurses and doctors emigrate at alarming rates. ' +
      'A cross-party committee has placed the issue on the Saeima agenda. ' +
      'Three fundamentally different reform paths are on the table, each with committed advocates.',
    source: 'OECD Health Statistics 2024 · Veselības inspekcija',
    stakeholders: [
      {
        id: 'hm',
        name: 'Dr. Inese Kalniņa',
        emoji: '👩‍⚕️',
        role: 'Health Minister',
        argument:
          'Public hospitals are crumbling. We need a €200M emergency investment — raise the healthcare tax ' +
          'from 1.8% to 3% of payroll. Yes, it costs. No, we cannot wait.',
        advocatesOption: 0,
      },
      {
        id: 'fm',
        name: 'Andris Bērziņš',
        emoji: '💼',
        role: 'Finance Minister',
        argument:
          'We already carry a 44% debt-to-GDP burden. New taxes will chase away the investment ' +
          'we desperately need. Let private insurers handle elective care; the state protects emergencies only.',
        advocatesOption: 1,
      },
      {
        id: 'reform',
        name: 'Māra Ozoliņa',
        emoji: '📊',
        role: 'Reform Bloc MP',
        argument:
          'Both sides are wrong. Digital health records, centralise specialist booking, ' +
          'e-prescriptions. Estonia did it for €50M and slashed wait times by 40%. Efficiency first.',
        advocatesOption: 2,
      },
    ],
    options: [
      {
        id: 'tax-increase',
        label: 'Raise payroll health tax to 3%',
        description: 'Direct public investment: 200M EUR injected into hospitals, GP salaries raised 25%.',
        outcome:
          'Healthcare quality improves noticeably over 2 years. Some doctors return from abroad. ' +
          'The business community grumbles about labour costs. GDP growth dips 0.3%.',
        effects: [
          { indicator: 'healthcareQuality', delta: 8 },
          { indicator: 'gdpGrowth', delta: -0.3 },
          { indicator: 'emigrationRate', delta: -3 },
          { indicator: 'publicDebt', delta: 1 },
        ],
        baseScore: 72,
        contextBonus: { indicator: 'healthcareQuality', op: '<', threshold: 40, bonus: 15 },
      },
      {
        id: 'private-insurance',
        label: 'Mandate private supplemental insurance',
        description:
          'State covers only emergency and primary care. All employers must offer supplemental health insurance.',
        outcome:
          'Wait times for elective procedures fall for insured workers. The uninsured — mostly low-income — ' +
          'face longer public queues. Social inequality in healthcare widens.',
        effects: [
          { indicator: 'healthcareQuality', delta: 3 },
          { indicator: 'socialCohesion', delta: -5 },
          { indicator: 'foreignInvestment', delta: 2 },
        ],
        baseScore: 48,
      },
      {
        id: 'digital-efficiency',
        label: 'Digital health system overhaul',
        description: 'Centralised e-health records, AI-assisted triage, telemedicine expansion. €60M investment.',
        outcome:
          'Short-term disruption as legacy systems migrate. After 18 months, booking times halve. ' +
          'A modest, sustainable improvement — no tax rise needed.',
        effects: [
          { indicator: 'healthcareQuality', delta: 5 },
          { indicator: 'digitalInfra', delta: 4 },
          { indicator: 'techSector', delta: 2 },
        ],
        baseScore: 65,
        contextBonus: { indicator: 'digitalInfra', op: '>', threshold: 55, bonus: 10 },
      },
    ],
  },

  {
    id: 'integration-policy',
    title: 'Russian Minority Integration',
    subtitle: 'Language reform momentum collides with minority rights obligations.',
    emoji: '🗣️',
    category: 'society',
    briefing:
      'A quarter of Latvia\'s population identifies as ethnic Russian. EU and Council of Europe monitors ' +
      'have raised concerns about language-testing requirements for citizenship. Meanwhile, Latvian language ' +
      'advocates warn that a generation of Russian-speaking youth is linguistically isolated. ' +
      'A new integration framework must be chosen.',
    source: 'OSCE High Commissioner on National Minorities · MISA integration reports',
    stakeholders: [
      {
        id: 'identity',
        name: 'Jānis Eglītis',
        emoji: '🏴',
        role: 'Identity & National Heritage Committee',
        argument:
          'Latvian is the national language. Every citizen must speak it. ' +
          'Bilingual schooling is cultural erosion in slow motion. Accelerate the transition — no exceptions.',
        advocatesOption: 0,
      },
      {
        id: 'minority-rep',
        name: 'Natalja Sorokina',
        emoji: '🤝',
        role: 'Minority Rights Caucus',
        argument:
          'Forced assimilation creates resentment. A bilingual civic identity model — like Switzerland — ' +
          'is more durable. Offer generous Latvian language support, but coercion will backfire.',
        advocatesOption: 1,
      },
      {
        id: 'eu-monitor',
        name: 'Hans Weber',
        emoji: '🇪🇺',
        role: 'European Commission Observer',
        argument:
          'The EU requires practical pathways. A funded integration incentive — housing, jobs, language ' +
          'courses — with a 3-year citizenship fast track for those who complete it. Carrot, not stick.',
        advocatesOption: 2,
      },
    ],
    options: [
      {
        id: 'accelerated-assimilation',
        label: 'Accelerate mandatory Latvian transition',
        description:
          'All public schools switch to Latvian-only instruction by 2026. ' +
          'Language test requirements tightened for civil service roles.',
        outcome:
          'National cohesion scores rise among Latvian speakers. A wave of protests in Riga\'s ' +
          'Latgale district. EU monitoring framework triggered. Some emigration among Russian speakers.',
        effects: [
          { indicator: 'nationalIdentity', delta: 6 },
          { indicator: 'socialCohesion', delta: -8 },
          { indicator: 'euStanding', delta: -4 },
          { indicator: 'russianMinorityIntegration', delta: -5 },
        ],
        baseScore: 40,
      },
      {
        id: 'bilingual-civic',
        label: 'Bilingual civic model with support',
        description:
          'Minority-language schools retain limited Russian instruction alongside Latvian. ' +
          'Cultural councils established with state funding.',
        outcome:
          'Tension eases. Integration stalls slightly — communities remain somewhat parallel. ' +
          'EU monitors satisfied. Russian-speaking youth employment improves modestly.',
        effects: [
          { indicator: 'socialCohesion', delta: 5 },
          { indicator: 'euStanding', delta: 3 },
          { indicator: 'russianMinorityIntegration', delta: 4 },
          { indicator: 'mediaTrust', delta: 2 },
        ],
        baseScore: 62,
      },
      {
        id: 'incentive-pathway',
        label: 'Incentivised integration pathway',
        description:
          'Free Latvian language courses, fast-track citizenship for completers, ' +
          'preferential housing grants and job placement for integrating families.',
        outcome:
          'Enrolment in Latvian language courses triples. Social cohesion improves. ' +
          'Costs €15M/year. Strong EU approval. Russia calls it "cultural colonialism" — ignored.',
        effects: [
          { indicator: 'russianMinorityIntegration', delta: 8 },
          { indicator: 'socialCohesion', delta: 6 },
          { indicator: 'euStanding', delta: 5 },
          { indicator: 'publicHappiness', delta: 3 },
        ],
        baseScore: 78,
        contextBonus: { indicator: 'socialCohesion', op: '<', threshold: 50, bonus: 12 },
      },
    ],
  },

  {
    id: 'defence-posture',
    title: 'Baltic Defence Posture',
    subtitle: 'NATO Article 3 requires credible self-defence capacity. How far do we go?',
    emoji: '🛡️',
    category: 'security',
    briefing:
      'After Russia\'s invasion of Ukraine, Latvia pledged 2.5% of GDP to defence. ' +
      'A new NATO planning document recommends all eastern-flank members hit 3% by 2028. ' +
      'The Finance Ministry warns this requires cutting education or healthcare. ' +
      'The Defence Committee wants to go further — including reservist training obligations.',
    source: 'NATO Defence Planning Process 2024 · LR Aizsardzības ministrija',
    stakeholders: [
      {
        id: 'general',
        name: 'Gen. Raimonds Graube',
        emoji: '⭐',
        role: 'National Armed Forces Commander',
        argument:
          '3% is the minimum. We need a full reservist mobilisation law — every citizen aged 18-55 ' +
          'on a registry. Russia isn\'t bluffing. We need to not be a soft target.',
        advocatesOption: 0,
      },
      {
        id: 'fm-defence',
        name: 'Ilze Vīksna',
        emoji: '💰',
        role: 'Finance Ministry Adviser',
        argument:
          'Hold at 2.5%. We can negotiate with allies for permanent basing contributions — ' +
          'that counts toward effective defence without breaking the budget.',
        advocatesOption: 1,
      },
      {
        id: 'nato-ally',
        name: 'Col. Mark Harrison',
        emoji: '🇺🇸',
        role: 'NATO Liaison Officer',
        argument:
          'The alliance is only as strong as its weakest link. But smart investment matters more than raw %. ' +
          'Prioritise cyber defence and drone capabilities — asymmetric deterrence at lower cost.',
        advocatesOption: 2,
      },
    ],
    options: [
      {
        id: 'full-three-percent',
        label: 'Raise to 3% GDP + reservist law',
        description:
          'Defence budget increased immediately. Universal reserve registry enacted. ' +
          'Mandatory 3-month training for under-30s on a rolling basis.',
        outcome:
          'Military readiness improves significantly. NATO allies applaud. Public initially supportive, ' +
          'then fatigued by training obligations. Education and healthcare squeezed.',
        effects: [
          { indicator: 'militaryReadiness', delta: 12 },
          { indicator: 'natoRelations', delta: 8 },
          { indicator: 'healthcareQuality', delta: -3 },
          { indicator: 'educationQuality', delta: -2 },
          { indicator: 'publicDebt', delta: 3 },
        ],
        baseScore: 70,
        contextBonus: { indicator: 'russiaRelations', op: '<', threshold: 20, bonus: 15 },
      },
      {
        id: 'hold-two-five',
        label: 'Hold at 2.5%, seek ally burden-sharing',
        description:
          'Negotiate permanent allied troop contributions counted toward defence value. ' +
          'Lobby NATO for revised spending metrics.',
        outcome:
          'Fiscal stability preserved. Allies express mild disappointment. ' +
          'Russia\'s state media calls it "wavering commitment" — propaganda, but it lands.',
        effects: [
          { indicator: 'natoRelations', delta: -3 },
          { indicator: 'militaryReadiness', delta: 2 },
          { indicator: 'publicDebt', delta: -1 },
        ],
        baseScore: 52,
      },
      {
        id: 'cyber-asymmetric',
        label: 'Asymmetric deterrence: cyber + drones',
        description:
          'Hold spending at 2.5% but redirect 30% of the budget toward cyber defence, ' +
          'drone fleets, and electronic warfare capabilities.',
        outcome:
          'Latvia becomes a NATO cyber-defence model. Conventional readiness lags slightly. ' +
          'Tech sector benefits from defence contracts. NATO Cyber Centre mandate expands.',
        effects: [
          { indicator: 'cyberDefense', delta: 12 },
          { indicator: 'militaryReadiness', delta: 4 },
          { indicator: 'techSector', delta: 5 },
          { indicator: 'natoRelations', delta: 3 },
        ],
        baseScore: 68,
        contextBonus: { indicator: 'cyberDefense', op: '<', threshold: 55, bonus: 10 },
      },
    ],
  },

  {
    id: 'startup-nation',
    title: 'Building a Baltic Silicon Valley',
    subtitle: 'R&D spending at 0.7% of GDP — can Latvia compete in the knowledge economy?',
    emoji: '💡',
    category: 'innovation',
    briefing:
      'Latvia spends only 0.7% of GDP on R&D, far below the EU target of 3%. ' +
      'Estonia\'s e-governance and startup ecosystem has become a global model, ' +
      'while Latvian graduates continue to emigrate for opportunities elsewhere. ' +
      'A new "Digital Economy Strategy 2030" must be approved. Three visions compete.',
    source: 'European Innovation Scoreboard 2024 · LIAA investment data',
    stakeholders: [
      {
        id: 'startup',
        name: 'Kaspars Rieksts',
        emoji: '🚀',
        role: 'Latvian Startup Association',
        argument:
          'Tax breaks, visa reform, and a state venture fund. Give us the tools Estonia has ' +
          'and we\'ll build the companies. Stop trying to control what you don\'t understand.',
        advocatesOption: 0,
      },
      {
        id: 'university',
        name: 'Prof. Dace Rutka',
        emoji: '🎓',
        role: 'University of Latvia Rector',
        argument:
          'Startups are built on research. Triple R&D grants to universities — ' +
          'applied research programmes, industry partnerships. You can\'t have Silicon Valley without MIT first.',
        advocatesOption: 1,
      },
      {
        id: 'eu-funds',
        name: 'Edgars Sproģis',
        emoji: '🇪🇺',
        role: 'EU Structural Funds Manager',
        argument:
          'We have €400M in unspent EU cohesion funds. Redirect them into a National Digital ' +
          'Transformation programme: government digitisation, 5G rollout, skills training. ' +
          'No new spending — reallocate what we have.',
        advocatesOption: 2,
      },
    ],
    options: [
      {
        id: 'startup-ecosystem',
        label: 'Startup-First ecosystem strategy',
        description:
          '15% flat tax for startups under 5 years old. State venture co-investment fund (€50M). ' +
          'Fast-track visa for tech talent. Regulatory sandbox.',
        outcome:
          'Foreign founders arrive. Domestic startups scale faster. Tax revenues dip short-term. ' +
          'Brain drain moderates slightly as opportunities appear. Five years to see full results.',
        effects: [
          { indicator: 'techSector', delta: 8 },
          { indicator: 'foreignInvestment', delta: 6 },
          { indicator: 'emigrationRate', delta: -4 },
          { indicator: 'taxBurden', delta: -2 },
        ],
        baseScore: 70,
        contextBonus: { indicator: 'techSector', op: '<', threshold: 50, bonus: 10 },
      },
      {
        id: 'research-foundation',
        label: 'University research investment programme',
        description:
          'R&D budget doubled to 1.4% of GDP over 3 years. University-industry partnerships mandated. ' +
          'PhD stipends raised to market-competitive levels.',
        outcome:
          'Brain drain among PhDs slows. First results visible in 3–5 years. ' +
          'Education quality index rises. Some frustration from the startup community who wanted faster action.',
        effects: [
          { indicator: 'rdSpending', delta: 0.4 },
          { indicator: 'educationQuality', delta: 5 },
          { indicator: 'workforceSkill', delta: 3 },
          { indicator: 'emigrationRate', delta: -2 },
        ],
        baseScore: 65,
      },
      {
        id: 'eu-digital-reallocation',
        label: 'EU funds digital transformation',
        description:
          'Reallocate €400M EU cohesion funds to 5G, e-government services, digital skills training, ' +
          'and public sector AI adoption.',
        outcome:
          'Immediate visible impact: government services go fully digital. 5G coverage reaches 95%. ' +
          'Economy-wide productivity gains. Less direct impact on startups or research output.',
        effects: [
          { indicator: 'digitalInfra', delta: 10 },
          { indicator: 'workforceSkill', delta: 4 },
          { indicator: 'publicConfidence', delta: 3 },
          { indicator: 'techSector', delta: 3 },
        ],
        baseScore: 62,
        contextBonus: { indicator: 'digitalInfra', op: '<', threshold: 55, bonus: 12 },
      },
    ],
  },

  {
    id: 'pension-reform',
    title: 'The Pension Time Bomb',
    subtitle: 'By 2035, one in three Latvians will be over 65. The maths don\'t work.',
    emoji: '🧓',
    category: 'economy',
    briefing:
      'Latvia\'s three-pillar pension system is under severe strain. ' +
      'The working-age population shrinks each year, while the pensioner cohort grows. ' +
      'The IMF projects the pension fund deficit will reach 3% of GDP by 2030 without reform. ' +
      'Three reform models are being debated in the Saeima Budget Committee.',
    source: 'IMF Article IV Consultation 2024 · VSAA Latvija annual report',
    stakeholders: [
      {
        id: 'pension-actuary',
        name: 'Mārtiņš Dreimanis',
        emoji: '📉',
        role: 'VSAA Actuarial Department',
        argument:
          'The numbers are unambiguous: raise the retirement age to 67 by 2030 and ' +
          'index future increases to life expectancy. Any other reform is postponing the problem.',
        advocatesOption: 0,
      },
      {
        id: 'trade-union',
        name: 'Inga Liepiņa',
        emoji: '✊',
        role: 'LBAS Trade Union Confederation',
        argument:
          'Working-class Latvians in manual jobs physically cannot work until 67. ' +
          'The answer is immigration policy and incentives for diaspora return — ' +
          'grow the contributor base, not cut the benefits.',
        advocatesOption: 1,
      },
      {
        id: 'economist',
        name: 'Dr. Roberts Zīle',
        emoji: '📊',
        role: 'Latvijas Banka Economist',
        argument:
          'A hybrid: gradual retirement age rise paired with a diaspora return incentive package ' +
          'and enhanced second-pillar contributions from employers. Share the pain fairly.',
        advocatesOption: 2,
      },
    ],
    options: [
      {
        id: 'raise-retirement-age',
        label: 'Raise retirement age to 67 by 2030',
        description:
          'Statutory retirement age increases by 6 months per year from 65 to 67. ' +
          'Early retirement penalties tightened. Contribution rate from employers raised 1%.',
        outcome:
          'Pension fund stabilised by 2031. Significant public backlash especially in manual-worker regions. ' +
          'Social Democrats in parliament threaten to withdraw from coalition.',
        effects: [
          { indicator: 'publicDebt', delta: -3 },
          { indicator: 'publicHappiness', delta: -6 },
          { indicator: 'socialStrain', delta: 5 },
          { indicator: 'gdpGrowth', delta: 0.2 },
        ],
        baseScore: 65,
        contextBonus: { indicator: 'publicDebt', op: '>', threshold: 50, bonus: 15 },
      },
      {
        id: 'diaspora-return',
        label: 'Diaspora return + immigration incentives',
        description:
          'Tax breaks for Latvian diaspora returnees for 5 years. ' +
          'Skilled-worker immigration fast-track programme. €20M marketing campaign abroad.',
        outcome:
          'Modest positive migration trend over 3–5 years. Some diaspora return. ' +
          'Pension fund shortfall deferred but not solved. Public mood improves.',
        effects: [
          { indicator: 'emigrationRate', delta: -5 },
          { indicator: 'population', delta: 0.02 },
          { indicator: 'publicHappiness', delta: 3 },
          { indicator: 'workforceSkill', delta: 2 },
        ],
        baseScore: 55,
      },
      {
        id: 'hybrid-reform',
        label: 'Hybrid: gradual age rise + return package',
        description:
          'Retirement age raised to 66 only (not 67). Diaspora return incentives. ' +
          'Employer second-pillar contributions raised from 6% to 8%.',
        outcome:
          'Broader coalition support for the reform. Pension fund partially stabilised. ' +
          'Some grumbling from both sides, but a sustainable political path forward.',
        effects: [
          { indicator: 'publicDebt', delta: -2 },
          { indicator: 'emigrationRate', delta: -3 },
          { indicator: 'publicHappiness', delta: -2 },
          { indicator: 'socialCohesion', delta: 3 },
        ],
        baseScore: 72,
      },
    ],
  },
];

// ─── Pure Functions ────────────────────────────────────────────────────────────

/** Pick a scenario by ID, or return the first one. */
export function getScenario(id: string): WorkshopScenario {
  return WORKSHOP_SCENARIOS.find(s => s.id === id) ?? WORKSHOP_SCENARIOS[0];
}

/**
 * Score a workshop choice given current game indicators.
 * Returns 0–100.
 */
export function scoreWorkshopChoice(
  scenario: WorkshopScenario,
  optionId: string,
  indicators: Record<string, number>,
): number {
  const option = scenario.options.find(o => o.id === optionId);
  if (!option) return 0;

  let score = option.baseScore;

  if (option.contextBonus) {
    const { indicator, op, threshold, bonus } = option.contextBonus;
    const val = indicators[indicator] ?? 0;
    const matches = op === '<' ? val < threshold : val > threshold;
    if (matches) score += bonus;
  }

  return Math.min(100, Math.max(0, score));
}

/** Derive grade label from numeric score. */
export function gradeFromScore(
  score: number,
): WorkshopResult['grade'] {
  if (score >= 80) return 'Expert Policy Architect';
  if (score >= 65) return 'Senior Adviser';
  if (score >= 50) return 'Junior Analyst';
  return 'Intern';
}

/** Feedback text keyed to grade. */
export function feedbackForGrade(grade: WorkshopResult['grade']): string {
  switch (grade) {
    case 'Expert Policy Architect':
      return 'Your decision was well-calibrated to Latvia\'s structural needs. Textbook governance.';
    case 'Senior Adviser':
      return 'A solid, defensible choice. Some trade-offs were left on the table, but nothing catastrophic.';
    case 'Junior Analyst':
      return 'The right intentions, but the fit to current conditions was imperfect. Review the context data.';
    case 'Intern':
      return 'This choice looks good in theory but misreads the current situation. Study the indicators more carefully.';
  }
}

/** Build a full WorkshopResult after the player votes. */
export function buildWorkshopResult(
  scenario: WorkshopScenario,
  optionId: string,
  indicators: Record<string, number>,
): WorkshopResult {
  const score = scoreWorkshopChoice(scenario, optionId, indicators);
  const grade = gradeFromScore(score);
  return {
    scenarioId: scenario.id,
    optionId,
    score,
    grade,
    feedback: feedbackForGrade(grade),
  };
}
