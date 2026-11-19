import type { AtRecord, PlyrTrackRef } from '../atproto/types.js';
import { IDENTITY, LIMIT } from '../config.js';
import type { PlyrTrack, TangledRepo } from '../lexicons.js';
import { plyrAlbumUrl, plyrArtistUrl, plyrTrackUrl, repoUrl } from '../links.js';
import { isWithinWindow, parseDate } from '../time.js';
import type { RepoItem, TrackItem } from '../types.js';

const recent = <T extends { createdAt: string }>(
  records: AtRecord<T>[],
  now: Date,
  limit: number
) =>
  records
    .map((rec) => ({ rec, at: parseDate(rec.value.createdAt) }))
    .filter((d): d is { rec: AtRecord<T>; at: Date } =>
      d.at !== null && isWithinWindow(d.at, now)
    )
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit);

/** plyr.fm's track refs keyed by record URI. */
export const indexPlyrTracks = (refs: PlyrTrackRef[]): Map<string, PlyrTrackRef> =>
  new Map(refs.map((r) => [r.uri, r]));

/**
 * Code repositories and published music from the last 30 days. With the
 * plyr.fm index, tracks link to their own page and album; without it, to the
 * artist page.
 */
export function selectMaking(
  repos: AtRecord<TangledRepo>[],
  tracks: AtRecord<PlyrTrack>[],
  now: Date,
  limit = LIMIT,
  plyrIndex?: Map<string, PlyrTrackRef>
): { repos: RepoItem[]; tracks: TrackItem[] } {
  const artistHref = plyrArtistUrl(IDENTITY.handle);
  return {
    repos: recent(repos, now, limit).map(({ rec, at }) => ({
      key: rec.uri,
      at: at.toISOString(),
      app: 'tangled',
      href: repoUrl(IDENTITY.handle, rec.value.name),
      serviceHref: repoUrl(IDENTITY.handle, rec.value.name),
      name: rec.value.name,
      description: rec.value.description || undefined,
    })),
    tracks: recent(tracks, now, limit).map(({ rec, at }) => {
      const ref = plyrIndex?.get(rec.uri);
      const trackHref = ref ? plyrTrackUrl(ref.id) : artistHref;
      return {
      key: rec.uri,
      at: at.toISOString(),
      app: 'plyr',
      href: trackHref,
      serviceHref: trackHref,
      artistHref: ref?.artistHandle ? plyrArtistUrl(ref.artistHandle) : artistHref,
      albumHref:
        ref?.albumSlug && rec.value.album
          ? plyrAlbumUrl(ref.artistHandle || IDENTITY.handle, ref.albumSlug)
          : undefined,
      title: rec.value.title,
      artist: rec.value.artist,
      album: rec.value.album || undefined,
      imageUrl: rec.value.imageUrl || undefined,
      durationSec: rec.value.duration,
      };
    }),
  };
}
