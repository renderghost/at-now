import type { AtRecord } from '../atproto/types.js';
import { LIMIT, WINDOW_DAYS } from '../config.js';
import type { CalendarEvent, RsvpRecord } from '../lexicons.js';
import { cdnImageUrl, eventUrl, parseAtUri } from '../links.js';
import { parseDate, recordDate } from '../time.js';
import type { EventItem } from '../types.js';
import { joinParts, tokenOf } from './util.js';

const DAY = 86_400_000;
const MODES = new Set(['inperson', 'virtual', 'hybrid']);

/**
 * One RSVP per event: when there are several (apps write their own, or the
 * answer changed), the newest one is the answer.
 */
export function latestRsvps(rsvps: AtRecord<RsvpRecord>[]): AtRecord<RsvpRecord>[] {
  const latest = new Map<string, { rec: AtRecord<RsvpRecord>; at: number }>();
  for (const rec of rsvps) {
    const uri = rec.value.subject?.uri;
    if (!uri) continue;
    const at = recordDate(rec)?.getTime() ?? 0;
    const current = latest.get(uri);
    if (!current || at > current.at) latest.set(uri, { rec, at });
  }
  return [...latest.values()].map((l) => l.rec);
}

/** RSVP subjects worth fetching (newest answer per event, not "not going"). */
export function eventUris(rsvps: AtRecord<RsvpRecord>[]): string[] {
  return latestRsvps(rsvps)
    .filter((r) => tokenOf(r.value.status) !== 'notgoing')
    .map((r) => r.value.subject.uri);
}

/**
 * Upcoming events (any distance ahead, ongoing included) and events that
 * ended in the last 30 days, latest date first. Going or interested only;
 * cancelled dropped.
 */
export function selectGoing(
  rsvps: AtRecord<RsvpRecord>[],
  events: Map<string, CalendarEvent>,
  now: Date,
  limit = LIMIT
): EventItem[] {
  const items: (EventItem & { sortAt: number })[] = [];

  const toItem = (rsvp: AtRecord<RsvpRecord>): (EventItem & { sortAt: number }) | null => {
    const status = tokenOf(rsvp.value.status);
    if (status !== 'going' && status !== 'interested') return null;
    const uri = rsvp.value.subject?.uri;
    const event = uri ? events.get(uri) : undefined;
    if (!uri || !event) return null;
    if (tokenOf(event.status) === 'cancelled') return null;

    const starts = parseDate(event.startsAt);
    const ends = parseDate(event.endsAt) ?? starts;
    if (!starts || !ends) return null;

    const past = ends.getTime() < now.getTime();
    if (past && now.getTime() - ends.getTime() > WINDOW_DAYS * DAY) return null;

    const parts = parseAtUri(uri);
    const mode = tokenOf(event.mode);
    const place = event.locations?.find((l) => l.name || l.locality);
    const image =
      event.media?.find((m) => m.role === 'thumbnail') ??
      event.media?.find((m) => m.role === 'header');

    return {
      key: rsvp.uri,
      at: starts.toISOString(),
      app: 'atmorsvp',
      href: parts ? eventUrl(parts.did, parts.rkey) : undefined,
      serviceHref: parts ? eventUrl(parts.did, parts.rkey) : undefined,
      name: event.name,
      startsAt: starts.toISOString(),
      endsAt: parseDate(event.endsAt)?.toISOString(),
      mode: mode && MODES.has(mode) ? (mode as EventItem['mode']) : undefined,
      location: place ? joinParts([place.name, place.locality]) : undefined,
      rsvp: status,
      past,
      imageUrl:
        image?.content?.ref?.$link && parts
          ? cdnImageUrl(parts.did, image.content.ref.$link)
          : undefined,
      sortAt: starts.getTime(),
    };
  };

  // One odd remote record must not take the others down with it.
  for (const rsvp of latestRsvps(rsvps)) {
    try {
      const item = toItem(rsvp);
      if (item) items.push(item);
    } catch {
      // Unusable event record: skip it.
    }
  }

  // Newest date first, like every other theme.
  return items
    .sort((a, b) => b.sortAt - a.sortAt)
    .slice(0, limit)
    .map(({ sortAt: _s, ...item }) => item);
}
