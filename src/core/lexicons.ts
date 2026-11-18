/**
 * Record value shapes for the collections the Now page reads. Only the fields
 * we use; everything optional unless the lexicon requires it.
 */

export interface StrongRef {
  uri: string;
  cid: string;
}

export interface Blob {
  $type?: 'blob';
  ref: { $link: string };
  mimeType?: string;
  size?: number;
}

export interface AddressLocation {
  $type?: string;
  name?: string;
  street?: string;
  locality?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

export interface StatusRecord {
  text?: string;
  emoji?: string;
  expires?: string;
  createdAt?: string;
}

export interface PositionRecord {
  title: string;
  company?: string;
  description?: string;
  startedAt: string;
  endedAt?: string;
  location?: AddressLocation;
  workplaceType?: string;
  employmentType?: string;
  isPrimary?: boolean;
  createdAt?: string;
}

export interface RsvpRecord {
  status: string;
  subject: StrongRef;
  createdAt?: string;
}

export interface CalendarEvent {
  name: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  mode?: string;
  status?: string;
  locations?: (AddressLocation & { uri?: string })[];
  media?: { role?: string; content?: Blob; alt?: string }[];
  uris?: { uri: string; name?: string }[];
  createdAt?: string;
}

export interface BookRecord {
  title: string;
  authors: string;
  hiveId: string;
  status?: string;
  stars?: number;
  cover?: Blob;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface LeafletBlock {
  $type?: string;
  image?: Blob;
}

export interface LeafletPage {
  blocks?: { block: LeafletBlock }[];
}

export interface StandardDocument {
  site: string;
  path?: string;
  title: string;
  description?: string;
  publishedAt: string;
  coverImage?: Blob;
  content?: { pages?: LeafletPage[] };
}

export interface LeafletDocument {
  title: string;
  description?: string;
  publication?: string;
  publishedAt?: string;
  pages?: LeafletPage[];
}

export interface StandardPublication {
  url: string;
  name: string;
  description?: string;
}

export interface LeafletPublication {
  name: string;
  base_path?: string;
}

export interface TangledRepo {
  name: string;
  description?: string;
  createdAt: string;
}

export interface PlyrTrack {
  title: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  duration?: number;
  createdAt: string;
}

export interface GrainGallery {
  title: string;
  description?: string;
  address?: AddressLocation;
  location?: { name?: string; value?: string };
  createdAt: string;
  updatedAt?: string;
}

export interface GrainPhoto {
  photo: Blob;
  alt?: string;
  aspectRatio?: { width: number; height: number };
  createdAt: string;
}

export interface GrainGalleryItem {
  gallery: string;
  item: string;
  position?: number;
  createdAt: string;
}

export interface TealPlay {
  trackName: string;
  artists?: { artistName: string }[];
  artistNames?: string[];
  releaseName?: string;
  playedTime?: string;
  originUri?: string;
}

export interface BskyPost {
  text: string;
  createdAt: string;
  reply?: { root: StrongRef; parent: StrongRef };
  embed?: BskyEmbed;
}

export type BskyEmbed =
  | {
      $type: 'app.bsky.embed.images';
      images: { image: Blob; alt: string }[];
    }
  | {
      $type: 'app.bsky.embed.external';
      external: {
        uri: string;
        title: string;
        description?: string;
        thumb?: Blob;
      };
    }
  | { $type: 'app.bsky.embed.record'; record: StrongRef }
  | {
      $type: 'app.bsky.embed.recordWithMedia';
      record: { record: StrongRef };
      media: BskyEmbed;
    }
  | { $type: 'app.bsky.embed.video' }
  | { $type: string };

export interface CosmikCard {
  type: 'URL' | 'NOTE' | string;
  url?: string;
  content:
    | {
        $type?: string;
        url: string;
        metadata?: {
          title?: string;
          imageUrl?: string;
          siteName?: string;
          description?: string;
        };
      }
    | { $type?: string; text: string };
  parentCard?: StrongRef;
  createdAt?: string;
}

export interface CurrentsSave {
  content: { $type?: string; image?: Blob };
  originUrl?: string;
  text?: string;
  createdAt: string;
}

/** Follows, likes, favourites, stars, upvotes, recommends, subscriptions. */
export interface InteractionRecord {
  subject?: string | StrongRef | { identity?: string; did?: string };
  publication?: string;
  document?: string;
  createdAt?: string;
}

export interface BskyProfile {
  displayName?: string;
  description?: string;
  avatar?: Blob;
  banner?: Blob;
  pronouns?: string;
  links?: StrongRef[];
}

export interface ActorLink {
  title?: string;
  url: string;
  icon?: Blob;
}

export interface PronounsRecord {
  sets?: { forms?: string[] }[];
}

export interface SifaLocation {
  address?: AddressLocation;
  isPrimary?: boolean;
  type?: string;
}
