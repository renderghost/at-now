import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import { NowImage } from '@/app/components/NowImage/NowImage';
import * as styles from './CardNowSaved.styles';
import type { CardNowSavedProps } from './CardNowSaved.types';

export const CardNowSaved: React.FC<CardNowSavedProps> = ({ item, now }) => (
  <Card as="article" className="justify-between">
    <div className={styles.row}>
      <NowImage src={item.imageUrl} alt="" className={styles.thumb} />
      <div className={styles.body}>
        <Link href={item.url} label={item.title} color="black" wrap />
        {item.siteName && <p className={styles.site}>{item.siteName}</p>}
        {item.note && <p className={styles.note}>{item.note}</p>}
      </div>
    </div>
    <ItemMeta at={item.at} app={item.app} now={now} prefix="saved" />
  </Card>
);
