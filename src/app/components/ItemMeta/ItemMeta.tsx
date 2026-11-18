import React from 'react';
import { AppLabel } from '@/app/components/AppLabel/AppLabel';
import { NowBadge } from '@/app/components/NowBadge/NowBadge';
import { formatDate, freshnessOf, relativeTime } from '@/core/time';
import { row, separator, time } from './ItemMeta.styles';
import type { ItemMetaProps } from './ItemMeta.types';

/** Now badge (when ≤7 days away), relative date and source app. */
export const ItemMeta: React.FC<ItemMetaProps> = ({
  at,
  app,
  now,
  prefix,
  hideBadge = false,
  tone = 'onLight',
}) => {
  const date = new Date(at);
  const valid = !Number.isNaN(date.getTime());
  const isNow = valid && freshnessOf(date, now) === 'now';

  return (
    <div className={row}>
      {isNow && !hideBadge && <NowBadge />}
      {valid && (
        <time dateTime={at} title={formatDate(date)} className={time[tone]}>
          {prefix ? `${prefix} ` : ''}
          {relativeTime(date, now)}
        </time>
      )}
      {valid && (
        <span className={separator[tone]} aria-hidden="true">
          ·
        </span>
      )}
      <AppLabel app={app} tone={tone} />
    </div>
  );
};
