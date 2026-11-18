import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import { DATE_PREFIX, STAR_CHAR, STATUS_LABELS, TOTAL_STARS } from './CardNowBook.constants';
import * as styles from './CardNowBook.styles';
import type { CardNowBookProps } from './CardNowBook.types';

export const CardNowBook: React.FC<CardNowBookProps> = ({ item, now }) => (
  <Card as="article" padding="compact" className="justify-between">
    <div className="flex flex-col gap-8 w-full">
      <div className={styles.coverWrapper}>
        {item.coverUrl ? (
          <img src={item.coverUrl} alt={item.title} className={styles.coverImage} loading="lazy" />
        ) : (
          <div className={styles.coverPlaceholder} />
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.status}>{STATUS_LABELS[item.status]}</p>
        {item.href ? (
          <Link href={item.href} label={item.title} color="black" wrap />
        ) : (
          <p className={styles.title}>{item.title}</p>
        )}
        {item.authors.length > 0 && <p className={styles.authors}>{item.authors.join(', ')}</p>}
        {item.stars !== undefined && item.stars > 0 && (
          <div className={styles.stars} aria-label={`${item.stars} out of ${TOTAL_STARS} stars`}>
            {Array.from({ length: TOTAL_STARS }, (_, i) => (
              <span key={i} aria-hidden="true" className={i < item.stars! ? styles.starFilled : styles.starEmpty}>
                {STAR_CHAR}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
    <ItemMeta at={item.at} app={item.app} now={now} prefix={DATE_PREFIX[item.status]} />
  </Card>
);
