import type { AtRecord } from '../atproto/types.js';
import { LIMIT, WINDOW_DAYS } from '../config.js';
import type { CalendarEvent, RsvpRecord } from '../lexicons.js';
import { cdnImageUrl, eventUrl, parseAtUri } from '../links.js';
import { parseDate } from '../time.js';
import type { EventItem } from '../types.js';
import { joinParts, tokenOf } from './util.js';

const DAY = 86_400_000;
const MODES = new Set(['inperson', 'virtual', 'hybrid']);

/** RSVP subjects worth fetching (anything but "not going"). */
export function eventUris(rsvps: AtRecord<RsvpRecord>[]): string[] {
  return [
    ...new Set(
      rsvps
        .filter((r) => tokenOf(r.value.status) !== 'notgoing')
        .map((r) => r.value.subject?.uri)
        .filter((uri): uri is string => Boolean(uri))
    ),
  ];
}

/**
 * Upcoming events (any distance ahead, ongoing included), then events that
 * ended in the last 30 days. Going or interested only; cancelled dropped.
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
      app: 'smokesignal',
      href: parts ? eventUrl(parts.did, parts.rkey) : undefined,
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
  for (const rsvp of rsvps) {
    try {
      const item = toItem(rsvp);
      if (item) items.push(item);
    } catch {
      // Unusable event record: skip it.
    }
  }

  const upcoming = items
    .filter((i) => !i.past)
    .sort((a, b) => a.sortAt - b.sortAt);
  const recent = items
    .filter((i) => i.past)
    .sort((a, b) => b.sortAt - a.sortAt);

  return [...upcoming, ...recent]
    .slice(0, limit)
    .map(({ sortAt: _s, ...item }) => item);
}
