import type { AtRecord } from '../atproto/types.js';
import { IDENTITY } from '../config.js';
import type {
  ActorLink,
  BskyProfile,
  PronounsRecord,
  SifaLocation,
} from '../lexicons.js';
import { avatarUrl, bannerUrl, cdnImageUrl, profileUrl } from '../links.js';
import type { NowProfile, ProfileCounts } from '../types.js';
import { joinParts } from './util.js';

/** "he/him" from Near Horizon's pronoun sets. */
function pronounsOf(records: AtRecord<PronounsRecord>[]): string | undefined {
  const forms = records[0]?.value.sets?.flatMap((s) => s.forms ?? []) ?? [];
  return forms.length ? forms.join('/') : undefined;
}

function locationOf(records: AtRecord<SifaLocation>[]): string | undefined {
  const primary = records.find((r) => r.value.isPrimary) ?? records[0];
  const address = primary?.value.address;
  return address
    ? joinParts([address.locality ?? address.region, address.country])
    : undefined;
}

/**
 * Barry's identity: name, bio, images and links from his Bluesky profile
 * record, pronouns from Near Horizon, place from Sifa, totals from the AppView.
 */
export function selectProfile(
  profiles: AtRecord<BskyProfile>[],
  links: AtRecord<ActorLink>[],
  pronouns: AtRecord<PronounsRecord>[],
  locations: AtRecord<SifaLocation>[],
  counts: ProfileCounts | null
): NowProfile | null {
  const record = profiles.find((p) => p.uri.endsWith('/self')) ?? profiles[0];
  if (!record) return null;
  const { value } = record;

  const linkByUri = new Map(links.map((l) => [l.uri, l]));
  const ordered = value.links?.length
    ? value.links
        .map((ref) => linkByUri.get(ref.uri))
        .filter((l): l is AtRecord<ActorLink> => Boolean(l))
    : links;

  return {
    did: IDENTITY.did,
    handle: IDENTITY.handle,
    profileUrl: profileUrl(IDENTITY.handle),
    displayName: value.displayName || undefined,
    bio: value.description?.trim() || undefined,
    avatarUrl: value.avatar
      ? avatarUrl(IDENTITY.did, value.avatar.ref.$link)
      : undefined,
    bannerUrl: value.banner
      ? bannerUrl(IDENTITY.did, value.banner.ref.$link)
      : undefined,
    pronouns: pronounsOf(pronouns) ?? (value.pronouns || undefined),
    location: locationOf(locations),
    links: ordered
      .filter((l) => l.value.url)
      .map((l) => ({
        title: l.value.title || new URL(l.value.url).host,
        url: l.value.url,
        ...(l.value.icon
          ? { iconUrl: cdnImageUrl(IDENTITY.did, l.value.icon.ref.$link) }
          : {}),
      })),
    counts,
  };
}
