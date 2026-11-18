import React from 'react';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
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
  <article className={styles.card}>
    {item.text && <p className={styles.text}>{item.text}</p>}
    {item.images.length > 0 && (
      <div className={styles.images}>
        {item.images.slice(0, MAX_IMAGES).map((img) => (
          <img key={img.thumb} src={img.thumb} alt={img.alt} className={styles.image} loading="lazy" />
        ))}
      </div>
    )}
    {item.external && (
      <a href={item.external.uri} className={styles.external} target="_blank" rel="noopener noreferrer">
        {item.external.thumb && (
          <img src={item.external.thumb} alt="" className={styles.externalThumb} loading="lazy" />
        )}
        <span className={styles.externalBody}>
          <span className={styles.externalTitle}>{item.external.title}</span>
          <span className={styles.externalHost}>{hostOf(item.external.uri)}</span>
        </span>
      </a>
    )}
    {item.quote && <Link href={item.quote.href} label={QUOTE_LABEL} color="blue" icon="right" />}
    <div className="flex flex-wrap items-center gap-16">
      <ItemMeta at={item.at} app={item.app} now={now} />
      {item.href && <Link href={item.href} label="View post" color="blue" icon="right" />}
    </div>
  </article>
);
