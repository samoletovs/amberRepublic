export const BUDGET_EFFECT_MAP: Record<string, { indicator: string; scale: number }> = {
  GF02: { indicator: 'militaryReadiness', scale: 0.005 },
  GF03: { indicator: 'borderSecurity', scale: 0.004 },
  GF07: { indicator: 'healthcareQuality', scale: 0.003 },
  GF09: { indicator: 'educationQuality', scale: 0.003 },
  GF10: { indicator: 'socialCohesion', scale: 0.001 },
  GF05: { indicator: 'greenTransition', scale: 0.01 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function applyIndicatorOverrides(
  baseIndicators: Record<string, number>,
  overrides: Record<string, number | null | undefined>,
): Record<string, number> {
  const next = { ...baseIndicators };

  for (const [key, value] of Object.entries(overrides)) {
    if (!(key in next)) continue;
    if (typeof value !== 'number' || Number.isNaN(value)) continue;
    next[key] = value;
  }

  return next;
}

export function applyBudgetAllocationEffects(
  baseIndicators: Record<string, number>,
  allocations: Record<string, number>,
): Record<string, number> {
  const next = { ...baseIndicators };

  for (const [code, allocation] of Object.entries(allocations)) {
    const mapping = BUDGET_EFFECT_MAP[code];
    if (!mapping) continue;

    const baselineEffect = allocation * mapping.scale;
    const current = next[mapping.indicator] ?? 50;
    next[mapping.indicator] = clamp(current + (baselineEffect - 3), 0, 100);
  }

  return next;
}
