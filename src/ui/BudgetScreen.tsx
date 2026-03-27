import { useState, useEffect } from 'react';
import type { BudgetItem } from '../engine/latviaData';
import { fetchBudget } from '../engine/latviaData';

interface Props {
  onAllocate: (allocations: Record<string, number>) => void;
  onSkip: () => void;
}

export default function BudgetScreen({ onAllocate, onSkip }: Props) {
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchBudget().then(data => {
      if (cancelled) return;
      const items = data.filter(b => b.code !== 'TOTAL');
      setBudget(items);
      const initial: Record<string, number> = {};
      for (const item of items) initial[item.code] = item.amount;
      setAllocations(initial);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center fade-in">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-sm" style={{ color: '#78716C' }}>Loading real budget data...</p>
        </div>
      </div>
    );
  }

  const totalBudget = budget.reduce((sum, b) => sum + b.amount, 0);
  const currentTotal = Object.values(allocations).reduce((sum, v) => sum + v, 0);
  const remaining = totalBudget - currentTotal;

  const handleSlider = (code: string, value: number) => {
    setAllocations(prev => ({ ...prev, [code]: Math.round(value) }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full fade-in">
        <div className="text-center mb-6">
          <span className="text-4xl">💰</span>
          <h2 className="text-2xl font-bold mt-2" style={{ color: '#1C1917' }}>Budget Allocation</h2>
          <p className="text-sm mt-1" style={{ color: '#78716C' }}>
            Latvia's real budget: €{(totalBudget / 1000).toFixed(1)}B. Redistribute as you see fit.
          </p>
        </div>

        {/* Remaining indicator */}
        <div className="glass-card p-3 mb-4 text-center">
          <span className="text-xs uppercase tracking-wider" style={{ color: '#78716C' }}>Unallocated</span>
          <div className="font-data text-lg font-bold" style={{
            color: Math.abs(remaining) < 50 ? '#16A34A' : remaining > 0 ? '#B8860B' : '#DC2626',
          }}>
            {remaining > 0 ? '+' : ''}{remaining.toLocaleString()} M€
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {budget.map(b => {
            const value = allocations[b.code] || 0;
            const original = b.amount;
            const pctChange = original > 0 ? ((value - original) / original * 100) : 0;

            return (
              <div key={b.code} className="glass-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: '#3D3731' }}>
                    {b.emoji} {b.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-data text-sm" style={{ color: '#1C1917' }}>
                      €{value.toLocaleString()}M
                    </span>
                    {Math.abs(pctChange) > 1 && (
                      <span className="text-[10px] font-data" style={{
                        color: pctChange > 0 ? '#16A34A' : '#DC2626',
                      }}>
                        {pctChange > 0 ? '+' : ''}{pctChange.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={original * 2}
                  step={10}
                  value={value}
                  onChange={e => handleSlider(b.code, Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #9E3039 0%, #9E3039 ${(value / (original * 2)) * 100}%, rgba(28,25,23,0.08) ${(value / (original * 2)) * 100}%, rgba(28,25,23,0.08) 100%)`,
                  }}
                  aria-label={`Adjust ${b.name} budget`}
                />
                <div className="flex justify-between text-[10px] mt-0.5" style={{ color: '#A8A29E' }}>
                  <span>€0</span>
                  <span className="font-data">Real: €{original.toLocaleString()}M</span>
                  <span>€{(original * 2).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onSkip}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'rgba(28,25,23,0.06)', color: '#3D3731' }}
            aria-label="Skip budget allocation"
          >
            Skip — Use Real Budget
          </button>
          <button
            onClick={() => onAllocate(allocations)}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: Math.abs(remaining) < 100 ? '#9E3039' : 'rgba(28,25,23,0.15)',
              color: Math.abs(remaining) < 100 ? '#fff' : '#78716C',
            }}
            aria-label="Apply budget allocation"
          >
            Apply Budget →
          </button>
        </div>

        <p className="text-[10px] mt-4 text-center" style={{ color: '#A8A29E' }}>
          Real data: CSP — Government expenditure by function (COFOG)
        </p>
      </div>
    </div>
  );
}
