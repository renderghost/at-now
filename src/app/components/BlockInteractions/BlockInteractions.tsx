import React from 'react';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import { APPS } from '@/core/config';
import * as styles from './BlockInteractions.styles';
import type { BlockInteractionsProps } from './BlockInteractions.types';

const number = new Intl.NumberFormat('en-GB');

/** Merged count, per-app breakdown and a few resolved highlights. */
export const BlockInteractions: React.FC<BlockInteractionsProps> = ({
  title,
  verb,
  noun,
  block,
  now,
}) => (
  <div className={styles.wrapper}>
    <p className={styles.subtitle}>{title}</p>
    <p className={styles.summary}>
      {verb} {number.format(block.total)}
      {block.capped ? '+' : ''} {noun}
    </p>
    {block.byApp.length > 0 && (
      <p className={styles.breakdown}>
        {block.byApp.map((b) => `${number.format(b.count)} on ${APPS[b.app].name}`).join(', ')}
      </p>
    )}
    {block.highlights.length > 0 && (
      <ul className={styles.list}>
        {block.highlights.map((h) => (
          <li key={h.key} className={styles.highlight}>
            {h.avatar && <img src={h.avatar} alt="" className={styles.avatar} loading="lazy" />}
            <div className={styles.body}>
              {h.href ? (
                <Link href={h.href} label={h.label} color="black" wrap />
              ) : (
                <p className={styles.label}>{h.label}</p>
              )}
              {h.sublabel && <p className={styles.sublabel}>{h.sublabel}</p>}
              <ItemMeta at={h.at} app={h.app} now={now} />
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);
