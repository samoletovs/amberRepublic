// Seeded pseudo-random number generator (mulberry32)
export function createRng(seed: number) {
  let s = seed | 0;
  return {
    next(): number {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    /** Random int in [min, max] inclusive */
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    /** Random float in [min, max) */
    float(min: number, max: number): number {
      return this.next() * (max - min) + min;
    },
    /** Pick random element from array */
    pick<T>(arr: T[]): T {
      return arr[Math.floor(this.next() * arr.length)];
    },
    /** Shuffle array in place */
    shuffle<T>(arr: T[]): T[] {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(this.next() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    /** Apply ±variance to a number */
    vary(value: number, variance: number = 0.15): number {
      return value * (1 + (this.next() * 2 - 1) * variance);
    },
  };
}

export type Rng = ReturnType<typeof createRng>;

export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
