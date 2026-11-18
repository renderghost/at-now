import React from 'react';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import * as styles from './RowNowRepo.styles';
import type { RowNowRepoProps } from './RowNowRepo.types';

export const RowNowRepo: React.FC<RowNowRepoProps> = ({ item, now }) => (
  <div className={styles.row}>
    {item.href ? (
      <Link href={item.href} label={item.name} color="black" wrap />
    ) : (
      <p className={styles.name}>{item.name}</p>
    )}
    {item.description && <p className={styles.description}>{item.description}</p>}
    <ItemMeta at={item.at} app={item.app} now={now} prefix="created" />
  </div>
);
