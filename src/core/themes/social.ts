import type { AtRecord, AtSource } from '../atproto/types.js';
import { LIMIT } from '../config.js';
import type {
  InteractionRecord,
  PlyrTrack,
  StandardDocument,
  StandardPublication,
  LeafletPublication,
} from '../lexicons.js';
import { appUrl, galleryUrl, parseAtUri, postUrl, profileUrl } from '../links.js';

/** A followed account's page in the app the follow came from. */
const personInApp = (app: AppId, handle: string): string => {
  switch (app) {
    case 'sifa':
      return `https://sifa.id/p/${handle}`;
    case 'tangled':
      return `https://tangled.org/${handle}`;
    case 'grain':
      return `https://grain.social/profile/${handle}`;
    case 'bluesky':
      return profileUrl(handle);
    default:
      return appUrl(app);
  }
};
import { isWithinWindow, recordDate } from '../time.js';
import type { AppId, Diagnostic, Highlight, InteractionBlock } from '../types.js';
import { rkeyOf } from './util.js';

export const FOLLOW_NSIDS = [
  'app.bsky.graph.follow',
  'social.grain.graph.follow',
  'is.currents.graph.follow',
  'id.sifa.graph.follow',
  'org.tangled.graph.follow',
] as const;

export const SUBSCRIBE_NSIDS = [
  'site.standard.graph.subscription',
  'pub.leaflet.graph.subscription',
] as const;

export const APPRECIATE_NSIDS = [
  'app.bsky.feed.like',
  'social.grain.favorite',
  'org.tangled.feed.star',
  'app.userinput.upvote',
  'fm.plyr.like',
  'site.standard.graph.recommend',
  'place.stream.like',
] as const;

export interface Group {
  app: AppId;
  nsid: string;
  records: AtRecord<InteractionRecord>[];
  capped: boolean;
}

interface Candidate {
  app: AppId;
  nsid: string;
  at: Date;
  rec: AtRecord<InteractionRecord>;
}

/** Highlights are tried in round-robin order until this many attempts. */
const MAX_ATTEMPTS = LIMIT * 2;
const SNIPPET = 80;

const snippet = (text: string): string =>
  text.length > SNIPPET ? `${text.slice(0, SNIPPET - 1).trimEnd()}…` : text;

function recent(groups: Group[], now: Date): Candidate[] {
  return groups.flatMap((g) =>
    g.records
      .map((rec) => ({ app: g.app, nsid: g.nsid, rec, at: recordDate(rec) }))
      .filter((c): c is Candidate => c.at !== null && isWithinWindow(c.at, now))
  );
}

function breakdown(candidates: Candidate[]): InteractionBlock['byApp'] {
  const counts = new Map<AppId, number>();
  for (const c of candidates) counts.set(c.app, (counts.get(c.app) ?? 0) + 1);
  return [...counts.entries()]
    .map(([app, count]) => ({ app, count }))
    .sort((a, b) => b.count - a.count);
}

/** Newest item from each app in turn; apps ordered by their newest item. */
export function roundRobin<T extends { app: AppId; at: Date }>(
  candidates: T[],
  limit: number
): T[] {
  const byApp = new Map<AppId, T[]>();
  for (const c of [...candidates].sort((a, b) => b.at.getTime() - a.at.getTime())) {
    const list = byApp.get(c.app) ?? [];
    list.push(c);
    byApp.set(c.app, list);
  }
  const queues = [...byApp.values()];
  const picked: T[] = [];
  while (picked.length < limit && queues.some((q) => q.length)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && picked.length < limit) picked.push(next);
    }
  }
  return picked;
}

const subjectUri = (value: InteractionRecord): string | undefined => {
  const s = value.subject;
  if (typeof s === 'string') return s;
  if (s && 'uri' in s && typeof s.uri === 'string') return s.uri;
  return undefined;
};

/** The followed account's DID. Tangled keeps it in the record key. */
export function followSubject(
  nsid: string,
  rec: AtRecord<InteractionRecord>
): string | null {
  if (nsid === 'org.tangled.graph.follow') {
    const key = rkeyOf(rec.uri);
    return key.startsWith('did:') ? key : null;
  }
  const s = rec.value.subject;
  return typeof s === 'string' && s.startsWith('did:') ? s : null;
}

async function resolveInOrder(
  candidates: Candidate[],
  resolve: (c: Candidate) => Promise<Highlight | null>,
  onError?: (d: Diagnostic) => void
): Promise<Highlight[]> {
  const settled = await Promise.allSettled(
    candidates.slice(0, MAX_ATTEMPTS).map(resolve)
  );
  const out: Highlight[] = [];
  settled.forEach((result) => {
    if (result.status === 'fulfilled') {
      if (result.value) out.push(result.value);
    } else {
      onError?.({
        scope: 'highlight',
        message: String(result.reason?.message ?? result.reason),
      });
    }
  });
  return byDateDesc(out.slice(0, LIMIT));
}

/** Highlights are chosen round-robin across apps, then shown newest first. */
const byDateDesc = (items: Highlight[]): Highlight[] =>
  [...items].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

