import React from 'react';
import { ItemMeta } from '@/app/components/ItemMeta/ItemMeta';
import { SUBJECT } from './StatusLine.constants';
import * as styles from './StatusLine.styles';
import type { StatusLineProps } from './StatusLine.types';

/** "😊 Barry is …" from the status app, while it lasts. */
export const StatusLine: React.FC<StatusLineProps> = ({ status, now }) => (
  <div className={styles.wrapper}>
    <p className={styles.text}>
      {status.emojiUrl ? (
        <img src={status.emojiUrl} alt="" className={styles.emoji} />
      ) : (
        status.emoji && <span aria-hidden="true">{status.emoji}</span>
      )}{' '}
      {SUBJECT} {status.text}
    </p>
    <ItemMeta at={status.at} app={status.app} now={now} prefix="set" serviceHref={status.href} />
  </div>
);
