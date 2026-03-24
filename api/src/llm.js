/**
 * Multi-provider LLM caller with automatic fallback.
 * Supports: OpenAI (GPT-4.1 nano/mini) and Anthropic (Haiku).
 * Tries models in cost order: cheapest first.
 */

const MODELS = [
  {
    id: 'gpt-4.1-nano',
    provider: 'openai',
    model: 'gpt-4.1-nano',
    label: 'GPT-4.1 Nano',
  },
  {
    id: 'gpt-4.1-mini',
    provider: 'openai',
    model: 'gpt-4.1-mini',
    label: 'GPT-4.1 Mini',
  },
  {
    id: 'claude-haiku',
    provider: 'anthropic',
    model: 'claude-haiku-4-20250514',
    label: 'Claude Haiku 4',
  },
  {
    id: 'claude-haiku-3.5',
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    label: 'Claude Haiku 3.5',
  },
];

async function callOpenAI(systemPrompt, userPrompt, model, apiKey, maxTokens) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

async function callAnthropic(systemPrompt, userPrompt, model, apiKey, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.content?.[0]?.text || null;
}

/**
 * Call LLM with automatic fallback across providers.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {string|null} preferredModel - specific model id, or null for auto
 * @param {number} maxTokens
 * @returns {{ text: string, model: string } | null}
 */
export async function callLLM(systemPrompt, userPrompt, preferredModel = null, maxTokens = 1024) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Build ordered model list: preferred first, then fallbacks
  let order = [...MODELS];
  if (preferredModel) {
    const preferred = order.find(m => m.id === preferredModel);
    if (preferred) {
      order = [preferred, ...order.filter(m => m.id !== preferredModel)];
    }
  }

  for (const m of order) {
    try {
      let text = null;
      if (m.provider === 'openai' && openaiKey) {
        text = await callOpenAI(systemPrompt, userPrompt, m.model, openaiKey, maxTokens);
      } else if (m.provider === 'anthropic' && anthropicKey) {
        text = await callAnthropic(systemPrompt, userPrompt, m.model, anthropicKey, maxTokens);
      }
      if (text) {
        return { text, model: m.id };
      }
    } catch {
      // Try next model
    }
  }

  return null;
}

/** Get list of available models (those with API keys configured) */
export function getAvailableModels() {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  return MODELS.filter(m =>
    (m.provider === 'openai' && openaiKey) ||
    (m.provider === 'anthropic' && anthropicKey)
  ).map(m => ({ id: m.id, label: m.label, provider: m.provider }));
}
