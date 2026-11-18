import { describe, expect, it } from 'vitest';
import { listAllPages, listSincePages } from '../../src/core/atproto/paging.js';
import type { PageFn } from '../../src/core/atproto/paging.js';
import { dateToTid } from '../../src/core/time.js';

const NOW = new Date('2026-11-18T12:00:00Z');
const DAY = 86_400_000;
const SINCE = new Date(NOW.getTime() - 30 * DAY);

/** In-window records every 14.4 min for 30 days, plus 200 older ones. */
function syntheticRecords(inWindow: number, older = 200) {
  const step = (30 * DAY) / inWindow;
  const recs = [];
  for (let i = 0; i < inWindow; i++) {
    const t = new Date(NOW.getTime() - 1000 - i * step);
    recs.push(t);
  }
  for (let i = 0; i < older; i++) {
    recs.push(new Date(SINCE.getTime() - (i + 1) * 3_600_000));
  }
  return recs
    .map((d) => dateToTid(d))
    .sort()
    .reverse()
    .map((rkey) => ({
      uri: `at://did:plc:x/app.bsky.feed.like/${rkey}`,
      cid: 'c',
      value: {},
    }));
}

/** Mimics listRecords: newest first, cursor = exclusive rkey upper bound. */
function fakePager(
  records: ReturnType<typeof syntheticRecords>,
  delayMs = 0
): { page: PageFn; calls: () => number } {
  let calls = 0;
  const page: PageFn = async (cursor) => {
    calls++;
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    const start = cursor
      ? records.findIndex((r) => r.uri.split('/').pop()! < cursor)
      : 0;
    if (start === -1) return { records: [] };
    const slice = records.slice(start, start + 100);
    const last = slice[slice.length - 1];
    return {
      records: slice,
      cursor:
        slice.length === 100 ? last.uri.split('/').pop() : undefined,
    };
  };
  return { page, calls: () => calls };
}

describe('listSincePages', () => {
  it('returns exactly the in-window records', async () => {
    const { page } = fakePager(syntheticRecords(3000));
    const { records, capped } = await listSincePages(page, SINCE, NOW, 40);
    expect(capped).toBe(false);
    expect(records).toHaveLength(3000);
    expect(new Set(records.map((r) => r.uri)).size).toBe(3000);
    const keys = records.map((r) => r.uri);
    expect(keys).toEqual([...keys].sort().reverse());
  });

  it('uses at most 40 pages and fans out in parallel', async () => {
    const pager = fakePager(syntheticRecords(3000), 50);
    const started = Date.now();
    await listSincePages(pager.page, SINCE, NOW, 40);
    expect(pager.calls()).toBeLessThanOrEqual(40);
    expect(pager.calls()).toBeGreaterThan(1);
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it('marks results capped when the page budget runs out', async () => {
    const { page } = fakePager(syntheticRecords(3000));
    const { records, capped } = await listSincePages(page, SINCE, NOW, 5);
    expect(capped).toBe(true);
    expect(records.length).toBeLessThan(3000);
  });

  it('stops after one page for sparse collections', async () => {
    const pager = fakePager(syntheticRecords(10));
    const { records } = await listSincePages(pager.page, SINCE, NOW, 40);
    expect(records).toHaveLength(10);
    expect(pager.calls()).toBe(1);
  });
});

describe('listAllPages', () => {
  it('follows cursors until absent', async () => {
    const pager = fakePager(syntheticRecords(250, 0));
    const { records, capped } = await listAllPages(pager.page, 40);
    expect(records).toHaveLength(250);
    expect(capped).toBe(false);
    expect(pager.calls()).toBe(3);
  });
});
