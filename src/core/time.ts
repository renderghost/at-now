import { NOW_DAYS, WINDOW_DAYS } from './config.js';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const FUTURE_TOLERANCE_MS = 5 * MINUTE;

const TID_ALPHABET = '234567abcdefghijklmnopqrstuvwxyz';
const TID_PATTERN = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;

export type Freshness = 'now' | 'recently';

/**
 * Parses the date strings found in real records: full ISO timestamps (with
 * milli- or microseconds and any offset), `YYYY-MM-DD`, `YYYY-MM` and `YYYY`.
 * Returns null for anything else.
 */
export function parseDate(input: string | undefined | null): Date | null {
  // Remote records are unvalidated: anything but a string is unusable.
  if (typeof input !== 'string' || !input) return null;
  const value = input.trim();

  const partial = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(value);
  if (partial) {
    const [, y, m = '01', d = '01'] = partial;
    const date = new Date(`${y}-${m}-${d}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return null;
  // Trim sub-millisecond precision, which Date parsing does not guarantee.
  const normalised = value.replace(/(\.\d{3})\d+/, '$1');
  const date = new Date(normalised);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Decodes a TID record key to its timestamp, or null if it is not a TID. */
export function tidToDate(tid: string): Date | null {
  if (!TID_PATTERN.test(tid)) return null;
  let value = 0n;
  for (const char of tid) {
    value = value * 32n + BigInt(TID_ALPHABET.indexOf(char));
  }
  const micros = value >> 10n;
  return new Date(Number(micros / 1000n));
}

/** Encodes a date as a TID (clock id 0), usable as a listRecords cursor. */
export function dateToTid(date: Date): string {
  let value = (BigInt(date.getTime()) * 1000n) << 10n;
  let out = '';
  for (let i = 0; i < 13; i++) {
    out = TID_ALPHABET[Number(value & 31n)] + out;
    value >>= 5n;
  }
  return out;
}

/** A record's date: its createdAt, else the timestamp in its TID key. */
export function recordDate(rec: { uri: string; value: object }): Date | null {
  const raw = (rec.value as { createdAt?: unknown }).createdAt;
  const created = typeof raw === 'string' ? parseDate(raw) : null;
  if (created) return created;
  const rkey = rec.uri.split('/').pop() ?? '';
  return tidToDate(rkey);
}

/** Now (≤7 days either side), Recently (≤30 days), otherwise null. */
export function freshnessOf(at: Date, now: Date): Freshness | null {
  const distance = Math.abs(now.getTime() - at.getTime());
  if (distance <= NOW_DAYS * DAY) return 'now';
  if (distance <= WINDOW_DAYS * DAY) return 'recently';
  return null;
}

/** True when `at` falls in the last 30 days (allowing small clock skew). */
export function isWithinWindow(at: Date, now: Date): boolean {
  const age = now.getTime() - at.getTime();
  return age >= -FUTURE_TOLERANCE_MS && age <= WINDOW_DAYS * DAY;
}

const relativeFormat = new Intl.RelativeTimeFormat('en-GB', {
  numeric: 'auto',
});

/** "2 days ago", "yesterday", "in 5 months", "just now". */
export function relativeTime(at: Date, now: Date): string {
  const diff = at.getTime() - now.getTime();
  const abs = Math.abs(diff);
  if (abs < MINUTE) return 'just now';

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 365 * DAY],
    ['month', 30.44 * DAY],
    ['week', 7 * DAY],
    ['day', DAY],
    ['hour', HOUR],
    ['minute', MINUTE],
  ];
  for (const [unit, size] of units) {
    if (abs >= size) {
      return relativeFormat.format(Math.round(diff / size), unit);
    }
  }
  return 'just now';
}

/**
 * "18 Nov 2026" (day) or "Nov 2026" (month), in British English. Month
 * precision is read in UTC: month-only values ("2026-11") are stored as the
 * 1st at 00:00Z, which is still October west of Greenwich.
 */
export function formatDate(at: Date, precision: 'day' | 'month' = 'day'): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: precision === 'day' ? 'numeric' : undefined,
    month: 'short',
    year: 'numeric',
    timeZone: precision === 'month' ? 'UTC' : undefined,
  }).format(at);
}

/** "Wednesday 18 November 2026": British order, no comma after the weekday. */
export function formatLongDate(at: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(at);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return `${get('weekday')} ${get('day')} ${get('month')} ${get('year')}`;
}
