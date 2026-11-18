import { describe, expect, it } from 'vitest';
import type { AtRecord } from '../../src/core/atproto/types.js';
import type {
  GrainGallery,
  GrainGalleryItem,
  GrainPhoto,
  LeafletDocument,
  PlyrTrack,
  StandardDocument,
  StandardPublication,
  TangledRepo,
  TealPlay,
} from '../../src/core/lexicons.js';
import { selectListening } from '../../src/core/themes/listening.js';
import { selectMaking } from '../../src/core/themes/making.js';
import { selectPhotographing } from '../../src/core/themes/photographing.js';
import { selectWriting } from '../../src/core/themes/writing.js';
import { dateToTid } from '../../src/core/time.js';
import { fixtureRecords } from '../helpers/fakeSource.js';

const NOW = new Date('2026-11-18T12:00:00Z');
const DAY = 86_400_000;
const DID = 'did:plc:s2rczyxit2v5vzedxqs326ri';

describe('selectWriting', () => {
  const docs = fixtureRecords<StandardDocument>('site.standard.document');
  const leaflet = fixtureRecords<LeafletDocument>('pub.leaflet.document');
  const pubs = fixtureRecords<StandardPublication>('site.standard.publication');

  it('lists recent writing across all publications, labelled', () => {
    const items = selectWriting(docs, leaflet, pubs, NOW);
    expect(items.map((i) => i.title)).toEqual([
      'Caught in a Loop.',
      "Knowledge doesn't just accumulate. It develops between people.",
    ]);
    expect(items.map((i) => i.publication.name)).toEqual([
      'Annotated',
      'Marginalia',
    ]);
    expect(items[0].publication.rkey).toBe('3lz3s33asuc2l');
    expect(items[0].href).toBe('https://renderghost.leaflet.pub/3n26j43scp22x');
    expect(items[0].coverUrl).toMatch(/^https:\/\/cdn\.bsky\.app\/img\//);
  });

  it('ignores Leaflet copies of Standard documents', () => {
    const copy: AtRecord<LeafletDocument> = {
      uri: `at://${DID}/pub.leaflet.document/3n26j43scp22x`,
      cid: 'c',
      value: { title: 'Caught in a Loop.', publishedAt: '2026-11-13T10:00:00Z' },
    };
    const items = selectWriting(docs, [...leaflet, copy], pubs, NOW);
    expect(items.filter((i) => i.title === 'Caught in a Loop.')).toHaveLength(1);
  });

  it('labels documents on a plain URL with its host', () => {
    const doc: AtRecord<StandardDocument> = {
      uri: `at://${DID}/site.standard.document/3n2aaaaaaaa22`,
      cid: 'c',
      value: {
        site: 'https://leaflet.pub/abc',
        path: '/xyz',
        title: 'Loose page',
        publishedAt: new Date(NOW.getTime() - DAY).toISOString(),
      },
    };
    const [item] = selectWriting([doc], [], pubs, NOW);
    expect(item.publication.name).toBe('leaflet.pub');
    expect(item.href).toBe('https://leaflet.pub/abc/xyz');
  });
});

describe('selectMaking', () => {
  it('shows recent tracks and no stale repos', () => {
    const { repos, tracks } = selectMaking(
      fixtureRecords<TangledRepo>('sh.tangled.repo'),
      fixtureRecords<PlyrTrack>('fm.plyr.track'),
      NOW
    );
    expect(repos).toEqual([]);
    expect(tracks).toHaveLength(5);
    expect(tracks[0]).toMatchObject({
      title: 'ǔuvvǔulluǔ',
      artist: 'gggiiirrrlllsss',
      app: 'plyr',
      href: 'https://plyr.fm/u/renderg.host',
    });
  });
});

describe('selectPhotographing', () => {
  const photo = (i: number): AtRecord<GrainPhoto> => ({
    uri: `at://${DID}/social.grain.photo/p${i}`,
    cid: 'c',
    value: {
      photo: { ref: { $link: `bafy${i}` } },
      alt: `Photo ${i}`,
      aspectRatio: { width: 4, height: 3 },
      createdAt: new Date(NOW.getTime() - 3 * DAY).toISOString(),
    },
  });

  it('hides galleries older than 30 days', () => {
    expect(
      selectPhotographing(
        fixtureRecords<GrainGallery>('social.grain.gallery'),
        fixtureRecords<GrainPhoto>('social.grain.photo'),
        fixtureRecords<GrainGalleryItem>('social.grain.gallery.item'),
        NOW
      )
    ).toEqual([]);
  });

  it('shows a recent gallery with its first five photos in order', () => {
    const galleryUri = `at://${DID}/social.grain.gallery/g1`;
    const gallery: AtRecord<GrainGallery> = {
      uri: galleryUri,
      cid: 'c',
      value: {
        title: 'Autumn',
        location: { name: 'Berlin, Germany' },
        createdAt: new Date(NOW.getTime() - 3 * DAY).toISOString(),
      },
    };
    const photos = [0, 1, 2, 3, 4, 5, 6].map(photo);
    const items: AtRecord<GrainGalleryItem>[] = photos.map((p, i) => ({
      uri: `at://${DID}/social.grain.gallery.item/i${i}`,
      cid: 'c',
      value: {
        gallery: galleryUri,
        item: p.uri,
        position: 6 - i,
        createdAt: p.value.createdAt,
      },
    }));
    const [item] = selectPhotographing([gallery], photos, items, NOW);
    expect(item.title).toBe('Autumn');
    expect(item.location).toBe('Berlin, Germany');
    expect(item.photoCount).toBe(7);
    expect(item.photos).toHaveLength(5);
    expect(item.photos[0].alt).toBe('Photo 6');
    expect(item.photos[0].url).toContain('bafy6');
  });

  it('groups recent photos outside any gallery', () => {
    const [item] = selectPhotographing([], [photo(1), photo(2)], [], NOW);
    expect(item.title).toBe('Photos');
    expect(item.photoCount).toBe(2);
  });
});

describe('selectListening', () => {
  const plays = fixtureRecords<TealPlay>('fm.teal.feed.play');

  it('summarises the last 30 days of plays', () => {
    const theme = selectListening(plays, NOW);
    expect(theme?.playCount).toBe(13);
    expect(theme?.topArtists[0]).toEqual({ label: 'gggiiirrrlllsss', count: 12 });
    expect(theme?.topTracks[0]).toMatchObject({
      label: 'Diamond Sirens (2012) - Piratio',
      count: 3,
    });
    expect(theme?.lastPlayed?.track).toBe('nai palm');
    expect(theme?.lastPlayed?.artist).toBe('nate');
  });

  it('is null without recent plays', () => {
    expect(selectListening([], NOW)).toBeNull();
    const old: AtRecord<TealPlay> = {
      uri: `at://${DID}/fm.teal.feed.play/${dateToTid(new Date(NOW.getTime() - 60 * DAY))}`,
      cid: 'c',
      value: {
        trackName: 'Old',
        playedTime: new Date(NOW.getTime() - 60 * DAY).toISOString(),
      },
    };
    expect(selectListening([old], NOW)).toBeNull();
  });
});
