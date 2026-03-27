import { useState, useEffect } from 'react';

interface ElectricityData {
  currentPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  cheapestHour: number | null;
  prices: { hour: number; price: number }[];
  currency: string;
}

interface WeatherCity {
  city: string;
  temp: number;
  feelsLike: number;
  description: string;
  windKmph: number;
  humidity: number;
}

interface RealityData {
  timestamp: string;
  electricity: ElectricityData | { error: string };
  weather: WeatherCity[] | { error: string };
}

const API_BASE = '/api';

const LATVIA_FACTS = [
  { emoji: '🏰', text: 'Riga is home to the largest collection of Art Nouveau buildings in the world — over 800 buildings in the city center.' },
  { emoji: '🌲', text: 'Latvia is one of the greenest countries in Europe — forests cover about 54% of the territory.' },
  { emoji: '📡', text: 'Latvia has one of the fastest internet speeds in the world, consistently ranking in the top 10 globally.' },
  { emoji: '🎵', text: 'The Latvian Song and Dance Festival, held every 5 years, gathers over 40,000 performers and is a UNESCO masterpiece.' },
  { emoji: '🏖️', text: 'Latvia has over 500 km of white sandy coastline along the Baltic Sea and the Gulf of Riga.' },
  { emoji: '🦅', text: 'Latvia is home to one of the largest populations of white storks in Europe — symbol of luck and fertility.' },
  { emoji: '🍺', text: 'Riga Black Balsam (Rīgas Melnais balzams) has been produced since 1752 — one of the oldest herbal liqueurs in Europe.' },
  { emoji: '🗳️', text: 'Latvia restored its independence in 1991 through a \"Singing Revolution\" — mass protests and folk singing, not violence.' },
  { emoji: '📚', text: 'Latvia has one of the highest literacy rates in the world at 99.9%, and one of the highest numbers of libraries per capita.' },
  { emoji: '🌍', text: 'Latvia is at the geographic center of the Baltic states, and Riga was the largest city in the former Russian Empire after Moscow and St. Petersburg.' },
  { emoji: '⚡', text: 'Latvia generates about 40% of its electricity from renewable sources, primarily hydropower from the Daugava river.' },
  { emoji: '🎄', text: 'Riga claims to have the first ever decorated Christmas tree in history (1510), though Tallinn disputes this.' },
];

interface Props {
  onBack: () => void;
}

