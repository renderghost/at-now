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

export interface AtSource {
  listAll<T>(collection: string): Promise<ListResult<T>>;
  listSince<T>(collection: string, since: Date): Promise<ListResult<T>>;
  /** Null when the record does not exist. */
  getRecord<T>(uri: string): Promise<AtRecord<T> | null>;
  getProfiles(dids: string[]): Promise<Profile[]>;
  getPosts(uris: string[]): Promise<PostView[]>;
  resolvePds(did: string): Promise<string>;
}
