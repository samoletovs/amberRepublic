import type { QuizQuestion } from './types';

const API_BASE = '/api';

interface StatResult {
  key: string;
  value: number;
  unit: string;
  label: string;
  period: string;
}

interface StatsResponse {
  stats: Record<string, StatResult>;
  errors?: string[];
  available: string[];
}

/** Question templates — each maps a CSP stat key to a quiz question. */
interface QuestionTemplate {
  statKey: string;
  text: string;
  hint: string;
  category: QuizQuestion['category'];
  emoji: string;
  source: string;
  funFact?: string;
  /** Generate 4 plausible options given the real value */
  generateOptions: (real: number) => number[];
  /** Format the value for display in the unit field */
  unitLabel: string;
}

function roundTo(n: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Generate 4 options around the real value: real ± spread variants */
function numericOptions(real: number, spreadPct: number, round: number): number[] {
  const offsets = [-2, -1, 0, 1].map(i => {
    const factor = 1 + (i * spreadPct) / 100;
    return roundTo(real * factor, round);
  });
  // Ensure the real value is always one of the options
  if (!offsets.includes(roundTo(real, round))) {
    offsets[2] = roundTo(real, round);
  }
  return shuffleArray(offsets);
}

/** For large numbers (population), round to nearest thousand */
function populationOptions(real: number): number[] {
  const r = Math.round(real / 1000) * 1000;
  const variants = [r - 60000, r - 25000, r, r + 40000];
  return shuffleArray(variants);
}

/** For salary, round to nearest 10 EUR */
function salaryOptions(real: number): number[] {
  const r = Math.round(real / 10) * 10;
  const variants = [r - 230, r - 90, r, r + 170];
  return shuffleArray(variants);
}

const QUESTION_TEMPLATES: QuestionTemplate[] = [
  {
    statKey: 'population',
    text: 'What is the population of Latvia?',
    hint: 'Think about recent demographic trends — Latvia has been losing people for decades.',
    category: 'demographics',
    emoji: '👥',
    source: 'CSP — Iedzīvotāju skaits',
    funFact: 'Latvia\'s population peaked at 2.67 million in 1989. It has declined every year since.',
    generateOptions: populationOptions,
    unitLabel: 'people',
  },
  {
    statKey: 'births',
    text: 'How many babies were born in Latvia last year?',
    hint: 'Latvia has one of the lowest birth rates in the EU.',
    category: 'demographics',
    emoji: '👶',
    source: 'CSP — Dzimstība',
    funFact: 'In the 1980s, Latvia had over 40,000 births per year. Now it\'s less than half of that.',
    generateOptions: (real) => numericOptions(real, 15, 0),
    unitLabel: 'births',
  },
  {
    statKey: 'deaths',
    text: 'How many people died in Latvia last year?',
    hint: 'Latvia has an aging population with a higher mortality rate than many EU countries.',
    category: 'demographics',
    emoji: '⚰️',
    source: 'CSP — Mirstība',
    generateOptions: (real) => numericOptions(real, 12, 0),
    unitLabel: 'deaths',
  },
  {
    statKey: 'naturalGrowth',
    text: 'What was Latvia\'s natural population growth (births minus deaths)?',
    hint: 'Think about whether more people are being born or dying in Latvia.',
    category: 'demographics',
    emoji: '📉',
    source: 'CSP — Dabiskais pieaugums',
    funFact: 'Latvia has had negative natural growth every year since 1991.',
    generateOptions: (real) => {
      const r = Math.round(real / 100) * 100;
      return shuffleArray([r - 2000, r - 800, r, r + 1500]);
    },
    unitLabel: 'people',
  },
  {
    statKey: 'netMigration',
    text: 'What was Latvia\'s net migration last year (immigrants minus emigrants)?',
    hint: 'Has Latvia been gaining or losing people to migration recently?',
    category: 'demographics',
    emoji: '✈️',
    source: 'CSP — Migrācijas saldo',
    funFact: 'After EU accession in 2004, Latvia experienced massive emigration, especially to the UK and Ireland.',
    generateOptions: (real) => {
      const r = Math.round(real / 100) * 100;
      return shuffleArray([r - 3000, r - 1200, r, r + 2500]);
    },
    unitLabel: 'people',
  },
  {
    statKey: 'marriages',
    text: 'How many marriages were registered in Latvia last year?',
    hint: 'Consider Latvia\'s population size and modern marriage trends.',
    category: 'society',
    emoji: '💍',
    source: 'CSP — Laulības',
    generateOptions: (real) => numericOptions(real, 18, 0),
    unitLabel: 'marriages',
  },
  {
    statKey: 'avgSalary',
    text: 'What is the average gross monthly salary in Latvia?',
    hint: 'Think in euros. Latvia joined the eurozone in 2014.',
    category: 'employment',
    emoji: '💶',
    source: 'CSP — Vidējā darba samaksa',
    funFact: 'Salaries in Latvia have nearly tripled since 2010, but still lag behind Western Europe.',
    generateOptions: salaryOptions,
    unitLabel: 'EUR/month',
  },
  {
    statKey: 'medianSalary',
    text: 'What is the median gross monthly salary in Latvia?',
    hint: 'The median is always lower than the average — half of workers earn less than this.',
    category: 'employment',
    emoji: '💰',
    source: 'CSP — Darba samaksas mediāna',
    funFact: 'The gap between average and median salary reveals income inequality — the average is pulled up by high earners.',
    generateOptions: salaryOptions,
    unitLabel: 'EUR/month',
  },
  {
    statKey: 'gdp',
    text: 'What is Latvia\'s GDP (in billions EUR)?',
    hint: 'Latvia is a small Baltic economy — think somewhere between Estonia and Lithuania.',
    category: 'economy',
    emoji: '💰',
    source: 'CSP — IKP',
    funFact: 'Latvia\'s GDP is roughly 1/100th of Germany\'s, but it has been one of the fastest-growing EU economies.',
    generateOptions: (real) => {
      // GDP comes in thousands, convert to billions for display
      const b = roundTo(real / 1_000_000, 1);
      return shuffleArray([b - 8, b - 3, b, b + 5]);
    },
    unitLabel: 'billion EUR',
  },
  {
    statKey: 'gdpPerCapita',
    text: 'What is Latvia\'s GDP per capita?',
    hint: 'Latvia is in the lower half of EU countries by GDP per capita.',
    category: 'economy',
    emoji: '📊',
    source: 'CSP — IKP uz vienu iedzīvotāju',
    funFact: 'Latvia\'s GDP per capita in PPS is about 72% of the EU average, up from 36% in 2000.',
    generateOptions: (real) => {
      const r = Math.round(real / 100) * 100;
      return shuffleArray([r - 4000, r - 1500, r, r + 3000]);
    },
    unitLabel: 'EUR',
  },
  {
    statKey: 'unemployment',
    text: 'What is Latvia\'s unemployment rate?',
    hint: 'Latvia recovered well from the 2008 crisis when unemployment hit 20%.',
    category: 'employment',
    emoji: '👷',
    source: 'CSP — Bezdarba līmenis',
    funFact: 'During the 2008-2010 financial crisis, Latvia\'s unemployment peaked at over 20% — among the worst in the EU.',
    generateOptions: (real) => numericOptions(real, 25, 1),
    unitLabel: '%',
  },
  {
    statKey: 'cpi',
    text: 'What was Latvia\'s annual consumer price change (inflation)?',
    hint: 'After the 2022 inflation spike, prices have been stabilizing across Europe.',
    category: 'economy',
    emoji: '🏷️',
    source: 'CSP — Patēriņa cenu indekss',
    funFact: 'In 2022, Latvia experienced 20%+ inflation — the highest in the eurozone, driven by energy prices.',
    generateOptions: (real) => numericOptions(real, 35, 1),
    unitLabel: '%',
  },
];

/** Fetch stats from our Azure Function proxy */
async function fetchStats(keys: string[]): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/latvia-stats?keys=${keys.join(',')}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

/** Generate quiz questions from real CSP data */
export async function generateQuizQuestions(count: number = 8): Promise<QuizQuestion[]> {
  // Pick random templates
  const selected = shuffleArray(QUESTION_TEMPLATES).slice(0, Math.min(count, QUESTION_TEMPLATES.length));
  const keys = selected.map(t => t.statKey);

  const { stats } = await fetchStats(keys);

  const questions: QuizQuestion[] = [];
  for (const template of selected) {
    const stat = stats[template.statKey];
    if (!stat || stat.value == null) continue;

    let displayValue = stat.value;
    let options = template.generateOptions(stat.value);

    // Special handling for GDP — convert from thousands to billions
    if (template.statKey === 'gdp') {
      displayValue = roundTo(stat.value / 1_000_000, 1);
    }

    questions.push({
      id: `quiz_${template.statKey}`,
      text: template.text,
      hint: template.hint,
      category: template.category,
      emoji: template.emoji,
      correctValue: template.statKey === 'gdp' ? displayValue : stat.value,
      unit: template.unitLabel,
      period: stat.period,
      source: template.source,
      options,
      funFact: template.funFact,
    });
  }

  return questions;
}

/** Format a number for display */
export function formatStatValue(value: number, unit: string): string {
  if (unit === 'people' || unit === 'births' || unit === 'deaths' || unit === 'marriages') {
    return value.toLocaleString('en-US');
  }
  if (unit === 'EUR/month' || unit === 'EUR') {
    return `€${value.toLocaleString('en-US')}`;
  }
  if (unit === 'billion EUR') {
    return `€${value}B`;
  }
  if (unit === '%') {
    return `${value}%`;
  }
  return value.toLocaleString('en-US');
}
