import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { formatDate } from '@/core/time';
import { ONGOING, WORKPLACE_LABELS } from './CardNowPosition.constants';
import * as styles from './CardNowPosition.styles';
import type { CardNowPositionProps } from './CardNowPosition.types';

export const CardNowPosition: React.FC<CardNowPositionProps> = ({ item, now }) => {
  const details = [
    item.company,
    item.location,
    item.workplaceType ? WORKPLACE_LABELS[item.workplaceType] : undefined,
  ].filter(Boolean);

  return (
    <Card as="article" className="justify-between">
      <div className={styles.body}>
        <h3 className={styles.title}>{item.title}</h3>
        {details.length > 0 && <p className={styles.metaText}>{details.join(' · ')}</p>}
        <p className={styles.dates}>
          {formatDate(new Date(item.startedAt), 'month')} – {ONGOING}
        </p>
      </div>
      <ItemMeta at={item.at} app={item.app} now={now} prefix="started" />
    </Card>
  );
};
