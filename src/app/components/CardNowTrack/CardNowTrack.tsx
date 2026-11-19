import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import * as styles from './CardNowTrack.styles';
import type { CardNowTrackProps } from './CardNowTrack.types';

const Credit: React.FC<{ label: string; href?: string }> = ({ label, href }) =>
  href ? <Link href={href} label={label} color="black" wrap /> : <span className={styles.plain}>{label}</span>;

/** A track Barry published: links to the track, its album and the artist. */
export const CardNowTrack: React.FC<CardNowTrackProps> = ({ item, now }) => (
  <Card as="article">
    <div className={styles.row}>
      <div className={styles.artWrapper}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className={styles.art} loading="lazy" />
        ) : (
          <div className={styles.artPlaceholder} />
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>
          {item.href ? <Link href={item.href} label={item.title} color="black" size="large" wrap /> : item.title}
        </h3>
        <p className={styles.credits}>
          <Credit label={item.artist} href={item.artistHref} />
          {item.album && (
            <>
              <span aria-hidden="true">·</span>
              <Credit label={item.album} href={item.albumHref} />
            </>
          )}
        </p>
        <ItemMeta at={item.at} app={item.app} now={now} prefix="published" serviceHref={item.serviceHref} />
      </div>
    </div>
  </Card>
);
