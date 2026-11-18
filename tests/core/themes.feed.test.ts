import { describe, expect, it } from 'vitest';
import type { AtRecord } from '../../src/core/atproto/types.js';
import type {
  BskyPost,
  CosmikCard,
  CurrentsSave,
} from '../../src/core/lexicons.js';
import { selectPosting } from '../../src/core/themes/posting.js';
import { selectSaving } from '../../src/core/themes/saving.js';
import { fixtureRecords } from '../helpers/fakeSource.js';

const NOW = new Date('2026-11-18T12:00:00Z');
const DAY = 86_400_000;
const DID = 'did:plc:s2rczyxit2v5vzedxqs326ri';

describe('selectPosting', () => {
  const posts = fixtureRecords<BskyPost>('app.bsky.feed.post');

  it('counts the week including replies', () => {
    const theme = selectPosting(posts, NOW);
    expect(theme?.weekCount).toBe(64);
    expect(theme?.weekReplies).toBe(42);
  });

  it('shows the latest five top-level posts with their media', () => {
    const theme = selectPosting(posts, NOW)!;
    expect(theme.items).toHaveLength(5);
    expect(theme.items[0].key.endsWith('3n2laj2kq4c2k')).toBe(true);
    expect(theme.items[0].text.startsWith('#Strudel flow by @xyflow.com')).toBe(true);
    expect(theme.items[0].images).toHaveLength(1);
    expect(theme.items[0].images[0].thumb).toContain('bafkreidsklqnie6ohlehzrifskxh75lxha5qjg4mnkykcmqw6jbodeyf54');
    expect(theme.items[0].href).toBe(
      `https://bsky.app/profile/${DID}/post/3n2laj2kq4c2k`
    );
  });

  it('never shows replies', () => {
    const replies = new Set(
      posts.filter((p) => p.value.reply).map((p) => p.uri)
    );
    const theme = selectPosting(posts, NOW)!;
    expect(theme.items.some((i) => replies.has(i.key))).toBe(false);
  });

  it('renders images and quotes from embeds', () => {
    const at = new Date(NOW.getTime() - DAY).toISOString();
    const post: AtRecord<BskyPost> = {
      uri: `at://${DID}/app.bsky.feed.post/3n2zzzzzzzz22`,
      cid: 'c',
      value: {
        text: 'Look',
        createdAt: at,
        embed: {
          $type: 'app.bsky.embed.recordWithMedia',
          record: {
            record: {
              uri: 'at://did:plc:other/app.bsky.feed.post/abc',
              cid: 'x',
            },
          },
          media: {
            $type: 'app.bsky.embed.images',
            images: [{ image: { ref: { $link: 'bafyimg' } }, alt: 'A cat' }],
          },
        },
      },
    };
    const [item] = selectPosting([post], NOW)!.items;
    expect(item.images).toEqual([
      {
        thumb: `https://cdn.bsky.app/img/feed_thumbnail/plain/${DID}/bafyimg@jpeg`,
        alt: 'A cat',
      },
    ]);
    expect(item.quote?.href).toBe(
      'https://bsky.app/profile/did:plc:other/post/abc'
    );
  });

  it('is null when there is nothing to show', () => {
    expect(selectPosting([], NOW)).toBeNull();
  });
});

describe('selectSaving', () => {
  const cards = fixtureRecords<CosmikCard>('network.cosmik.card');
  const saves = fixtureRecords<CurrentsSave>('is.currents.feed.save');

  it('lists recent saved links, newest first', () => {
    const items = selectSaving(cards, saves, NOW);
    expect(items).toHaveLength(5);
    expect(items[0]).toMatchObject({
      url: 'https://github.com/renderghost',
      title: 'renderghost on GitHub',
      app: 'semble',
    });
  });

  it('attaches notes to the cards they annotate', () => {
    const items = selectSaving(cards, saves, NOW);
    expect(items[0].note).toBe('All my code work');
    const radio = items.find((i) => i.url === 'https://radio.renderg.host/');
    expect(radio?.note).toBe('My Radio Player');
  });

  it('includes recent Currents saves', () => {
    const save: AtRecord<CurrentsSave> = {
      uri: `at://${DID}/is.currents.feed.save/3n2yyyyyyyy22`,
      cid: 'c',
      value: {
        content: { image: { ref: { $link: 'bafysave' } } },
        originUrl: 'https://www.discogs.com/release/1',
        createdAt: new Date(NOW.getTime() - DAY).toISOString(),
      },
    };
    const [item] = selectSaving([], [save], NOW);
    expect(item).toMatchObject({
      app: 'currents',
      title: 'www.discogs.com',
      url: 'https://www.discogs.com/release/1',
    });
    expect(item.imageUrl).toContain('bafysave');
  });
});
