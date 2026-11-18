/**
 * The NowPayload contract: returned by /api/now, rendered by the page, and
 * later consumed by renderg.host. Dates are ISO strings.
 */

export type AppId =
  | 'bluesky'
  | 'bookhive'
  | 'currents'
  | 'grain'
  | 'leaflet'
  | 'plyr'
  | 'semble'
  | 'sifa'
  | 'smokesignal'
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
  href?: string;
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

export interface Diagnostic {
  scope: ThemeId | 'status' | 'highlight';
  message: string;
}

export interface NowPayload {
  generatedAt: string;
  status: StatusItem | null;
  themes: Theme[];
  footprint: { collections: number; apps: AppRef[] };
  diagnostics: Diagnostic[];
}
