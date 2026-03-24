/**
 * Multi-provider LLM caller with automatic fallback.
 * Supports: Azure OpenAI, OpenAI, and Anthropic.
 * Tries models in cost order: cheapest first.
 * 
 * Environment variables:
 *   AZURE_OPENAI_ENDPOINT - Azure OpenAI endpoint URL
 *   AZURE_OPENAI_KEY      - Azure OpenAI API key
 *   OPENAI_API_KEY        - OpenAI API key (optional fallback)
 *   ANTHROPIC_API_KEY     - Anthropic API key (optional fallback)
 */

const MODELS = [
  {
    id: 'azure-gpt-4.1-nano',
    provider: 'azure-openai',
    deployment: 'gpt-4.1-nano',
    label: 'Azure GPT-4.1 Nano',
  },
  {
    id: 'azure-gpt-4.1',
    provider: 'azure-openai',
    deployment: 'gpt-4.1',
    label: 'Azure GPT-4.1',
  },
  {
    id: 'azure-o4-mini',
    provider: 'azure-openai',
    deployment: 'o4-mini',
    label: 'Azure o4-mini',
  },
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

async function callAzureOpenAI(systemPrompt, userPrompt, deployment, endpoint, apiKey, maxTokens) {
  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-10-21`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
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
async function callLLM(systemPrompt, userPrompt, preferredModel = null, maxTokens = 1024) {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureKey = process.env.AZURE_OPENAI_KEY;
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
      if (m.provider === 'azure-openai' && azureEndpoint && azureKey) {
        text = await callAzureOpenAI(systemPrompt, userPrompt, m.deployment, azureEndpoint, azureKey, maxTokens);
      } else if (m.provider === 'openai' && openaiKey) {
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
function getAvailableModels() {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureKey = process.env.AZURE_OPENAI_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  return MODELS.filter(m =>
    (m.provider === 'azure-openai' && azureEndpoint && azureKey) ||
    (m.provider === 'openai' && openaiKey) ||
    (m.provider === 'anthropic' && anthropicKey)
  ).map(m => ({ id: m.id, label: m.label, provider: m.provider }));
}

module.exports = { callLLM, getAvailableModels };
