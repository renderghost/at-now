import { PAGE_SIZE } from '../config.js';
import { dateToTid, tidToDate } from '../time.js';
import type { AtRecord } from './types.js';

export type Page = { records: AtRecord<unknown>[]; cursor?: string };
export type PageFn = (cursor: string | undefined) => Promise<Page>;
type Listing = { records: AtRecord<unknown>[]; capped: boolean };

const rkeyOf = (rec: AtRecord<unknown>): string => rec.uri.split('/').pop() ?? '';

const isLastPage = (page: Page): boolean =>
  !page.cursor || page.records.length < PAGE_SIZE;

/** Follows cursors to the end, up to `maxPages` requests. */
export async function listAllPages(
  page: PageFn,
  maxPages: number
): Promise<Listing> {
  const records: AtRecord<unknown>[] = [];
  let cursor: string | undefined;
  for (let used = 0; used < maxPages; used++) {
    const result = await page(cursor);
    records.push(...result.records);
    if (isLastPage(result)) return { records, capped: false };
    cursor = result.cursor;
  }
  return { records, capped: true };
}

/**
 * Lists TID-keyed records created since `since`, newest first.
 *
 * Fetches the newest page, estimates the record rate from it, then splits the
 * rest of the window into time slices fetched in parallel. Any TID is a valid
 * listRecords cursor, so each slice starts from a synthesised TID. Slices
 * share one page budget.
 */
export async function listSincePages(
  page: PageFn,
  since: Date,
  now: Date,
  maxPages: number
): Promise<Listing> {
  const sinceKey = dateToTid(since);
  let budget = maxPages - 1;
  let capped = false;

  const first = await page(undefined);
  const collected = first.records.filter((r) => rkeyOf(r) >= sinceKey);
  const lastKey = first.records.length ? rkeyOf(first.records.at(-1)!) : '';
  const oldest = tidToDate(lastKey);

  if (isLastPage(first) || !oldest || lastKey < sinceKey) {
    return { records: collected, capped: false };
  }

  const span = oldest.getTime() - since.getTime();
  const rate = PAGE_SIZE / Math.max(1, now.getTime() - oldest.getTime());
  const estimatedPages = (span * rate) / PAGE_SIZE;
  const sliceCount = Math.max(
    1,
    Math.min(Math.ceil(estimatedPages * 1.25), budget)
  );

  const boundaries = Array.from(
    { length: sliceCount + 1 },
    (_, i) => new Date(oldest.getTime() - (span * i) / sliceCount)
  );

  const fetchSlice = async (i: number): Promise<AtRecord<unknown>[]> => {
    const lowerKey = i === sliceCount - 1 ? sinceKey : dateToTid(boundaries[i + 1]);
    let cursor: string | undefined =
      i === 0 ? first.cursor : dateToTid(boundaries[i]);
    const out: AtRecord<unknown>[] = [];
    for (;;) {
      if (budget <= 0) {
        capped = true;
        return out;
      }
      budget--;
      const result = await page(cursor);
      out.push(...result.records.filter((r) => rkeyOf(r) >= lowerKey));
      const tail = result.records.length ? rkeyOf(result.records.at(-1)!) : '';
      if (isLastPage(result) || tail < lowerKey) return out;
      cursor = result.cursor;
    }
  };

  const slices = await Promise.all(
    Array.from({ length: sliceCount }, (_, i) => fetchSlice(i))
  );

  const byUri = new Map<string, AtRecord<unknown>>();
  for (const rec of [...collected, ...slices.flat()]) byUri.set(rec.uri, rec);
  const records = [...byUri.values()].sort((a, b) =>
    rkeyOf(a) < rkeyOf(b) ? 1 : rkeyOf(a) > rkeyOf(b) ? -1 : 0
  );
  return { records, capped };
}
