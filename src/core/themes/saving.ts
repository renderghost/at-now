import type { AtRecord } from '../atproto/types.js';
import { IDENTITY, LIMIT } from '../config.js';
import type { CosmikCard, CurrentsSave } from '../lexicons.js';
import { appUrl, cdnImageUrl, sembleProfileUrl } from '../links.js';
import { isWithinWindow, parseDate, recordDate } from '../time.js';
import type { SavedItem } from '../types.js';

const hostOf = (url: string): string | undefined => {
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
};

const urlContent = (card: CosmikCard) =>
  'url' in card.content ? card.content : undefined;

const noteText = (card: CosmikCard) =>
  'text' in card.content ? card.content.text : undefined;

/**
 * Semble URL cards (with any note attached through parentCard) and Currents
 * saves from the last 30 days, newest first.
 */
export function selectSaving(
  cards: AtRecord<CosmikCard>[],
  saves: AtRecord<CurrentsSave>[],
  now: Date
): SavedItem[] {
  const notesByParent = new Map<string, string>();
  for (const card of cards) {
    const text = noteText(card.value);
    const parent = card.value.parentCard?.uri;
    if (card.value.type === 'NOTE' && text && parent) {
      notesByParent.set(parent, text);
    }
  }
  const urlCardUris = new Set(
    cards.filter((c) => c.value.type === 'URL').map((c) => c.uri)
  );

  const items: SavedItem[] = [];

  for (const card of cards) {
    const at = recordDate(card);
    if (!at || !isWithinWindow(at, now)) continue;

    if (card.value.type === 'URL') {
      const content = urlContent(card.value);
      if (!content?.url) continue;
      const meta = content.metadata;
      items.push({
        key: card.uri,
        at: at.toISOString(),
        app: 'semble',
        href: content.url,
        serviceHref: sembleProfileUrl(IDENTITY.handle),
        title: meta?.title || content.url,
        url: content.url,
        imageUrl: meta?.imageUrl || undefined,
        siteName: meta?.siteName || hostOf(content.url),
        note: notesByParent.get(card.uri),
      });
    } else if (card.value.type === 'NOTE') {
      const parent = card.value.parentCard?.uri;
      if (parent && urlCardUris.has(parent)) continue;
      const text = noteText(card.value);
      const url = card.value.url;
      if (!text || !url) continue;
      items.push({
        key: card.uri,
        at: at.toISOString(),
        app: 'semble',
        href: url,
        serviceHref: sembleProfileUrl(IDENTITY.handle),
        title: hostOf(url) ?? url,
        url,
        siteName: hostOf(url),
        note: text,
      });
    }
  }

  for (const save of saves) {
    const at = parseDate(save.value.createdAt);
    const url = save.value.originUrl;
    if (!at || !url || !isWithinWindow(at, now)) continue;
    const image = save.value.content?.image;
    items.push({
      key: save.uri,
      at: at.toISOString(),
      app: 'currents',
      href: url,
      serviceHref: appUrl('currents'),
      title: hostOf(url) ?? url,
      url,
      imageUrl: image ? cdnImageUrl(IDENTITY.did, image.ref.$link) : undefined,
      siteName: hostOf(url),
      note: save.value.text || undefined,
    });
  }

  return items
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, LIMIT);
}
