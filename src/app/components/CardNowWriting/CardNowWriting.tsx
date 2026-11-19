import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import { NowImage } from '@/app/components/NowImage/NowImage';
import * as styles from './CardNowWriting.styles';
import type { CardNowWritingProps } from './CardNowWriting.types';

export const CardNowWriting: React.FC<CardNowWritingProps> = ({ item, now }) => (
  <Card as="article">
    <div className={styles.row}>
      {item.coverUrl && <NowImage src={item.coverUrl} alt="" className={styles.cover} />}
      <div className={styles.body}>
        <p className={styles.overline}>{item.publication.name}</p>
        <h3 className={styles.titleText}>
          {item.href ? <Link href={item.href} label={item.title} color="black" size="large" wrap /> : item.title}
        </h3>
        {item.description && <p className={styles.description}>{item.description}</p>}
        <ItemMeta at={item.at} app={item.app} now={now} prefix="published" serviceHref={item.serviceHref} />
      </div>
    </div>
  </Card>
);
