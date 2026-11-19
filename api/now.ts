import { createHttpSource } from '../src/core/atproto/source.js';
import type { AtSource } from '../src/core/atproto/types.js';
import { buildNow } from '../src/core/buildNow.js';
import {
  APPVIEW_URL,
  IDENTITY,
  MAX_CONCURRENCY,
  MAX_PAGES,
  PLC_URL,
  PLYR_API_URL,
  TIMEOUT_MS,
} from '../src/core/config.js';
import type { NowPayload } from '../src/core/types.js';

const CACHE_CONTROL =
  'public, max-age=0, s-maxage=900, stale-while-revalidate=86400';

const BASE_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
};

export interface HandleNowDeps {
  source: AtSource;
  now: Date;
  build?: (source: AtSource, now: Date) => Promise<NowPayload>;
}

/**
 * Builds the payload. A total outage (nothing rendered and failures recorded)
 * is answered with an uncached 500, so the CDN never pins an empty page.
 */
export async function handleNow({
  source,
  now,
  build = buildNow,
}: HandleNowDeps): Promise<Response> {
  try {
    const payload = await build(source, now);
    if (!payload.status && !payload.themes.length && payload.diagnostics.length) {
      throw new Error('Every source failed');
    }
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...BASE_HEADERS, 'cache-control': CACHE_CONTROL },
    });
  } catch (err) {
    console.error('[now] request failed:', err);
    return new Response(JSON.stringify({ error: 'unavailable' }), {
      status: 500,
      headers: { ...BASE_HEADERS, 'cache-control': 'no-store' },
    });
  }
}

export function GET(_request: Request): Promise<Response> {
  const source = createHttpSource({
    did: IDENTITY.did,
    pdsUrl: IDENTITY.pdsUrl,
    appviewUrl: APPVIEW_URL,
    plcUrl: PLC_URL,
    plyrApiUrl: PLYR_API_URL,
    timeoutMs: TIMEOUT_MS,
    maxConcurrency: MAX_CONCURRENCY,
    maxPages: MAX_PAGES,
    now: () => new Date(),
  });
  return handleNow({ source, now: new Date() });
}
