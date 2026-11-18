import { describe, expect, it } from 'vitest';
import {
  APPS,
  COLLECTIONS,
  THEME_ORDER,
  footprint,
} from '../../src/core/config.js';

describe('collection registry', () => {
  it('reads exactly 30 collections', () => {
    expect(COLLECTIONS).toHaveLength(30);
  });

  it('has no duplicate collections', () => {
    const nsids = COLLECTIONS.map((c) => c.nsid);
    expect(new Set(nsids).size).toBe(nsids.length);
  });

  it('excludes collections Barry ruled out', () => {
    const nsids = COLLECTIONS.map((c) => c.nsid);
    for (const excluded of [
      'pub.leaflet.comment',
      'app.userinput.discussion',
      'app.bsky.feed.repost',
      'sh.tangled.feed.star',
    ]) {
      expect(nsids).not.toContain(excluded);
    }
  });

  it('maps every collection to a known app', () => {
    for (const c of COLLECTIONS) expect(APPS[c.app]).toBeDefined();
  });

  it('uses the fixed editorial theme order', () => {
    expect(THEME_ORDER).toEqual([
      'working',
      'going',
      'writing',
      'making',
      'photographing',
      'reading',
      'listening',
      'posting',
      'saving',
      'social',
    ]);
  });
});

describe('footprint', () => {
  it('counts the collections and apps this page reads', () => {
    const fp = footprint();
    expect(fp.collections).toBe(30);
    expect(fp.apps).toHaveLength(15);
  });

  it('lists apps alphabetically by name', () => {
    const names = footprint().apps.map((a) => a.name);
    expect(names).toEqual(
      [...names].sort((a, b) => a.localeCompare(b, 'en-GB'))
    );
  });
});
