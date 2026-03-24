import { app } from '@azure/functions';
import { callLLM, getAvailableModels } from '../llm.js';

const SYSTEM_PROMPT = `You are the consequence engine for "Amber Republic," a political simulation game set in Latvia. The player typed a custom response to a political event instead of choosing a predefined option.

Evaluate their response and determine realistic effects on Latvia's indicators. Be fair but realistic — bold moves have big consequences (positive AND negative).

Available indicators (use exact keys):
gdp, gdpGrowth, unemployment, inflation, publicDebt, taxBurden, foreignInvestment, energyIndependence, portActivity,
population, emigrationRate, birthRate, russianMinorityIntegration, workforceSkill,
publicHappiness, healthcareQuality, educationQuality, corruptionLevel, mediaTrust, nationalIdentity, socialCohesion,
natoRelations, euStanding, russiaRelations, militaryReadiness, cyberDefense, borderSecurity,
techSector, rdSpending, digitalInfra, greenTransition

Respond with ONLY valid JSON:
{
  "label": "Short name for what the player chose",
  "description": "1-2 sentence interpretation of their choice",
  "effects": [
    { "indicator": "<key>", "delta": <number -15 to 15>, "delay": 0, "duration": 1 }
  ],
  "humor": "Witty one-liner about the consequence",
  "narrative": "2-3 sentence narrative of what happened as a result"
}`;

app.http('evaluate-choice', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request) => {
    const available = getAvailableModels();
    if (available.length === 0) {
      return { status: 503, jsonBody: { error: 'No AI provider configured' } };
    }

    try {
      const body = await request.json();
      const { eventTitle, eventDescription, customResponse, indicators, model } = body;

      if (!customResponse?.trim()) {
        return { status: 400, jsonBody: { error: 'Empty response' } };
      }

      const safeResponse = customResponse.slice(0, 500);

      const userPrompt = `EVENT: "${eventTitle}"
${eventDescription}

PLAYER'S CUSTOM RESPONSE: "${safeResponse}"

Current state context: GDP Growth ${indicators.gdpGrowth ?? 0}%, Unemployment ${indicators.unemployment ?? 0}%, Happiness ${indicators.publicHappiness ?? 50}/100, EU Standing ${indicators.euStanding ?? 50}/100

Evaluate this response. What realistically happens in Latvia? Affect 3-6 indicators. Be creative but fair.`;

      const result = await callLLM(SYSTEM_PROMPT, userPrompt, model || null, 512);
      if (!result) {
        return { status: 503, jsonBody: { error: 'All LLM providers failed' } };
      }

      const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const evaluation = JSON.parse(jsonStr);

      if (evaluation.effects) {
        for (const eff of evaluation.effects) {
          eff.delta = Math.max(-15, Math.min(15, eff.delta));
          eff.delay = eff.delay ?? 0;
          eff.duration = eff.duration ?? 1;
        }
      }

      return { jsonBody: { ...evaluation, _model: result.model } };
    } catch {
      return { status: 500, jsonBody: { error: 'Failed to evaluate choice' } };
    }
  },
});
