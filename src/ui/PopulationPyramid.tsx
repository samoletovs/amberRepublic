import { useState, useEffect } from 'react';
import type { PyramidBar } from '../engine/latviaData';
import { fetchPyramid } from '../engine/latviaData';

// CSP 2025 data fallback — used when API is unreachable (local dev, offline)
const FALLBACK_PYRAMID: PyramidBar[] = [
  { ageGroup: '0-4', male: 40059, female: 38203 },
  { ageGroup: '5-9', male: 53422, female: 49951 },
  { ageGroup: '10-14', male: 51039, female: 48204 },
  { ageGroup: '15-19', male: 46483, female: 43860 },
  { ageGroup: '20-24', male: 46826, female: 44148 },
  { ageGroup: '25-29', male: 51632, female: 49011 },
  { ageGroup: '30-34', male: 57963, female: 55826 },
  { ageGroup: '35-39', male: 62482, female: 61189 },
  { ageGroup: '40-44', male: 62994, female: 63017 },
  { ageGroup: '45-49', male: 58439, female: 60953 },
  { ageGroup: '50-54', male: 55219, female: 60432 },
  { ageGroup: '55-59', male: 52906, female: 62073 },
  { ageGroup: '60-64', male: 46736, female: 59310 },
  { ageGroup: '65-69', male: 40283, female: 55932 },
  { ageGroup: '70-74', male: 32476, female: 51608 },
  { ageGroup: '75-79', male: 20612, female: 39087 },
  { ageGroup: '80-84', male: 10703, female: 26009 },
  { ageGroup: '85+', male: 5812, female: 19192 },
];

export default function PopulationPyramid() {
  const [pyramid, setPyramid] = useState<PyramidBar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPyramid()
      .then(data => {
        if (!cancelled) {
          setPyramid(data.length > 0 ? data : FALLBACK_PYRAMID);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPyramid(FALLBACK_PYRAMID);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  if (loading || pyramid.length === 0) {
    return (
      <div className="glass-card p-4 fade-in">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#B8860B' }}>
          🏛️ Population Pyramid
        </h3>
        <div className="space-y-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-pulse" style={{ height: 14, borderRadius: 4 }} />
          ))}
        </div>
      </div>
    );
  }

  const maxPop = Math.max(...pyramid.flatMap(p => [p.male, p.female]));

  return (
    <div className="glass-card p-4 fade-in">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#B8860B' }}>
        🏛️ Population Pyramid — Real Latvia
      </h3>

      <div className="flex items-center justify-between text-[10px] mb-1" style={{ color: '#78716C' }}>
        <span>♂ Male</span>
        <span>Age</span>
        <span>Female ♀</span>
      </div>

      <div className="space-y-0.5">
        {[...pyramid].reverse().map(bar => {
          const maleWidth = maxPop > 0 ? (bar.male / maxPop) * 100 : 0;
          const femaleWidth = maxPop > 0 ? (bar.female / maxPop) * 100 : 0;

          return (
            <div key={bar.ageGroup} className="flex items-stretch gap-0.5" style={{ height: 14 }}>
              {/* Male bar — right-aligned */}
              <div className="flex-1 flex justify-end items-stretch">
                <div
                  className="rounded-l-sm transition-all duration-500"
                  style={{
                    width: `${maleWidth}%`,
                    height: '100%',
                    background: 'rgba(27, 73, 101, 0.6)',
                    minWidth: maleWidth > 0 ? 2 : 0,
                  }}
                  title={`${bar.ageGroup} Male: ${bar.male.toLocaleString()}`}
                />
              </div>

              {/* Age label */}
              <span className="text-[9px] font-data w-8 text-center shrink-0 flex items-center justify-center" style={{ color: '#78716C' }}>
                {bar.ageGroup}
              </span>

              {/* Female bar — left-aligned */}
              <div className="flex-1 flex items-stretch">
                <div
                  className="rounded-r-sm transition-all duration-500"
                  style={{
                    width: `${femaleWidth}%`,
                    height: '100%',
                    background: 'rgba(158, 48, 57, 0.5)',
                    minWidth: femaleWidth > 0 ? 2 : 0,
                  }}
                  title={`${bar.ageGroup} Female: ${bar.female.toLocaleString()}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 text-[10px] text-center" style={{ color: '#A8A29E' }}>
        Total: {pyramid.reduce((s, p) => s + p.male + p.female, 0).toLocaleString()} · CSP data
      </div>
    </div>
  );
}
