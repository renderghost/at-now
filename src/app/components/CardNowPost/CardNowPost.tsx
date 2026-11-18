import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import { NowImage } from '@/app/components/NowImage/NowImage';
import { MAX_IMAGES, QUOTE_LABEL } from './CardNowPost.constants';
import * as styles from './CardNowPost.styles';
import type { CardNowPostProps } from './CardNowPost.types';

const hostOf = (url: string): string => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

export const CardNowPost: React.FC<CardNowPostProps> = ({ item, now }) => (
  <Card as="article" className="justify-between">
    <div className={styles.body}>
    {item.text && <p className={styles.text}>{item.text}</p>}
    {item.images.length > 0 && (
      <div className={styles.images}>
        {item.images.slice(0, MAX_IMAGES).map((img) => (
          <NowImage key={img.thumb} src={img.thumb} alt={img.alt} className={styles.image} />
        ))}
      </div>
    )}
    {item.external && (
      <a href={item.external.uri} className={styles.external} target="_blank" rel="noopener noreferrer">
        {item.external.thumb && <NowImage src={item.external.thumb} alt="" className={styles.externalThumb} />}
        <span className={styles.externalBody}>
          <span className={styles.externalTitle}>{item.external.title}</span>
          <span className={styles.externalHost}>{hostOf(item.external.uri)}</span>
        </span>
      </a>
    )}
    {item.quote && <Link href={item.quote.href} label={QUOTE_LABEL} color="blue" icon="right" />}
    </div>
    <div className={styles.footer}>
      <ItemMeta at={item.at} app={item.app} now={now} />
      {item.href && <Link href={item.href} label="View post" color="blue" icon="right" />}
    </div>
  </Card>
);
