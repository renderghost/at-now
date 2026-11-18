import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import * as styles from './CardNowTrack.styles';
import type { CardNowTrackProps } from './CardNowTrack.types';

/** A track Barry published, artwork first. */
export const CardNowTrack: React.FC<CardNowTrackProps> = ({ item, now }) => (
  <Card as="article" padding="compact" className="justify-between">
    <div className={styles.top}>
      <div className={styles.artWrapper}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className={styles.art} loading="lazy" />
        ) : (
          <div className={styles.artPlaceholder} />
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.title}>{item.title}</p>
        <p className={styles.sub}>{item.artist}</p>
        {item.album && <p className={styles.sub}>{item.album}</p>}
      </div>
    </div>
    <ItemMeta at={item.at} app={item.app} now={now} prefix="published" />
  </Card>
);
