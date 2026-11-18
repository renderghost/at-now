import { describe, expect, it } from 'vitest';
import type {
  ActorLink,
  BskyProfile,
  PronounsRecord,
  SifaLocation,
} from '../../src/core/lexicons.js';
import { selectProfile } from '../../src/core/themes/profile.js';
import { fixtureRecords } from '../helpers/fakeSource.js';

const DID = 'did:plc:s2rczyxit2v5vzedxqs326ri';
const counts = {
  followers: 2461,
  following: 217,
  posts: 6168,
  joinedAt: '2025-01-26T06:53:23.042Z',
};

const select = () =>
  selectProfile(
    fixtureRecords<BskyProfile>('app.bsky.actor.profile'),
    fixtureRecords<ActorLink>('app.bsky.actor.link'),
    fixtureRecords<PronounsRecord>('app.nearhorizon.actor.pronouns'),
    fixtureRecords<SifaLocation>('id.sifa.profile.location'),
    counts
  );

describe('selectProfile', () => {
  it('reads name, bio and images from the profile record', () => {
    const profile = select()!;
    expect(profile.displayName).toBe('B. Prendergast');
    expect(profile.bio?.startsWith('🌀 Socialist building a social web')).toBe(true);
    expect(profile.avatarUrl).toBe(
      `https://cdn.bsky.app/img/avatar/plain/${DID}/bafkreifc4qkgsfigkfuurldwbbsnnvmdbmtkpccpaa555zjdkm6rbh256m@jpeg`
    );
    expect(profile.bannerUrl).toBe(
      `https://cdn.bsky.app/img/banner/plain/${DID}/bafkreib7fdvojtkrib4k2yvk6xm7l74iqiie7rjprcwwrhaeccahbh7ypm@jpeg`
    );
    expect(profile.profileUrl).toBe('https://bsky.app/profile/renderg.host');
  });

  it('takes pronouns from Near Horizon and place from Sifa', () => {
    const profile = select()!;
    expect(profile.pronouns).toBe('he/him');
    expect(profile.location).toBe('Berlin, DE');
  });

  it('lists profile links in the order the profile gives them', () => {
    const profile = select()!;
    expect(profile.links.map((l) => l.title)).toEqual([
      'Message Me',
      'Meet Me',
      'Homepage',
      'Music',
      'Photos',
      'Playlists',
      'Radio',
      'Reading',
    ]);
    expect(profile.links[2]).toEqual({ title: 'Homepage', url: 'https://renderg.host/' });
    expect(profile.links[3].iconUrl).toContain('bafkreihv7rz7tbzlulrjabj7bv6vpnes43tk7bb5z5xw5zeggbczf2nixe');
  });

  it('passes Bluesky totals through', () => {
    expect(select()!.counts).toEqual(counts);
  });

  it('is null without a profile record', () => {
    expect(selectProfile([], [], [], [], null)).toBeNull();
  });
});
