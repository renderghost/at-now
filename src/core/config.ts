/** Identity, endpoints and limits for the Now page. */

export const IDENTITY = {
  did: 'did:plc:s2rczyxit2v5vzedxqs326ri',
  handle: 'renderg.host',
  pdsUrl: 'https://eurosky.social',
} as const;

export const APPVIEW_URL = 'https://public.api.bsky.app';
export const PLC_URL = 'https://plc.directory';
export const CDN_URL = 'https://cdn.bsky.app';

/** Age (days) at or under which an item counts as "now". */
export const NOW_DAYS = 7;
/** Age (days) beyond which an item is ignored unless exempt. */
export const WINDOW_DAYS = 30;
/** Maximum items per theme or sub-block. */
export const LIMIT = 5;

export const PAGE_SIZE = 100;
export const MAX_PAGES = 40;
export const TIMEOUT_MS = 4000;
export const MAX_CONCURRENCY = 12;
