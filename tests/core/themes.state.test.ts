import { describe, expect, it } from 'vitest';
import type { AtRecord } from '../../src/core/atproto/types.js';
import type {
  BookRecord,
  CalendarEvent,
  PositionRecord,
  RsvpRecord,
  StatusRecord,
} from '../../src/core/lexicons.js';
import { eventUris, selectGoing } from '../../src/core/themes/going.js';
import { selectReading } from '../../src/core/themes/reading.js';
import { selectStatus } from '../../src/core/themes/status.js';
import { selectWorking } from '../../src/core/themes/working.js';
import { freshnessOf } from '../../src/core/time.js';
import { createFakeSource, fixtureRecords } from '../helpers/fakeSource.js';

const NOW = new Date('2026-11-18T12:00:00Z');
const DAY = 86_400_000;
const iso = (msAgo: number) => new Date(NOW.getTime() - msAgo).toISOString();

describe('selectStatus', () => {
  const [recorded] = fixtureRecords<StatusRecord>('io.zzstoatzz.status.record');
  const withValue = (value: StatusRecord): AtRecord<StatusRecord>[] => [
    { ...recorded, value },
  ];

  it('hides an expired status', () => {
    expect(selectStatus([recorded], NOW)).toBeNull();
  });

  it('shows a status until it expires', () => {
    const item = selectStatus(
      withValue({ ...recorded.value, expires: '2026-11-19T00:00:00Z' }),
      NOW
    );
    expect(item?.text).toBe('is in love');
    expect(item?.app).toBe('status');
  });

  it('applies the window when there is no expiry', () => {
    const { expires: _e, ...rest } = recorded.value;
    expect(
      selectStatus(withValue({ ...rest, createdAt: iso(2 * DAY) }), NOW)?.text
    ).toBe('is in love');
    expect(
      selectStatus(withValue({ ...rest, createdAt: iso(40 * DAY) }), NOW)
    ).toBeNull();
  });

  it('resolves custom emoji to the status app image', () => {
    const item = selectStatus(
      withValue({ ...recorded.value, expires: '2026-11-19T00:00:00Z' }),
      NOW
    );
    expect(item?.emoji).toBeUndefined();
    expect(item?.emojiUrl).toBe('https://find-bufo.com/e/bufo-blush.png');
  });

  it('keeps plain emoji as text', () => {
    const item = selectStatus(
      withValue({ ...recorded.value, emoji: '🎧', expires: '2026-11-19T00:00:00Z' }),
      NOW
    );
    expect(item?.emoji).toBe('🎧');
    expect(item?.emojiUrl).toBeUndefined();
  });
});

describe('selectWorking', () => {
  const records = fixtureRecords<PositionRecord>('id.sifa.profile.position');

  it('lists current positions, newest start first', () => {
    const items = selectWorking(records, NOW);
    expect(items.map((i) => i.company)).toEqual([
      'Atmosphere Community Cooperative',
      'Innn.it',
      'Modal Foundation',
      'Thomas Kuhn Foundation',
      'Barry Prendergast',
    ]);
    expect(items[0].at).toBe('2026-11-01T00:00:00.000Z');
    expect(items[0].href).toBe('https://sifa.id/p/renderg.host');
    expect(freshnessOf(new Date(items[0].at), NOW)).toBe('recently');
  });

  it('formats location and workplace type', () => {
    const [first] = selectWorking(records, NOW);
    expect(first.location).toBe('Berlin, DE');
    expect(first.workplaceType).toBe('remote');
    expect(first.employmentType).toBe('contract');
  });

  it('skips unparseable start dates', () => {
    const broken = { ...records[0], value: { ...records[0].value, startedAt: 'soon' } };
    expect(() => selectWorking([broken], NOW)).not.toThrow();
    expect(selectWorking([broken], NOW)).toEqual([]);
  });
});

describe('selectGoing', () => {
  const rsvps = fixtureRecords<RsvpRecord>('community.lexicon.calendar.rsvp');

  async function eventMap(): Promise<Map<string, CalendarEvent>> {
    const source = createFakeSource();
    const map = new Map<string, CalendarEvent>();
    for (const uri of eventUris(rsvps)) {
      const rec = await source.getRecord<CalendarEvent>(uri);
      if (rec) map.set(uri, rec.value);
    }
    return map;
  }

  it('shows upcoming events then recent past ones', async () => {
    const items = selectGoing(rsvps, await eventMap(), NOW);
    expect(items.map((i) => i.name)).toEqual([
      'AtmosphereConf 2027',
      'The Launch of the European Social Association',
    ]);
    expect(items[0]).toMatchObject({ rsvp: 'going', past: false, location: 'Amersfoort' });
    expect(items[1]).toMatchObject({ rsvp: 'interested', past: true });
  });

  it('drops cancelled events', async () => {
    const events = await eventMap();
    const conf = rsvps.find((r) =>
      events.get(r.value.subject.uri)?.name === 'AtmosphereConf 2027'
    )!;
    events.set(conf.value.subject.uri, {
      ...events.get(conf.value.subject.uri)!,
      status: 'community.lexicon.calendar.event#cancelled',
    });
    expect(selectGoing(rsvps, events, NOW).map((i) => i.name)).toEqual([
      'The Launch of the European Social Association',
    ]);
  });

  it('skips RSVPs whose event could not be fetched', () => {
    expect(selectGoing(rsvps, new Map(), NOW)).toEqual([]);
  });
});

describe('selectReading', () => {
  const books = fixtureRecords<BookRecord>('buzz.bookhive.book');

  it('puts books being read first, then recent additions', () => {
    const items = selectReading(books, NOW);
    expect(items).toHaveLength(5);
    expect(items.slice(0, 2).map((i) => i.title)).toEqual([
      'The Word for World Is Forest',
      'Become What You Are',
    ]);
    expect(items.slice(0, 2).every((i) => i.status === 'reading')).toBe(true);
    expect(items.slice(2).every((i) => i.status === 'wantToRead')).toBe(true);
  });

  it('dates finished books by when they were finished', () => {
    const titles = selectReading(books, NOW).map((i) => i.title);
    expect(titles).not.toContain('Fight Club');
    expect(titles).not.toContain('Jurassic Park');
  });

  it('builds cover URLs and halves star ratings', () => {
    const item = selectReading(books, NOW).find((i) => i.coverUrl);
    expect(item?.coverUrl).toMatch(
      /^https:\/\/eurosky\.social\/xrpc\/com\.atproto\.sync\.getBlob\?did=/
    );
    const rated = selectReading(
      [{ ...books[0], value: { ...books[0].value, status: 'buzz.bookhive.defs#reading', stars: 9 } }],
      NOW
    );
    expect(rated[0].stars).toBe(5);
  });

  it('skips books with unusable dates', () => {
    const broken = {
      ...books[0],
      value: { ...books[0].value, status: 'buzz.bookhive.defs#finished', createdAt: 'x', finishedAt: undefined },
    };
    expect(() => selectReading([broken], NOW)).not.toThrow();
    expect(selectReading([broken], NOW)).toEqual([]);
  });
});
