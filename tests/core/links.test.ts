import { describe, expect, it } from 'vitest';
import {
  bookUrl,
  eventUrl,
  galleryUrl,
  plyrArtistUrl,
  postUrl,
  repoUrl,
  sifaProfileUrl,
  statusUrl,
} from '../../src/core/links.js';

// Each pattern was checked against the live app (HTTP 200, right page title).
const DID = 'did:plc:s2rczyxit2v5vzedxqs326ri';

describe('app links', () => {
  it('builds verified deep links', () => {
    expect(postUrl(DID, '3n2laj2kq4c2k')).toBe(
      `https://bsky.app/profile/${DID}/post/3n2laj2kq4c2k`
    );
    expect(bookUrl('bk_vCAP6cPocMwKKHkFSpEy')).toBe(
      'https://bookhive.buzz/books/bk_vCAP6cPocMwKKHkFSpEy'
    );
    expect(galleryUrl(DID, '3mw6nbxp6n6k6')).toBe(
      `https://grain.social/profile/${DID}/gallery/3mw6nbxp6n6k6`
    );
    expect(repoUrl('renderg.host', 'semble-raycast-extension')).toBe(
      'https://tangled.org/renderg.host/semble-raycast-extension'
    );
    expect(eventUrl('did:plc:3xewinw4wtimo2lqfy5fm5sw', '3mw74r4r3gsej')).toBe(
      'https://atmo.rsvp/p/did:plc:3xewinw4wtimo2lqfy5fm5sw/e/3mw74r4r3gsej'
    );
    expect(statusUrl('renderg.host')).toBe('https://status.zzstoatzz.io/@renderg.host');
    expect(plyrArtistUrl('renderg.host')).toBe('https://plyr.fm/u/renderg.host');
    expect(sifaProfileUrl('renderg.host')).toBe('https://sifa.id/p/renderg.host');
  });
});
