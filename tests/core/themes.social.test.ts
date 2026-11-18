import { describe, expect, it, vi } from 'vitest';
import { APPS, COLLECTIONS } from '../../src/core/config.js';
import type { InteractionRecord } from '../../src/core/lexicons.js';
import {
  APPRECIATE_NSIDS,
  FOLLOW_NSIDS,
  SUBSCRIBE_NSIDS,
  buildAppreciated,
  buildFollowing,
  buildSubscribed,
  followSubject,
  roundRobin,
} from '../../src/core/themes/social.js';
import type { Group } from '../../src/core/themes/social.js';
import { isWithinWindow, recordDate } from '../../src/core/time.js';
import type { AppId } from '../../src/core/types.js';
import { createFakeSource, fixtureRecords } from '../helpers/fakeSource.js';

const NOW = new Date('2026-11-18T12:00:00Z');

const groupsFor = (nsids: readonly string[]): Group[] =>
  nsids.map((nsid) => ({
    nsid,
    app: COLLECTIONS.find((c) => c.nsid === nsid)!.app,
    records: fixtureRecords<InteractionRecord>(nsid),
    capped: false,
  }));

describe('roundRobin', () => {
  it('takes the newest item of each app in turn', () => {
    const c = (app: AppId, minute: number) => ({ app, at: new Date(minute * 60_000) });
    const picked = roundRobin(
      [c('bluesky', 10), c('bluesky', 8), c('bluesky', 6), c('grain', 9), c('teal', 7), c('teal', 5)],
      4
    );
    expect(picked.map((p) => `${p.app}@${p.at.getTime() / 60_000}`)).toEqual([
      'bluesky@10',
      'grain@9',
      'teal@7',
      'bluesky@8',
    ]);
  });
});

describe('buildFollowing', () => {
  it('merges follows across apps with a per-app breakdown', async () => {
    const groups = groupsFor(FOLLOW_NSIDS);
    const block = await buildFollowing(groups, createFakeSource(), NOW);

    const distinct = new Set<string>();
    for (const g of groups) {
      for (const rec of g.records) {
        const at = recordDate(rec);
        const did = followSubject(g.nsid, rec);
        if (at && did && isWithinWindow(at, NOW)) distinct.add(did);
      }
    }

    expect(block?.byApp).toEqual([
      { app: 'bluesky', count: 58 },
      { app: 'sifa', count: 2 },
      { app: 'tangled', count: 2 },
      { app: 'grain', count: 1 },
    ]);
    expect(block?.total).toBe(distinct.size);
    expect(block!.highlights.length).toBeGreaterThan(0);
    expect(block!.highlights.length).toBeLessThanOrEqual(5);
    expect(block!.highlights[0].app).toBe('bluesky');
  });

  it('reads the subject of a Tangled follow from its record key', () => {
    expect(
      followSubject('org.tangled.graph.follow', {
        uri: 'at://did:plc:me/org.tangled.graph.follow/did:plc:zntngpowgd6rorjt3haywj36',
        cid: 'c',
        value: { createdAt: '2026-10-29T05:01:09.003Z' },
      })
    ).toBe('did:plc:zntngpowgd6rorjt3haywj36');
  });
});

describe('buildSubscribed', () => {
  it('is empty when no subscriptions are recent', async () => {
    expect(
      await buildSubscribed(groupsFor(SUBSCRIBE_NSIDS), createFakeSource(), NOW)
    ).toBeNull();
  });
});

describe('buildAppreciated', () => {
  it('counts appreciation across apps', async () => {
    const block = await buildAppreciated(
      groupsFor(APPRECIATE_NSIDS),
      createFakeSource(),
      NOW,
      () => {}
    );
    expect(block?.byApp).toEqual([
      { app: 'bluesky', count: 100 },
      { app: 'grain', count: 17 },
      { app: 'standard', count: 1 },
      { app: 'streamplace', count: 1 },
    ]);
    expect(block?.total).toBe(119);
    expect(block?.capped).toBe(false);
  });

  it('highlights a spread of apps, never uncountable ones', async () => {
    const block = await buildAppreciated(
      groupsFor(APPRECIATE_NSIDS),
      createFakeSource(),
      NOW,
      () => {}
    );
    const apps = block!.highlights.map((h) => h.app);
    expect(apps).toContain('bluesky');
    expect(apps).not.toContain('streamplace');
    expect(block!.highlights.length).toBeLessThanOrEqual(5);
    for (const h of block!.highlights) expect(h.label.length).toBeGreaterThan(0);
  });

  it('keeps counts when a highlight lookup fails', async () => {
    const onError = vi.fn();
    const block = await buildAppreciated(
      groupsFor(APPRECIATE_NSIDS),
      createFakeSource({ failGetRecord: (uri) => uri.includes('social.grain') }),
      NOW,
      onError
    );
    expect(block!.highlights.some((h) => h.app === 'grain')).toBe(false);
    expect(block!.byApp.find((b) => b.app === 'grain')?.count).toBe(17);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ scope: 'highlight' })
    );
  });

  it('marks capped counts', async () => {
    const groups = groupsFor(APPRECIATE_NSIDS).map((g) =>
      g.nsid === 'app.bsky.feed.like' ? { ...g, capped: true } : g
    );
    const block = await buildAppreciated(groups, createFakeSource(), NOW, () => {});
    expect(block?.capped).toBe(true);
  });

  it('uses only registered apps', () => {
    for (const nsid of [...FOLLOW_NSIDS, ...SUBSCRIBE_NSIDS, ...APPRECIATE_NSIDS]) {
      const spec = COLLECTIONS.find((c) => c.nsid === nsid);
      expect(spec && APPS[spec.app]).toBeTruthy();
    }
  });
});
