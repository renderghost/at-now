import { afterEach, describe, expect, it } from 'vitest';
import type { AtRecord } from '../../src/core/atproto/types.js';
import type { CalendarEvent, RsvpRecord } from '../../src/core/lexicons.js';
import { selectGoing } from '../../src/core/themes/going.js';
import { formatDate, parseDate } from '../../src/core/time.js';

const NOW = new Date('2026-11-18T12:00:00Z');
const ORIGINAL_TZ = process.env.TZ;

afterEach(() => {
  process.env.TZ = ORIGINAL_TZ;
});

describe('month dates west of UTC', () => {
  it('show the recorded month in Los Angeles', () => {
    process.env.TZ = 'America/Los_Angeles';
    expect(formatDate(new Date('2026-11-01T00:00:00Z'), 'month')).toBe('Nov 2026');
    expect(formatDate(new Date('2026-05-01T00:00:00Z'), 'month')).toBe('May 2026');
  });
});

describe('parseDate with non-string input', () => {
  it('returns null instead of throwing', () => {
    expect(parseDate(1767000000 as unknown as string)).toBeNull();
    expect(parseDate({} as unknown as string)).toBeNull();
  });
});

describe('selectGoing with odd remote events', () => {
  const rsvp = (uri: string): AtRecord<RsvpRecord> => ({
    uri: `at://did:plc:me/community.lexicon.calendar.rsvp/${uri.split('/').pop()}`,
    cid: 'c',
    value: {
      status: 'community.lexicon.calendar.rsvp#going',
      subject: { uri, cid: 'x' },
    },
  });
  const good = 'at://did:plc:org/community.lexicon.calendar.event/good';
  const numeric = 'at://did:plc:org/community.lexicon.calendar.event/numeric';
  const legacy = 'at://did:plc:org/community.lexicon.calendar.event/legacy';

  it('skips the bad event and keeps the rest', () => {
    const events = new Map<string, CalendarEvent>([
      [good, { name: 'Good', startsAt: '2026-12-01T10:00:00Z' }],
      [numeric, { name: 'Numeric', startsAt: 1767000000 as unknown as string }],
      [
        legacy,
        {
          name: 'Legacy image',
          startsAt: '2026-12-02T10:00:00Z',
          media: [
            {
              role: 'thumbnail',
              content: { cid: 'bafylegacy', mimeType: 'image/png' } as never,
            },
          ],
        },
      ],
    ]);
    const items = selectGoing([rsvp(good), rsvp(numeric), rsvp(legacy)], events, NOW);
    expect(items.map((i) => i.name)).toEqual(['Legacy image', 'Good']);
    expect(items[0].imageUrl).toBeUndefined();
  });
});
