import { describe, expect, it } from 'vitest';
import {
  dateToTid,
  formatDate,
  formatLongDate,
  freshnessOf,
  isWithinWindow,
  parseDate,
  recordDate,
  relativeTime,
  tidToDate,
} from '../../src/core/time.js';

const NOW = new Date('2026-11-18T12:00:00Z');
const DAY = 86_400_000;
const ago = (ms: number) => new Date(NOW.getTime() - ms);

describe('parseDate', () => {
  it('reads month precision as the 1st of the month', () => {
    expect(parseDate('2026-11')?.toISOString()).toBe('2026-11-01T00:00:00.000Z');
  });
  it('reads year precision as 1 January', () => {
    expect(parseDate('2019')?.toISOString()).toBe('2019-01-01T00:00:00.000Z');
  });
  it('truncates microseconds', () => {
    expect(parseDate('2026-11-02T20:26:59.418214Z')?.toISOString()).toBe(
      '2026-11-02T20:26:59.418Z'
    );
  });
  it('honours offsets', () => {
    expect(parseDate('2026-05-02T00:37:56+03:00')?.toISOString()).toBe(
      '2026-05-01T21:37:56.000Z'
    );
  });
  it('rejects garbage and empties', () => {
    expect(parseDate('soon')).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate(null)).toBeNull();
    expect(parseDate('')).toBeNull();
  });
});

describe('TID codec', () => {
  it('decodes a real like rkey to its day', () => {
    expect(tidToDate('3n2lfcee4br2w')?.toISOString().slice(0, 10)).toBe(
      '2026-11-18'
    );
  });
  it('round-trips a date', () => {
    const d = new Date('2026-10-24T09:17:00.123Z');
    expect(tidToDate(dateToTid(d))?.getTime()).toBe(d.getTime());
  });
  it('rejects non-TID keys', () => {
    expect(tidToDate('N20JH62Z683G')).toBeNull();
    expect(tidToDate('did:plc:zntngpowgd6rorjt3haywj36')).toBeNull();
  });
});

describe('recordDate', () => {
  it('prefers createdAt', () => {
    expect(
      recordDate({
        uri: 'at://did:plc:x/c/3n2lfcee4br2w',
        value: { createdAt: '2026-01-01T00:00:00Z' },
      })?.toISOString()
    ).toBe('2026-01-01T00:00:00.000Z');
  });
  it('falls back to the rkey TID', () => {
    expect(
      recordDate({ uri: 'at://did:plc:x/c/3n2lfcee4br2w', value: {} })
        ?.toISOString()
        .slice(0, 10)
    ).toBe('2026-11-18');
  });
});

describe('freshnessOf', () => {
  it('buckets by absolute distance', () => {
    expect(freshnessOf(ago(2 * DAY), NOW)).toBe('now');
    expect(freshnessOf(ago(7 * DAY), NOW)).toBe('now');
    expect(freshnessOf(ago(8 * DAY), NOW)).toBe('recently');
    expect(freshnessOf(ago(31 * DAY), NOW)).toBeNull();
    expect(freshnessOf(ago(-5 * DAY), NOW)).toBe('now');
    expect(freshnessOf(ago(-60 * DAY), NOW)).toBeNull();
  });
});

describe('isWithinWindow', () => {
  it('keeps the last 30 days and tolerates small clock skew', () => {
    expect(isWithinWindow(ago(29 * DAY), NOW)).toBe(true);
    expect(isWithinWindow(ago(31 * DAY), NOW)).toBe(false);
    expect(isWithinWindow(ago(-60_000), NOW)).toBe(true);
    expect(isWithinWindow(ago(-DAY), NOW)).toBe(false);
  });
});

describe('relativeTime', () => {
  it('speaks British English', () => {
    expect(relativeTime(ago(2 * DAY), NOW)).toBe('2 days ago');
    expect(relativeTime(ago(DAY), NOW)).toBe('yesterday');
    expect(relativeTime(new Date('2027-04-29T07:00:00Z'), NOW)).toBe(
      'in 5 months'
    );
    expect(relativeTime(ago(30_000), NOW)).toBe('just now');
    expect(relativeTime(ago(3 * 3_600_000), NOW)).toBe('3 hours ago');
  });
});

describe('formatLongDate', () => {
  it('spells the date out in en-GB', () => {
    expect(formatLongDate(NOW)).toBe('Wednesday 18 November 2026');
  });
});

describe('formatDate', () => {
  it('formats in en-GB', () => {
    expect(formatDate(NOW)).toBe('18 Nov 2026');
    expect(formatDate(NOW, 'month')).toBe('Nov 2026');
  });
});
