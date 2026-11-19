import type { AtRecord } from '../atproto/types.js';
import { IDENTITY, LIMIT } from '../config.js';
import type { BookRecord } from '../lexicons.js';
import { bookUrl, pdsBlobUrl } from '../links.js';
import { isWithinWindow, parseDate } from '../time.js';
import type { BookItem } from '../types.js';
import { tokenOf } from './util.js';

type Status = BookItem['status'];

/**
 * "Smart dates": books being read always show (dated by when started);
 * finished books by when finished; want-to-read by when added. Abandoned
 * books are hidden. Newest first, whatever the status.
 */
export function selectReading(
  records: AtRecord<BookRecord>[],
  now: Date,
  limit = LIMIT
): BookItem[] {
  const items: BookItem[] = [];

  for (const rec of records) {
    const { value } = rec;
    const status = tokenOf(value.status);
    let at: Date | null;
    if (status === 'reading') {
      at = parseDate(value.startedAt) ?? parseDate(value.createdAt);
    } else if (status === 'finished') {
      at = parseDate(value.finishedAt) ?? parseDate(value.createdAt);
    } else if (status === 'wantToRead') {
      at = parseDate(value.createdAt);
    } else {
      continue;
    }
    if (!at) continue;
    if (status !== 'reading' && !isWithinWindow(at, now)) continue;

    items.push({
      key: rec.uri,
      at: at.toISOString(),
      app: 'bookhive',
      href: value.hiveId ? bookUrl(value.hiveId) : undefined,
      serviceHref: value.hiveId ? bookUrl(value.hiveId) : undefined,
      title: value.title,
      authors: value.authors.split('\t').map((a) => a.trim()).filter(Boolean),
      status: status as Status,
      coverUrl: value.cover
        ? pdsBlobUrl(IDENTITY.pdsUrl, IDENTITY.did, value.cover.ref.$link)
        : undefined,
      stars:
        typeof value.stars === 'number' ? Math.round(value.stars / 2) : undefined,
    });
  }

  return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, limit);
}
