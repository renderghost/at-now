import type { AtRecord } from '../atproto/types.js';
import { IDENTITY, LIMIT } from '../config.js';
import type { PlyrTrack, TangledRepo } from '../lexicons.js';
import { appUrl, repoUrl } from '../links.js';
import { isWithinWindow, parseDate } from '../time.js';
import type { RepoItem, TrackItem } from '../types.js';

const recent = <T extends { createdAt: string }>(
  records: AtRecord<T>[],
  now: Date
) =>
  records
    .map((rec) => ({ rec, at: parseDate(rec.value.createdAt) }))
    .filter((d): d is { rec: AtRecord<T>; at: Date } =>
      d.at !== null && isWithinWindow(d.at, now)
    )
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, LIMIT);

/** Code repositories and published music from the last 30 days. */
export function selectMaking(
  repos: AtRecord<TangledRepo>[],
  tracks: AtRecord<PlyrTrack>[],
  now: Date
): { repos: RepoItem[]; tracks: TrackItem[] } {
  return {
    repos: recent(repos, now).map(({ rec, at }) => ({
      key: rec.uri,
      at: at.toISOString(),
      app: 'tangled',
      href: repoUrl(IDENTITY.handle, rec.value.name),
      name: rec.value.name,
      description: rec.value.description || undefined,
    })),
    tracks: recent(tracks, now).map(({ rec, at }) => ({
      key: rec.uri,
      at: at.toISOString(),
      app: 'plyr',
      href: appUrl('plyr'),
      title: rec.value.title,
      artist: rec.value.artist,
      album: rec.value.album || undefined,
      imageUrl: rec.value.imageUrl || undefined,
      durationSec: rec.value.duration,
    })),
  };
}
