import { useState, useEffect } from 'react';
import type { NewsBriefing } from '../engine/latviaData';
import { generateNewsBriefings } from '../engine/latviaData';

export default function NewsTicker() {
  const [briefings, setBriefings] = useState<NewsBriefing[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    generateNewsBriefings().then(b => {
      if (!cancelled && b.length > 0) {
        setBriefings(b);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (briefings.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(i => (i + 1) % briefings.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [briefings.length]);

  if (!loaded || briefings.length === 0) return null;

  const current = briefings[currentIdx];

  return (
    <div className="glass-card px-4 py-2.5 mb-3 fade-in overflow-hidden">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider shrink-0" style={{ color: '#9E3039' }}>
          📰 Advisor
        </span>
        <div className="flex-1 min-w-0 overflow-hidden">
          <p
            key={currentIdx}
            className="text-xs truncate fade-in"
            style={{ color: '#3D3731' }}
          >
            {current.emoji} {current.text}
          </p>
        </div>
        <span className="text-[10px] shrink-0" style={{ color: '#A8A29E' }}>
          {current.source}
        </span>
      </div>
    </div>
  );
}
