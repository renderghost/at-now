import type { AtRecord } from '../atproto/types.js';
import { IDENTITY, LIMIT } from '../config.js';
import type { GrainGallery, GrainGalleryItem, GrainPhoto } from '../lexicons.js';
import { appUrl, cdnImageUrl, galleryUrl } from '../links.js';
import { isWithinWindow, parseDate } from '../time.js';
import type { GalleryItem, GalleryPhoto } from '../types.js';
import { joinParts, rkeyOf } from './util.js';

const toPhoto = (rec: AtRecord<GrainPhoto>): GalleryPhoto => {
  const ratio = rec.value.aspectRatio;
  return {
    url: cdnImageUrl(IDENTITY.did, rec.value.photo.ref.$link),
    alt: rec.value.alt || undefined,
    aspect: ratio && ratio.height ? ratio.width / ratio.height : undefined,
  };
};

/**
 * Galleries created or updated in the last 30 days, each with its first five
 * photos in gallery order. Recent photos outside any gallery form one
 * "Photos" group.
 */
export function selectPhotographing(
  galleries: AtRecord<GrainGallery>[],
  photos: AtRecord<GrainPhoto>[],
  items: AtRecord<GrainGalleryItem>[],
  now: Date
): GalleryItem[] {
  const photoByUri = new Map(photos.map((p) => [p.uri, p]));
  const linked = new Set(items.map((i) => i.value.item));
  const result: GalleryItem[] = [];

  for (const gallery of galleries) {
    const at =
      parseDate(gallery.value.updatedAt) ?? parseDate(gallery.value.createdAt);
    if (!at || !isWithinWindow(at, now)) continue;

    const members = items
      .filter((i) => i.value.gallery === gallery.uri)
      .sort((a, b) => (a.value.position ?? 0) - (b.value.position ?? 0))
      .map((i) => photoByUri.get(i.value.item))
      .filter((p): p is AtRecord<GrainPhoto> => Boolean(p));

    result.push({
      key: gallery.uri,
      at: at.toISOString(),
      app: 'grain',
      href: galleryUrl(IDENTITY.did, rkeyOf(gallery.uri)),
      title: gallery.value.title,
      location:
        gallery.value.location?.name ??
        joinParts([gallery.value.address?.locality, gallery.value.address?.country]),
      description: gallery.value.description || undefined,
      photos: members.slice(0, LIMIT).map(toPhoto),
      photoCount: members.length,
    });
  }

  const loose = photos
    .filter((p) => !linked.has(p.uri))
    .map((p) => ({ p, at: parseDate(p.value.createdAt) }))
    .filter((d): d is { p: AtRecord<GrainPhoto>; at: Date } =>
      d.at !== null && isWithinWindow(d.at, now)
    )
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  if (loose.length) {
    result.push({
      key: 'grain:loose-photos',
      at: loose[0].at.toISOString(),
      app: 'grain',
      href: appUrl('grain'),
      title: 'Photos',
      photos: loose.slice(0, LIMIT).map((d) => toPhoto(d.p)),
      photoCount: loose.length,
    });
  }

  return result
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, LIMIT);
}
