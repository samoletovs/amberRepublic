import { INDICATORS } from './indicators';

export interface CustomScenario {
  name: string;
  year?: number;
  indicatorOverrides: Record<string, number>;
}

const MAX_NAME_LENGTH = 80;

function toBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, b => String.fromCharCode(b)).join('');
  return globalThis.btoa(binary);
}

function fromBase64(value: string): string {
  const binary = globalThis.atob(value);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function sanitizeCustomScenario(input: unknown): CustomScenario | null {
  if (!input || typeof input !== 'object') return null;

  const source = input as { name?: unknown; year?: unknown; indicatorOverrides?: unknown };
  if (typeof source.name !== 'string') return null;

  const name = source.name.trim().slice(0, MAX_NAME_LENGTH);
  if (!name) return null;

  const indicatorOverrides: Record<string, number> = {};
  if (source.indicatorOverrides && typeof source.indicatorOverrides === 'object') {
    const overrides = source.indicatorOverrides as Record<string, unknown>;
    for (const meta of INDICATORS) {
      const raw = overrides[meta.key];
      if (typeof raw !== 'number' || !Number.isFinite(raw)) continue;
      indicatorOverrides[meta.key] = Math.min(meta.max, Math.max(meta.min, raw));
    }
  }

  const year = typeof source.year === 'number' && Number.isFinite(source.year)
    ? Math.min(2100, Math.max(1991, Math.round(source.year)))
    : undefined;

  return { name, year, indicatorOverrides };
}

export function encodeCustomScenario(scenario: CustomScenario): string {
  const payload = sanitizeCustomScenario(scenario);
  if (!payload) return '';
  return toBase64(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function decodeCustomScenario(encoded: string): CustomScenario | null {
  if (!encoded) return null;
  try {
    const base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(encoded.length / 4) * 4, '=');
    const decoded = fromBase64(base64);
    return sanitizeCustomScenario(JSON.parse(decoded));
  } catch {
    return null;
  }
}

export function buildCustomScenarioUrl(encoded: string, baseUrl?: string): string {
  const fallbackUrl = baseUrl
    ?? (typeof window !== 'undefined' ? window.location.href : 'http://localhost/');
  const url = new URL(fallbackUrl);
  url.searchParams.set('scenario', encoded);
  url.hash = '';
  return url.toString();
}
