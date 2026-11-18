import { APPS, CDN_URL } from './config.js';
import type { AppId } from './types.js';

/** Web links into each app. Every pattern was verified against the live app. */

export const appUrl = (app: AppId): string => APPS[app].url;

export const profileUrl = (handleOrDid: string): string =>
  `https://bsky.app/profile/${handleOrDid}`;

export const postUrl = (did: string, rkey: string): string =>
  `https://bsky.app/profile/${did}/post/${rkey}`;

export const bookUrl = (hiveId: string): string =>
  `https://bookhive.buzz/books/${hiveId}`;

export const galleryUrl = (did: string, rkey: string): string =>
  `https://grain.social/profile/${did}/gallery/${rkey}`;

export const repoUrl = (handle: string, name: string): string =>
  `https://tangled.org/${handle}/${name}`;

export const eventUrl = (did: string, rkey: string): string =>
  `https://smokesignal.events/${did}/${rkey}`;

export const statusUrl = (handle: string): string =>
  `https://status.zzstoatzz.io/@${handle}`;

/** The custom emoji image the status app renders for "custom:<name>". */
export const statusEmojiUrl = (name: string): string =>
  `https://find-bufo.com/e/${encodeURIComponent(name)}.png`;

export const plyrArtistUrl = (handle: string): string =>
  `https://plyr.fm/u/${handle}`;

export const sifaProfileUrl = (handle: string): string =>
  `https://sifa.id/p/${handle}`;

/** Splits an at-uri into its repo DID, collection and record key. */
export function parseAtUri(
  uri: string
): { did: string; collection: string; rkey: string } | null {
  const match = /^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(uri);
  if (!match) return null;
  return { did: match[1], collection: match[2], rkey: match[3] };
}

/** Profile images through the Bluesky image CDN. */
export const avatarUrl = (did: string, cid: string): string =>
  `${CDN_URL}/img/avatar/plain/${did}/${cid}@jpeg`;

export const bannerUrl = (did: string, cid: string): string =>
  `${CDN_URL}/img/banner/plain/${did}/${cid}@jpeg`;

/** A blob served through the Bluesky image CDN (feed thumbnail size). */
export const cdnImageUrl = (did: string, cid: string): string =>
  `${CDN_URL}/img/feed_thumbnail/plain/${did}/${cid}@jpeg`;

/** A blob served straight from a PDS. */
export const pdsBlobUrl = (pdsUrl: string, did: string, cid: string): string =>
  `${pdsUrl}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`;
