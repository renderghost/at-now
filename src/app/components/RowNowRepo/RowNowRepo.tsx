import React from 'react';
import { Card } from '@/app/components/Card/Card';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import * as styles from './RowNowRepo.styles';
import type { RowNowRepoProps } from './RowNowRepo.types';

export const RowNowRepo: React.FC<RowNowRepoProps> = ({ item, now }) => (
  <Card as="article" className="justify-between">
    <div className={styles.body}>
      {item.href ? (
        <Link href={item.href} label={item.name} color="black" wrap />
      ) : (
        <p className={styles.name}>{item.name}</p>
      )}
      {item.description && <p className={styles.description}>{item.description}</p>}
    </div>
    <ItemMeta at={item.at} app={item.app} now={now} prefix="created" />
  </Card>
);
