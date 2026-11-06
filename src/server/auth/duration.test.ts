import { parseDurationMs } from './duration';

describe('parseDurationMs', () => {
  it('parses days, hours, minutes, and seconds', () => {
    expect(parseDurationMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
    expect(parseDurationMs('12h')).toBe(12 * 60 * 60 * 1000);
    expect(parseDurationMs('30m')).toBe(30 * 60 * 1000);
    expect(parseDurationMs('45s')).toBe(45 * 1000);
  });

  it('falls back to a given default for an unparseable value', () => {
    expect(parseDurationMs('not-a-duration', 999)).toBe(999);
    expect(parseDurationMs(undefined, 999)).toBe(999);
  });
});
