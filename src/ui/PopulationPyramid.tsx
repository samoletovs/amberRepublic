import { useState, useEffect } from 'react';
import type { PyramidBar } from '../engine/latviaData';
import { fetchPyramid } from '../engine/latviaData';

export default function PopulationPyramid() {
  const [pyramid, setPyramid] = useState<PyramidBar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPyramid().then(data => {
      if (!cancelled && data.length > 0) {
        setPyramid(data);
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
            <div key={bar.ageGroup} className="flex items-center gap-0.5" style={{ height: 14 }}>
              {/* Male bar — right-aligned */}
              <div className="flex-1 flex justify-end">
                <div
                  className="h-full rounded-l-sm transition-all duration-500"
                  style={{
                    width: `${maleWidth}%`,
                    background: 'rgba(27, 73, 101, 0.6)',
                    minWidth: maleWidth > 0 ? 2 : 0,
                  }}
                  title={`${bar.ageGroup} Male: ${bar.male.toLocaleString()}`}
                />
              </div>

              {/* Age label */}
              <span className="text-[9px] font-data w-8 text-center shrink-0" style={{ color: '#78716C' }}>
                {bar.ageGroup}
              </span>

              {/* Female bar — left-aligned */}
              <div className="flex-1">
                <div
                  className="h-full rounded-r-sm transition-all duration-500"
                  style={{
                    width: `${femaleWidth}%`,
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
