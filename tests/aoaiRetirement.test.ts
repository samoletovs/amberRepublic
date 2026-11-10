import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRequire } from 'module';

// Azure OpenAI models retiring 2026-11-19 (o3, o4-mini) and 2027-04-14 (gpt-4o*, gpt-4.1*).
const RETIRING = /gpt-4o|gpt-4\.1|o4-mini|o3/;

const require = createRequire(import.meta.url);

type FetchCall = { url: string; body: Record<string, unknown> };

function stubFetch(content: string): FetchCall[] {
  const calls: FetchCall[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: { body: string }) => {
      calls.push({ url: String(url), body: JSON.parse(init.body) });
      return {
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content } }] }),
      };
    }),
  );
  return calls;
}

const savedEnv = { ...process.env };

beforeEach(() => {
  process.env.AZURE_OPENAI_ENDPOINT = 'https://example.openai.azure.com/';
  process.env.AZURE_OPENAI_KEY = 'test-key';
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...savedEnv };
});

describe('api/src/llm.js — Azure OpenAI retirement', () => {
  const llm = require('../api/src/llm.js');

  it('registers exactly one Azure model, gpt-6-luna', () => {
    const azure = llm.getAvailableModels().filter((m: { provider: string }) => m.provider === 'azure-openai');
    expect(azure.map((m: { id: string }) => m.id)).toEqual(['azure-gpt-6-luna']);
  });

  it('default call goes to the gpt-6-luna deployment with max_completion_tokens and reasoning none', async () => {
    const calls = stubFetch('hello');
    const result = await llm.callLLM('system', 'user', null, 123);

    expect(result).toEqual({ text: 'hello', model: 'azure-gpt-6-luna' });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain('/openai/deployments/gpt-6-luna/chat/completions?api-version=2024-10-21');
    expect(calls[0].url).not.toMatch(RETIRING);
    expect(calls[0].body.max_completion_tokens).toBe(123);
    expect(calls[0].body).not.toHaveProperty('max_tokens');
    expect(calls[0].body.reasoning_effort).toBe('none');
  });

  it('a stale retired model id from the client still resolves to gpt-6-luna', async () => {
    const calls = stubFetch('ok');
    const result = await llm.callLLM('system', 'user', 'azure-gpt-4.1', 50);
    expect(result.model).toBe('azure-gpt-6-luna');
    expect(calls[0].url).toContain('/deployments/gpt-6-luna/');
  });
});

describe('api/src/guardrails.js — price table', () => {
  it('prices azure-gpt-6-luna at USD 0.50 per 1M output tokens', () => {
    const guardrails = require('../api/src/guardrails.js');
    const before = guardrails.getStats().spentUsdToday;
    guardrails.recordEstimatedCost('azure-gpt-6-luna', 1000);
    const after = guardrails.getStats().spentUsdToday;
    expect(after - before).toBeCloseTo(0.0005, 6);
  });
});

describe('scripts/refresh-data/generator.mjs — Azure OpenAI retirement', () => {
  it('first provider is gpt-6-luna with max_completion_tokens, temperature 0.9 and reasoning none', async () => {
    const calls = stubFetch('[]');
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const { generateEvents } = await import('../scripts/refresh-data/generator.mjs');
    await generateEvents({});

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain('/openai/deployments/gpt-6-luna/chat/completions?api-version=2024-10-21');
    expect(calls[0].url).not.toMatch(RETIRING);
    expect(calls[0].body.max_completion_tokens).toBe(4096);
    expect(calls[0].body).not.toHaveProperty('max_tokens');
    expect(calls[0].body.temperature).toBe(0.9);
    expect(calls[0].body.reasoning_effort).toBe('none');
  });
});
