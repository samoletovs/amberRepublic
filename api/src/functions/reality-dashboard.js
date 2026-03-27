const { app } = require('@azure/functions');

/**
 * Latvia Reality Dashboard API — fetches live data from multiple sources:
 * - Electricity prices from Elering (NordPool day-ahead)
 * - Weather from wttr.in (simple, no auth needed)
 * - Key stats served from the existing latvia-stats function cache
 */

const ELERING_API = 'https://dashboard.elering.ee/api/nps/price';

// In-memory cache (5 min TTL for real-time data)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function cached(key, ttl = CACHE_TTL) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data;
  return null;
}

function setCache(key, data, ttl = CACHE_TTL) {
  cache.set(key, { data, ts: Date.now() });
  // Evict old entries
  if (cache.size > 50) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) cache.delete(oldest[0]);
  }
}

async function fetchElectricity() {
  const key = 'electricity';
  const hit = cached(key);
  if (hit) return hit;

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const url = `${ELERING_API}?start=${start.toISOString()}&end=${end.toISOString()}`;
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'AmberRepublic/1.0' },
    signal: AbortSignal.timeout(10000),
  });

  if (!resp.ok) throw new Error(`Elering API: ${resp.status}`);
  const data = await resp.json();

  // Extract Latvia prices (lv key)
  const prices = (data.data?.lv || []).map(p => ({
    hour: new Date(p.timestamp * 1000).getHours(),
    price: Math.round(p.price * 100) / 100, // EUR/MWh, 2 decimals
  }));

  const currentHour = now.getHours();
  const currentPrice = prices.find(p => p.hour === currentHour)?.price ?? null;
  const minPrice = prices.length ? Math.min(...prices.map(p => p.price)) : null;
  const maxPrice = prices.length ? Math.max(...prices.map(p => p.price)) : null;
  const cheapestHour = prices.length ? prices.reduce((a, b) => a.price < b.price ? a : b).hour : null;

  const result = { currentPrice, minPrice, maxPrice, cheapestHour, prices, currency: 'EUR/MWh' };
  setCache(key, result);
  return result;
}

async function fetchWeather() {
  const key = 'weather';
  const hit = cached(key, 15 * 60 * 1000); // 15 min cache for weather
  if (hit) return hit;

  const cities = ['Riga', 'Liepaja', 'Daugavpils', 'Jurmala'];
  const results = await Promise.allSettled(
    cities.map(async (city) => {
      const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'AmberRepublic/1.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      const current = data.current_condition?.[0];
      if (!current) return null;
      return {
        city,
        temp: parseInt(current.temp_C),
        feelsLike: parseInt(current.FeelsLikeC),
        description: current.weatherDesc?.[0]?.value || 'Unknown',
        windKmph: parseInt(current.windspeedKmph),
        humidity: parseInt(current.humidity),
      };
    })
  );

  const weather = results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);

  setCache(key, weather, 15 * 60 * 1000);
  return weather;
}

app.http('reality-dashboard', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reality',
  handler: async (request, context) => {
    try {
      const [electricity, weather] = await Promise.allSettled([
        fetchElectricity(),
        fetchWeather(),
      ]);

      const body = {
        timestamp: new Date().toISOString(),
        electricity: electricity.status === 'fulfilled' ? electricity.value : { error: 'unavailable' },
        weather: weather.status === 'fulfilled' ? weather.value : { error: 'unavailable' },
      };

      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(body),
      };
    } catch (err) {
      context.error('Reality dashboard error:', err);
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to fetch reality data' }),
      };
    }
  },
});
