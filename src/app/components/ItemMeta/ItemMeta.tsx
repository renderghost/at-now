import React from 'react';
import { AppLabel } from '@/app/components/AppLabel/AppLabel';
import { formatDate, relativeTime } from '@/core/time';
import { row, separator, time } from './ItemMeta.styles';
import type { ItemMetaProps } from './ItemMeta.types';

/** Relative date and the source app, linked to the item inside that app. */
export const ItemMeta: React.FC<ItemMetaProps> = ({ at, app, now, prefix, serviceHref }) => {
  const date = new Date(at);
  const valid = !Number.isNaN(date.getTime());

  return (
    <div className={row}>
      {valid && (
        <time dateTime={at} title={formatDate(date)} className={time}>
          {prefix ? `${prefix} ` : ''}
          {relativeTime(date, now)}
        </time>
      )}
      {valid && (
        <span className={separator} aria-hidden="true">
          ·
        </span>
      )}
      <AppLabel app={app} href={serviceHref} />
    </div>
  );
};
