import type { AtRecord } from '../atproto/types.js';
import { IDENTITY, LIMIT, NOW_DAYS } from '../config.js';
import type { BskyEmbed, BskyPost, StrongRef } from '../lexicons.js';
import { cdnImageUrl, parseAtUri, postUrl } from '../links.js';
import { isWithinWindow, parseDate } from '../time.js';
import type { PostImage, PostItem, PostingTheme } from '../types.js';
import { rkeyOf } from './util.js';

const DAY = 86_400_000;

interface EmbedParts {
  images: PostImage[];
  external?: PostItem['external'];
  quote?: PostItem['quote'];
}

const quoteOf = (ref?: StrongRef): PostItem['quote'] => {
  const parts = ref?.uri ? parseAtUri(ref.uri) : null;
  return parts && ref
    ? { uri: ref.uri, href: postUrl(parts.did, parts.rkey) }
    : undefined;
};

function readEmbed(embed: BskyEmbed | undefined): EmbedParts {
  if (!embed) return { images: [] };
  switch (embed.$type) {
    case 'app.bsky.embed.images': {
      const { images } = embed as Extract<BskyEmbed, { $type: 'app.bsky.embed.images' }>;
      return {
        images: images
          .filter((i) => i.image?.ref?.$link)
          .map((i) => ({
            thumb: cdnImageUrl(IDENTITY.did, i.image.ref.$link),
            alt: i.alt ?? '',
          })),
      };
    }
    case 'app.bsky.embed.external': {
      const { external } = embed as Extract<BskyEmbed, { $type: 'app.bsky.embed.external' }>;
      return {
        images: [],
        external: {
          uri: external.uri,
          title: external.title || external.uri,
          description: external.description || undefined,
          thumb: external.thumb
            ? cdnImageUrl(IDENTITY.did, external.thumb.ref.$link)
            : undefined,
        },
      };
    }
    case 'app.bsky.embed.record': {
      const { record } = embed as Extract<BskyEmbed, { $type: 'app.bsky.embed.record' }>;
      return { images: [], quote: quoteOf(record) };
    }
    case 'app.bsky.embed.recordWithMedia': {
      const { record, media } = embed as Extract<
        BskyEmbed,
        { $type: 'app.bsky.embed.recordWithMedia' }
      >;
      return { ...readEmbed(media), quote: quoteOf(record?.record) };
    }
    default:
      return { images: [] };
  }
}

/**
 * Week summary (posts incl. replies) plus the latest five top-level posts
 * from the last 30 days.
 */
export function selectPosting(
  posts: AtRecord<BskyPost>[],
  now: Date
): PostingTheme | null {
  const dated = posts
    .map((rec) => ({ rec, at: parseDate(rec.value.createdAt) }))
    .filter((d): d is { rec: AtRecord<BskyPost>; at: Date } => d.at !== null)
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  const week = dated.filter(
    (d) => now.getTime() - d.at.getTime() <= NOW_DAYS * DAY && isWithinWindow(d.at, now)
  );

  const items: PostItem[] = dated
    .filter((d) => !d.rec.value.reply && isWithinWindow(d.at, now))
    .slice(0, LIMIT)
    .map(({ rec, at }) => ({
      key: rec.uri,
      at: at.toISOString(),
      app: 'bluesky',
      href: postUrl(IDENTITY.did, rkeyOf(rec.uri)),
      text: rec.value.text ?? '',
      ...readEmbed(rec.value.embed),
    }));

  if (!items.length && !week.length) return null;

  return {
    id: 'posting',
    weekCount: week.length,
    weekReplies: week.filter((d) => d.rec.value.reply).length,
    items,
  };
}
