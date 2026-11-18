import { parseAtUri } from '../links.js';
import { HttpError, createLimiter, fetchJson } from './http.js';
import { listAllPages, listSincePages } from './paging.js';
import type { Page } from './paging.js';
import type { AtRecord, AtSource, PostView, Profile } from './types.js';

export type { AtRecord, AtSource, ListResult, PostView, Profile } from './types.js';

export interface HttpSourceOptions {
  did: string;
  pdsUrl: string;
  appviewUrl: string;
  plcUrl: string;
  timeoutMs: number;
  maxConcurrency: number;
  maxPages: number;
  now: () => Date;
  fetchImpl?: typeof fetch;
}

const BATCH = 25;

interface DidDocument {
  service?: { id: string; type?: string; serviceEndpoint: string }[];
}

interface ProfileView {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

interface AppviewPost {
  uri: string;
  author: ProfileView;
  record: { text?: string; createdAt?: string };
}

const chunk = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size)
  );

const toProfile = (p: ProfileView): Profile => ({
  did: p.did,
  handle: p.handle,
  displayName: p.displayName || undefined,
  avatar: p.avatar || undefined,
});

export function createHttpSource(opts: HttpSourceOptions): AtSource {
  const limit = createLimiter(opts.maxConcurrency);
  const get = <T>(url: string) =>
    limit(() =>
      fetchJson<T>(url, { timeoutMs: opts.timeoutMs, fetchImpl: opts.fetchImpl })
    );
  const pdsCache = new Map<string, Promise<string>>();

  const resolvePds = (did: string): Promise<string> => {
    if (did === opts.did) return Promise.resolve(opts.pdsUrl);
    const cached = pdsCache.get(did);
    if (cached) return cached;
    const docUrl = did.startsWith('did:web:')
      ? `https://${did.slice('did:web:'.length)}/.well-known/did.json`
      : `${opts.plcUrl}/${did}`;
    const pending = get<DidDocument>(docUrl).then((doc) => {
      const service = doc.service?.find((s) => s.id.endsWith('#atproto_pds'));
      if (!service) throw new Error(`No PDS service in DID document for ${did}`);
      return service.serviceEndpoint.replace(/\/$/, '');
    });
    pending.catch(() => pdsCache.delete(did));
    pdsCache.set(did, pending);
    return pending;
  };

  const pager =
    (collection: string) =>
    (cursor: string | undefined): Promise<Page> => {
      const params = new URLSearchParams({
        repo: opts.did,
        collection,
        limit: '100',
      });
      if (cursor) params.set('cursor', cursor);
      return get<Page>(
        `${opts.pdsUrl}/xrpc/com.atproto.repo.listRecords?${params}`
      );
    };

  return {
    resolvePds,

    async listAll<T>(collection: string) {
      const result = await listAllPages(pager(collection), opts.maxPages);
      return result as { records: AtRecord<T>[]; capped: boolean };
    },

    async listSince<T>(collection: string, since: Date) {
      const result = await listSincePages(
        pager(collection),
        since,
        opts.now(),
        opts.maxPages
      );
      return result as { records: AtRecord<T>[]; capped: boolean };
    },

    async getRecord<T>(uri: string) {
      const parts = parseAtUri(uri);
      if (!parts) throw new Error(`Not an at-uri: ${uri}`);
      const pds = await resolvePds(parts.did);
      const params = new URLSearchParams({
        repo: parts.did,
        collection: parts.collection,
        rkey: parts.rkey,
      });
      try {
        return await get<AtRecord<T>>(
          `${pds}/xrpc/com.atproto.repo.getRecord?${params}`
        );
      } catch (err) {
        if (
          err instanceof HttpError &&
          (err.status === 404 || err.code === 'RecordNotFound')
        ) {
          return null;
        }
        throw err;
      }
    },

    async getProfiles(dids: string[]) {
      const unique = [...new Set(dids)];
      const batches = await Promise.all(
        chunk(unique, BATCH).map((batch) => {
          const params = new URLSearchParams();
          for (const did of batch) params.append('actors', did);
          return get<{ profiles: ProfileView[] }>(
            `${opts.appviewUrl}/xrpc/app.bsky.actor.getProfiles?${params}`
          );
        })
      );
      return batches.flatMap((b) => b.profiles.map(toProfile));
    },

    async getProfile(actor: string) {
      const params = new URLSearchParams({ actor });
      try {
        const p = await get<{
          followersCount?: number;
          followsCount?: number;
          postsCount?: number;
          createdAt?: string;
        }>(`${opts.appviewUrl}/xrpc/app.bsky.actor.getProfile?${params}`);
        return {
          followers: p.followersCount ?? 0,
          following: p.followsCount ?? 0,
          posts: p.postsCount ?? 0,
          joinedAt: p.createdAt,
        };
      } catch (err) {
        if (err instanceof HttpError && err.status === 400) return null;
        throw err;
      }
    },

    async getPosts(uris: string[]) {
      const unique = [...new Set(uris)];
      const batches = await Promise.all(
        chunk(unique, BATCH).map((batch) => {
          const params = new URLSearchParams();
          for (const uri of batch) params.append('uris', uri);
          return get<{ posts: AppviewPost[] }>(
            `${opts.appviewUrl}/xrpc/app.bsky.feed.getPosts?${params}`
          );
        })
      );
      return batches.flatMap((b) =>
        b.posts.map(
          (p): PostView => ({
            uri: p.uri,
            author: toProfile(p.author),
            text: p.record.text ?? '',
            createdAt: p.record.createdAt ?? '',
          })
        )
      );
    },
  };
}
