import { app } from '@azure/functions';
import { callLLM, getAvailableModels } from '../llm.js';

const SYSTEM_PROMPT = `You are at the heart of "Amber Republic," a political simulation game set in modern Latvia (2025-2035). The player is Prime Minister navigating real Latvian politics.

You generate political events as structured JSON. Each event must:
- Be grounded in realistic Latvian politics, culture, economy, or geopolitics
- Have 2-3 meaningful choices with different tradeoffs
- Include effects on game indicators (deltas between -15 and +15)
- Be distinct from recently shown events
- Include dry Baltic humor

Available indicators (use these exact keys):
gdp, gdpGrowth, unemployment, inflation, publicDebt, taxBurden, foreignInvestment, energyIndependence, portActivity,
population, emigrationRate, birthRate, russianMinorityIntegration, workforceSkill,
publicHappiness, healthcareQuality, educationQuality, corruptionLevel, mediaTrust, nationalIdentity, socialCohesion,
natoRelations, euStanding, russiaRelations, militaryReadiness, cyberDefense, borderSecurity,
techSector, rdSpending, digitalInfra, greenTransition

Categories: economy, security, society, diplomacy, science, crisis, environment, culture

Respond with ONLY valid JSON matching this schema:
{
  "id": "ai_<unique_slug>",
  "title": "Short Event Title",
  "description": "2-3 sentence description of the situation",
  "category": "<category>",
  "flavor": "Optional italic flavor text with humor",
  "choices": [
    {
      "label": "Short choice name",
      "description": "What this choice means",
      "effects": [
        { "indicator": "<key>", "delta": <number>, "delay": 0, "duration": 1 }
      ],
      "humor": "Optional witty consequence text"
    }
  ]
}`;

app.http('generate-event', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request) => {
    const available = getAvailableModels();
    if (available.length === 0) {
      return { status: 503, jsonBody: { error: 'No AI provider configured' } };
    }

    try {
      const body = await request.json();
      const { indicators, turn, year, quarter, recentEventTitles = [], model } = body;

      const userPrompt = `Game state — Turn ${turn}, Q${quarter} ${year}:
Key indicators: GDP Growth ${indicators.gdpGrowth ?? 0}%, Unemployment ${indicators.unemployment ?? 0}%, Happiness ${indicators.publicHappiness ?? 50}/100, NATO ${indicators.natoRelations ?? 50}/100, Russia ${indicators.russiaRelations ?? 50}/100, EU ${indicators.euStanding ?? 50}/100, Population ${indicators.population ?? 1.8}M, Tech ${indicators.techSector ?? 50}/100, Green ${indicators.greenTransition ?? 50}/100, Corruption ${indicators.corruptionLevel ?? 50}/100

Recent events to AVOID repeating: ${recentEventTitles.join(', ') || 'none yet'}

Generate ONE new political event for this quarter. Make it topical to the current state — if unemployment is high, maybe a labor issue; if Russia relations are tense, maybe a border incident. Be creative and specific to Latvia.`;

      const result = await callLLM(SYSTEM_PROMPT, userPrompt, model || null, 1024);
      if (!result) {
        return { status: 503, jsonBody: { error: 'All LLM providers failed' } };
      }

      const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const event = JSON.parse(jsonStr);

      if (!event.id || !event.title || !event.choices?.length) {
        return { status: 502, jsonBody: { error: 'Invalid event structure' } };
      }

      event.weight = 1;
      event.oneTime = true;
      event.preconditions = [];
      for (const choice of event.choices) {
        for (const eff of choice.effects || []) {
          eff.delay = eff.delay ?? 0;
          eff.duration = eff.duration ?? 1;
          eff.delta = Math.max(-15, Math.min(15, eff.delta));
        }
      }

      return { jsonBody: { ...event, _model: result.model } };
    } catch {
      return { status: 500, jsonBody: { error: 'Failed to generate event' } };
    }
  },
});
