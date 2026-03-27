const { app } = require('@azure/functions');

/**
 * CSP PxWeb API proxy for Latvia statistics.
 * Proxies requests to https://data.stat.gov.lv/api/v1/lv/OSP_PUB/
 * Handles CORS and caches responses (stats update quarterly).
 */

const CSP_BASE = 'https://data.stat.gov.lv/api/v1/lv/OSP_PUB';

// In-memory cache with TTL (24 hours — data updates quarterly)
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000;

function getCacheKey(tablePath, body) {
  return `${tablePath}:${JSON.stringify(body)}`;
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Pre-defined stat queries for the quiz and reality-check features.
 * Each maps to a specific CSP table + POST body.
 */
const STAT_QUERIES = {
  population: {
    path: 'POP/IR/IRS/IRS010',
    body: {
      query: [
        { code: 'INDICATOR', selection: { filter: 'item', values: ['POP_SY'] } },
        { code: 'ContentsCode', selection: { filter: 'item', values: ['IRS010'] } },
        { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
      ],
      response: { format: 'json-stat2' },
    },
    extract: (data) => ({ value: data.value[0], unit: 'people', label: 'Population (start of year)' }),
  },
  births: {
    path: 'POP/IR/IRS/IRS010',
    body: {
      query: [
        { code: 'INDICATOR', selection: { filter: 'item', values: ['LBIRTH'] } },
        { code: 'ContentsCode', selection: { filter: 'item', values: ['IRS010'] } },
        { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
      ],
      response: { format: 'json-stat2' },
    },
    extract: (data) => ({ value: data.value[0], unit: 'people', label: 'Live births per year' }),
  },
  deaths: {
    path: 'POP/IR/IRS/IRS010',
    body: {
      query: [
        { code: 'INDICATOR', selection: { filter: 'item', values: ['DEATH'] } },
        { code: 'ContentsCode', selection: { filter: 'item', values: ['IRS010'] } },
        { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
      ],
      response: { format: 'json-stat2' },
    },
    extract: (data) => ({ value: data.value[0], unit: 'people', label: 'Deaths per year' }),
  },
  naturalGrowth: {
    path: 'POP/IR/IRS/IRS010',
    body: {
      query: [
        { code: 'INDICATOR', selection: { filter: 'item', values: ['NATGROW'] } },
        { code: 'ContentsCode', selection: { filter: 'item', values: ['IRS010'] } },
        { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
      ],
      response: { format: 'json-stat2' },
    },
    extract: (data) => ({ value: data.value[0], unit: 'people', label: 'Natural population growth' }),
  },
  netMigration: {
    path: 'POP/IR/IRS/IRS010',
    body: {
      query: [
        { code: 'INDICATOR', selection: { filter: 'item', values: ['MIGR_NET'] } },
        { code: 'ContentsCode', selection: { filter: 'item', values: ['IRS010'] } },
        { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
      ],
      response: { format: 'json-stat2' },
    },
    extract: (data) => ({ value: data.value[0], unit: 'people', label: 'Net migration' }),
  },
  marriages: {
    path: 'POP/IR/IRS/IRS010',
    body: {
      query: [
        { code: 'INDICATOR', selection: { filter: 'item', values: ['MARRIAGE'] } },
        { code: 'ContentsCode', selection: { filter: 'item', values: ['IRS010'] } },
        { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
      ],
      response: { format: 'json-stat2' },
    },
    extract: (data) => ({ value: data.value[0], unit: 'marriages', label: 'Marriages per year' }),
  },
  avgSalary: {
    path: 'EMP/DS/DSV/DSV010',
    body: {
      query: [
        { code: 'SECTOR', selection: { filter: 'item', values: ['TOTAL'] } },
        { code: 'GRS_NET', selection: { filter: 'item', values: ['GRS'] } },
        { code: 'INDICATOR', selection: { filter: 'item', values: ['AVWAG_M'] } },
        { code: 'ContentsCode', selection: { filter: 'item', values: ['DSV010'] } },
        { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
      ],
      response: { format: 'json-stat2' },
    },
    extract: (data) => ({ value: data.value[0], unit: 'EUR/month', label: 'Average gross monthly salary' }),
  },
  medianSalary: {
    path: 'EMP/DS/DSV/DSV010',
    body: {
      query: [
        { code: 'SECTOR', selection: { filter: 'item', values: ['TOTAL'] } },
        { code: 'GRS_NET', selection: { filter: 'item', values: ['GRS'] } },
        { code: 'INDICATOR', selection: { filter: 'item', values: ['MDWAG_M'] } },
        { code: 'ContentsCode', selection: { filter: 'item', values: ['DSV010'] } },
        { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
      ],
      response: { format: 'json-stat2' },
    },
    extract: (data) => ({ value: data.value[0], unit: 'EUR/month', label: 'Median gross monthly salary' }),
  },
  gdp: {
    path: 'VEK/IK/IKP/IKP010',
    body: {
      query: [
        { code: 'PRICES', selection: { filter: 'item', values: ['CP'] } },
        { code: 'ContentsCode', selection: { filter: 'item', values: ['IKP010'] } },
        { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
      ],
      response: { format: 'json-stat2' },
    },
    extract: (data) => ({ value: data.value[0], unit: 'EUR thousands', label: 'GDP (current prices, thousands EUR)' }),
  },
  gdpPerCapita: {
    path: 'VEK/IK/IKP/IKP010',
    body: {
      query: [
        { code: 'PRICES', selection: { filter: 'item', values: ['CP'] } },
        { code: 'ContentsCode', selection: { filter: 'item', values: ['IKP0101'] } },
        { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
      ],
      response: { format: 'json-stat2' },
    },
    extract: (data) => ({ value: data.value[0], unit: 'EUR', label: 'GDP per capita' }),
  },
  unemployment: {
    path: 'EMP/NBBA/NBBB/NBB010',
    body: {
      query: [
        { code: 'SEX', selection: { filter: 'item', values: ['T'] } },
        { code: 'AgeGroup', selection: { filter: 'item', values: ['TOTAL'] } },
        { code: 'ETHNICITY_GROUP', selection: { filter: 'item', values: ['TOTAL'] } },
        { code: 'ContentsCode', selection: { filter: 'item', values: ['NBB010'] } },
        { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
      ],
      response: { format: 'json-stat2' },
    },
    extract: (data) => ({ value: data.value[0], unit: '%', label: 'Unemployment rate' }),
  },
  cpi: {
    path: 'VEK/PC/PCI/PCI021',
    body: {
      query: [
        { code: 'ECOICOP_V2', selection: { filter: 'item', values: ['0'] } },
        { code: 'ContentsCode', selection: { filter: 'item', values: ['PCI0214'] } },
        { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
      ],
      response: { format: 'json-stat2' },
    },
    extract: (data) => ({ value: data.value[0], unit: '%', label: 'Consumer price index (annual change)' }),
  },
};

/** Fetch a single stat by key */
async function fetchStat(key) {
  const query = STAT_QUERIES[key];
  if (!query) return null;

  const cacheKey = getCacheKey(query.path, query.body);
  const cached = getCached(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const url = `${CSP_BASE}/${query.path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query.body),
  });

  if (!res.ok) return null;

  const data = await res.json();

  // Extract the time period from the response
  const timeDim = data.dimension?.TIME;
  const timeLabels = timeDim?.category?.label || {};
  const period = Object.values(timeLabels)[0] || 'latest';

  const result = { ...query.extract(data), key, period };
  cache.set(cacheKey, { data: result, ts: Date.now() });
  return result;
}

/** Fetch a stat for a specific year (for historical mode) */
async function fetchStatForYear(key, year) {
  const query = STAT_QUERIES[key];
  if (!query) return null;

  // Clone the body and replace TIME filter
  const body = JSON.parse(JSON.stringify(query.body));
  const timeIdx = body.query.findIndex(q => q.code === 'TIME');
  if (timeIdx >= 0) {
    body.query[timeIdx] = { code: 'TIME', selection: { filter: 'item', values: [String(year)] } };
  }

  const cacheKey = getCacheKey(query.path, body);
  const cached = getCached(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const url = `${CSP_BASE}/${query.path}`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) return null;
  const data = await res.json();
  const result = { ...query.extract(data), key, period: String(year) };
  cache.set(cacheKey, { data: result, ts: Date.now() });
  return result;
}

/** Fetch raw CSP data for a custom query */
async function fetchCustomQuery(path, body) {
  const cacheKey = getCacheKey(path, body);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${CSP_BASE}/${path}`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) return null;
  const data = await res.json();
  cache.set(cacheKey, { data, ts: Date.now() });
  return data;
}

/**
 * GET /api/latvia-stats?keys=population,gdp,avgSalary&year=2009
 * Returns an object with requested stat values.
 * Optional year param for historical data.
 */
app.http('latvia-stats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request) => {
    try {
      const url = new URL(request.url);
      const keysParam = url.searchParams.get('keys');
      const yearParam = url.searchParams.get('year');
      const keys = keysParam
        ? keysParam.split(',').filter(k => k in STAT_QUERIES)
        : Object.keys(STAT_QUERIES);

      if (keys.length === 0) {
        return {
          status: 400,
          jsonBody: { error: 'No valid stat keys provided', available: Object.keys(STAT_QUERIES) },
        };
      }

      const results = {};
      const errors = [];

      // Fetch in parallel (max 5 concurrent to be respectful to CSP)
      const chunks = [];
      for (let i = 0; i < keys.length; i += 5) {
        chunks.push(keys.slice(i, i + 5));
      }

      for (const chunk of chunks) {
        const batch = await Promise.all(chunk.map(k =>
          (yearParam ? fetchStatForYear(k, yearParam) : fetchStat(k)).catch(() => null)
        ));
        chunk.forEach((key, idx) => {
          if (batch[idx]) {
            results[key] = batch[idx];
          } else {
            errors.push(key);
          }
        });
      }

      return {
        jsonBody: {
          stats: results,
          errors: errors.length > 0 ? errors : undefined,
          available: Object.keys(STAT_QUERIES),
        },
      };
    } catch (err) {
      return {
        status: 500,
        jsonBody: { error: 'Failed to fetch Latvia statistics' },
      };
    }
  },
});

/**
 * GET /api/latvia-regions
 * Returns regional data: population, unemployment per region
 */
app.http('latvia-regions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async () => {
    try {
      const regions = [
        { code: 'LV00A', name: 'Rīga', nameEn: 'Riga' },
        { code: 'LV00C', name: 'Vidzeme', nameEn: 'Vidzeme' },
        { code: 'LV00B', name: 'Kurzeme', nameEn: 'Kurzeme' },
        { code: 'LV009', name: 'Zemgale', nameEn: 'Zemgale' },
        { code: 'LV005', name: 'Latgale', nameEn: 'Latgale' },
      ];

      // Regional population
      const popBody = {
        query: [
          { code: 'INDICATOR', selection: { filter: 'item', values: ['POP_SY'] } },
          { code: 'AREA', selection: { filter: 'item', values: regions.map(r => r.code) } },
          { code: 'ContentsCode', selection: { filter: 'item', values: ['IRS031'] } },
          { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
        ],
        response: { format: 'json-stat2' },
      };
      const popData = await fetchCustomQuery('POP/IR/IRS/IRS031', popBody);
      const popValues = popData?.value || [];

      const result = regions.map((r, i) => ({
        ...r,
        population: popValues[i] || null,
      }));

      return { jsonBody: { regions: result } };
    } catch {
      return { status: 500, jsonBody: { error: 'Failed to fetch regional data' } };
    }
  },
});

/**
 * GET /api/latvia-pyramid
 * Returns age pyramid data: population by 5-year age groups and sex
 */
app.http('latvia-pyramid', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async () => {
    try {
      const ageGroups = ['Y0-4','Y5-9','Y10-14','Y15-19','Y20-24','Y25-29','Y30-34','Y35-39','Y40-44','Y45-49','Y50-54','Y55-59','Y60-64','Y65-69','Y70-74','Y75-79','Y80-84','Y_GE85'];
      const ageLabels = ['0-4','5-9','10-14','15-19','20-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70-74','75-79','80-84','85+'];

      const body = {
        query: [
          { code: 'AREA', selection: { filter: 'item', values: ['LV'] } },
          { code: 'AGE', selection: { filter: 'item', values: ageGroups } },
          { code: 'SEX', selection: { filter: 'item', values: ['M', 'F'] } },
          { code: 'ContentsCode', selection: { filter: 'item', values: ['IRD041'] } },
          { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
        ],
        response: { format: 'json-stat2' },
      };
      const data = await fetchCustomQuery('POP/IR/IRD/IRD041', body);
      if (!data?.value) return { status: 503, jsonBody: { error: 'No data' } };

      // Data is ordered: [age0_male, age0_female, age1_male, age1_female, ...]
      const pyramid = ageLabels.map((label, i) => ({
        ageGroup: label,
        male: data.value[i * 2] || 0,
        female: data.value[i * 2 + 1] || 0,
      }));

      return { jsonBody: { pyramid } };
    } catch {
      return { status: 500, jsonBody: { error: 'Failed to fetch pyramid data' } };
    }
  },
});

/**
 * GET /api/latvia-budget
 * Returns government expenditure by COFOG function (millions EUR)
 */
app.http('latvia-budget', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async () => {
    try {
      const functions = [
        { code: 'TOTAL', name: 'Total', emoji: '📊' },
        { code: 'GF02', name: 'Defence', emoji: '🛡️' },
        { code: 'GF03', name: 'Public Order & Safety', emoji: '🚔' },
        { code: 'GF04', name: 'Economic Affairs', emoji: '💼' },
        { code: 'GF05', name: 'Environment', emoji: '🌿' },
        { code: 'GF07', name: 'Healthcare', emoji: '🏥' },
        { code: 'GF08', name: 'Culture & Recreation', emoji: '🎭' },
        { code: 'GF09', name: 'Education', emoji: '📚' },
        { code: 'GF10', name: 'Social Protection', emoji: '🤝' },
      ];

      const body = {
        query: [
          { code: 'SECTOR', selection: { filter: 'item', values: ['S13'] } },
          { code: 'GOVFUNKC', selection: { filter: 'item', values: functions.map(f => f.code) } },
          { code: 'INDICATOR', selection: { filter: 'item', values: ['OTE'] } },
          { code: 'ContentsCode', selection: { filter: 'item', values: ['VFV040'] } },
          { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
        ],
        response: { format: 'json-stat2' },
      };
      const data = await fetchCustomQuery('VEK/VF/VFV/VFV040', body);
      if (!data?.value) return { status: 503, jsonBody: { error: 'No data' } };

      const budget = functions.map((f, i) => ({
        ...f,
        amount: Math.round(data.value[i] || 0),
      }));

      return { jsonBody: { budget } };
    } catch {
      return { status: 500, jsonBody: { error: 'Failed to fetch budget data' } };
    }
  },
});

/**
 * GET /api/latvia-crime
 * Returns total registered crimes for latest year
 */
app.http('latvia-crime', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async () => {
    try {
      const body = {
        query: [
          { code: 'CRIME', selection: { filter: 'item', values: ['TOTAL'] } },
          { code: 'ContentsCode', selection: { filter: 'item', values: ['NOR010'] } },
          { code: 'TIME', selection: { filter: 'top', values: ['2'] } },
        ],
        response: { format: 'json-stat2' },
      };
      const data = await fetchCustomQuery('POP/NO/NOR/NOR010', body);
      if (!data?.value) return { status: 503, jsonBody: { error: 'No data' } };

      const timeDim = data.dimension?.TIME;
      const years = timeDim ? Object.keys(timeDim.category.index) : [];

      return {
        jsonBody: {
          crimes: data.value.map((v, i) => ({ year: years[i] || 'unknown', total: v })),
        },
      };
    } catch {
      return { status: 500, jsonBody: { error: 'Failed to fetch crime data' } };
    }
  },
});

/**
 * GET /api/latvia-trade
 * Returns export/import by country groups (millions EUR)
 */
app.http('latvia-trade', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async () => {
    try {
      const body = {
        query: [
          { code: 'ContentsCode', selection: { filter: 'item', values: ['ATD100', 'ATD1001'] } },
          { code: 'TIME', selection: { filter: 'top', values: ['1'] } },
        ],
        response: { format: 'json-stat2' },
      };
      const data = await fetchCustomQuery('TIR/AT/ATD/ATD100', body);
      if (!data?.value) return { status: 503, jsonBody: { error: 'No data' } };

      // Just get total export and import
      return {
        jsonBody: {
          exports: data.value[0] || 0,
          imports: data.value[1] || 0,
        },
      };
    } catch {
      return { status: 500, jsonBody: { error: 'Failed to fetch trade data' } };
    }
  },
});
