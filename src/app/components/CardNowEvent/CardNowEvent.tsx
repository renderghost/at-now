import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import { NowImage } from '@/app/components/NowImage/NowImage';
import { StateBadge } from '@/app/components/StateBadge/StateBadge';
import { formatDate } from '@/core/time';
import { MODE_LABELS, RSVP_LABELS } from './CardNowEvent.constants';
import * as styles from './CardNowEvent.styles';
import type { CardNowEventProps } from './CardNowEvent.types';

const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

function dateRange(startsAt?: string, endsAt?: string): string | undefined {
  if (!startsAt) return undefined;
  const start = new Date(startsAt);
  if (!endsAt) return formatDate(start);
  const end = new Date(endsAt);
  if (formatDate(start) === formatDate(end)) {
    return `${formatDate(start)}, ${timeFormat.format(start)}–${timeFormat.format(end)}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export const CardNowEvent: React.FC<CardNowEventProps> = ({ item, now }) => {
  const meta = [
    dateRange(item.startsAt, item.endsAt),
    item.mode ? MODE_LABELS[item.mode] : undefined,
    item.location,
  ].filter(Boolean);

  return (
    <Card as="article">
      <div className={styles.row}>
        {item.imageUrl && <NowImage src={item.imageUrl} alt="" className={styles.image} />}
        <div className={styles.body}>
          <StateBadge label={RSVP_LABELS[item.rsvp]} />
          <h3 className={styles.title}>
            {item.href ? <Link href={item.href} label={item.name} color="black" size="large" wrap /> : item.name}
          </h3>
          {meta.length > 0 && (
            <p className={styles.metaText} data-part="event-meta">
              {meta.join(' · ')}
            </p>
          )}
          <ItemMeta
            at={item.at}
            app={item.app}
            now={now}
            prefix={item.past ? 'was' : undefined}
            serviceHref={item.serviceHref}
          />
        </div>
      </div>
    </Card>
  );
};
