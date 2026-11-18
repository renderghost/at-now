import React from 'react';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import * as styles from './CardNowWriting.styles';
import type { CardNowWritingProps } from './CardNowWriting.types';

export const CardNowWriting: React.FC<CardNowWritingProps> = ({ item, now }) => (
  <article className={styles.card}>
    {item.coverUrl && <img src={item.coverUrl} alt="" className={styles.cover} loading="lazy" />}
    <div className={styles.body}>
      <p className={styles.overline}>{item.publication.name}</p>
      <h3 className={styles.titleText}>
        {item.href ? <Link href={item.href} label={item.title} color="black" size="large" wrap /> : item.title}
      </h3>
      {item.description && <p className={styles.description}>{item.description}</p>}
      <ItemMeta at={item.at} app={item.app} now={now} prefix="published" />
    </div>
  </article>
);
