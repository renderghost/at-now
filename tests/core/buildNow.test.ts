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
    expect(payload.footprint.collections).toBe(30);
    expect(payload.diagnostics).toEqual([]);
    expect(payload.generatedAt).toBe(NOW.toISOString());
    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
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
