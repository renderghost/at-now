/**
 * The NowPayload contract: returned by /api/now, rendered by the page, and
 * later consumed by renderg.host. Dates are ISO strings.
 */

export type AppId =
  | 'atmorsvp'
  | 'bluesky'
  | 'bookhive'
  | 'currents'
  | 'grain'
  | 'leaflet'
  | 'nearhorizon'
  | 'plyr'
  | 'semble'
  | 'sifa'
  | 'standard'
  | 'status'
  | 'streamplace'
  | 'tangled'
  | 'teal'
  | 'userinput';

export interface AppRef {
  id: AppId;
  name: string;
  url: string;
}

export type ThemeId =
  | 'working'
  | 'going'
  | 'writing'
  | 'making'
  | 'photographing'
  | 'reading'
  | 'listening'
  | 'posting'
  | 'saving'
  | 'social';

export interface ItemBase {
  /** Stable unique key (usually the record's at-uri). */
  key: string;
  /** The date the item is placed by (ISO). */
  at: string;
  app: AppId;
  /** The content itself (article, post, event page…). */
  href?: string;
  /** The closest page for this item inside its source app. */
  serviceHref?: string;
}

export interface StatusItem extends ItemBase {
  text: string;
  emoji?: string;
  emojiUrl?: string;
  expires?: string;
}

export interface PositionItem extends ItemBase {
  title: string;
  company?: string;
  location?: string;
  workplaceType?: string;
  employmentType?: string;
  startedAt: string;
}

export interface EventItem extends ItemBase {
  name: string;
  startsAt?: string;
  endsAt?: string;
  mode?: 'inperson' | 'virtual' | 'hybrid';
  location?: string;
  rsvp: 'going' | 'interested';
  past: boolean;
  imageUrl?: string;
}

export interface WritingItem extends ItemBase {
  title: string;
  description?: string;
  publication: { name: string; rkey?: string; url?: string };
  coverUrl?: string;
}

export interface RepoItem extends ItemBase {
  name: string;
  description?: string;
}

export interface TrackItem extends ItemBase {
  title: string;
  artist: string;
  artistHref?: string;
  albumHref?: string;
  album?: string;
  imageUrl?: string;
  durationSec?: number;
}

export interface GalleryPhoto {
  url: string;
  alt?: string;
  aspect?: number;
}

export interface GalleryItem extends ItemBase {
  title: string;
  location?: string;
  description?: string;
  photos: GalleryPhoto[];
  photoCount: number;
}

export interface BookItem extends ItemBase {
  title: string;
  authors: string[];
  status: 'reading' | 'finished' | 'wantToRead';
  coverUrl?: string;
  /** 0–5 */
  stars?: number;
}

export interface CountItem {
  label: string;
  sublabel?: string;
  count: number;
}

export interface PlayItem extends ItemBase {
  track: string;
  artist?: string;
}

export interface ListeningTheme {
  id: 'listening';
  playCount: number;
  topArtists: CountItem[];
  topTracks: CountItem[];
  lastPlayed: PlayItem | null;
}

export interface PostImage {
  thumb: string;
  alt: string;
}

export interface PostItem extends ItemBase {
  text: string;
  images: PostImage[];
  external?: { uri: string; title: string; description?: string; thumb?: string };
  quote?: { uri: string; href: string };
}

export interface PostingTheme {
  id: 'posting';
  weekCount: number;
  weekReplies: number;
  items: PostItem[];
}

export interface SavedItem extends ItemBase {
  title: string;
  url: string;
  imageUrl?: string;
  siteName?: string;
  note?: string;
}

export interface Highlight extends ItemBase {
  label: string;
  sublabel?: string;
  avatar?: string;
}

export interface InteractionBlock {
  total: number;
  capped: boolean;
  byApp: { app: AppId; count: number }[];
  highlights: Highlight[];
}

export type Theme =
  | { id: 'working'; items: PositionItem[] }
  | { id: 'going'; items: EventItem[] }
  | { id: 'writing'; items: WritingItem[] }
  | { id: 'making'; repos: RepoItem[]; tracks: TrackItem[] }
  | { id: 'photographing'; galleries: GalleryItem[] }
  | { id: 'reading'; items: BookItem[] }
  | ListeningTheme
  | PostingTheme
  | { id: 'saving'; items: SavedItem[] }
  | {
      id: 'social';
      following: InteractionBlock | null;
      subscribed: InteractionBlock | null;
      appreciated: InteractionBlock | null;
    };

export interface ProfileLink {
  title: string;
  url: string;
  iconUrl?: string;
}

export interface ProfileCounts {
  followers: number;
  following: number;
  posts: number;
  /** When the account was created (ISO). */
  joinedAt?: string;
}

/** Barry's ATmosphere identity, for the page header. */
export interface NowProfile {
  did: string;
  handle: string;
  profileUrl: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  pronouns?: string;
  location?: string;
  links: ProfileLink[];
  counts: ProfileCounts | null;
}

/** Top-line numbers, counted over full windows (not the 5-item limit). */
export interface NowStats {
  postsThisWeek: number;
  appreciated: number;
  appreciatedCapped: boolean;
  followed: number;
  booksOnTheGo: number;
  plays: number;
  tracksPublished: number;
  eventsUpcoming: number;
}

export interface Diagnostic {
  scope: ThemeId | 'status' | 'profile' | 'highlight';
  message: string;
}

export interface NowPayload {
  generatedAt: string;
  profile: NowProfile | null;
  status: StatusItem | null;
  stats: NowStats;
  themes: Theme[];
  footprint: { collections: number; apps: AppRef[]; pdsHost: string };
  diagnostics: Diagnostic[];
}
