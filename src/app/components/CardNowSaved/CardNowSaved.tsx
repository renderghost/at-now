import React from 'react';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import * as styles from './CardNowSaved.styles';
import type { CardNowSavedProps } from './CardNowSaved.types';

export const CardNowSaved: React.FC<CardNowSavedProps> = ({ item, now }) => (
  <div className={styles.row}>
    {item.imageUrl ? (
      <img src={item.imageUrl} alt="" className={styles.thumb} loading="lazy" />
    ) : (
      <div className={styles.thumbPlaceholder} aria-hidden="true" />
    )}
    <div className={styles.body}>
      <Link href={item.url} label={item.title} color="black" wrap />
      {item.siteName && <p className={styles.site}>{item.siteName}</p>}
      {item.note && <p className={styles.note}>{item.note}</p>}
      <ItemMeta at={item.at} app={item.app} now={now} prefix="saved" />
    </div>
  </div>
);
