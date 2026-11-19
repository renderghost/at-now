import { describe, expect, it } from 'vitest';
import type { AtRecord } from '../../src/core/atproto/types.js';
import type { BookRecord, CalendarEvent, RsvpRecord } from '../../src/core/lexicons.js';
import { selectGoing } from '../../src/core/themes/going.js';
import { selectReading } from '../../src/core/themes/reading.js';
import { fixtureRecords } from '../helpers/fakeSource.js';

const NOW = new Date('2026-11-18T12:00:00Z');

describe('everything sorts by date, newest first', () => {
  it('books ignore status when ordering', () => {
    const items = selectReading(fixtureRecords<BookRecord>('buzz.bookhive.book'), NOW);
    const dates = items.map((i) => Date.parse(i.at));
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
    expect(items[0].status).toBe('wantToRead');
  });

  it('events run from the latest date to the earliest', () => {
    const ev = (name: string, startsAt: string): CalendarEvent => ({ name, startsAt });
    const uri = (k: string) => `at://did:plc:org/community.lexicon.calendar.event/${k}`;
    const rsvp = (k: string): AtRecord<RsvpRecord> => ({
      uri: `at://did:plc:me/community.lexicon.calendar.rsvp/${k}`,
      cid: 'c',
      value: { status: 'community.lexicon.calendar.rsvp#going', subject: { uri: uri(k), cid: 'x' } },
    });
    const events = new Map([
      [uri('soon'), ev('Soon', '2026-12-01T10:00:00Z')],
      [uri('later'), ev('Later', '2027-06-01T10:00:00Z')],
      [uri('past'), ev('Past', '2026-11-04T10:00:00Z')],
    ]);
    const names = selectGoing([rsvp('soon'), rsvp('later'), rsvp('past')], events, NOW).map(
      (i) => i.name
    );
    expect(names).toEqual(['Later', 'Soon', 'Past']);
  });
});

describe('one card per event', () => {
  it('keeps only the newest RSVP when there are several for one event', () => {
    const uri = 'at://did:plc:org/community.lexicon.calendar.event/ietf';
    const rsvp = (rkey: string, status: string, createdAt: string): AtRecord<RsvpRecord> => ({
      uri: `at://did:plc:me/community.lexicon.calendar.rsvp/${rkey}`,
      cid: 'c',
      value: { status: `community.lexicon.calendar.rsvp#${status}`, subject: { uri, cid: 'x' }, createdAt },
    });
    const events = new Map([[uri, { name: 'IETF 129 Berlin', startsAt: '2027-07-17T08:00:00Z' }]]);
    const items = selectGoing(
      [rsvp('a', 'interested', '2026-10-01T00:00:00Z'), rsvp('b', 'going', '2026-11-01T00:00:00Z')],
      events,
      NOW
    );
    expect(items).toHaveLength(1);
    expect(items[0].rsvp).toBe('going');
  });

  it('drops the event when the newest RSVP says not going', () => {
    const uri = 'at://did:plc:org/community.lexicon.calendar.event/x';
    const rsvp = (rkey: string, status: string, createdAt: string): AtRecord<RsvpRecord> => ({
      uri: `at://did:plc:me/community.lexicon.calendar.rsvp/${rkey}`,
      cid: 'c',
      value: { status: `community.lexicon.calendar.rsvp#${status}`, subject: { uri, cid: 'x' }, createdAt },
    });
    const events = new Map([[uri, { name: 'X', startsAt: '2027-01-01T08:00:00Z' }]]);
    expect(
      selectGoing([rsvp('a', 'going', '2026-10-01T00:00:00Z'), rsvp('b', 'notgoing', '2026-11-01T00:00:00Z')], events, NOW)
    ).toEqual([]);
  });
});