export default function RealityDashboard({ onBack }: Props) {
  const [data, setData] = useState<RealityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * LATVIA_FACTS.length));

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const resp = await fetch(`${API_BASE}/reality`);
        if (!resp.ok) throw new Error(`API error: ${resp.status}`);
        const json = await resp.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load');
          setLoading(false);
        }
      }
    }

    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div className="reality-dashboard" style={styles.container}>
        <h1 style={styles.title}>🇱🇻 Latvia Right Now</h1>
        <div style={styles.grid}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-pulse" style={{ ...styles.card, height: 200 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reality-dashboard" style={styles.container}>
        <h1 style={styles.title}>🇱🇻 Latvia Right Now</h1>
        <p style={styles.error}>Could not load live data: {error}</p>
        <button onClick={() => window.location.reload()} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  const elec = data && !('error' in data.electricity) ? data.electricity as ElectricityData : null;
  const weather = data && !('error' in data.weather) ? data.weather as WeatherCity[] : null;

  return (
    <div className="reality-dashboard" style={styles.container}>
      <div style={styles.header}>
        <button
          onClick={onBack}
          style={{ ...styles.retryButton, background: 'transparent', color: '#9E3039', border: '1px solid #9E3039', marginBottom: '1rem' }}
        >
          ← Back to Main Menu
        </button>
        <h1 style={styles.title}>🇱🇻 Latvia Right Now</h1>
        <p style={styles.subtitle}>
          Live data from public APIs — the real world your simulation is based on
        </p>
        {data?.timestamp && (
          <p style={styles.timestamp}>
            Updated {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>

      <div style={styles.grid}>
        {/* Electricity Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>⚡ Electricity Price</h2>
          {elec ? (
            <>
              <div style={styles.bigNumber}>
                {elec.currentPrice !== null ? `${elec.currentPrice.toFixed(1)}` : '—'}
                <span style={styles.unit}> {elec.currency}</span>
              </div>
              <div style={styles.cardDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Today's range</span>
                  <span style={styles.value}>
                    {elec.minPrice?.toFixed(1)} – {elec.maxPrice?.toFixed(1)}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Cheapest hour</span>
                  <span style={styles.value}>
                    {elec.cheapestHour !== null ? `${elec.cheapestHour}:00` : '—'}
                  </span>
                </div>
              </div>
              {/* Mini price chart */}
              {elec.prices.length > 0 && (
                <div style={styles.chart}>
                  {elec.prices.map((p, i) => {
                    const max = elec.maxPrice || 1;
                    const min = elec.minPrice || 0;
                    const range = max - min || 1;
                    const height = Math.max(4, ((p.price - min) / range) * 60);
                    const isNow = p.hour === new Date().getHours();
                    return (
                      <div
                        key={i}
                        style={{
                          ...styles.bar,
                          height,
                          backgroundColor: isNow ? '#9E3039' : p.price <= (min + range * 0.3) ? '#2d6a4f' : '#B8860B',
                          opacity: isNow ? 1 : 0.6,
                        }}
                        title={`${p.hour}:00 — ${p.price.toFixed(1)} EUR/MWh`}
                      />
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <p style={styles.unavailable}>Price data unavailable</p>
          )}
        </div>

        {/* Weather Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🌤 Weather Across Latvia</h2>
          {weather && weather.length > 0 ? (
            <div style={styles.weatherGrid}>
              {weather.map((w) => (
                <div key={w.city} style={styles.weatherCity}>
                  <div style={styles.cityName}>{w.city}</div>
                  <div style={styles.bigNumber}>
                    {w.temp}°
                  </div>
                  <div style={styles.weatherDesc}>{w.description}</div>
                  <div style={styles.weatherMeta}>
                    💨 {w.windKmph} km/h · 💧 {w.humidity}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.unavailable}>Weather data unavailable</p>
          )}
        </div>

        {/* About Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📊 About This Dashboard</h2>
          <p style={styles.aboutText}>
            This shows <strong>real Latvia data</strong> from public APIs — the same data that powers
            the Amber Republic simulation. Play the game to see how your decisions compare to reality.
          </p>
          <div style={styles.apiList}>
            <div style={styles.apiItem}>⚡ Electricity: NordPool via Elering API</div>
            <div style={styles.apiItem}>🌤 Weather: wttr.in (Open-Meteo)</div>
            <div style={styles.apiItem}>📈 Statistics: CSP Latvia (PxWeb API)</div>
          </div>
          <p style={styles.nauroTag}>
            A <a href="https://naurolabs.com" style={styles.link}>NauroLabs</a> experiment
          </p>
        </div>
      </div>

      {/* Did You Know? Section */}
      <div style={{ ...styles.card, marginTop: '1.5rem', textAlign: 'center' as const }}>
        <h2 style={styles.cardTitle}>💡 Did You Know?</h2>
        <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{LATVIA_FACTS[factIndex].emoji}</p>
        <p style={{ ...styles.aboutText, fontSize: '1rem', maxWidth: 600, margin: '0 auto 1rem' }}>
          {LATVIA_FACTS[factIndex].text}
        </p>
        <button
          onClick={() => setFactIndex((factIndex + 1) % LATVIA_FACTS.length)}
          style={{ ...styles.retryButton, background: '#B8860B' }}
        >
          Another fact →
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '2rem 1rem',
    fontFamily: "'Source Sans 3', system-ui, sans-serif",
  },
  header: { textAlign: 'center' as const, marginBottom: '2rem' },
  title: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '2rem',
    color: '#9E3039',
    margin: 0,
  },
  subtitle: {
    color: '#666',
    fontSize: '1rem',
    margin: '0.5rem 0 0',
  },
  timestamp: {
    color: '#999',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    background: '#FFFDF7',
    border: '1px solid #E8E0D0',
    borderRadius: 12,
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.1rem',
    color: '#333',
    marginTop: 0,
    marginBottom: '1rem',
  },
  bigNumber: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#1a1a1a',
    lineHeight: 1,
    marginBottom: '0.75rem',
  },
  unit: {
    fontSize: '0.875rem',
    fontWeight: 400,
    color: '#666',
  },
  cardDetails: { marginBottom: '1rem' },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.25rem 0',
    fontSize: '0.875rem',
  },
  label: { color: '#888' },
  value: { color: '#333', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" },
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    height: 64,
    marginTop: '0.5rem',
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    minWidth: 0,
    transition: 'height 0.3s',
  },
  weatherGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  weatherCity: {
    textAlign: 'center' as const,
    padding: '0.75rem',
    background: '#FFF9F0',
    borderRadius: 8,
    border: '1px solid #F0E8D8',
  },
  cityName: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#9E3039',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  weatherDesc: { fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' },
  weatherMeta: { fontSize: '0.7rem', color: '#999' },
  aboutText: { fontSize: '0.9rem', color: '#555', lineHeight: 1.6, margin: '0 0 1rem' },
  apiList: { marginBottom: '1rem' },
  apiItem: { fontSize: '0.8rem', color: '#777', padding: '0.2rem 0' },
  nauroTag: { fontSize: '0.75rem', color: '#999', textAlign: 'center' as const },
  link: { color: '#B8860B', textDecoration: 'none' },
  unavailable: { color: '#999', fontStyle: 'italic' as const },
  error: { color: '#9E3039', textAlign: 'center' as const },
  retryButton: {
    display: 'block',
    margin: '1rem auto',
    padding: '0.5rem 1.5rem',
    background: '#9E3039',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', system-ui",
  },
};