/** Follows across apps, deduplicated by account. */
export async function buildFollowing(
  groups: Group[],
  source: AtSource,
  now: Date
): Promise<InteractionBlock | null> {
  const candidates = recent(groups, now);
  if (!candidates.length) return null;

  const firstByDid = new Map<string, Candidate>();
  for (const c of [...candidates].sort((a, b) => b.at.getTime() - a.at.getTime())) {
    const did = followSubject(c.nsid, c.rec);
    if (did && !firstByDid.has(did)) firstByDid.set(did, c);
  }

  const ordered = roundRobin([...firstByDid.values()], MAX_ATTEMPTS);
  const dids = ordered.map((c) => followSubject(c.nsid, c.rec)!);
  const profiles = await source.getProfiles(dids).catch(() => []);
  const profileByDid = new Map(profiles.map((p) => [p.did, p]));

  const highlights = ordered
    .map((c): Highlight | null => {
      const profile = profileByDid.get(followSubject(c.nsid, c.rec)!);
      if (!profile || profile.handle === profile.did) return null;
      return {
        key: c.rec.uri,
        at: c.at.toISOString(),
        app: c.app,
        href: profileUrl(profile.handle),
        serviceHref: personInApp(c.app, profile.handle),
        label: profile.displayName || profile.handle,
        sublabel: `@${profile.handle}`,
        avatar: profile.avatar,
      };
    })
    .filter((h): h is Highlight => h !== null)
    .slice(0, LIMIT)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  return {
    total: firstByDid.size,
    capped: groups.some((g) => g.capped),
    byApp: breakdown(candidates),
    highlights,
  };
}

/** Publication subscriptions, deduplicated by publication. */
export async function buildSubscribed(
  groups: Group[],
  source: AtSource,
  now: Date
): Promise<InteractionBlock | null> {
  const candidates = recent(groups, now);
  const firstByPub = new Map<string, Candidate>();
  for (const c of [...candidates].sort((a, b) => b.at.getTime() - a.at.getTime())) {
    const pub = c.rec.value.publication;
    if (pub && !firstByPub.has(pub)) firstByPub.set(pub, c);
  }
  if (!firstByPub.size) return null;

  const highlights = await resolveInOrder(
    roundRobin([...firstByPub.values()], MAX_ATTEMPTS),
    async (c) => {
      const uri = c.rec.value.publication!;
      const rec = await source.getRecord<StandardPublication & LeafletPublication>(uri);
      if (!rec?.value.name) return null;
      const url =
        rec.value.url ??
        (rec.value.base_path ? `https://${rec.value.base_path}` : undefined);
      return {
        key: c.rec.uri,
        at: c.at.toISOString(),
        app: c.app,
        href: url,
        label: rec.value.name,
      };
    }
  );

  return {
    total: firstByPub.size,
    capped: groups.some((g) => g.capped),
    byApp: breakdown([...firstByPub.values()]),
    highlights,
  };
}

/** Likes, favourites, stars, upvotes and recommendations across apps. */
export async function buildAppreciated(
  groups: Group[],
  source: AtSource,
  now: Date,
  onError: (d: Diagnostic) => void
): Promise<InteractionBlock | null> {
  const candidates = recent(groups, now);
  if (!candidates.length) return null;

  const highlightable = candidates.filter(
    (c) => c.nsid !== 'org.tangled.feed.star' && c.nsid !== 'place.stream.like'
  );
  const ordered = roundRobin(highlightable, MAX_ATTEMPTS);

  const likedPosts = ordered
    .filter((c) => c.nsid === 'app.bsky.feed.like')
    .map((c) => subjectUri(c.rec.value))
    .filter((u): u is string => Boolean(u));
  let posts: Awaited<ReturnType<AtSource['getPosts']>> = [];
  if (likedPosts.length) {
    try {
      posts = await source.getPosts(likedPosts);
    } catch (err) {
      onError({ scope: 'highlight', message: String((err as Error).message ?? err) });
    }
  }
  const postByUri = new Map(posts.map((p) => [p.uri, p]));

  const highlights = await resolveInOrder(
    ordered,
    async (c): Promise<Highlight | null> => {
      const uri =
        c.nsid === 'site.standard.graph.recommend'
          ? c.rec.value.document
          : subjectUri(c.rec.value);
      if (!uri) return null;
      const base = { key: c.rec.uri, at: c.at.toISOString(), app: c.app };
      const parts = parseAtUri(uri);

      switch (c.nsid) {
        case 'app.bsky.feed.like': {
          const post = postByUri.get(uri);
          if (!post || !parts) return null;
          return {
            ...base,
            href: postUrl(post.author.did, parts.rkey),
            label: snippet(post.text || 'A post'),
            sublabel: `@${post.author.handle}`,
            avatar: post.author.avatar,
          };
        }
        case 'social.grain.favorite': {
          if (!parts || parts.collection !== 'social.grain.gallery') return null;
          const rec = await source.getRecord<{ title?: string }>(uri);
          if (!rec?.value.title) return null;
          return { ...base, href: galleryUrl(parts.did, parts.rkey), label: rec.value.title };
        }
        case 'site.standard.graph.recommend': {
          const rec = await source.getRecord<StandardDocument>(uri);
          if (!rec?.value.title) return null;
          let href: string | undefined;
          if (rec.value.site?.startsWith('at://')) {
            const pub = await source.getRecord<StandardPublication>(rec.value.site);
            if (pub?.value.url) {
              href = `${pub.value.url.replace(/\/$/, '')}${rec.value.path ?? ''}`;
            }
          }
          return { ...base, href, label: rec.value.title };
        }
        case 'app.userinput.upvote': {
          const rec = await source.getRecord<{ title?: string }>(uri);
          if (!rec?.value.title) return null;
          return { ...base, href: appUrl('userinput'), label: rec.value.title };
        }
        case 'fm.plyr.like': {
          const rec = await source.getRecord<PlyrTrack>(uri);
          if (!rec?.value.title) return null;
          return {
            ...base,
            href: appUrl('plyr'),
            label: rec.value.title,
            sublabel: rec.value.artist,
          };
        }
        default:
          return null;
      }
    },
    onError
  );

  return {
    total: candidates.length,
    capped: groups.some((g) => g.capped),
    byApp: breakdown(candidates),
    highlights,
  };
}
