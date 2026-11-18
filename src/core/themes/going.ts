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

  for (const rsvp of rsvps) {
    const status = tokenOf(rsvp.value.status);
    if (status !== 'going' && status !== 'interested') continue;
    const uri = rsvp.value.subject?.uri;
    const event = uri ? events.get(uri) : undefined;
    if (!uri || !event) continue;
    if (tokenOf(event.status) === 'cancelled') continue;

    const starts = parseDate(event.startsAt);
    const ends = parseDate(event.endsAt) ?? starts;
    if (!starts || !ends) continue;

    const past = ends.getTime() < now.getTime();
    if (past && now.getTime() - ends.getTime() > WINDOW_DAYS * DAY) continue;

    const parts = parseAtUri(uri);
    const mode = tokenOf(event.mode);
    const place = event.locations?.find((l) => l.name || l.locality);
    const image =
      event.media?.find((m) => m.role === 'thumbnail') ??
      event.media?.find((m) => m.role === 'header');

    items.push({
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
        image?.content && parts
          ? cdnImageUrl(parts.did, image.content.ref.$link)
          : undefined,
      sortAt: starts.getTime(),
    });
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
