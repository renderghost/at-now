import type { AtRecord } from '../atproto/types.js';
import { IDENTITY, LIMIT } from '../config.js';
import type {
  Blob,
  LeafletDocument,
  LeafletPage,
  StandardDocument,
  StandardPublication,
} from '../lexicons.js';
import { cdnImageUrl } from '../links.js';
import { isWithinWindow, parseDate } from '../time.js';
import type { WritingItem } from '../types.js';
import { rkeyOf } from './util.js';

function firstImage(pages?: LeafletPage[]): Blob | undefined {
  for (const page of pages ?? []) {
    for (const entry of page.blocks ?? []) {
      if (entry.block?.$type === 'pub.leaflet.blocks.image' && entry.block.image) {
        return entry.block.image;
      }
    }
  }
  return undefined;
}

const hostOf = (url: string): string | undefined => {
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
};

/**
 * Recent documents from every publication, labelled by publication.
 * Leaflet documents that duplicate a Standard document (same rkey) are
 * dropped in favour of the Standard one.
 */
export function selectWriting(
  docs: AtRecord<StandardDocument>[],
  leafletDocs: AtRecord<LeafletDocument>[],
  pubs: AtRecord<StandardPublication>[],
  now: Date
): WritingItem[] {
  const pubByUri = new Map(pubs.map((p) => [p.uri, p]));
  const standardKeys = new Set(docs.map((d) => rkeyOf(d.uri)));
  const items: WritingItem[] = [];

  for (const rec of docs) {
    const { value } = rec;
    const at = parseDate(value.publishedAt);
    if (!at || !isWithinWindow(at, now)) continue;

    const path = value.path ?? `/${rkeyOf(rec.uri)}`;
    let publication: WritingItem['publication'];
    let href: string | undefined;
    if (value.site.startsWith('at://')) {
      const pub = pubByUri.get(value.site);
      publication = {
        name: pub?.value.name ?? 'Writing',
        rkey: rkeyOf(value.site),
        url: pub?.value.url,
      };
      href = pub ? `${pub.value.url.replace(/\/$/, '')}${path}` : undefined;
    } else {
      const base = value.site.replace(/\/$/, '');
      publication = { name: hostOf(value.site) ?? value.site, url: value.site };
      href = `${base}${path}`;
    }

    const cover = value.coverImage ?? firstImage(value.content?.pages);
    items.push({
      key: rec.uri,
      at: at.toISOString(),
      app: 'standard',
      href,
      title: value.title,
      description: value.description || undefined,
      publication,
      coverUrl: cover ? cdnImageUrl(IDENTITY.did, cover.ref.$link) : undefined,
    });
  }

  for (const rec of leafletDocs) {
    if (standardKeys.has(rkeyOf(rec.uri))) continue;
    const at = parseDate(rec.value.publishedAt);
    if (!at || !isWithinWindow(at, now)) continue;
    const cover = firstImage(rec.value.pages);
    items.push({
      key: rec.uri,
      at: at.toISOString(),
      app: 'leaflet',
      title: rec.value.title,
      description: rec.value.description || undefined,
      publication: {
        name: 'Leaflet',
        rkey: rec.value.publication ? rkeyOf(rec.value.publication) : undefined,
      },
      coverUrl: cover ? cdnImageUrl(IDENTITY.did, cover.ref.$link) : undefined,
    });
  }

  return items
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, LIMIT);
}
