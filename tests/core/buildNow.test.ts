import { describe, expect, it, vi } from 'vitest';
import { buildNow } from '../../src/core/buildNow.js';
import { createFakeSource } from '../helpers/fakeSource.js';

const NOW = new Date('2026-11-18T12:00:00Z');
const CONF_2027 =
  'at://did:plc:3xewinw4wtimo2lqfy5fm5sw/community.lexicon.calendar.event/3mw74r4r3gsej';

describe('buildNow', () => {
  it('builds themes in the fixed order, skipping empty ones', async () => {
    const payload = await buildNow(createFakeSource(), NOW);
    expect(payload.themes.map((t) => t.id)).toEqual([
      'working',
      'going',
      'writing',
      'making',
      'reading',
      'listening',
      'posting',
      'saving',
      'social',
    ]);
    expect(payload.status).toBeNull();
    expect(payload.footprint.collections).toBe(34);
    expect(payload.diagnostics).toEqual([]);
    expect(payload.generatedAt).toBe(NOW.toISOString());
    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
  });

  it('includes the identity profile', async () => {
    const payload = await buildNow(createFakeSource(), NOW);
    expect(payload.profile).toMatchObject({
      handle: 'renderg.host',
      displayName: 'B. Prendergast',
      pronouns: 'he/him',
      location: 'Berlin, DE',
      counts: { followers: 2461, following: 217, posts: 6168 },
    });
  });

  it('computes top-line stats over full windows', async () => {
    const payload = await buildNow(createFakeSource(), NOW);
    expect(payload.stats).toMatchObject({
      postsThisWeek: 64,
      appreciated: 119,
      appreciatedCapped: false,
      booksOnTheGo: 2,
      plays: 13,
      tracksPublished: 7,
      eventsUpcoming: 1,
    });
    const social = payload.themes.find((t) => t.id === 'social');
    expect(payload.stats.followed).toBe(
      social && 'following' in social ? social.following?.total : -1
    );
  });

  it('keeps going without a profile', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const payload = await buildNow(
      createFakeSource({ failList: (nsid) => nsid === 'app.bsky.actor.profile' }),
      NOW
    );
    spy.mockRestore();
    expect(payload.profile).toBeNull();
    expect(payload.themes.length).toBeGreaterThan(0);
    expect(payload.diagnostics).toEqual([
      expect.objectContaining({ scope: 'profile' }),
    ]);
  });

  it('isolates a failing theme', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const payload = await buildNow(
      createFakeSource({ failList: (nsid) => nsid === 'buzz.bookhive.book' }),
      NOW
    );
    spy.mockRestore();
    expect(payload.themes.map((t) => t.id)).not.toContain('reading');
    expect(payload.themes.map((t) => t.id)).toContain('working');
    expect(payload.diagnostics).toEqual([
      expect.objectContaining({ scope: 'reading' }),
    ]);
  });

  it('drops an unreachable event but keeps the rest', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const payload = await buildNow(
      createFakeSource({ failGetRecord: (uri) => uri === CONF_2027 }),
      NOW
    );
    spy.mockRestore();
    const going = payload.themes.find((t) => t.id === 'going');
    expect(going && 'items' in going && going.items.map((i) => i.name)).toEqual([
      'The Launch of the European Social Association',
    ]);
    expect(payload.diagnostics).toEqual([
      expect.objectContaining({ scope: 'going' }),
    ]);
  });
});
