import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import * as styles from './CardNowGallery.styles';
import type { CardNowGalleryProps } from './CardNowGallery.types';

export const CardNowGallery: React.FC<CardNowGalleryProps> = ({ item, now }) => {
  const extra = item.photoCount - item.photos.length;
  return (
    <Card as="article">
      <div className={styles.head}>
        <h3 className={styles.title}>
          {item.href ? <Link href={item.href} label={item.title} color="black" size="large" wrap /> : item.title}
        </h3>
        {item.location && <p className={styles.location}>{item.location}</p>}
      </div>
      <ul className={styles.grid}>
        {item.photos.map((photo) => (
          <li key={photo.url} className={styles.photoWrapper}>
            <img src={photo.url} alt={photo.alt ?? ''} className={styles.photo} loading="lazy" />
          </li>
        ))}
      </ul>
      {extra > 0 && <p className={styles.more}>+{extra} more</p>}
      <ItemMeta at={item.at} app={item.app} now={now} />
    </Card>
  );
};
