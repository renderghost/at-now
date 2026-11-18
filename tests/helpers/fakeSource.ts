import { readFileSync } from 'node:fs';
import type {
  AtRecord,
  AtSource,
  PostView,
  Profile,
} from '../../src/core/atproto/types.js';
import { tidToDate } from '../../src/core/time.js';

const FIXTURES = new URL('../fixtures/', import.meta.url);
const cache = new Map<string, unknown>();

function readFixture<T>(path: string): T {
  if (!cache.has(path)) {
    cache.set(path, JSON.parse(readFileSync(new URL(path, FIXTURES), 'utf8')));
  }
  return cache.get(path) as T;
}

/** Own records recorded from the PDS for one collection. */
export function fixtureRecords<T>(nsid: string): AtRecord<T>[] {
  try {
    return readFixture<{ records: AtRecord<T>[] }>(`records/${nsid}.json`)
      .records;
  } catch {
    return [];
  }
}

export interface FakeSourceOptions {
  failGetRecord?: (uri: string) => boolean;
  failList?: (nsid: string) => boolean;
  /** Replace a collection's records for one test. */
  override?: Record<string, AtRecord<unknown>[]>;
}

/** An AtSource backed by the recorded fixtures; no network. */
export function createFakeSource(opts: FakeSourceOptions = {}): AtSource {
  const list = <T>(nsid: string): AtRecord<T>[] => {
    if (opts.failList?.(nsid)) throw new Error(`simulated: ${nsid}`);
    return (opts.override?.[nsid] as AtRecord<T>[]) ?? fixtureRecords<T>(nsid);
  };

  return {
    async listAll<T>(nsid: string) {
      return { records: list<T>(nsid), capped: false };
    },
    async listSince<T>(nsid: string, since: Date) {
      const records = list<T>(nsid).filter((r) => {
        const at = tidToDate(r.uri.split('/').pop() ?? '');
        return at !== null && at >= since;
      });
      return { records, capped: false };
    },
    async getRecord<T>(uri: string) {
      if (opts.failGetRecord?.(uri)) throw new Error(`simulated: ${uri}`);
      const remote = readFixture<Record<string, T>>('remote.json');
      if (uri in remote) return { uri, cid: 'fixture', value: remote[uri] };
      const nsid = uri.split('/')[3];
      return (list<T>(nsid).find((r) => r.uri === uri) ?? null) as AtRecord<T> | null;
    },
    async getProfiles(dids: string[]) {
      const known = readFixture<Profile[]>('profiles.json');
      return [...new Set(dids)].map(
        (did) => known.find((p) => p.did === did) ?? { did, handle: did }
      );
    },
    async getPosts(uris: string[]) {
      const known = readFixture<PostView[]>('posts.json');
      return known.filter((p) => uris.includes(p.uri));
    },
    async resolvePds() {
      return 'https://fixture.example';
    },
  };
}
