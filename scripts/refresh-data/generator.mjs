/**
 * AI-powered event generator.
 * Takes raw data from fetchers and uses LLM to produce game events.
 * Reuses the same LLM providers as the game's API.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from api/.env or project root .env
function loadEnv() {
  for (const envPath of [
    resolve(__dirname, '../../api/.env'),
    resolve(__dirname, '../../.env'),
  ]) {
    try {
      const content = readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (val && !process.env[key]) process.env[key] = val;
        }
      }
    } catch { /* ignore missing */ }
  }
}

loadEnv();

const SYSTEM_PROMPT = `You are the event designer for "Amber Republic," a political simulation game set in modern Latvia (2025-2035). The player is Prime Minister.

You will receive REAL DATA from Latvia — current news, statistics, petitions, and parliamentary activity. Your job is to transform this data into compelling game events.

Rules:
- Each event has 3 choices: a bold/progressive option, a cautious/conservative option, and a third creative angle
- Effects use these indicator keys: gdp, gdpGrowth, unemployment, inflation, publicDebt, taxBurden, foreignInvestment, energyIndependence, portActivity, population, emigrationRate, birthRate, russianMinorityIntegration, workforceSkill, publicHappiness, healthcareQuality, educationQuality, corruptionLevel, mediaTrust, nationalIdentity, socialCohesion, natoRelations, euStanding, russiaRelations, militaryReadiness, cyberDefense, borderSecurity, techSector, rdSpending, digitalInfra, greenTransition
- Deltas between -12 and +12, delays 0-6 quarters, durations 0-12
- Categories: economy, security, society, diplomacy, science, crisis, environment, culture, petition
- Include dry Baltic humor in flavor text and choice humor
- IDs must be unique slugs prefixed with the category
- Each event needs preconditions array (can be empty [])

Output ONLY a valid JSON array of event objects matching this structure:
[
  {
    "id": "category_unique_slug",
    "title": "📜 Short Title",
    "description": "2-3 sentences grounded in the real data provided",
    "category": "petition|economy|society|...",
    "weight": 5,
    "oneTime": true,
    "flavor": "Italic humor text",
    "preconditions": [],
    "choices": [
      {
        "label": "Bold option",
        "description": "What this means",
        "effects": [
          { "indicator": "publicHappiness", "delta": 5, "delay": 0, "duration": 0 }
        ],
        "humor": "Witty consequence"
      }
    ]
  }
]`;

async function callAzureOpenAI(system, user, deployment, maxTokens) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_KEY;
  if (!endpoint || !key) return null;

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-10-21`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': key },
    body: JSON.stringify({
      max_tokens: maxTokens,
      temperature: 0.9,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) {
    console.error(`  Azure OpenAI ${deployment}: ${res.status}`);
    return null;
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

async function callOpenAI(system, user, model, maxTokens) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.9,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

async function callAnthropic(system, user, model, maxTokens) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.content?.[0]?.text ?? null;
}

const MODELS = [
  { call: (s, u, t) => callAzureOpenAI(s, u, 'gpt-4.1', t), label: 'Azure GPT-4.1' },
  { call: (s, u, t) => callAzureOpenAI(s, u, 'gpt-4.1-nano', t), label: 'Azure GPT-4.1 Nano' },
  { call: (s, u, t) => callOpenAI(s, u, 'gpt-4.1-mini', t), label: 'OpenAI GPT-4.1 Mini' },
  { call: (s, u, t) => callAnthropic(s, u, 'claude-haiku-4-20250514', t), label: 'Claude Haiku 4' },
];

async function callLLM(userPrompt, maxTokens = 4096) {
  for (const m of MODELS) {
    try {
      console.log(`  Trying ${m.label}...`);
      const text = await m.call(SYSTEM_PROMPT, userPrompt, maxTokens);
      if (text) {
        console.log(`  ✓ ${m.label} responded`);
        return text;
      }
    } catch (e) {
      console.error(`  ✗ ${m.label}: ${e.message}`);
    }
  }
  return null;
}

export async function generateEvents(realData) {
  const prompt = buildPrompt(realData);
  console.log('\n🤖 Generating events from real data...');

  const raw = await callLLM(prompt);
  if (!raw) {
    console.error('All LLM providers failed');
    return [];
  }

  try {
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const events = JSON.parse(jsonStr);
    if (!Array.isArray(events)) return [events];

    // Validate and normalize
    return events.filter(e => e.id && e.title && e.choices?.length).map(e => ({
      ...e,
      weight: e.weight ?? 5,
      oneTime: e.oneTime ?? true,
      preconditions: e.preconditions ?? [],
      choices: e.choices.map(c => ({
        ...c,
        effects: (c.effects ?? []).map(eff => ({
          ...eff,
          delay: eff.delay ?? 0,
          duration: eff.duration ?? 0,
          delta: Math.max(-15, Math.min(15, eff.delta)),
        })),
      })),
    }));
  } catch (e) {
    console.error('Failed to parse LLM response:', e.message);
    console.error('Raw response (first 500 chars):', raw.slice(0, 500));
    return [];
  }
}

function buildPrompt(data) {
  const sections = [];

  // Petitions
  if (data.petitions) {
    const { active, completed } = data.petitions;
    sections.push(`## REAL PETITIONS (from data.gov.lv — Citizen Initiatives)
