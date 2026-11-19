import type { AtRecord } from '../atproto/types.js';
import { IDENTITY, LIMIT } from '../config.js';
import type { PositionRecord } from '../lexicons.js';
import { sifaCareerUrl, sifaProfileUrl } from '../links.js';
import { parseDate } from '../time.js';
import type { PositionItem } from '../types.js';
import { joinParts, tokenOf } from './util.js';

/** Every position without an end date, newest start first. */
export function selectWorking(
  records: AtRecord<PositionRecord>[],
  _now: Date
): PositionItem[] {
  return records
    .filter((rec) => !rec.value.endedAt)
    .map((rec) => ({
      rec,
      started: parseDate(rec.value.startedAt),
      created: parseDate(rec.value.createdAt)?.getTime() ?? 0,
    }))
    .filter((d): d is typeof d & { started: Date } => d.started !== null)
    .sort(
      (a, b) =>
        b.started.getTime() - a.started.getTime() || b.created - a.created
    )
    .slice(0, LIMIT)
    .map(({ rec, started }): PositionItem => {
      const { value } = rec;
      const loc = value.location;
      return {
        key: rec.uri,
        at: started.toISOString(),
        app: 'sifa',
        href: sifaProfileUrl(IDENTITY.handle),
        serviceHref: sifaCareerUrl(IDENTITY.handle),
        title: value.title,
        company: value.company,
        location: loc ? joinParts([loc.locality ?? loc.region, loc.country]) : undefined,
        workplaceType: tokenOf(value.workplaceType),
        employmentType: tokenOf(value.employmentType),
        startedAt: started.toISOString(),
      };
    });
}
