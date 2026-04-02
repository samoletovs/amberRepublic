/**
 * Data fetchers for real Latvian data sources.
 * Each fetcher returns structured data that the AI event generator can use.
 */

// ── 1. Petitions (data.gov.lv CKAN) ──────────────────────────────────

const PETITIONS_ACTIVE_RESOURCE = '55409dbf-073f-49b8-93cf-3d7f91d7e76d';
const PETITIONS_COMPLETED_RESOURCE = 'c68dece9-d1b7-4768-ac3e-87b1f8fb1293';
const CKAN_BASE = 'https://data.gov.lv/dati/api/3/action/datastore_search';

export async function fetchPetitions() {
  const [active, completed] = await Promise.all([
    fetchCKAN(PETITIONS_ACTIVE_RESOURCE),
    fetchCKAN(PETITIONS_COMPLETED_RESOURCE),
  ]);

  return {
    source: 'data.gov.lv — Citizen Initiative Petitions',
    active: active.map(normalizePetition),
    completed: completed.map(r => ({
      ...normalizePetition(r),
      collectedSignatures: r.Savaktais_parakstu_skaits,
    })),
  };
}

function normalizePetition(r) {
  return {
    name: r.Iniciativas_nosaukums,
    type: r.Iniciativas_veids,
    requiredSignatures: r.Nepieciesamais_parakstu_skaits,
    eSignatures: r.E_pakalpojumu_parakstu_skaits,
    inPersonSignatures: r.Klatienes_parakstu_skaits,
    totalSignatures: r.Parakstisanas_faktu_skaits ?? r.Savaktais_parakstu_skaits,
    startDate: r.Parakstu_vaksana_sakas,
    endDate: r.Parakstu_vaksana_beidzas,
  };
}

async function fetchCKAN(resourceId) {
  const url = `${CKAN_BASE}?resource_id=${resourceId}&limit=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CKAN fetch failed: ${res.status}`);
  const data = await res.json();
  return data.result?.records ?? [];
}

// ── 2. CSP Statistics (PxWeb API) ────────────────────────────────────

const CSP_BASE = 'https://data.stat.gov.lv/api/v1/lv/OSP_PUB';

const CSP_QUERIES = {
  population: {
    path: '/IRS/IRD/IRD010/IRD01030.px',
    label: 'Population at start of year',
  },
  unemployment: {
    path: '/NBS/NBS050/NBS05010.px',
    label: 'Unemployment rate',
  },
  gdp: {
    path: '/IKP/IKP10_P/IKP10_P020.px',
    label: 'GDP at current prices',
  },
  avgSalary: {
    path: '/DDA/DDG/DDG010/DDG01010.px',
    label: 'Average monthly salary',
  },
  cpi: {
    path: '/CEN/CP/CP070/CPG0700.px',
    label: 'Consumer Price Index, annual change',
  },
};

export async function fetchCSPStats() {
  const results = {};
  for (const [key, q] of Object.entries(CSP_QUERIES)) {
    try {
      const url = `${CSP_BASE}${q.path}`;
      const meta = await fetch(url);
      if (meta.ok) {
        const json = await meta.json();
        results[key] = {
          label: q.label,
          title: json.title,
          lastUpdated: json.updated,
          variables: json.variables?.map(v => v.text).join(', '),
        };
      }
    } catch {
      results[key] = { label: q.label, error: 'fetch failed' };
    }
  }
  return { source: 'CSP PxWeb — Central Statistical Bureau', stats: results };
}

// ── 3. LSM.lv News Headlines ─────────────────────────────────────────

export async function fetchNewsHeadlines() {
  // LSM.lv RSS feed — public English-language Latvian news
  const RSS_URL = 'https://eng.lsm.lv/rss/';
  try {
    const res = await fetch(RSS_URL);
    if (!res.ok) return { source: 'LSM.lv', headlines: [], error: `HTTP ${res.status}` };
    const xml = await res.text();
    // Simple XML title extraction (no dependency needed)
    const items = [];
    const itemRegex = /<item>[\s\S]*?<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
      const title = match[0].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        || match[0].match(/<title>(.*?)<\/title>/)?.[1];
      const pubDate = match[0].match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
      const desc = match[0].match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        || match[0].match(/<description>(.*?)<\/description>/)?.[1];
      if (title) items.push({ title, date: pubDate, summary: desc?.slice(0, 200) });
    }
    return { source: 'LSM.lv — Latvian Public Broadcasting (English)', headlines: items };
  } catch (e) {
    return { source: 'LSM.lv', headlines: [], error: e.message };
  }
}

// ── 4. Saeima (Parliament) ───────────────────────────────────────────

export async function fetchSaeimaData() {
  // titania.saeima.lv open data — recent draft laws
  const url = 'https://titania.saeima.lv/LIVS14/SasijuSaraksts.nsf/webAll?OpenView&count=10&start=1';
  try {
    const res = await fetch(url, { headers: { Accept: 'text/html' } });
    if (!res.ok) return { source: 'Saeima Open Data', data: [], error: `HTTP ${res.status}` };
    const html = await res.text();
    // Extract session/law titles from the page
    const titles = [];
    const regex = /<a[^>]*>([^<]{10,100})<\/a>/g;
    let m;
    while ((m = regex.exec(html)) !== null && titles.length < 15) {
      const text = m[1].trim();
      if (text.length > 15 && !text.includes('javascript')) titles.push(text);
    }
    return { source: 'Saeima — Latvian Parliament', items: [...new Set(titles)].slice(0, 10) };
  } catch (e) {
    return { source: 'Saeima', items: [], error: e.message };
  }
}

// ── 5. Eurostat ──────────────────────────────────────────────────────

export async function fetchEurostatData() {
  // Eurostat JSON API — key Latvia indicators
  const indicators = [
    { code: 'tec00115', label: 'GDP per capita in PPS (EU=100)' },
    { code: 'tps00203', label: 'Population change' },
    { code: 'tipslm80', label: 'Employment rate 20-64' },
  ];

  const results = [];
  for (const ind of indicators) {
    try {
      const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${ind.code}?geo=LV&sinceTimePeriod=2023`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const values = data.value ? Object.entries(data.value).map(([, v]) => v) : [];
        results.push({ ...ind, latestValue: values[values.length - 1], values });
      }
    } catch {
      results.push({ ...ind, error: 'fetch failed' });
    }
  }
  return { source: 'Eurostat — EU Statistical Office', indicators: results };
}