Active petitions (currently collecting signatures):
${active.map(p => `- "${p.name}" — ${p.totalSignatures}/${p.requiredSignatures} signatures (${p.type}), collecting until ${p.endDate}`).join('\n')}

Completed petitions (signature collection finished):
${completed.map(p => `- "${p.name}" — collected ${p.collectedSignatures}/${p.requiredSignatures} (${p.collectedSignatures >= p.requiredSignatures ? 'SUCCEEDED' : 'FAILED'})`).join('\n')}

Generate 3-4 PETITION events from this data. Use category "petition". Frame each as: citizens have started/completed a petition, the PM must decide how to respond.`);
  }

  // News
  if (data.news?.headlines?.length) {
    sections.push(`## CURRENT NEWS HEADLINES (from LSM.lv — Latvian Public Broadcasting)
${data.news.headlines.slice(0, 10).map(h => `- ${h.title} (${h.date})`).join('\n')}

Generate 2-3 events inspired by these headlines. Pick the most politically significant ones.`);
  }

  // CSP Stats
  if (data.cspStats?.stats) {
    const stats = data.cspStats.stats;
    sections.push(`## LATEST STATISTICS (from Central Statistical Bureau)
${Object.entries(stats).map(([k, v]) => `- ${v.label}: ${v.title ?? 'available'} (updated: ${v.lastUpdated ?? 'unknown'})`).join('\n')}

If any stat has changed significantly, generate 1 event about it.`);
  }

  // Parliamentary
  if (data.saeima?.items?.length) {
    sections.push(`## PARLIAMENTARY ACTIVITY (from Saeima)
Recent items: ${data.saeima.items.join('; ')}

Generate 1-2 events about parliamentary debates or legislation.`);
  }

  // Eurostat
  if (data.eurostat?.indicators?.length) {
    sections.push(`## EU CONTEXT (from Eurostat)
${data.eurostat.indicators.map(i => `- ${i.label}: ${i.latestValue ?? 'N/A'}`).join('\n')}

If Latvia is underperforming or overperforming EU averages, generate 1 event about EU pressure/opportunity.`);
  }

  if (sections.length === 0) {
    sections.push('No real data available. Generate 3 events about current Latvian politics in 2025-2026.');
  }

  return `Today is ${new Date().toISOString().split('T')[0]}. Here is REAL, CURRENT data from Latvia:\n\n${sections.join('\n\n')}\n\nGenerate a total of 6-10 game events based on the data above. Mix categories. Every event must be traceable to one of the real data points provided.`;
}
