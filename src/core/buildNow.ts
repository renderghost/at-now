import type { AtRecord, AtSource, ListResult } from './atproto/types.js';
import {
  COLLECTIONS,
  IDENTITY,
  THEME_ORDER,
  WINDOW_DAYS,
  footprint,
} from './config.js';
import type {
  ActorLink,
  BookRecord,
  BskyProfile,
  BskyPost,
  CalendarEvent,
  CosmikCard,
  CurrentsSave,
  GrainGallery,
  GrainGalleryItem,
  GrainPhoto,
  InteractionRecord,
  LeafletDocument,
  PlyrTrack,
  PositionRecord,
  PronounsRecord,
  RsvpRecord,
  SifaLocation,
  StandardDocument,
  StandardPublication,
  StatusRecord,
  TangledRepo,
  TealPlay,
} from './lexicons.js';
import { eventUris, selectGoing } from './themes/going.js';
import { selectListening } from './themes/listening.js';
import { indexPlyrTracks, selectMaking } from './themes/making.js';
import { selectPhotographing } from './themes/photographing.js';
import { selectPosting } from './themes/posting.js';
import { selectProfile } from './themes/profile.js';
import { selectReading } from './themes/reading.js';
import { selectSaving } from './themes/saving.js';
import {
  APPRECIATE_NSIDS,
  FOLLOW_NSIDS,
  SUBSCRIBE_NSIDS,
  buildAppreciated,
  buildFollowing,
  buildSubscribed,
} from './themes/social.js';
import type { Group } from './themes/social.js';
import { selectStatus } from './themes/status.js';
import { selectWorking } from './themes/working.js';
import { selectWriting } from './themes/writing.js';
import type {
  Diagnostic,
  NowPayload,
  NowProfile,
  NowStats,
  Theme,
  ThemeId,
} from './types.js';

const DAY = 86_400_000;

const messageOf = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

function isEmpty(theme: Theme): boolean {
  switch (theme.id) {
    case 'making':
      return !theme.repos.length && !theme.tracks.length;
    case 'photographing':
      return !theme.galleries.length;
    case 'listening':
      return theme.playCount === 0;
    case 'posting':
      return !theme.items.length && theme.weekCount === 0;
    case 'social':
      return !theme.following && !theme.subscribed && !theme.appreciated;
    default:
      return !theme.items.length;
  }
}

/**
 * Reads every collection, applies the theme rules and assembles the payload.
 * Each theme (and each social sub-block) fails on its own: a failure is
 * logged, recorded in `diagnostics`, and that part is left out.
 */
