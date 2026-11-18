import React from 'react';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { Link } from '@/app/components/Link/Link';
import * as styles from './ItemRow.styles';
import type { ItemRowProps } from './ItemRow.types';

/** Compact one-line item: label (linked), optional detail, meta. */
export const ItemRow: React.FC<ItemRowProps> = ({
  label,
  href,
  detail,
  at,
  app,
  now,
  prefix,
}) => (
  <div className={styles.row}>
    {href ? (
      <Link href={href} label={label} color="black" wrap />
    ) : (
      <p className={styles.label}>{label}</p>
    )}
    {detail && <p className={styles.detail}>{detail}</p>}
    <ItemMeta at={at} app={app} now={now} prefix={prefix} />
  </div>
);
