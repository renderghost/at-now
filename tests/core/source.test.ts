import { describe, expect, it, vi } from 'vitest';
import { fetchJson } from '../../src/core/atproto/http.js';
import { createHttpSource } from '../../src/core/atproto/source.js';

const NOW = new Date('2026-11-18T12:00:00Z');
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

function sourceWith(fetchImpl: typeof fetch) {
  return createHttpSource({
    did: 'did:plc:me',
    pdsUrl: 'https://pds.example',
    appviewUrl: 'https://appview.example',
    plcUrl: 'https://plc.example',
    timeoutMs: 200,
    maxConcurrency: 4,
    maxPages: 40,
    now: () => NOW,
    fetchImpl,
  });
}

describe('fetchJson', () => {
  it('times out', async () => {
    const never = (() => new Promise<Response>(() => {})) as typeof fetch;
    const started = Date.now();
    await expect(
      fetchJson('https://x.example', { timeoutMs: 100, fetchImpl: never })
    ).rejects.toThrow();
    expect(Date.now() - started).toBeLessThan(150 + 50);
  });

  it('throws with the URL and status on errors', async () => {
    const fail = (async () => json({}, 502)) as typeof fetch;
    await expect(
      fetchJson('https://x.example/a', { timeoutMs: 100, fetchImpl: fail })
    ).rejects.toThrow(/502.*x\.example\/a|x\.example\/a.*502/);
  });
});

describe('createHttpSource', () => {
  it('batches getProfiles by 25', async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request) => {
      const actors = new URL(String(url)).searchParams.getAll('actors');
      return json({
        profiles: actors.map((did) => ({ did, handle: `${did}.test` })),
      });
    });
    const source = sourceWith(fetchImpl as unknown as typeof fetch);
    const dids = Array.from({ length: 60 }, (_, i) => `did:plc:${i}`);
    const profiles = await source.getProfiles(dids);
    expect(profiles).toHaveLength(60);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(String(fetchImpl.mock.calls[0][0])).toContain(
      'app.bsky.actor.getProfiles'
    );
  });

  it('returns null for a missing record', async () => {
    const fetchImpl = (async (url: string | URL | Request) => {
      if (String(url).startsWith('https://plc.example')) {
        return json({
          service: [
            {
              id: '#atproto_pds',
              type: 'AtprotoPersonalDataServer',
              serviceEndpoint: 'https://other.example',
            },
          ],
        });
      }
      return json({ error: 'RecordNotFound', message: 'nope' }, 400);
    }) as typeof fetch;
    const source = sourceWith(fetchImpl);
    expect(
      await source.getRecord('at://did:plc:other/app.x.thing/abc')
    ).toBeNull();
  });

  it('caches PDS resolution', async () => {
    const fetchImpl = vi.fn(async () =>
      json({
        service: [
          {
            id: '#atproto_pds',
            type: 'AtprotoPersonalDataServer',
            serviceEndpoint: 'https://other.example',
          },
        ],
      })
    );
    const source = sourceWith(fetchImpl as unknown as typeof fetch);
    expect(await source.resolvePds('did:plc:other')).toBe(
      'https://other.example'
    );
    await source.resolvePds('did:plc:other');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('reads own records from the configured PDS without a PLC lookup', async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request) =>
      json({ uri: 'at://did:plc:me/c/k', cid: 'x', value: { a: 1 } })
    );
    const source = sourceWith(fetchImpl as unknown as typeof fetch);
    const rec = await source.getRecord('at://did:plc:me/c/k');
    expect(rec?.value).toEqual({ a: 1 });
    expect(String(fetchImpl.mock.calls[0][0])).toMatch(
      /^https:\/\/pds\.example\/xrpc\/com\.atproto\.repo\.getRecord\?/
    );
  });
});
