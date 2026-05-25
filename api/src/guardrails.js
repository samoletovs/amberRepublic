/**
 * API guardrails for the public amberRepublic backend.
 *
 * Two cheap, dependency-free layers of protection so a public repo + open
 * /api/* endpoints can't be weaponised to burn the lab's Azure OpenAI quota:
 *
 *   1. Per-IP rate limit  (sliding 1-hour window)
 *   2. Daily USD budget cap (worst-case estimate, per Function instance)
 *
 * State lives in process memory. Azure Functions on Consumption plan may scale
 * out or cold-start, so the budget is per-instance — meaning the true ceiling
 * can be N * DAILY_BUDGET_USD if N instances are warm. That is acceptable
 * defense-in-depth for a research-grade game; an attacker still gets shut
 * down quickly on any single instance.
 *
 * Environment variables (set via Azure SWA App Settings):
 *   RATE_LIMIT_PER_HOUR  - max requests per IP per hour (default 30)
 *   DAILY_BUDGET_USD     - per-instance daily $ ceiling (default 1.00)
 */

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_PER_HOUR || '30', 10);
const DAILY_BUDGET_USD = parseFloat(process.env.DAILY_BUDGET_USD || '1.00');

const ipHits = new Map();
let dailyBudget = { date: '', costUsd: 0 };

// Conservative USD per 1K output tokens (worst case so we overestimate cost).
const COST_PER_1K_OUTPUT = {
  'azure-gpt-4.1-nano': 0.0004,
  'azure-gpt-4.1': 0.008,
  'azure-o4-mini': 0.0044,
  'gpt-4.1-nano': 0.0004,
  'gpt-4.1-mini': 0.0016,
  'claude-haiku': 0.005,
  'claude-haiku-3.5': 0.005,
};
const DEFAULT_COST_PER_1K = 0.008;

function getClientIp(request) {
  const xff = request.headers?.get?.('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers?.get?.('client-ip') || 'unknown';
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function pruneOldHits(timestamps, now) {
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  let i = 0;
  while (i < timestamps.length && timestamps[i] < cutoff) i++;
  return i > 0 ? timestamps.slice(i) : timestamps;
}

function checkRateLimit(request) {
  const ip = getClientIp(request);
  const now = Date.now();
  const hits = pruneOldHits(ipHits.get(ip) || [], now);
  if (hits.length >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((hits[0] + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
      jsonBody: {
        error: 'Too many requests from this IP. Try again later.',
        retryAfter,
        limit: RATE_LIMIT_MAX,
        windowSeconds: RATE_LIMIT_WINDOW_MS / 1000,
      },
    };
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return null;
}

function checkBudget() {
  const today = todayKey();
  if (dailyBudget.date !== today) {
    dailyBudget = { date: today, costUsd: 0 };
  }
  if (dailyBudget.costUsd >= DAILY_BUDGET_USD) {
    return {
      status: 429,
      jsonBody: {
        error: 'Daily AI budget exceeded. Resets at UTC midnight.',
        budgetUsd: DAILY_BUDGET_USD,
        spentUsd: Number(dailyBudget.costUsd.toFixed(4)),
      },
    };
  }
  return null;
}

function recordEstimatedCost(modelId, maxTokens) {
  const today = todayKey();
  if (dailyBudget.date !== today) {
    dailyBudget = { date: today, costUsd: 0 };
  }
  const rate = COST_PER_1K_OUTPUT[modelId] ?? DEFAULT_COST_PER_1K;
  dailyBudget.costUsd += (maxTokens / 1000) * rate;
}

function getStats() {
  return {
    rateLimitPerHour: RATE_LIMIT_MAX,
    dailyBudgetUsd: DAILY_BUDGET_USD,
    spentUsdToday: Number(dailyBudget.costUsd.toFixed(4)),
    trackedIps: ipHits.size,
  };
}

module.exports = {
  checkRateLimit,
  checkBudget,
  recordEstimatedCost,
  getClientIp,
  getStats,
};
