export interface AtRecord<T> {
  uri: string;
  cid: string;
  value: T;
}

export interface ListResult<T> {
  records: AtRecord<T>[];
  /** True when the page budget ran out before the listing finished. */
  capped: boolean;
}

export interface Profile {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

export interface PostView {
  uri: string;
  author: Profile;
  text: string;
  createdAt: string;
}

export interface ProfileCountsResult {
  followers: number;
  following: number;
  posts: number;
  joinedAt?: string;
}

/** A plyr.fm track's web id and album, keyed by its record URI. */
export interface PlyrTrackRef {
  id: number;
  uri: string;
  artistHandle: string;
  albumSlug?: string;
}

export interface AtSource {
  listAll<T>(collection: string): Promise<ListResult<T>>;
  listSince<T>(collection: string, since: Date): Promise<ListResult<T>>;
  /** Null when the record does not exist. */
  getRecord<T>(uri: string): Promise<AtRecord<T> | null>;
  getProfiles(dids: string[]): Promise<Profile[]>;
  getPosts(uris: string[]): Promise<PostView[]>;
  /** Bluesky totals for an account; null if the AppView doesn't know it. */
  getProfile(actor: string): Promise<ProfileCountsResult | null>;
  resolvePds(did: string): Promise<string>;
  /** plyr.fm's index of an artist's tracks (not on the PDS: web ids, albums). */
  getPlyrTracks(artistDid: string): Promise<PlyrTrackRef[]>;
}