export async function buildNow(source: AtSource, now: Date): Promise<NowPayload> {
  const diagnostics: Diagnostic[] = [];
  const report = (scope: Diagnostic['scope'], err: unknown) => {
    const message = messageOf(err);
    console.error(`[now] ${scope}: ${message}`);
    diagnostics.push({ scope, message });
  };

  const since = new Date(now.getTime() - WINDOW_DAYS * DAY);
  const listings = new Map<string, Promise<ListResult<unknown>>>();
  for (const spec of COLLECTIONS) {
    const pending =
      spec.strategy === 'since'
        ? source.listSince(spec.nsid, since)
        : source.listAll(spec.nsid);
    pending.catch(() => undefined); // awaited (and reported) by its theme
    listings.set(spec.nsid, pending);
  }
  const list = async <T>(nsid: string): Promise<AtRecord<T>[]> =>
    ((await listings.get(nsid)!) as ListResult<T>).records;
  const groups = async (nsids: readonly string[]): Promise<Group[]> =>
    Promise.all(
      nsids.map(async (nsid) => {
        const result = (await listings.get(nsid)!) as ListResult<InteractionRecord>;
        const app = COLLECTIONS.find((c) => c.nsid === nsid)!.app;
        return { nsid, app, records: result.records, capped: result.capped };
      })
    );

  // Full-window counts for the header stats, filled in as themes build.
  const fullCounts = { eventsUpcoming: 0, booksOnTheGo: 0, tracksPublished: 0 };

  const profile = async (): Promise<NowProfile | null> => {
    try {
      const counts = await source.getProfile(IDENTITY.did).catch((err) => {
        report('profile', err);
        return null;
      });
      return selectProfile(
        await list<BskyProfile>('app.bsky.actor.profile'),
        await list<ActorLink>('app.bsky.actor.link').catch(() => []),
        await list<PronounsRecord>('app.nearhorizon.actor.pronouns').catch(() => []),
        await list<SifaLocation>('id.sifa.profile.location').catch(() => []),
        counts
      );
    } catch (err) {
      report('profile', err);
      return null;
    }
  };

  const theme = async (
    id: ThemeId | 'status',
    build: () => Promise<Theme | null>
  ): Promise<Theme | null> => {
    try {
      return await build();
    } catch (err) {
      report(id, err);
      return null;
    }
  };

  const going = async (): Promise<Theme> => {
    const rsvps = await list<RsvpRecord>('community.lexicon.calendar.rsvp');
    const uris = eventUris(rsvps);
    const settled = await Promise.allSettled(
      uris.map((uri) => source.getRecord<CalendarEvent>(uri))
    );
    const events = new Map<string, CalendarEvent>();
    settled.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        if (result.value) events.set(uris[i], result.value.value);
      } else {
        report('going', result.reason);
      }
    });
    fullCounts.eventsUpcoming = selectGoing(rsvps, events, now, Infinity).filter(
      (e) => !e.past
    ).length;
    return { id: 'going', items: selectGoing(rsvps, events, now) };
  };

  const socialBlock = async <T>(build: () => Promise<T>): Promise<T | null> => {
    try {
      return await build();
    } catch (err) {
      report('social', err);
      return null;
    }
  };

  const [profileResult, statusResult, ...themes] = await Promise.all([
    profile(),
    (async () => {
      try {
        return selectStatus(
          await list<StatusRecord>('io.zzstoatzz.status.record'),
          now
        );
      } catch (err) {
        report('status', err);
        return null;
      }
    })(),
    theme('working', async () => ({
      id: 'working',
      items: selectWorking(await list<PositionRecord>('id.sifa.profile.position'), now),
    })),
    theme('going', going),
    theme('writing', async () => ({
      id: 'writing',
      items: selectWriting(
        await list<StandardDocument>('site.standard.document'),
        await list<LeafletDocument>('pub.leaflet.document'),
        await list<StandardPublication>('site.standard.publication'),
        now
      ),
    })),
    theme('making', async () => {
      const repos = await list<TangledRepo>('sh.tangled.repo');
      const tracks = await list<PlyrTrack>('fm.plyr.track');
      fullCounts.tracksPublished = selectMaking([], tracks, now, Infinity).tracks.length;
      // plyr.fm web ids for deep links; without them tracks link to the artist.
      const refs = tracks.length
        ? await source.getPlyrTracks(IDENTITY.did).catch((err) => {
            report('making', err);
            return [];
          })
        : [];
      return {
        id: 'making',
        ...selectMaking(repos, tracks, now, undefined, indexPlyrTracks(refs)),
      };
    }),
    theme('photographing', async () => ({
      id: 'photographing',
      galleries: selectPhotographing(
        await list<GrainGallery>('social.grain.gallery'),
        await list<GrainPhoto>('social.grain.photo'),
        await list<GrainGalleryItem>('social.grain.gallery.item'),
        now
      ),
    })),
    theme('reading', async () => {
      const books = await list<BookRecord>('buzz.bookhive.book');
      fullCounts.booksOnTheGo = selectReading(books, now, Infinity).filter(
        (b) => b.status === 'reading'
      ).length;
      return { id: 'reading', items: selectReading(books, now) };
    }),
    theme('listening', async () =>
      selectListening(await list<TealPlay>('fm.teal.feed.play'), now)
    ),
    theme('posting', async () =>
      selectPosting(await list<BskyPost>('app.bsky.feed.post'), now)
    ),
    theme('saving', async () => ({
      id: 'saving',
      items: selectSaving(
        await list<CosmikCard>('network.cosmik.card'),
        await list<CurrentsSave>('is.currents.feed.save'),
        now
      ),
    })),
    theme('social', async () => {
      const [following, subscribed, appreciated] = await Promise.all([
        socialBlock(async () => buildFollowing(await groups(FOLLOW_NSIDS), source, now)),
        socialBlock(async () => buildSubscribed(await groups(SUBSCRIBE_NSIDS), source, now)),
        socialBlock(async () =>
          buildAppreciated(await groups(APPRECIATE_NSIDS), source, now, (d) =>
            diagnostics.push(d)
          )
        ),
      ]);
      return { id: 'social', following, subscribed, appreciated };
    }),
  ]);

  const present = themes.filter((t): t is Theme => t !== null && !isEmpty(t));
  const ordered = THEME_ORDER.map((id) => present.find((t) => t.id === id)).filter(
    (t): t is Theme => Boolean(t)
  );

  const find = <K extends Theme['id']>(id: K) =>
    ordered.find((t): t is Extract<Theme, { id: K }> => t.id === id);
  const social = find('social');
  const stats: NowStats = {
    postsThisWeek: find('posting')?.weekCount ?? 0,
    appreciated: social?.appreciated?.total ?? 0,
    appreciatedCapped: social?.appreciated?.capped ?? false,
    followed: social?.following?.total ?? 0,
    booksOnTheGo: fullCounts.booksOnTheGo,
    plays: find('listening')?.playCount ?? 0,
    tracksPublished: fullCounts.tracksPublished,
    eventsUpcoming: fullCounts.eventsUpcoming,
  };

  return {
    generatedAt: now.toISOString(),
    profile: profileResult,
    status: statusResult,
    stats,
    themes: ordered,
    footprint: footprint(),
    diagnostics,
  };
}
