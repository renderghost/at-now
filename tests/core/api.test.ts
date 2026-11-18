import { describe, expect, it, vi } from 'vitest';
import { handleNow } from '../../api/now.js';
import type { AtSource } from '../../src/core/atproto/types.js';
import { createFakeSource } from '../helpers/fakeSource.js';

const NOW = new Date('2026-11-18T12:00:00Z');

describe('handleNow', () => {
  it('returns JSON with edge cache and CORS headers', async () => {
    const res = await handleNow({ source: createFakeSource(), now: NOW });
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=900');
    expect(res.headers.get('cache-control')).toContain(
      'stale-while-revalidate=86400'
    );
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('content-type')).toContain('application/json');
    const body = await res.json();
    expect(body.themes.length).toBeGreaterThan(0);
  });

  it('returns 500 without caching when the build fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await handleNow({
      source: createFakeSource(),
      now: NOW,
      build: async () => {
        throw new Error('boom');
      },
    });
    spy.mockRestore();
    expect(res.status).toBe(500);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({ error: 'unavailable' });
  });

  it('returns 500 when every source call fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failing = new Proxy({} as AtSource, {
      get: () => async () => {
        throw new Error('down');
      },
    });
    const res = await handleNow({ source: failing, now: NOW });
    spy.mockRestore();
    expect(res.status).toBe(500);
  });
});
