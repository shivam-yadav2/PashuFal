const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/** Parses a duration like "7d", "12h", "30m", "45s" into milliseconds. */
export function parseDurationMs(value: string | undefined, fallback = 7 * UNIT_MS.d): number {
  if (!value) return fallback;
  const match = /^(\d+)(s|m|h|d)$/.exec(value.trim());
  if (!match) return fallback;
  return Number(match[1]) * UNIT_MS[match[2]];
}
