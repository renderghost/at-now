import { describe, expect, it } from 'vitest';
import { APPS } from '../../src/core/config.js';
import type {
  BookRecord,
  BskyPost,
  CalendarEvent,
  CosmikCard,
  CurrentsSave,
  PlyrTrack,
  PositionRecord,
  RsvpRecord,
  StandardDocument,
  StandardPublication,
  LeafletDocument,
  TangledRepo,
} from '../../src/core/lexicons.js';
import { eventUris, selectGoing } from '../../src/core/themes/going.js';
import { indexPlyrTracks, selectMaking } from '../../src/core/themes/making.js';
import { selectPosting } from '../../src/core/themes/posting.js';
import { selectReading } from '../../src/core/themes/reading.js';
import { selectSaving } from '../../src/core/themes/saving.js';
import { selectWorking } from '../../src/core/themes/working.js';
import { selectWriting } from '../../src/core/themes/writing.js';
import { createFakeSource, fixtureRecords } from '../helpers/fakeSource.js';

const NOW = new Date('2026-11-18T12:00:00Z');
const DID = 'did:plc:s2rczyxit2v5vzedxqs326ri';

describe('service links point at the content', () => {
  it('events open on atmo.rsvp', async () => {
    const rsvps = fixtureRecords<RsvpRecord>('community.lexicon.calendar.rsvp');
    const source = createFakeSource();
    const events = new Map<string, CalendarEvent>();
    for (const uri of eventUris(rsvps)) {
      const rec = await source.getRecord<CalendarEvent>(uri);
      if (rec) events.set(uri, rec.value);
    }
    const conf = selectGoing(rsvps, events, NOW).find((i) => i.name === 'AtmosphereConf 2027')!;
    const url = 'https://atmo.rsvp/p/did:plc:3xewinw4wtimo2lqfy5fm5sw/e/3mw74r4r3gsej';
    expect(conf.app).toBe('atmorsvp');
    expect(conf.href).toBe(url);
    expect(conf.serviceHref).toBe(url);
    expect(APPS.atmorsvp).toEqual({ id: 'atmorsvp', name: 'atmo.rsvp', url: 'https://atmo.rsvp' });
  });

  it('positions open the career section on Sifa', () => {
    const [first] = selectWorking(fixtureRecords<PositionRecord>('id.sifa.profile.position'), NOW);
    expect(first.serviceHref).toBe('https://sifa.id/p/renderg.host#career');
  });

  it('writing links straight to the article', () => {
    const [item] = selectWriting(
      fixtureRecords<StandardDocument>('site.standard.document'),
      fixtureRecords<LeafletDocument>('pub.leaflet.document'),
      fixtureRecords<StandardPublication>('site.standard.publication'),
      NOW
    );
    expect(item.serviceHref).toBe('https://renderghost.leaflet.pub/3n26j43scp22x');
  });

  it('posts, books and repos link to the item itself', () => {
    const posting = selectPosting(fixtureRecords<BskyPost>('app.bsky.feed.post'), NOW)!;
    expect(posting.items[0].serviceHref).toBe(
      `https://bsky.app/profile/${DID}/post/3n2laj2kq4c2k`
    );
    const [book] = selectReading(fixtureRecords<BookRecord>('buzz.bookhive.book'), NOW);
    expect(book.serviceHref).toMatch(/^https:\/\/bookhive\.buzz\/books\/bk_/);
    const repo: TangledRepo = { name: 'x', createdAt: NOW.toISOString() };
    const { repos } = selectMaking(
      [{ uri: `at://${DID}/sh.tangled.repo/3n2xxxxxxxx22`, cid: 'c', value: repo }],
      [],
      NOW
    );
    expect(repos[0].serviceHref).toBe('https://tangled.org/renderg.host/x');
  });

  it('saved links open the saver’s collection, not the app home', () => {
    const items = selectSaving(
      fixtureRecords<CosmikCard>('network.cosmik.card'),
      fixtureRecords<CurrentsSave>('is.currents.feed.save'),
      NOW
    );
    expect(items[0].serviceHref).toBe('https://semble.so/profile/renderg.host');
  });
});

describe('plyr.fm tracks', () => {
  const tracks = fixtureRecords<PlyrTrack>('fm.plyr.track');

  it('link to the track, its album and the artist', async () => {
    const index = indexPlyrTracks(await createFakeSource().getPlyrTracks(DID));
    const [first] = selectMaking([], tracks, NOW, undefined, index).tracks;
    expect(first.title).toBe('ǔuvvǔulluǔ');
    expect(first.href).toBe('https://plyr.fm/track/1675');
    expect(first.serviceHref).toBe('https://plyr.fm/track/1675');
    expect(first.albumHref).toBe('https://plyr.fm/u/renderg.host/album/tunng');
    expect(first.artistHref).toBe('https://plyr.fm/u/renderg.host');
  });

  it('fall back to the artist page without the plyr.fm lookup', () => {
    const [first] = selectMaking([], tracks, NOW).tracks;
    expect(first.href).toBe('https://plyr.fm/u/renderg.host');
    expect(first.albumHref).toBeUndefined();
    expect(first.artistHref).toBe('https://plyr.fm/u/renderg.host');
  });
});
