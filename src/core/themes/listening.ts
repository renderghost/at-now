import type { AtRecord } from '../atproto/types.js';
import { LIMIT } from '../config.js';
import type { TealPlay } from '../lexicons.js';
import { appUrl } from '../links.js';
import { isWithinWindow, parseDate, recordDate } from '../time.js';
import type { CountItem, ListeningTheme } from '../types.js';

const artistsOf = (play: TealPlay): string[] => {
  const named = play.artists?.map((a) => a.artistName).filter(Boolean) ?? [];
  return named.length ? named : (play.artistNames ?? []);
};

/** Counts labels; ties broken by the most recent occurrence. */
function rank(
  entries: { label: string; sublabel?: string; at: number }[]
): CountItem[] {
  const tally = new Map<string, { item: CountItem; latest: number }>();
  for (const e of entries) {
    const current = tally.get(e.label);
    if (current) {
      current.item.count++;
      current.latest = Math.max(current.latest, e.at);
    } else {
      tally.set(e.label, {
        item: { label: e.label, sublabel: e.sublabel, count: 1 },
        latest: e.at,
      });
    }
  }
  return [...tally.values()]
    .sort((a, b) => b.item.count - a.item.count || b.latest - a.latest)
    .slice(0, LIMIT)
    .map(({ item }) =>
      item.sublabel ? item : { label: item.label, count: item.count }
    );
}

/** Plays in the last 30 days: top artists, top tracks and the last play. */
export function selectListening(
  plays: AtRecord<TealPlay>[],
  now: Date
): ListeningTheme | null {
  const recent = plays
    .map((rec) => ({
      rec,
      at: parseDate(rec.value.playedTime) ?? recordDate(rec),
    }))
    .filter((d): d is { rec: AtRecord<TealPlay>; at: Date } =>
      d.at !== null && isWithinWindow(d.at, now) && Boolean(d.rec.value.trackName)
    )
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  if (!recent.length) return null;

  const topArtists = rank(
    recent.flatMap(({ rec, at }) =>
      artistsOf(rec.value).map((label) => ({ label, at: at.getTime() }))
    )
  );
  const topTracks = rank(
    recent.map(({ rec, at }) => ({
      label: rec.value.trackName.trim(),
      sublabel: artistsOf(rec.value)[0],
      at: at.getTime(),
    }))
  );

  const last = recent[0];
  return {
    id: 'listening',
    playCount: recent.length,
    topArtists,
    topTracks,
    lastPlayed: {
      key: last.rec.uri,
      at: last.at.toISOString(),
      app: 'teal',
      href: last.rec.value.originUri ?? appUrl('teal'),
      track: last.rec.value.trackName.trim(),
      artist: artistsOf(last.rec.value)[0],
    },
  };
}
