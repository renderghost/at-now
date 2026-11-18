import { formatDate } from '@/core/time';
import type { NowPayload, NowProfile, NowStats } from '@/core/types';
import type { Stat, StatGroup } from './StatsPanel.types';

export const TITLE = 'At a glance';

const number = new Intl.NumberFormat('en-GB');

const count = (n: number, one: string, many: string, capped = false): Stat | null =>
  n > 0
    ? { value: `${number.format(n)}${capped ? '+' : ''}`, label: n === 1 ? one : many }
    : null;

const present = (stats: (Stat | null)[]): Stat[] =>
  stats.filter((s): s is Stat => s !== null);

/** The four header stat groups; zero values and empty groups are dropped. */
export function statGroups(
  stats: NowStats,
  profile: NowProfile | null,
  footprint: NowPayload['footprint']
): StatGroup[] {
  const counts = profile?.counts;
  const joined = counts?.joinedAt ? new Date(counts.joinedAt) : null;

  const groups: StatGroup[] = [
    {
      title: 'Activity',
      stats: present([
        count(stats.postsThisWeek, 'post this week', 'posts this week'),
        count(
          stats.appreciated,
          'thing appreciated in 30 days',
          'things appreciated in 30 days',
          stats.appreciatedCapped
        ),
        count(stats.followed, 'person followed in 30 days', 'people followed in 30 days'),
      ]),
    },
    {
      title: 'On the go',
      stats: present([
        count(stats.booksOnTheGo, 'book on the go', 'books on the go'),
        count(stats.plays, 'play in 30 days', 'plays in 30 days'),
        count(stats.tracksPublished, 'track published in 30 days', 'tracks published in 30 days'),
        count(stats.eventsUpcoming, 'event coming up', 'events coming up'),
      ]),
    },
    {
      title: 'On Bluesky',
      stats: present([
        counts ? count(counts.followers, 'follower', 'followers') : null,
        counts ? count(counts.following, 'following', 'following') : null,
        counts ? count(counts.posts, 'post', 'posts') : null,
        joined && !Number.isNaN(joined.getTime())
          ? { value: formatDate(joined, 'month'), label: 'on the ATmosphere since' }
          : null,
      ]),
    },
    {
      title: 'Footprint',
      stats: present([
        count(footprint.collections, 'collection', 'collections'),
        count(footprint.apps.length, 'app', 'apps'),
        { value: footprint.pdsHost, label: 'hosts my data', wide: true },
      ]),
    },
  ];

  return groups.filter((g) => g.stats.length > 0);
}
