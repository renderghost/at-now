/**
 * Captures the remote records, profiles and posts that the recorded PDS
 * fixtures in tests/fixtures/records point at, so tests run offline.
 *
 * Tests pin exact values to this snapshot: re-running this script (or
 * re-capturing records) changes those expectations.
 *
 * Usage: node scripts/capture-remote-fixtures.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = new URL('../tests/fixtures/', import.meta.url);
const APPVIEW = 'https://public.api.bsky.app';
const PLC = 'https://plc.directory';
const NEWEST = 10;

const records = (nsid) =>
  JSON.parse(readFileSync(new URL(`records/${nsid}.json`, DIR), 'utf8'))
    .records;

const newestFirst = (recs) =>
  [...recs].sort((a, b) =>
    String(b.value.createdAt ?? b.uri).localeCompare(
      String(a.value.createdAt ?? a.uri)
    )
  );

const getJson = async (url) => {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
};

const pdsCache = new Map();
async function pdsFor(did) {
  if (!pdsCache.has(did)) {
    const doc = await getJson(
      did.startsWith('did:web:')
        ? `https://${did.slice(8)}/.well-known/did.json`
        : `${PLC}/${did}`
    );
    const svc = doc.service.find((s) => s.id.endsWith('#atproto_pds'));
    pdsCache.set(did, svc.serviceEndpoint.replace(/\/$/, ''));
  }
  return pdsCache.get(did);
}

async function getRecord(uri) {
  const [, , did, collection, rkey] = uri.split('/');
  const pds = await pdsFor(did);
  const params = new URLSearchParams({ repo: did, collection, rkey });
  const rec = await getJson(
    `${pds}/xrpc/com.atproto.repo.getRecord?${params}`
  );
  return rec.value;
}

const subjectUri = (v) =>
  typeof v.subject === 'string' ? v.subject : v.subject?.uri;

const remoteUris = [
  ...records('community.lexicon.calendar.rsvp').map((r) => r.value.subject.uri),
  ...newestFirst(records('social.grain.favorite')).slice(0, NEWEST).map((r) => subjectUri(r.value)),
  ...newestFirst(records('site.standard.graph.recommend')).slice(0, NEWEST).map((r) => r.value.document),
  ...newestFirst(records('fm.plyr.like')).slice(0, NEWEST).map((r) => subjectUri(r.value)),
  ...newestFirst(records('app.userinput.upvote')).slice(0, NEWEST).map((r) => subjectUri(r.value)),
  ...newestFirst(records('site.standard.graph.subscription')).slice(0, NEWEST).map((r) => r.value.publication),
  ...records('pub.leaflet.graph.subscription').slice(0, NEWEST).map((r) => r.value.publication),
].filter((u) => typeof u === 'string' && u.startsWith('at://'));

const remote = {};
for (const uri of [...new Set(remoteUris)]) {
  try {
    remote[uri] = await getRecord(uri);
  } catch (err) {
    console.warn(`skip ${uri}: ${err.message}`);
  }
}

const followDids = [
  'app.bsky.graph.follow',
  'social.grain.graph.follow',
  'is.currents.graph.follow',
  'id.sifa.graph.follow',
].flatMap((nsid) =>
  newestFirst(records(nsid)).slice(0, NEWEST).map((r) => r.value.subject)
);
const tangledDids = newestFirst(records('org.tangled.graph.follow'))
  .slice(0, NEWEST)
  .map((r) => r.uri.split('/').pop());

const profiles = [];
const dids = [...new Set([...followDids, ...tangledDids])];
for (let i = 0; i < dids.length; i += 25) {
  const params = new URLSearchParams();
  dids.slice(i, i + 25).forEach((d) => params.append('actors', d));
  const res = await getJson(`${APPVIEW}/xrpc/app.bsky.actor.getProfiles?${params}`);
  profiles.push(
    ...res.profiles.map(({ did, handle, displayName, avatar }) => ({
      did,
      handle,
      displayName,
      avatar,
    }))
  );
}

const likedUris = newestFirst(records('app.bsky.feed.like'))
  .slice(0, NEWEST)
  .map((r) => r.value.subject.uri);
const params = new URLSearchParams();
likedUris.forEach((u) => params.append('uris', u));
const postsRes = await getJson(`${APPVIEW}/xrpc/app.bsky.feed.getPosts?${params}`);
const posts = postsRes.posts.map((p) => ({
  uri: p.uri,
  author: {
    did: p.author.did,
    handle: p.author.handle,
    displayName: p.author.displayName,
    avatar: p.author.avatar,
  },
  text: p.record.text ?? '',
  createdAt: p.record.createdAt ?? '',
}));

writeFileSync(new URL('remote.json', DIR), JSON.stringify(remote, null, 1));
writeFileSync(new URL('profiles.json', DIR), JSON.stringify(profiles, null, 1));
writeFileSync(new URL('posts.json', DIR), JSON.stringify(posts, null, 1));
console.log(
  `remote ${Object.keys(remote).length}, profiles ${profiles.length}, posts ${posts.length}`
);
