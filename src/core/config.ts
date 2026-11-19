import type { AppId, AppRef, NowPayload, ThemeId } from './types.js';

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

export const PLYR_API_URL = 'https://api.plyr.fm';

export const APPS: Record<AppId, AppRef> = {
  atmorsvp: { id: 'atmorsvp', name: 'atmo.rsvp', url: 'https://atmo.rsvp' },
  bluesky: { id: 'bluesky', name: 'Bluesky', url: 'https://bsky.app' },
  bookhive: { id: 'bookhive', name: 'Bookhive', url: 'https://bookhive.buzz' },
  currents: { id: 'currents', name: 'Currents', url: 'https://currents.is' },
  grain: { id: 'grain', name: 'Grain', url: 'https://grain.social' },
  leaflet: { id: 'leaflet', name: 'Leaflet', url: 'https://leaflet.pub' },
  nearhorizon: {
    id: 'nearhorizon',
    name: 'Near Horizon',
    url: 'https://nearhorizon.app',
  },
  plyr: { id: 'plyr', name: 'plyr.fm', url: 'https://plyr.fm' },
  semble: { id: 'semble', name: 'Semble', url: 'https://semble.so' },
  sifa: { id: 'sifa', name: 'Sifa', url: 'https://sifa.id' },
  standard: {
    id: 'standard',
    name: 'Standard.site',
    url: 'https://standard.site',
  },
  status: { id: 'status', name: 'Status', url: 'https://status.zzstoatzz.io' },
  streamplace: {
    id: 'streamplace',
    name: 'Streamplace',
    url: 'https://stream.place',
  },
  tangled: { id: 'tangled', name: 'Tangled', url: 'https://tangled.org' },
  teal: { id: 'teal', name: 'teal.fm', url: 'https://teal.fm' },
  userinput: {
    id: 'userinput',
    name: 'UserInput',
    url: 'https://userinput.app',
  },
};

export interface CollectionSpec {
  nsid: string;
  app: AppId;
  theme: ThemeId | 'status' | 'profile';
  /** 'since': TID-keyed and high-volume, fetched by time window. */
  strategy: 'all' | 'since';
}

const c = (
  nsid: string,
  app: AppId,
  theme: ThemeId | 'status' | 'profile',
  strategy: 'all' | 'since' = 'all'
): CollectionSpec => ({ nsid, app, theme, strategy });

export const COLLECTIONS: readonly CollectionSpec[] = [
  c('app.bsky.actor.profile', 'bluesky', 'profile'),
  c('app.bsky.actor.link', 'bluesky', 'profile'),
  c('app.nearhorizon.actor.pronouns', 'nearhorizon', 'profile'),
  c('id.sifa.profile.location', 'sifa', 'profile'),
  c('io.zzstoatzz.status.record', 'status', 'status'),
  c('id.sifa.profile.position', 'sifa', 'working'),
  c('community.lexicon.calendar.rsvp', 'atmorsvp', 'going'),
  c('site.standard.document', 'standard', 'writing'),
  c('site.standard.publication', 'standard', 'writing'),
  c('pub.leaflet.document', 'leaflet', 'writing'),
  c('sh.tangled.repo', 'tangled', 'making'),
  c('fm.plyr.track', 'plyr', 'making'),
  c('social.grain.gallery', 'grain', 'photographing'),
  c('social.grain.photo', 'grain', 'photographing'),
  c('social.grain.gallery.item', 'grain', 'photographing'),
  c('buzz.bookhive.book', 'bookhive', 'reading'),
  c('fm.teal.feed.play', 'teal', 'listening', 'since'),
  c('app.bsky.feed.post', 'bluesky', 'posting', 'since'),
  c('network.cosmik.card', 'semble', 'saving'),
  c('is.currents.feed.save', 'currents', 'saving'),
  c('app.bsky.graph.follow', 'bluesky', 'social', 'since'),
  c('social.grain.graph.follow', 'grain', 'social'),
  c('is.currents.graph.follow', 'currents', 'social'),
  c('id.sifa.graph.follow', 'sifa', 'social'),
  c('org.tangled.graph.follow', 'tangled', 'social'),
  c('site.standard.graph.subscription', 'standard', 'social'),
  c('pub.leaflet.graph.subscription', 'leaflet', 'social'),
  c('app.bsky.feed.like', 'bluesky', 'social', 'since'),
  c('social.grain.favorite', 'grain', 'social', 'since'),
  c('org.tangled.feed.star', 'tangled', 'social'),
  c('app.userinput.upvote', 'userinput', 'social'),
  c('fm.plyr.like', 'plyr', 'social'),
  c('site.standard.graph.recommend', 'standard', 'social'),
  c('place.stream.like', 'streamplace', 'social'),
];

export const THEME_ORDER: readonly ThemeId[] = [
  'working',
  'going',
  'writing',
  'making',
  'photographing',
  'reading',
  'listening',
  'posting',
  'saving',
  'social',
];

/** The collections and apps this page reads, for the footprint block. */
export function footprint(): NowPayload['footprint'] {
  const appIds = [...new Set(COLLECTIONS.map((col) => col.app))];
  const apps = appIds
    .map((id) => APPS[id])
    .sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
  return {
    collections: COLLECTIONS.length,
    apps,
    pdsHost: new URL(IDENTITY.pdsUrl).host,
  };
}
